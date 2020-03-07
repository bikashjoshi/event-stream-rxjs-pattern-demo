import { Observable, combineLatest, SchedulerLike, merge, asyncScheduler } from 'rxjs';
import { map, filter, take, switchMap } from 'rxjs/operators';
import { TargetSales } from '../event-stream/target-sales-stream';

enum TargetSalesType {
  Daily,
  Weekly,
  Monthly
}

export function computedTargetSalesStream(
    workingDaysPerWeekStream: Observable<number>,
    daysPerMonthStream: Observable<number>,
    targetDailySalesStream: Observable<number>,
    targetWeeklySalesStream: Observable<number>,
    targetMonthlySalesStream: Observable<number>,
    scheduler: SchedulerLike = asyncScheduler
  ): Observable<TargetSales> {

    /* Specs: See target-sales-compute.transformer.spec.ts
      1) if working days per week or days per month changes, daily rates remains same, but weekly and monthly sales changes.
      2) if daily target sales changes, update weekly and monthly target sales. Daily Target is rounded off first.
      3) if weekly target sales changes, update daily and monthly target sales. Daily Target is rounded off first.
      4) if monthly target sales changes, update daily and weekly target sales. Daily Target is rounded off first.
    */

    const computedFromDailySalesStream: Observable<[number, number, number, TargetSalesType]>
    = combineLatest([
        workingDaysPerWeekStream,
        daysPerMonthStream,
        targetDailySalesStream
      ], scheduler)
      .pipe(filter(([x, y, z]) => x && y && z ? true : false))
      .pipe(map(([daysPerWeek, daysPerMonth, dailySales]) => [daysPerWeek, daysPerMonth, dailySales, TargetSalesType.Daily]));

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
                .pipe(map(([daysPerWeek, daysPerMonth]) => [daysPerWeek, daysPerMonth, targetSales, targetedSalesType as TargetSalesType]));
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

function computeSalesTarget(daysPerWeek: number, daysPerMonth: number, targetSales: number, targetedSalesType: TargetSalesType)
          : [number, number, number] {
    switch (targetedSalesType) {
      case TargetSalesType.Daily:
            const unitSale = Math.round(targetSales);
            return [unitSale, unitSale * daysPerWeek, unitSale * daysPerMonth];
      case TargetSalesType.Weekly:
            const dailySales = Math.round(targetSales / daysPerWeek);
            return [dailySales, dailySales * daysPerWeek, dailySales * daysPerMonth];
      case TargetSalesType.Monthly:
            const salesPerDay = Math.round(targetSales / daysPerMonth);
            return [salesPerDay, salesPerDay * daysPerWeek, salesPerDay * daysPerMonth];
      default:
        return [0, 0 , 0];
    }
  }

