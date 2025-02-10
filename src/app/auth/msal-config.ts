import {
  InteractionType,
  IPublicClientApplication,
  PublicClientApplication,
} from '@azure/msal-browser';
// src/app/auth/msal-config.ts
import { Configuration, LogLevel } from '@azure/msal-browser';
import {
  MsalGuardConfiguration,
  MsalInterceptorConfiguration,
} from '@azure/msal-angular';

export const msalConfig: Configuration = {
  auth: {
    clientId: 'e41e5adb-c41e-47d0-b5f7-84fe72573ea8',
    authority:
      'https://login.microsoftonline.com/46d5bd32-d922-452f-bb3d-afa8a484ecfe',
    redirectUri: 'http://localhost:4200', // This should match your route
    postLogoutRedirectUri: 'http://localhost:4200',
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: true,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level: LogLevel, message: string) => {
        console.log(message);
      },
      logLevel: LogLevel.Info,
      piiLoggingEnabled: false,
    },
  },
};

export const loginRequest = {
  scopes: ['User.Read', 'General'],
  prompt: 'select_account',
};

export const msalGuardConfig: MsalGuardConfiguration = {
  interactionType: InteractionType.Redirect,
};

// Factory function to initialize MSAL instance
export function MSALInstanceFactory(): IPublicClientApplication {
  const msalInstance = new PublicClientApplication(msalConfig);
  // Initialize MSAL instance
  msalInstance.initialize().catch((error) => {
    console.error('MSAL Initialization Error:', error);
  });
  return msalInstance;
}

export const MSALInterceptorConfigFactory =
  (): MsalInterceptorConfiguration => ({
    interactionType: InteractionType.Redirect,
    protectedResourceMap: new Map([
      ['https://graph.microsoft.com/v1.0/me', ['user.read']],
    ]),
  });
