import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { EsmpApiService } from './services/esmp-api.service';
import { TicketInformationComponent } from './ticket-information/ticket-information.component';
import { TicketsListComponent } from './tickets-list/tickets-list.component';
import { AuthInterceptorProvider } from './interceptors/auth.interceptor';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzPaginationModule } from "ng-zorro-antd/pagination";
import { NzTableModule } from "ng-zorro-antd/table";
import { NZ_I18N } from 'ng-zorro-antd/i18n';
import { en_US } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NzCommentModule } from 'ng-zorro-antd/comment';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzCardModule } from 'ng-zorro-antd/card';
import { LoginComponent } from './login/login.component';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageModule } from 'ng-zorro-antd/message';



registerLocaleData(en);

@NgModule({
  declarations: [
    AppComponent,
    TicketInformationComponent,
    TicketsListComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NzPaginationModule,
    NzTableModule,
    BrowserAnimationsModule,
    NzCommentModule,
    NzAvatarModule,
    NzListModule,
    NzCardModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzMessageModule,
  ],
  providers: [EsmpApiService, AuthInterceptorProvider, { provide: NZ_I18N, useValue: en_US }],
  bootstrap: [AppComponent]
})
export class AppModule { }
