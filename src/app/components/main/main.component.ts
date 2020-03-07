import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ComponentStoreProviderService } from 'src/app/services/component-store-provider.service';
import { debounceTime } from 'rxjs/operators';
import { computedTargetSalesStream } from 'src/app/transformations/target-sales-compute.transformations';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css'],
  providers: [ComponentStoreProviderService]
})
export class MainComponent implements OnInit, OnDestroy { 
  @Input()
  title: string;
  subscription: Subscription;
  constructor(private componentStoreProviderService: ComponentStoreProviderService) { }

  ngOnInit() {
    const mainStream = this.componentStoreProviderService.mainEventStream;
    const configStream = mainStream.daysConfigEventStream;
    const targetSalesStream = mainStream.targetSalesEventStream;
    const changedSalesStream = computedTargetSalesStream(
      configStream.daysPerWeekEventStream.event$,
      configStream.daysPerMonthEventStream.event$,
      targetSalesStream.perDayEventStream.event$,
      targetSalesStream.perWeekEventStream.event$,
      targetSalesStream.perMonthEventStream.event$
    );

    this.subscription = changedSalesStream
    .pipe(debounceTime(200))
    .subscribe(x => targetSalesStream.emit(x));
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
