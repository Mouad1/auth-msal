// app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthTestComponent } from './auth/auth-test.component';
import { MsalRedirectComponent } from '@azure/msal-angular';

const routes: Routes = [
  {
    path: '',
    component: AuthTestComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
