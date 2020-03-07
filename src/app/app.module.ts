import { TargetSalesComponent } from './components/target-sales/target-sales.component';
import { DaysConfigureComponent } from './components/days-configure/days-configure.component';
import { MainComponent } from './components/main/main.component';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './components/app.component';


@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    DaysConfigureComponent,
    TargetSalesComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
