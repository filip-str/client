import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
  MatFormFieldModule, MatInputModule, MatSelectModule,
  MatOptionModule, MatButtonModule, MatTableModule, MatPaginatorModule,
  MatToolbarModule, MatCardModule, MatListModule, MatSnackBarModule,
  MatProgressSpinnerModule, MatSlideToggleModule, MatAutocompleteModule
} from '@angular/material';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { TableComponent } from './table/table.component';
import { GraphComponent } from './graph/graph.component';
import {ChartsModule, ThemeService} from 'ng2-charts';


@NgModule({
  declarations: [
    AppComponent,
    ToolbarComponent,
    TableComponent,
    GraphComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatOptionModule, MatButtonModule, MatTableModule,
    MatPaginatorModule, MatToolbarModule, MatCardModule,
    MatListModule, ChartsModule, MatSnackBarModule, MatProgressSpinnerModule,
    MatSlideToggleModule, MatAutocompleteModule, ReactiveFormsModule 
  ],
  providers: [ThemeService],
  bootstrap: [AppComponent]
})
export class AppModule { }
