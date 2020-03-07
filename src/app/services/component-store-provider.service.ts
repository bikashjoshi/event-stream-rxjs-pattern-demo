import { MainEventStream, Main } from './../event-stream/main-event-stream';
import { Injectable } from '@angular/core';

@Injectable()
export class ComponentStoreProviderService {
  mainEventStream: MainEventStream;
  constructor() {
    const defaultMain: Main = {
      daysConfig: {
        daysPerWeek: 6,
        daysPerMonth: 24
      },
      targetSales: {
        perDay: 1,
        perWeek: 6,
        perMonth: 24
      }
    };

    this.mainEventStream = new MainEventStream(defaultMain);
   }
}
