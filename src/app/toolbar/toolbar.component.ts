import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {

  routes = [
    {name: 'Graph', path: '/graph'},
    {name: 'Table', path: '/table'}
  ]

  ngOnInit() {
  }

}
