# EventStream Pattern with RXJS

A light weight state management using RXJS that allows state and data sharing among different components for an Angular application. This application demonstrates a pattern without using any specific framework for state management other than RXJS. 

In addition, this demo application also demonstrates usage of one way binding along with transformations of streams using RXJS operators such as combineLatest, merge, distinctUntilChanged, switchMap and filter. 

The application also provides sample usage of stream binding using Angular async pipe along with the marble unit tests and TestScheduler using RXJS testing.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. 


## Event Stream Interface

```
export interface EventStream<T> {
    event$: Observable<T>;
    emit(t: T): void;
}

```

## Defining General Purpose Event Stream

```
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

```

## Defining Composite Event Stream

```
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

```

## Transformations with Pure Functions

```
export function computedTargetSalesStream(
    workingDaysPerWeekStream: Observable<number>,
    daysPerMonthStream: Observable<number>,
    targetDailySalesStream: Observable<number>,
    targetWeeklySalesStream: Observable<number>,
    targetMonthlySalesStream: Observable<number>,
    scheduler: SchedulerLike = asyncScheduler
  ): Observable<TargetSales> {
      
   const computedFromDailySalesStream: Observable<[number, number, number, TargetSalesType]>
    = combineLatest([
        workingDaysPerWeekStream,
        daysPerMonthStream,
        targetDailySalesStream
      ], scheduler)
      .pipe(filter(([x, y, z]) => x && y && z ? true : false))
      .pipe(map(([daysPerWeek, daysPerMonth, dailySales]) => 
                    [daysPerWeek, daysPerMonth, dailySales, TargetSalesType.Daily]));

    const combinedWeeklyAndMonthlySalesStream: Observable<[number, TargetSalesType]>
    = merge(
        targetWeeklySalesStream.pipe(map(x => [x, TargetSalesType.Weekly])),
        targetMonthlySalesStream.pipe(map(x => [x, TargetSalesType.Monthly])),
        scheduler)
        .pipe(map(([x, y]) => [x as number, y as TargetSalesType]));

    const combinedDailyAndWeeklyDaysStream: Observable<[number, number]>
        = combineLatest([
          workingDaysPerWeekStream,
          daysPerMonthStream],
          scheduler)
         .pipe(filter(([x, y]) => x && y ? true : false));

    const computedWeeklyAndMonthlySalesStream: Observable<[number, number, number, TargetSalesType]>
    = combinedWeeklyAndMonthlySalesStream
      .pipe(map(([targetSales, targetedSalesType]) => {
        return combinedDailyAndWeeklyDaysStream
                .pipe(take(1))
                .pipe(map(([daysPerWeek, daysPerMonth]) => 
                              [daysPerWeek, daysPerMonth, targetSales, targetedSalesType as TargetSalesType]));
      }))
      .pipe(switchMap((_) => _))
      .pipe(map(([a, b, c, d]) => [a as number, b as number, c as number, d as TargetSalesType]));

    const resultingStream
    = merge(
            computedFromDailySalesStream,
            computedWeeklyAndMonthlySalesStream,
            scheduler)
        .pipe(map(([daysPerWeek, daysPerMonth, targetSales, targetedSalesType]) =>
                    computeSalesTarget(daysPerWeek, daysPerMonth, targetSales, targetedSalesType)));

    return resultingStream
           .pipe(map(x => <TargetSales>{
             perDay: x[0],
             perWeek: x[1],
             perMonth: x[2]
           }));
  }

```

## Unit Tests of Transformation function with RXJS Marble Testing

```
 it('it should compute weekly and monthly from provided daily target sales and days 
 config with daily rates rounded off.', () => {
       scheduler.run(({ expectObservable })  => {
           timer(2)
            .subscribe(_ => {
                workingDaysPerWeekEventStream.next(3);
                daysPerMonthStream.next(12);
                targetDailySalesStream.next(1.3);
            });

           const expectedTargetSales: TargetSales = {
                perDay: 1, // rounding
                perWeek: 1 * 3, // perDay * number of days a in week
                perMonth: 1 * 12 // perDay * number of days in a month
            };

           const expectedMarbles = '--a';
           const expectedValues = { a : expectedTargetSales };

           expectObservable(sut).toBe(expectedMarbles, expectedValues);
        });
       });
```

## Defining Store Service for Component Level Composite EventStream
```
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
```

## Defining Store Service at Parent Component
```
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
```

## Using async pipe with the intended event streams on the HTML template
```
<div class="sales-target-container">
        <span>Daily sales target:</span>
        <input type="number"[value]="targetSalesEventStream.perDayEventStream.event$ | async" 
               (change)="onDailyTargetChanges($event.target.value)"/>
</div>
```
```
 onDailyTargetChanges(change: number): void {
    this.targetSalesEventStream.perDayEventStream.emit(change);
  }
```