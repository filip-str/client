import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GraphComponent } from './graph/graph.component';
import { TableComponent } from './table/table.component';


const routes: Routes = [
  { path: 'graph', component: GraphComponent },
  { path: 'table', component: TableComponent },
  { path: '', redirectTo: '/graph', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
