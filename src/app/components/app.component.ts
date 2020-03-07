import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'event-stream-rxjs-pattern-demo';
  items: any[] = [ {id: 1}, {id: 2}, {id: 3}];
}
