import { computedTargetSalesStream } from 'src/app/transformations/target-sales-compute.transformations';
import { TestScheduler } from 'rxjs/testing';
import { Observable, timer, ReplaySubject } from 'rxjs';
import { TargetSales } from '../event-stream/target-sales-stream';

describe('computedTargetSalesStream-transformer', () => {
     let workingDaysPerWeekEventStream: ReplaySubject<number>;
     let daysPerMonthStream: ReplaySubject<number>;
     let targetDailySalesStream: ReplaySubject<number>;
     let targetWeeklySalesStream: ReplaySubject<number>;
     let targetMonthlySalesStream: ReplaySubject<number>;
     let scheduler: TestScheduler;
     let sut: Observable<TargetSales>;

     beforeEach(() => {
        workingDaysPerWeekEventStream = new ReplaySubject(1);
        daysPerMonthStream = new ReplaySubject(1);
        targetDailySalesStream = new ReplaySubject(1);
        targetWeeklySalesStream = new ReplaySubject(1);
        targetMonthlySalesStream = new ReplaySubject(1);
        scheduler = new TestScheduler((actual, expected) => {
            expect(actual).toEqual(expected);
          });
        sut = computedTargetSalesStream(
            workingDaysPerWeekEventStream,
            daysPerMonthStream,
            targetDailySalesStream,
            targetWeeklySalesStream,
            targetMonthlySalesStream,
            scheduler);
    });

     it('it should compute weekly and monthly from provided daily target sales and days config with daily rates rounded off.', () => {
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

     it('it should compute daily and monthly from provided weekly target sales and days config with daily rates rounded off.', () => {
        scheduler.run(({ expectObservable })  => {
            timer(2)
             .subscribe(_ => {
                 workingDaysPerWeekEventStream.next(3);
                 daysPerMonthStream.next(30);
                 targetDailySalesStream.next(1);
             });

            timer(4)
             .subscribe(_ => targetWeeklySalesStream.next(10));

            const expectedTargetSales: TargetSales[] = [{
                 perDay: 1,
                 perWeek: 1 * 3, // perDay * number of days in a week
                 perMonth: 1 * 30 // perDay * number of days in a month
             },
             {
                perDay: 3, // rounding of weekly => target/ number of week => 10 / 3
                perWeek: 3 * 3, // perDay * number of days in a week
                perMonth: 3 * 30 // perDay * number of days in a month
            },
            ];

            const expectedMarbles = '--a-b';
            const expectedValues = { a : expectedTargetSales[0], b: expectedTargetSales[1] };

            expectObservable(sut).toBe(expectedMarbles, expectedValues);
         });
        });

     it('it should compute daily and weekly from provided monthly target sales and days config with daily rates rounded off.', () => {
            scheduler.run(({ expectObservable })  => {
                timer(2)
                 .subscribe(_ => {
                     workingDaysPerWeekEventStream.next(5);
                     daysPerMonthStream.next(20);
                     targetDailySalesStream.next(1);
                 });

                timer(5)
                 .subscribe(_ => targetMonthlySalesStream.next(100));

                const expectedTargetSales: TargetSales[] = [{
                     perDay: 1,
                     perWeek: 1 * 5, // perDay * number of days in a week
                     perMonth: 1 * 20 // perDay * number of days in a month
                 },
                 {
                    perDay: 5, // rounding of monthly => target / number of days in month => 100 / 20
                    perWeek: 5 * 5, // perDay * number of days in a week
                    perMonth: 5 * 20 // perDay * number of days in a month
                },
                ];

                const expectedMarbles = '--a--b';
                const expectedValues = { a : expectedTargetSales[0], b: expectedTargetSales[1] };

                expectObservable(sut).toBe(expectedMarbles, expectedValues);
             });
            });
});
