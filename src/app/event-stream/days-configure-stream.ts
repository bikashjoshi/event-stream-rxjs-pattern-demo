import { Observable, SchedulerLike, asyncScheduler, combineLatest } from 'rxjs';
import { filter, map, observeOn, shareReplay, startWith } from 'rxjs/operators';
import { EventStream } from './event-stream';
import { EventStreamBase } from './event-stream-base';

export interface DaysConfigure {
    daysPerWeek: number;
    daysPerMonth: number;
}

export class DaysConfigureEventStream implements EventStream<DaysConfigure> {
    daysPerWeekEventStream: EventStreamBase<number>;
    daysPerMonthEventStream: EventStreamBase<number>;

    constructor(private startDaysConfig: DaysConfigure, private scheduler: SchedulerLike = asyncScheduler) {
        this.daysPerMonthEventStream = new EventStreamBase(startDaysConfig.daysPerMonth, scheduler);
        this.daysPerWeekEventStream = new EventStreamBase(startDaysConfig.daysPerWeek, scheduler);
    }

    get event$(): Observable<DaysConfigure> {
        const observable = combineLatest([
            this.daysPerMonthEventStream.event$, 
            this.daysPerWeekEventStream.event$], 
            this.scheduler)
        .pipe(filter(([x, y]) => x && y ? true : false))
        .pipe(map(([x, y]) => <DaysConfigure>{
            daysPerWeek: x,
            daysPerMonth: y
        }))
        .pipe(observeOn(this.scheduler))
        .pipe(shareReplay(1))
        .pipe(startWith(this.startDaysConfig));

        return observable;
    }    
    
    emit(daysConfig: DaysConfigure): void {
        this.scheduler.schedule(_ => {
            this.daysPerWeekEventStream.emit(daysConfig.daysPerWeek);
            this.daysPerMonthEventStream.emit(daysConfig.daysPerMonth);
        });
    }
}
