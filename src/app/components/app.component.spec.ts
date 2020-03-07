import { DaysConfigureComponent } from './days-configure/days-configure.component';
import { TargetSalesComponent } from './target-sales/target-sales.component';
import { MainComponent } from './main/main.component';
import { TestBed, async } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { ComponentStoreProviderService } from '../services/component-store-provider.service';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent, MainComponent, TargetSalesComponent, DaysConfigureComponent
      ],
      providers: [ComponentStoreProviderService]
    })
    .compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });
});
