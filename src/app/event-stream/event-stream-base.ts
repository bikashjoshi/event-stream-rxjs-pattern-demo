import { Observable, SchedulerLike, asyncScheduler, Subject, BehaviorSubject } from 'rxjs';
import { observeOn, shareReplay, distinctUntilChanged} from 'rxjs/operators';
import { EventStream } from './event-stream';

export class EventStreamBase<T> implements EventStream<T> {
    private event: Subject<T>;
    private eventObservable: Observable<T>;

    constructor(t: T, private scheduler: SchedulerLike = asyncScheduler) {
        this.event = new BehaviorSubject<T>(t);
        this.eventObservable = this.event
                                .pipe(observeOn(scheduler))
                                .pipe(distinctUntilChanged())
                                .pipe(shareReplay(1));
    }

    get event$(): Observable<T> {
       return this.eventObservable;
    }

    emit(t: T): void {
        this.scheduler.schedule(_ => this.event.next(t));
    }
}
