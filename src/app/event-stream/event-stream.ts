import { Observable } from 'rxjs';

export interface EventStream<T> {
    event$: Observable<T>;
    emit(t: T): void;
}
