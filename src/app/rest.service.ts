import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';

const dblpPublURL = 'https://dblp.org/search/publ/api?q=';
const dblpAuthorUrl = 'https://dblp.uni-trier.de/search/author/api?q=';


@Injectable({
  providedIn: 'root'
})
export class RestService {

  private serverHost = window.location.hostname;

  constructor(private http: HttpClient) { }

  searchRequest(searchKey: string, year: string, fromRes: number, resNo: number) {
    return this.http.get(dblpPublURL + searchKey +
      '+year:' + year +
      '&h=' + String(resNo) +
      '&f=' + String(fromRes) +
      '&format=json').toPromise();
  }

  searchAuthor(searchKey: string) {
    return this.http.get(dblpAuthorUrl + searchKey).toPromise();

  }
}
