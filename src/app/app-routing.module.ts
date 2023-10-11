import { NgModule, inject } from '@angular/core';
import { Router, RouterModule, Routes } from '@angular/router';
import { TicketInformationComponent } from './ticket-information/ticket-information.component';
import { TicketsListComponent } from './tickets-list/tickets-list.component';
import { LoginComponent } from './login/login.component';
import { authGuard } from './guards/auth.guard';
import { AuthService } from './services/auth.service';
import { map, tap } from 'rxjs';

const routes: Routes = [
  {
    path: "info",
    pathMatch: "full",
    component: TicketInformationComponent,
    canActivate: [authGuard]
  },
  {
    path: "",
    pathMatch: "full",
    component: TicketsListComponent,
    canActivate: [authGuard]
  },
  {
    path: "login",
    pathMatch: "full",
    component: LoginComponent,
    canActivate: [() => {
      const router = inject(Router);
      return inject(AuthService).isAuthorized$.pipe(
        map((isAuthorized: boolean) => {
          if (!isAuthorized) {
            return true;
          }

          const tree = router.parseUrl("/");
          return tree;
        }),
      );
    }]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
