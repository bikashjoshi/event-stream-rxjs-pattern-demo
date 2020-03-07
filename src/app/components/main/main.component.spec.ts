import { TargetSalesComponent } from './../target-sales/target-sales.component';
import { DaysConfigureComponent } from './../days-configure/days-configure.component';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MainComponent } from './main.component';
import { ComponentStoreProviderService } from 'src/app/services/component-store-provider.service';

describe('MainComponent', () => {
  let component: MainComponent;
  let fixture: ComponentFixture<MainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MainComponent, DaysConfigureComponent, TargetSalesComponent ],
      providers: [ComponentStoreProviderService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
