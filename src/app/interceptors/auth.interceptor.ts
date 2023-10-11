import { Injectable, Provider, inject } from '@angular/core';
import { HttpInterceptor, HttpEvent, HttpHandler, HttpRequest, HTTP_INTERCEPTORS, HttpEventType, HttpErrorResponse } from '@angular/common/http';
import { Observable, switchMap, map, tap, catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const skipInterceptionHeader = "skip-interception";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    private readonly authService = inject(AuthService);

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (req.headers.has(skipInterceptionHeader)) {
            return next.handle(req.clone({
                headers: req.headers.delete(skipInterceptionHeader)
            }));
        }

        const sessionId = this.authService.getSessionId();
        const request = sessionId 
            ? req.clone({
                setParams: {
                    SessionID: sessionId,
                }
            })
            : req;

        return next.handle(request).pipe(
            catchError((error: HttpErrorResponse) => {
                if (error.status === 403) {
                    this.authService.logOut();
                }
                return throwError(() => error);
            })
        );
        // return this.esmpApiService.autorize().pipe(
        //     switchMap((SessionId: string) => next.handle(req.clone({
        //         setParams: { SessionId }
        //     })))
        // );
    }
} 

export const AuthInterceptorProvider: Provider = {
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true
}