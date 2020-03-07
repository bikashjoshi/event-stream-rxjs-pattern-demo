import { Observable, combineLatest, SchedulerLike, asyncScheduler } from 'rxjs';
import { startWith, filter, map, observeOn, shareReplay } from 'rxjs/operators';
import { EventStream } from './event-stream';
import { TargetSales, TargetSalesEventStream } from './target-sales-stream';
import { DaysConfigure, DaysConfigureEventStream } from './days-configure-stream';

export interface Main {
    daysConfig: DaysConfigure;
    targetSales: TargetSales;
}

export class MainEventStream implements EventStream<Main> {
    daysConfigEventStream: DaysConfigureEventStream;
    targetSalesEventStream: TargetSalesEventStream;

    constructor(private startWithMain: Main, private scheduler: SchedulerLike = asyncScheduler) {
        this.daysConfigEventStream = new DaysConfigureEventStream(startWithMain.daysConfig, scheduler);
        this.targetSalesEventStream = new TargetSalesEventStream(startWithMain.targetSales, scheduler);
    }

    get event$(): Observable<Main> {
       const observable = combineLatest([
        this.daysConfigEventStream.event$,
        this.targetSalesEventStream.event$
       ], this.scheduler)
        .pipe(filter(([x, y]) => x && y ? true : false))
        .pipe(map(([x, y]) => <Main>{
            daysConfig: x,
            targetSales: y
        }))
        .pipe(observeOn(this.scheduler))
        .pipe(shareReplay(1))
        .pipe(startWith(this.startWithMain));

       return observable;
    }     
    
    emit(t: Main): void {
       this.scheduler.schedule(_ => {
        this.daysConfigEventStream.emit(t.daysConfig);
        this.targetSalesEventStream.emit(t.targetSales);
       });
    }
}
