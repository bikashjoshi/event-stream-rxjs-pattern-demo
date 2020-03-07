import { startWith, observeOn, shareReplay, map, filter } from 'rxjs/operators';
import { SchedulerLike, asyncScheduler, Observable, combineLatest } from 'rxjs';
import { EventStream } from './event-stream';
import { EventStreamBase } from './event-stream-base';

export interface TargetSales {
    perDay: number;
    perWeek: number;
    perMonth: number;
}

export class TargetSalesEventStream implements EventStream<TargetSales> {
    perDayEventStream: EventStreamBase<number>;
    perWeekEventStream: EventStreamBase<number>;
    perMonthEventStream: EventStreamBase<number>;

    constructor(private startWithTargetSales: TargetSales, private scheduler: SchedulerLike = asyncScheduler){
        this.perDayEventStream = new EventStreamBase(startWithTargetSales.perDay, scheduler);
        this.perWeekEventStream = new EventStreamBase(startWithTargetSales.perWeek, scheduler);
        this.perMonthEventStream = new EventStreamBase(startWithTargetSales.perMonth, scheduler);
    }

    get event$(): Observable<TargetSales> {
     const observable =  combineLatest([
            this.perDayEventStream.event$,
            this.perWeekEventStream.event$,
            this.perMonthEventStream.event$
        ], this.scheduler)
        .pipe(observeOn(this.scheduler))
        .pipe(filter(([x, y, z]) => x && y && z ? true : false))
        .pipe(map(([x, y, z]) => <TargetSales> {
            perDay: x,
            perWeek: y,
            perMonth: z
        }))
        .pipe(shareReplay(1))
        .pipe(startWith(this.startWithTargetSales));
        
     return observable;
    }

    emit(t: TargetSales): void {
        this.scheduler.schedule(_ => {
            this.perDayEventStream.emit(t.perDay);
            this.perWeekEventStream.emit(t.perWeek);
            this.perMonthEventStream.emit(t.perMonth);
        });
    }
}
