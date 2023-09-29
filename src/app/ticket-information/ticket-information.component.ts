import { Component, OnInit, ViewEncapsulation, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EsmpApiService } from '../services/esmp-api.service';
import { Ticket } from '../models/ticket';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-ticket-information',
  templateUrl: './ticket-information.component.html',
  styleUrls: ['./ticket-information.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class TicketInformationComponent implements OnInit {
  private route = inject(ActivatedRoute)
  private esmpApiService = inject(EsmpApiService)

  public ticket$: Observable<Ticket> | undefined;
  public readonly user = "https://cdn-icons-png.flaticon.com/512/6596/6596121.png";
  public readonly vk = "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/VK_Compact_Logo_%282021-present%29.svg/1200px-VK_Compact_Logo_%282021-present%29.svg.png";

  public readonly additionalInfoAttributesMap = new Map<string, keyof Ticket>([
    ["Исполнитель", "Owner"],
    ["Клиент", "CustomerUserID"],
    ["Состояние", "State"],
    ["Приоритет", "Priority"],
    ["Тип", "Type"],
  ])

  public ngOnInit(): void {
    const ticketId: Ticket["TicketID"] | null = this.route.snapshot.queryParamMap.get("TicketID");
    this.ticket$ = ticketId ? this.esmpApiService.ticketGet(ticketId) : of<any>({})
  }
}
