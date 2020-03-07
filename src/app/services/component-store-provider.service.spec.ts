import { TestBed } from '@angular/core/testing';

import { ComponentStoreProviderService } from './component-store-provider.service';
import { MainComponent } from '../components/main/main.component';
import { DaysConfigureComponent } from '../components/days-configure/days-configure.component';
import { TargetSalesComponent } from '../components/target-sales/target-sales.component';

describe('ComponentStoreProviderService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    declarations: [ MainComponent, DaysConfigureComponent, TargetSalesComponent ],
      providers: [ComponentStoreProviderService]
  }));

  it('should be created', () => {
    const service: ComponentStoreProviderService = TestBed.get(ComponentStoreProviderService);
    expect(service).toBeTruthy();
  });
});
