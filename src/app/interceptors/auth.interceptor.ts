import { Injectable, Provider, inject } from '@angular/core';
import { HttpInterceptor, HttpEvent, HttpHandler, HttpRequest, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable, switchMap, map } from 'rxjs';
import { EsmpApiService } from '../services/esmp-api.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    private readonly esmpApiService = inject(EsmpApiService);

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(req);
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