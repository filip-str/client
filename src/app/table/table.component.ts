import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {RestService} from '../rest.service';
import {MatPaginator, MatTableDataSource} from '@angular/material';
import {isArray} from 'util';

export interface Publication {
  authors: string;
  title: string;
  venue: string;
  year: string;
}

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
export class TableComponent implements OnInit {

  @Input() dataSource = new MatTableDataSource<Publication>([]);

  columnsToDisplay = ['authors', 'title', 'venue', 'year'];

  searchInput = '';
  noOfResults = 0;

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  constructor(private restService: RestService) { }

  ngOnInit() {
    this.dataSource.paginator = this.paginator;
  }

  onSearch() {
    this.restService.searchRequest(this.searchInput, '', 0, 10)
      .then((result: any) => {
        this.fillTable(result['result']['hits']['hit']);
        this.noOfResults = parseInt(result['result']['hits']['@total'], 10);
      })
      .catch((err) => console.error('Server Error: ', err));
  }

  fillTable(results: string[]) {
    const newDataSource = new MatTableDataSource<Publication>([]);
    results.map(result => result['info']).forEach(result => {
      let authors = '';
      const authorArray = isArray(result['authors']['author']) ? result['authors']['author'] : [result['authors']['author']];
      authorArray.map(author => author['text']).forEach(author => {
        authors += ( authors !== '' ? ', ' : '') + this.decodeXML(author);
      });

      const title = this.decodeXML(result['title']);
      const venue = this.decodeXML(result['venue']);
      const year = result['year'];

      const Publication: Publication = {authors, title, venue, year};
      newDataSource.data.push(Publication);
    });
    this.dataSource = newDataSource;
  }

  decodeXML(value: string): string {
    if (value) {
      return value.replace(/&amp;/g, '&')
        .replace(/&apos;/g, '\'')
        .replace(/&quot;/g, '"')
        .replace(/&gt;/g, '>')
        .replace(/&lt;/g, '<');
    }
  }

  turnPage(event: any) {
    this.restService.searchRequest(this.searchInput, '', event.pageIndex * 10 + 1, 10)
      .then((result: any) => {
        this.fillTable(result['result']['hits']['hit']);
      })
      .catch((err) => console.error('Server Error: ', err));
  }
}
