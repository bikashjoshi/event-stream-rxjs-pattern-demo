import { Component, OnInit } from '@angular/core';
import { ComponentStoreProviderService } from 'src/app/services/component-store-provider.service';
import { TargetSalesEventStream } from 'src/app/event-stream/target-sales-stream';

@Component({
  selector: 'app-target-sales',
  templateUrl: './target-sales.component.html',
  styleUrls: ['./target-sales.component.css']
})
export class TargetSalesComponent implements OnInit {

  targetSalesEventStream: TargetSalesEventStream;

  constructor(private componentStoreProviderService: ComponentStoreProviderService) { }

  ngOnInit() {
    const mainStream = this.componentStoreProviderService.mainEventStream;
    this.targetSalesEventStream = mainStream.targetSalesEventStream;
   }

  onDailyTargetChanges(change: number): void {
    this.targetSalesEventStream.perDayEventStream.emit(change);
  }

  onWeeklyTargetChanges(change: number): void {
    this.targetSalesEventStream.perWeekEventStream.emit(change);
  }

  onMonthlyTargetChanges(change: number): void {
    this.targetSalesEventStream.perMonthEventStream.emit(change);
  }
}
