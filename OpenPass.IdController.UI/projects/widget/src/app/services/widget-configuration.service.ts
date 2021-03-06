import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { WidgetConfiguration } from '@app-types/widget-configuration';
import { WidgetModes } from '@enums/widget-modes.enum';
import { Variants } from '@enums/variants.enum';
import { Sessions } from '@enums/sessions.enum';
import { Providers } from '@enums/providers.enum';

@Injectable({
  providedIn: 'root',
})
export class WidgetConfigurationService {
  isModal = false;
  isRequired = false;

  private configuration = new BehaviorSubject<WidgetConfiguration>({
    ifa: '',
    uid2: '',
    ctoBundle: '',
    view: WidgetModes.native,
    variant: Variants.dialog,
    session: Sessions.authenticated,
    provider: Providers.advertiser,
  });

  getConfiguration(): Observable<WidgetConfiguration> {
    return this.configuration.asObservable();
  }

  setConfiguration(config: WidgetConfiguration) {
    this.isModal = config.view === WidgetModes.modal || config.view === WidgetModes.nonSkippableModal;
    this.isRequired = config.view === WidgetModes.nonSkippableModal;
    this.configuration.next(config);
  }
}
