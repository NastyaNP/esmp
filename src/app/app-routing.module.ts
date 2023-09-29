import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TicketInformationComponent } from './ticket-information/ticket-information.component';
import { TicketsListComponent } from './tickets-list/tickets-list.component';

const routes: Routes = [
  {
    path: "info",
    pathMatch: "full",
    component: TicketInformationComponent
  },
  {
    path: "",
    pathMatch: "full",
    component: TicketsListComponent
  },
  {
    path: "**",
    pathMatch: "full",
    component: TicketsListComponent
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
