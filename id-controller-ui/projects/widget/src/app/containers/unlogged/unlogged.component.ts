import { Component, Inject, NgModule, OnDestroy, OnInit, Input, HostBinding } from '@angular/core';
import { WidgetModes } from '../../enums/widget-modes.enum';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { WINDOW } from '../../utils/injection-tokens';
import { CookiesService } from '../../services/cookies.service';
import { PublicApiService } from '../../services/public-api.service';
import { PostMessagesService } from '../../services/post-messages.service';
import { MessageSubscriptionService } from '../../services/message-subscription.service';
import { environment } from '../../../environments/environment';
import { filter } from 'rxjs/operators';
import { PostMessageActions } from '@shared/enums/post-message-actions.enum';
import { PipesModule } from '../../pipes/pipes.module';

@Component({
  selector: 'wdgt-unlogged',
  templateUrl: './unlogged.component.html',
  styleUrls: ['./unlogged.component.scss'],
})
export class UnloggedComponent implements OnInit, OnDestroy {
  @Input() view: WidgetModes;

  isOpen = true;
  widgetMods = WidgetModes;
  hasCookie = false;
  openPassWindow: Window;
  postSubscription: Subscription;

  @HostBinding('class.modal')
  get isModal(): boolean {
    return this.view === WidgetModes.modal && this.isOpen;
  }

  get openerConfigs(): string {
    const { innerHeight, innerWidth } = this.window;
    const width = 400;
    const height = 500;
    const config = {
      width,
      height,
      left: (innerWidth - width) / 2,
      top: (innerHeight - height) / 2,
      location: environment.production ? 'no' : 'yes',
      toolbar: environment.production ? 'no' : 'yes',
    };
    return Object.entries(config)
      .map((entry) => entry.join('='))
      .join(',');
  }

  constructor(
    @Inject(WINDOW) private window: Window,
    private cookiesService: CookiesService,
    private publicApiService: PublicApiService,
    private postMessagesService: PostMessagesService,
    private messageSubscriptionService: MessageSubscriptionService
  ) {}

  ngOnInit() {
    this.hasCookie = !!this.cookiesService.getCookie(environment.cookieName);
  }

  ngOnDestroy() {
    this.messageSubscriptionService.destroyTokenListener();
    this.postSubscription?.unsubscribe?.();
  }

  backdropClick() {
    this.isOpen = false;
    this.publicApiService.setUserData({ token: null, email: null, isDeclined: true });
  }

  launchOpenPassApp() {
    const queryParams = new URLSearchParams({ origin: this.window.location.origin });
    const url = `${environment.idControllerAppUrl}/unauthenticated?${queryParams}`;
    this.openPassWindow = this.window.open(url, '_blank', this.openerConfigs);
    if (this.openPassWindow) {
      this.messageSubscriptionService.initTokenListener(this.openPassWindow);
      this.listenForClosingRequest();
    }
  }

  private listenForClosingRequest() {
    this.postSubscription = this.postMessagesService
      .getSubscription()
      .pipe(filter(({ action }) => action === PostMessageActions.closeChild))
      .subscribe(() => this.openPassWindow?.close());
  }
}

@NgModule({
  declarations: [UnloggedComponent],
  imports: [CommonModule, PipesModule],
})
class UnloggedModule {}