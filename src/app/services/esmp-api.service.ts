import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, forkJoin, map, of, switchMap, tap } from 'rxjs';
import { Ticket } from '../models/ticket';
import { SessionResponse } from '../models/session-response';

@Injectable({
  providedIn: 'root'
})
export class EsmpApiService {

  private httpClient = inject(HttpClient);
  
  public ticketGet(id: string): Observable<Ticket>{
    return this.httpClient.get<{ Ticket: [Ticket] }>('https://sm.support.mcs.mail.ru/otrs/nph-genericinterface.pl/Webservice/HelpMe/TicketGet', {
      params: {
        TicketID: id,
        ...this.getAuthParams(),
      }
    }).pipe(
      map(({ Ticket: [ticket] }) => ticket),
    )
  }

  public getAllTicketsIds(options: Record<string, unknown>): Observable<string[]> {
    return this.httpClient.post<{ TicketID: Ticket["TicketID"][] }>("https://sm.support.mcs.mail.ru/otrs/nph-genericinterface.pl/Webservice/HelpMe/Original/TicketSearch", options, {
      params: this.getAuthParams()
    }).pipe(
      map(({ TicketID }) => TicketID)
    )
  }

  public getCustomerTickets(limit: number, offset: number = 0, getCounters = false): Observable<Ticket[]> {
    return this.httpClient.get<Record<string, Ticket[]>>(`https://sm.support.mcs.mail.ru/otrs/nph-genericinterface.pl/Webservice/HelpMe/TicketSearch?Types=Closed&Types=Rejected&Types=Public&Types=Active`, {
      params: {
        ...offset && { Offset: offset },
        CustomerLogin: "a.polezhaeva@corp.mail.ru",
        ...getCounters && { Mode: "Counter" },
        Limit: limit,
        SortBy: "t.tn",
        OrderBy: "Down",
        ...this.getAuthParams(),
      }
    }).pipe(
      map((obj) => Object.values(obj).flat())
    )
  }

  private getAuthParams(): Record<string, string> {
    return {
      UserLogin: "",
      Password: "",
    };
  }


}
