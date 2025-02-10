import { Injectable } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import {
  AccountInfo,
  AuthenticationResult,
  InteractionRequiredAuthError,
} from '@azure/msal-browser';
import { Observable, from, throwError, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { loginRequest } from './msal-config';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private initialized = false;

  constructor(private msalService: MsalService) {
    // Initialize on service creation
    this.initialize();
  }

  private async initialize() {
    if (!this.initialized) {
      try {
        await this.msalService.instance.initialize();
        this.initialized = true;
        console.log('MSAL initialized successfully');
      } catch (error) {
        console.error('MSAL initialization failed:', error);
      }
    }
  }

  login(): Observable<void> {
    if (!this.initialized) {
      return throwError(() => new Error('MSAL not initialized'));
    }

    if (this.msalService.instance.getAllAccounts().length > 0) {
      console.log('User is already logged in.');
      return of(void 0);
    }

    return from(this.msalService.loginRedirect()).pipe(
      catchError((error) => {
        console.error('Login error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * UPDATED LOGOUT METHOD
   * Use MSAL’s built-in logoutRedirect, passing in the active account
   * and your desired postLogoutRedirectUri (must be registered in Azure AD).
   */
  async logout(): Promise<void> {
    try {
      await this.msalService.logoutRedirect({
        account: this.msalService.instance.getActiveAccount(),
        postLogoutRedirectUri: 'http://localhost:4200', // Make sure this is allowed in your Azure AD app
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  isLoggedIn(): boolean {
    return (
      this.initialized && this.msalService.instance.getAllAccounts().length > 0
    );
  }

  getUser(): AccountInfo | null {
    if (!this.initialized) {
      return null;
    }

    let activeAccount = this.msalService.instance.getActiveAccount();
    if (!activeAccount) {
      const accounts = this.msalService.instance.getAllAccounts();
      if (accounts && accounts.length > 0) {
        activeAccount = accounts[0];
        this.msalService.instance.setActiveAccount(activeAccount);
      }
    }
    return activeAccount;
  }

  acquireToken(): Observable<AuthenticationResult> {
    const activeAccount = this.msalService.instance.getActiveAccount();
    if (!activeAccount) {
      return throwError(() => new Error('No active account found.'));
    }

    return from(
      this.msalService.acquireTokenSilent({
        ...loginRequest,
        account: activeAccount,
      })
    ).pipe(
      catchError((error) => {
        if (error instanceof InteractionRequiredAuthError) {
          // fallback to interaction when silent call fails
          return from(this.msalService.acquireTokenPopup(loginRequest));
        }
        return throwError(() => error);
      })
    );
  }
}
