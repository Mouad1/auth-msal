import { MsalService } from '@azure/msal-angular';
// src/app/auth/auth-test.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from './auth.service';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import {
  AccountInfo,
  AuthenticationResult,
  EventMessage,
  EventType,
} from '@azure/msal-browser';
import { MsalBroadcastService } from '@azure/msal-angular';

@Component({
  selector: 'app-auth-test',
  templateUrl: './auth-test.component.html',
})
export class AuthTestComponent implements OnInit, OnDestroy {
  private readonly _destroying$ = new Subject<void>();
  user: AccountInfo | null = null;
  token: string | null = null;
  error: any = null;
  isInteractionInProgress = false;

  constructor(
    private authService: AuthService,
    private msalBroadcastService: MsalBroadcastService,
    private msalService: MsalService
  ) {}

  ngOnInit(): void {
    this.msalBroadcastService.msalSubject$
      .pipe(
        filter(
          (msg: EventMessage) => msg.eventType === EventType.LOGIN_SUCCESS
        ),
        takeUntil(this._destroying$)
      )
      .subscribe((result: EventMessage) => {
        console.log('Login successful');
        this.refreshUser();
      });

    // Handle initial state
    this.msalService.instance.handleRedirectPromise().then(() => {
      this.refreshUser();
    });
  }

  ngOnDestroy(): void {
    this._destroying$.next();
    this._destroying$.complete();
  }

  login(): void {
    if (this.isInteractionInProgress) {
      return;
    }

    this.isInteractionInProgress = true;
    this.error = null;

    this.authService
      .login()
      .pipe(takeUntil(this._destroying$))
      .subscribe({
        next: () => {
          console.log('Login initiated');
        },
        error: (error) => {
          this.error = error;
          console.error('Login error:', error);
          this.isInteractionInProgress = false;
        },
        complete: () => {
          this.isInteractionInProgress = false;
        },
      });
  }

  async logout(): Promise<void> {
    await this.authService.logout();
    this.user = null;
    this.token = null;
    this.error = null;
  }

  refreshUser(): void {
    this.user = this.authService.getUser();
  }

  acquireToken(): void {
    this.authService
      .acquireToken()
      .pipe(takeUntil(this._destroying$))
      .subscribe({
        next: (result: AuthenticationResult) => {
          this.token = result.accessToken;
          console.log('Token acquired:', result.accessToken);
        },
        error: (error) => {
          this.error = error;
          console.error('Error acquiring token:', error);
        },
      });
  }
}
