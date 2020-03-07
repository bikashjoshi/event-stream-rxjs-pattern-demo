import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DaysConfigureComponent } from './days-configure.component';
import { ComponentStoreProviderService } from 'src/app/services/component-store-provider.service';

describe('DaysConfigureComponent', () => {
  let component: DaysConfigureComponent;
  let fixture: ComponentFixture<DaysConfigureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DaysConfigureComponent],
      providers: [ComponentStoreProviderService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DaysConfigureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
