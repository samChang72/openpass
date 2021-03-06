import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { NgxsModule } from '@ngxs/store';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { windowFactory } from '@utils/window-factory';
import { environment } from '@env';
import { NgxsDispatchPluginModule } from '@ngxs-labs/dispatch-decorator';
import { SsoState } from '@store/otp-widget/sso.state';
import { AuthState } from '@store/otp-widget/auth.state';
import { OpenerState } from '@store/otp-widget/opener.state';
import { ControlsState } from '@store/controls.state';
import { OtpWidgetState } from '@store/otp-widget/otp-widget.state';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { WINDOW } from '@utils/injection-tokens';
import { TrackingDataInterceptor } from './interceptors/tracking-data.interceptor';

export const createTranslateLoader = (http: HttpClient): TranslateHttpLoader =>
  new TranslateHttpLoader(http, './assets/i18n/', '.json');

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    RouterModule,
    AppRoutingModule,
    HttpClientModule,
    NgxsModule.forRoot([OpenerState, OtpWidgetState, AuthState, SsoState, ControlsState], {
      developmentMode: !environment.production,
    }),
    NgxsDispatchPluginModule.forRoot(),
    TranslateModule.forRoot({
      defaultLanguage: 'en',
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient],
      },
    }),
  ],
  providers: [
    { provide: WINDOW, useFactory: windowFactory },
    { provide: HTTP_INTERCEPTORS, useClass: TrackingDataInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
