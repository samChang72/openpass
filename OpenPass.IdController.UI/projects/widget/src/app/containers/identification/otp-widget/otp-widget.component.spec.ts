import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtpWidgetComponent } from './otp-widget.component';
import { windowFactory } from '@utils/window-factory';
import { DEPLOY_URL, WINDOW } from '@utils/injection-tokens';
import { PipesModule } from '@pipes/pipes.module';
import { TranslateModule } from '@ngx-translate/core';
import { EventTrackingService } from '@rest/event-tracking/event-tracking.service';

describe('OtpWidgetComponent', () => {
  let component: OtpWidgetComponent;
  let fixture: ComponentFixture<OtpWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OtpWidgetComponent],
      imports: [PipesModule, TranslateModule.forRoot()],
      providers: [
        { provide: WINDOW, useFactory: windowFactory },
        { provide: DEPLOY_URL, useFactory: () => {} },
        { provide: EventTrackingService, useFactory: () => ({ track: () => ({ subscribe: () => {} }) }) },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OtpWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
