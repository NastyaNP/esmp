import { Component, OnInit, inject } from '@angular/core';
import { EsmpApiService } from '../services/esmp-api.service';
import { Ticket } from '../models/ticket';
import { BehaviorSubject, Observable, catchError, combineLatest, concatMap, distinctUntilChanged, finalize, forkJoin, map, mergeMap, of, scan, shareReplay, startWith, switchMap, take, takeUntil, tap } from 'rxjs';
import { Router } from '@angular/router';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { customerIds } from './customer-ids';
import { NzIconService } from 'ng-zorro-antd/icon';
import { AuthService } from '../services/auth.service';

const DEFAULT_LIMIT = 10;

@Component({
  selector: 'app-tickets-list',
  templateUrl: './tickets-list.component.html',
  styleUrls: ['./tickets-list.component.less']
})
export class TicketsListComponent implements OnInit {
  private readonly esmpApiService = inject(EsmpApiService);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  public limit: number = DEFAULT_LIMIT;
  public overOffset: number = 0;
  public pageIndex: number = 1;
  public loading: boolean = true;

  public searchLoading: boolean = false;
  public searchText: string = "";

  public tickets$: Observable<Ticket[]> = of([]);
  public ticketIds$: Observable<string[]> = of([]);
  public allTicketIds$: Observable<string[]> = of([]);
  public totalCount$: Observable<number> = of(0);
  public exceptedTicketIds$: Observable<Set<string>> = of(new Set<string>());

  private loadedTicketsMap: Map<string, Ticket> = new Map<string, Ticket>();

  private exceptTicketIds$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  private readonly offset$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
 
  constructor(private iconService: NzIconService) {
    this.iconService.fetchFromIconfont({
      scriptUrl: 'https://at.alicdn.com/t/font_8d5l8fzk5b87iudi.js'
    });
  }

  public ngOnInit(): void {
    this.allTicketIds$ = this.getAllTicketsIds();
    this.exceptedTicketIds$ = this.exceptTicketIds$.pipe(
      scan(
        (exceptedTicketIds: Set<string>, newExcepted: string[]) => {
          return newExcepted.some((ticketId: string) => !exceptedTicketIds.has(ticketId))
            ? new Set([...exceptedTicketIds, ...newExcepted])
            : exceptedTicketIds;
        },
        new Set<string>()
      ),
      distinctUntilChanged(),
      tap((exceptedTicketIds) => console.log({ exceptedTicketIds })),
      shareReplay(1),
    );
    this.ticketIds$ = combineLatest([this.allTicketIds$, this.exceptedTicketIds$]).pipe(
      map(([allTicketIds, exceptedTicketIds]: [string[], Set<string>]) => {
        return allTicketIds.filter((id: string) => !exceptedTicketIds.has(Number(id) as any));
      }),
      shareReplay(1),
    )
    this.totalCount$ = this.ticketIds$.pipe(
      map((ids: string[]) => ids.length),
      tap((size) => console.log({ size }))
    );
    this.tickets$ = combineLatest([this.ticketIds$, this.offset$.pipe(distinctUntilChanged())]).pipe(
      tap(([ticketIds, offset]: [string[], number]) => {
        console.log({ ticketIds, offset });
        this.loading = true;
      }),
      concatMap(([ticketIds, offset]: [string[], number]) => this.loadTickets(of([ticketIds, offset])).pipe(
        finalize(() => this.loading = false),
      ))
    );
  }

  public logout(): void {
    this.authService.logOut();
  }

  public onQueryParamsChange(params: NzTableQueryParams): void {
    console.log({ params });
    this.pageIndex = params.pageIndex;
    this.offset$.next(params.pageIndex * params.pageSize);
  }

  public onPageChange(pageIndex: number): void {
    console.log({ pageIndex, limit: this.limit });
    
    this.offset$.next(pageIndex * this.limit);
  }

  public onTicketSearch(searchValue: string): void {
    if (!searchValue) {
      return;
    }

    this.searchLoading = true;
    this.esmpApiService.getAllTicketsIds({
      "TicketNumber": searchValue
    })
      .pipe(
        catchError((error) => {
          console.error("Error when search tickets:", error);
          return [];
        }),
        finalize(() => this.searchLoading = false),
        take(1),
      )
      .subscribe((ticketsIds: string[]) => {
        if (ticketsIds.length > 0) {
          this.router.navigate(["/info"], {
            queryParams: {
              TicketID: ticketsIds[0]
            }
          })
        }
      })
  }

  private loadTickets(params$: Observable<[string[], number]>): Observable<Ticket[]> {
    return params$.pipe(
      concatMap(([ticketIds, offset]: [string[], number]) => {
        const slicedTicketIds: string[] = ticketIds.slice(offset, offset + this.limit);
        return forkJoin(slicedTicketIds.map(
          (id: string) => this.loadedTicketsMap.has(id) 
            ? of(this.loadedTicketsMap.get(id)!) 
            : this.esmpApiService.ticketGet(id))
        )
          .pipe(
            map((tickets: Ticket[]) => {
              const jiraTickets = tickets.filter((ticket: Ticket) => ticket.Type === "Задача Jira");
              const correctTickets = tickets.filter((ticket: Ticket) => ticket.Type !== "Задача Jira");
              console.log({ jiraTickets, correctTickets, overOffset: this.overOffset, limit: this.limit });
              
              correctTickets.forEach((ticket: Ticket) => 
                this.loadedTicketsMap.set(ticket.TicketID.toString(), ticket)
              );

              if (jiraTickets.length === 0) {
                return correctTickets;
              }

              this.exceptTicketIds$.next(jiraTickets.map((ticket: Ticket) => ticket.TicketID));
              return correctTickets;
            }),
          )
      })
    )
  }

  private getAllTicketsIds(): Observable<string[]> {
    return forkJoin([
      this.esmpApiService.getAllTicketsIds({
        "Limit": 9999999999,
        "QueueIDs": ["207"],
        "Type": ["Запрос на информацию", "Запрос на обслуживание", "Инцидент", "Не классифицирован"],
        "TypeIds": [50, 4, 2, 5],
        "StateIDs": [4, 15, 12, 2, 1, 94, 13, 55],
        "TicketCreateTimeNewerDate": "2023-10-1 00:00:00",
        "OrderBy": "Up",
        "SortBy": "Age",
        "CustomerID": customerIds
      }),
      this.esmpApiService.getAllTicketsIds({
        "Limit": 9999999999,
        "QueueIDs": ["281"],
        "Type": ["Запрос на информацию", "Запрос на обслуживание", "Инцидент", "Не классифицирован"],
        "TypeIds": [50, 4, 2, 5],
        "StateIDs": [4, 15, 12, 2, 1, 94, 13, 55],
        "TicketCreateTimeNewerDate": "2023-10-1 00:00:00",
        "OrderBy": "Up",
        "SortBy": "Age",
        "CustomerID": customerIds
      })
    ]).pipe(
      map(([allIds, spamIds]: [string[], string[]])=> {
        const spamIdsSet = new Set(spamIds);
        return allIds.filter((id)=> !spamIdsSet.has(id));
      }),
      shareReplay(1)
    );
  }
}
