import { Component, OnDestroy, OnInit } from '@angular/core';
import { Actions, ofActionDispatched, Select } from '@ngxs/store';
import { SsoState } from '@store/otp-widget/sso.state';
import { Observable, Subscription } from 'rxjs';
import { EventTypes } from '@shared/enums/event-types.enum';
import { AuthService } from '@services/auth.service';
import { DialogWindowService } from '@services/dialog-window.service';
import { EventsTrackingService } from '@services/events-tracking.service';
import { GetTokenByEmail, ReceiveToken } from '@store/otp-widget/auth.actions';
import { Dispatch } from '@ngxs-labs/dispatch-decorator';
import { AuthState, IAuthState } from '@store/otp-widget/auth.state';

@Component({
  selector: 'usrf-sso-view',
  templateUrl: './sso-view.component.html',
  styleUrls: ['./sso-view.component.scss'],
})
export class SsoViewComponent implements OnInit, OnDestroy {
  @Select(SsoState.isFetching)
  isFetching$: Observable<boolean>;
  @Select(AuthState.fullState)
  authState$: Observable<IAuthState>;

  eventTypes = EventTypes;

  private authSubscriptions: Subscription;

  constructor(
    private actions$: Actions,
    private authService: AuthService,
    private dialogWindowService: DialogWindowService,
    private eventsTrackingService: EventsTrackingService
  ) {}

  @Dispatch()
  getToken(email: string, eventType: EventTypes) {
    return new GetTokenByEmail(email, eventType);
  }

  ngOnInit() {
    this.authSubscriptions = this.actions$
      .pipe(ofActionDispatched(ReceiveToken))
      .subscribe(() => this.saveTokenAndClose());
  }

  ngOnDestroy() {
    this.authSubscriptions?.unsubscribe?.();
  }

  private saveTokenAndClose() {
    this.authService.setTokenToOpener();
    this.eventsTrackingService.trackEvent(EventTypes.consentGranted);
    this.dialogWindowService.closeDialogWindow();
  }
}
