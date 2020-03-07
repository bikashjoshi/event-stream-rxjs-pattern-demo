import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export function convertToMonthStream(weekStream: Observable<number>): Observable<number> {
    return weekStream.pipe(map(x => 4 * x)); // month transformation is four times weekly working days
}
