
export type Ticket = {
    TicketID: string;
    TicketNumber: number;
    Type: string;
    Priority: string;
    State: string;
    Created: string;
    OwnerLastname: string;
    OwnerFirstname: string;
    Owner: string;
    CustomerUserID: string;
    Title: string;
    Article: Article[];
}

export interface Article {
    Body: string;
    CreateTime: string;
    FromRealname: string;
    SenderType: string;
}