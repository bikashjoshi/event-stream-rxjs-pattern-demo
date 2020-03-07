import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TargetSalesComponent } from './target-sales.component';
import { ComponentStoreProviderService } from 'src/app/services/component-store-provider.service';

describe('TargetSalesComponent', () => {
  let component: TargetSalesComponent;
  let fixture: ComponentFixture<TargetSalesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TargetSalesComponent ],
      providers: [ComponentStoreProviderService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TargetSalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
