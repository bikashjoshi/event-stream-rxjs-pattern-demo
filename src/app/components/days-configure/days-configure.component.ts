import { DaysConfigureEventStream } from './../../event-stream/days-configure-stream';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ComponentStoreProviderService } from 'src/app/services/component-store-provider.service';
import { convertToMonthStream } from 'src/app/transformations/month-compute.transformation';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-days-configure',
  templateUrl: './days-configure.component.html',
  styleUrls: ['./days-configure.component.css']
})
export class DaysConfigureComponent implements OnInit, OnDestroy {
  daysConfigEventStream: DaysConfigureEventStream;
  maxDaysInWeek = 7;
  maxDaysInMonth = 31;
  minimumDays = 1;
  subscription: Subscription;

  constructor(private componentStoreProviderService: ComponentStoreProviderService) { }

  ngOnInit() {
    this.daysConfigEventStream = this.componentStoreProviderService.mainEventStream.daysConfigEventStream;
    convertToMonthStream(this.daysConfigEventStream.daysPerWeekEventStream.event$)
    .subscribe(x => this.perMonthDaysChange(x));
  }

  perWeekDaysChange(change: number): void {
    if (change > this.minimumDays && change <= this.maxDaysInWeek) {
      this.daysConfigEventStream.daysPerWeekEventStream.emit(change);
    }
  }

  perMonthDaysChange(change: number): void {
    if (change > this.minimumDays && change <= this.maxDaysInMonth) {
      this.daysConfigEventStream.daysPerMonthEventStream.emit(change);
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
