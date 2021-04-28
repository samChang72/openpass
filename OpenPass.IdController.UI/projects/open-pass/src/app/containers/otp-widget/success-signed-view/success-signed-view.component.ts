import { Component, Inject, OnInit } from '@angular/core';
import { localStorage } from '@shared/utils/storage-decorator';
import { timer } from 'rxjs';
import { AuthService } from '@services/auth.service';
import { PostMessagesService } from '@services/post-messages.service';
import { PostMessagePayload } from '@shared/types/post-message-payload';
import { PostMessageActions } from '@shared/enums/post-message-actions.enum';
import { WINDOW } from '@utils/injection-tokens';
import { EventsTrackingService } from '@services/events-tracking.service';
import { EventTypes } from '@enums/event-types.enum';

@Component({
  selector: 'usrf-success-signed-view',
  templateUrl: './success-signed-view.component.html',
  styleUrls: ['./success-signed-view.component.scss'],
})
export class SuccessSignedViewComponent implements OnInit {
  @localStorage('openpass.email')
  private readonly userEmail: string;

  get secureEmail() {
    const visibleCharsCount = 3;
    const hiddenChars = Math.min((this.userEmail?.length || visibleCharsCount) - visibleCharsCount, 10);
    return (this.userEmail || '***')?.slice(0, visibleCharsCount) + '*'.repeat(hiddenChars);
  }

  constructor(
    @Inject(WINDOW) private window: Window,
    private authService: AuthService,
    private postMessagesService: PostMessagesService,
    private eventsTrackingService: EventsTrackingService
  ) {}

  ngOnInit() {
    const message: PostMessagePayload = { action: PostMessageActions.closeChild };
    this.authService.setTokenToOpener();
    this.eventsTrackingService.trackEvent(EventTypes.consentGranted);
    timer(5000).subscribe(() => {
      this.postMessagesService.sendMessage(message);
      this.window.close(); // fallback
    });
  }
}