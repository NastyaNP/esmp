import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable, ReplaySubject, map, throwError } from "rxjs";
import { skipInterceptionHeader } from "../interceptors/auth.interceptor";
import { Router } from "@angular/router";
import customersCredentials from "./customers-credentials.json";

const sessionStorageKey = "sessionId";
const agentCreds = {
    login: "ARMGS@API",
    password: "mS2Lem%IKCrw"
}

@Injectable({
    providedIn: "root"
})
export class AuthService {
    private readonly httpClient = inject(HttpClient);
    private readonly router = inject(Router);
    private readonly isAuthorizedSubject$ = new ReplaySubject<boolean>(1);

    public readonly isAuthorized$: Observable<boolean>;

    constructor() {
        this.isAuthorizedSubject$.next(Boolean(this.getSessionId()));
        this.isAuthorized$ = this.isAuthorizedSubject$.asObservable();
    }

    public authorize(login: string, password: string): Observable<string> {
        if (!customersCredentials.some(customerCreds => customerCreds.login === login && customerCreds.password === password)) {
            return throwError(() => new HttpErrorResponse({
                status: 401
            }));
        }
        return this.httpClient.post<{ SessionMaxTime: string, SessionID: string }>("https://sm.support.mcs.mail.ru/otrs/nph-genericinterface.pl/Webservice/ARMGS/SessionCreate", {
            UserLogin: agentCreds.login,
            Password: agentCreds.password,
        }, {
            headers: new HttpHeaders({
                [skipInterceptionHeader]: "true"
            })
        }).pipe(
            map((response: { SessionMaxTime: string, SessionID: string }) => response.SessionID),
        )
    }

    public logOut(): void {
        this.isAuthorizedSubject$.next(false);
        this.setSessionId(null);
        this.router.navigate(["/login"]);
    }

    public logIn(sessionId: string): void {
        this.isAuthorizedSubject$.next(true);
        this.setSessionId(sessionId);
        this.router.navigate(["/"]);
    }

    public getSessionId(): string | null {
        return window.sessionStorage.getItem(sessionStorageKey);
    }

    private setSessionId(sessionId: string | null): void {
        if (sessionId === null) {
            return window.sessionStorage.removeItem(sessionStorageKey);
        }
        window.sessionStorage.setItem(sessionStorageKey, sessionId);
    }

}