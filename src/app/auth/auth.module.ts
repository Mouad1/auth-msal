// src/app/auth/auth.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthTestComponent } from './auth-test.component';
import {
  MsalModule,
  MsalService,
  MSAL_INSTANCE,
  MsalGuard,
  MsalInterceptor,
  MsalBroadcastService,
} from '@azure/msal-angular';
import { PublicClientApplication, InteractionType } from '@azure/msal-browser';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { msalConfig } from './msal-config';

export function MSALInstanceFactory(): PublicClientApplication {
  return new PublicClientApplication(msalConfig);
}

@NgModule({
  declarations: [AuthTestComponent],
  imports: [CommonModule, MsalModule],
  providers: [
    {
      provide: MSAL_INSTANCE,
      useFactory: MSALInstanceFactory,
    },
    MsalService,
    MsalGuard,
    MsalBroadcastService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MsalInterceptor,
      multi: true,
    },
  ],
  exports: [AuthTestComponent],
})
export class AuthModule {}
