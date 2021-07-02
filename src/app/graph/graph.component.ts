import {AfterContentInit, AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {RestService} from '../rest.service';
import {ChartDataSets, ChartOptions, ChartType} from 'chart.js';
import {Color, Label, BaseChartDirective} from 'ng2-charts';
import * as jsnx from 'jsnetworkx';
import {HttpClient} from '@angular/common/http';
import {Observable, Subject, Subscription} from 'rxjs';
import {startWith, map} from 'rxjs/operators';
import { saveAs } from 'file-saver';
import { randomColor } from 'randomcolor';
import { QueryList } from '@angular/core';
import { ViewChildren } from '@angular/core';
import { FormControl } from '@angular/forms';


interface SelectOptions {
  value: string;
  text: string;
}

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.scss']
})
export class GraphComponent implements AfterViewInit {

  searchInput = 'Cosmin Bonchis, Adrian Craciun, Gabriel Istrate, Eva Kaslik, Mircea Marin, Marian Neagul,';
  graphOptions: SelectOptions[] = [
    {value: 'pubPerYear', text: 'No. of publications per year'}
  ];

  orderOptions: SelectOptions[] = [
    {value: '0', text: 'Order 0'},
    {value: '1', text: 'Order 1'},
    {value: '2', text: 'Order 2'},
    {value: '3', text: 'Order 3'},
    {value: '4', text: 'Order 4'}
  ];

  selectedOrderOption = '1';

  searchOptions: SelectOptions[] = [];
  selectedSearchOption: SelectOptions;

  data: ChartDataSets[] = []; 

  highlightOnHover = true;

  nodes = [];
  edges = [];
  nodesAndDegrees = {};
  G = new jsnx.Graph();

  serverUrl = 'http://' + window.location.hostname + ':3000/';

  _search$ = new Subject();
  search$ = this._search$.asObservable();
  searchSub = new Subscription();

  searchGraphInput: SelectOptions;
  graphSearch = false;
  myControl = new FormControl();
  filteredGraphSearchOptions: Observable<string[]>;


  constructor(private httpClient: HttpClient) { }

  @ViewChild('canvas', {static: false, read: ElementRef}) canvasEl: ElementRef;

  ngAfterViewInit(): void {
    this.newGraph();
    this.filteredGraphSearchOptions = this.myControl.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value))
      );
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.nodes.filter(node => node.toLowerCase().includes(filterValue));
  }

  onChange(inputValue) {
    var file:File = inputValue.target.files[0]; 
    var myReader:FileReader = new FileReader();

    myReader.onloadend = (e) => {
      this.parseJsonFile(myReader.result);
    }

    myReader.readAsText(file);
  }

  onHighlightChange(value) {
    this.highlightOnHover = value.checked;
  }

  public parseJsonFile(file) {
    if (this.isJson(file))  {
      const data = JSON.parse(file);
      if (data.nodes && data.edges) {
        this.newGraph();
        this.nodes = data.nodes;
        this.edges = data.edges;
        this.nodes.forEach(node => {
          const color = randomColor({
            luminosity: 'bright',
            hue: 'random'
          });
          const size = this.edges.map(edge => {
            return edge[0] + edge[1]
          }).filter((mergedEdge: string) => mergedEdge.includes(node)).length;
          this.G.addNode(node, {size: 100 + size* 2, color: color});
        });
        this.edges.forEach(edge => {
          this.G.addEdge(edge[0], edge[1], {size: 100});

        }) 
      }
    }
  }

  isJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

  exportData() {
    const blob = new Blob([JSON.stringify({nodes: this.nodes, edges: this.edges},  null, '\t')], {type: 'text/plain;charset=utf-8'});
    saveAs(blob, 'graph data.json');
  }

  exportSVG() {
    const canvasEl: HTMLElement = this.canvasEl.nativeElement;
    canvasEl.firstElementChild.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    const blob = new Blob([canvasEl.innerHTML], {type: 'text/plain;charset=utf-8'});
    saveAs(blob, 'graph svg.svg');
  }


  searchMultiple(authors: string[], index) {
    if (authors.length > index) {
      console.log(authors[index]);
      const req = new XMLHttpRequest();
      this.searchOptions = [];
      req.onreadystatechange = () => {
        if (req.readyState === 4 && req.status === 200) {
          req.responseXML.querySelectorAll('hit').forEach(h => {
            this.searchOptions.push({
              text: h.querySelector('author').textContent,
              value: h.querySelector('url').textContent
            });
          });
          this.searchInput = authors[index];
          if (this.searchOptions.length === 1) {
            this.createGraph(this.searchOptions[0].value);
            this.searchMultiple(authors, index + 1);
          } else if (this.searchOptions.length === 0) {
            this.searchMultiple(authors, index + 1);
          } else {
            this.searchSub = this.search$.subscribe(() => {
              this.searchSub.unsubscribe();
              this.searchMultiple(authors, index + 1);
            });
          }
        }
      };
      req.open('GET', 'https://dblp.uni-trier.de/search/author/api?q=' + authors[index], true);
      req.send();
    }
  }

  onSearch() {
    const listOfAuthors = this.searchInput.split(',');
    this.searchMultiple(listOfAuthors, 0);
  }

  clearGraph() {
    this.G = new jsnx.Graph();
    this.nodes = [];
    this.edges = [];
  }

  newGraph(nodes = [], edges = []) {

    this.clearGraphSearch();
    this.nodes = nodes;
    this.edges = edges;
    this.nodesAndDegrees = {};
    this.colorArray = {};
    this.G = new jsnx.Graph();
    jsnx.draw(this.G, {
      element: this.canvasEl.nativeElement,
      withLabels: true,
      panZoom: {
        enabled: true,
        scale: false
      },
      layoutAttr: {
        gravity: 0.12,
        charge: function(d) {
          return d.data.size * -300;
        },
        linkStrength: 0.2,
        friction: 0.94
      },
      nodeStyle: {
        fill: function(d) {
          return d.data.color;
        }
      },

      edgeStyle: {
        stroke: 'black'
      },
      nodeAttr: {
        r: function(d) {
          // `d` has the properties `node`, `data` and `G`
          return d.data.size;
        },
        title: function(d) {
          return d.node;
        }
      },
      edgeAttr: {
        parents: function(d) {
          return d.edge[0] + d.edge[1] ;
        },

      },
      labelStyle: {
        fill: 'black',
        'font-size': function(d) {
          return String(Math.max(d.data.size * 0.27, 22)) + 'px';
        }},
    }, true);
  }

  createGraph(node: any) {
    this.searchOptions = [];
    this.searchInput = undefined;
    this.selectedSearchOption = null;
    this._search$.next();
    try {
      this.getNode(node, parseInt(this.selectedOrderOption));
    } catch(err) {
      console.warn('error');
    }
  }

  colorArray = {};

  getNode(node: any, degrees = 1, parent?: string) {
    if (node) {
      const req = new XMLHttpRequest();
      req.onreadystatechange = () => {
        if (req.readyState === 4 && req.status === 200) {
          const publ = parseInt(req.responseXML.querySelector('dblpperson').getAttribute('n'), 0);
          const name = req.responseXML.querySelector('dblpperson').getAttribute('name');
          this.nodes.push(name);
          let color = '';
          if (parent && (degrees == 0)) {
            color = randomColor({
              luminosity: 'bright',
              hue: this.colorArray[parent] || 'random'
            });
          } else {
            color = randomColor({
              luminosity: 'bright',
              hue: 'random'
            });
            this.colorArray[name] = color;
          }

          if (this.nodesAndDegrees[name] === undefined || this.nodesAndDegrees[name] < degrees) {
            this.G.addNode(name, {size: degrees ? 200 * degrees: 100, color: color, publNo: publ});
            this.setMouseOverListener(name);
            this.nodesAndDegrees[name] = degrees;
          }
          if (degrees > 0) {
            req.responseXML.querySelectorAll('na').forEach(h => {
              const newEdge = [name, h.textContent];
              this.edges.push(newEdge);
              this.G.addEdge(name, h.textContent, {size: 100, publNo: publ});
              if ((this.nodes.filter(n => n === h.textContent).length === 0  && degrees > 0)|| degrees > 1) {
                if (h.getAttribute('pid') !== null && h.getAttribute('pid') !== 'null' && degrees > 1) {
                  const newLink = 'https://dblp.org/pid/' + h.getAttribute('pid');
                  this.getNode(newLink, degrees - 1, name);

                } else {
                  const auxNode = h.textContent;
                  this.nodes.push(auxNode);
                  this.nodesAndDegrees[auxNode] = 0;
                  const childColor = randomColor({
                    luminosity: 'bright',
                    hue: color
                  });
                  this.G.addNode(auxNode, {size: 100, color: childColor, publNo: publ});
                  this.setMouseOverListener(auxNode);
                }
              }
              this.addParentAttribute( h.textContent, name);
              this.addParentAttribute(name, h.textContent);
            });
          }
        }
        console.log('Loading');
      };
      req.open('GET',  node + '.xml', true);
      req.send();
    }
  }

  addParentAttribute(nodeName: string, parentName: string) {
    setTimeout(() => {
      const nodeEl: HTMLElement = this.canvasEl.nativeElement.querySelector('circle[title="'+nodeName+'"]');
      const parentNameAZ =  parentName.replace(/[^a-zA-Z]+/g, '');
      nodeEl.setAttribute(parentNameAZ, '');
    })
  }

  setMouseOverListener(nodeName: string) {
    setTimeout(() => {
      const nodeNameAZ =  nodeName.replace(/[^a-zA-Z]+/g, '');
      
      const parentNodeEl: HTMLElement = this.canvasEl.nativeElement.querySelector('circle[title="'+nodeName+'"]');

      if (parentNodeEl) {
        parentNodeEl.onmouseenter = () => {
          const nodeEls: HTMLElement[] = this.canvasEl.nativeElement.querySelectorAll('circle['+nodeNameAZ+']')
          const pathEls: HTMLElement[] = this.canvasEl.nativeElement.querySelectorAll('path[parents*="'+nodeName+'"]');
    
          if (this.highlightOnHover) {
            this.canvasEl.nativeElement.classList.add('hovered');
            parentNodeEl.classList.add('highlighted');
            nodeEls.forEach(node => node.classList.add('highlighted'));
            pathEls.forEach(node => node.classList.add('highlighted'));
          }

        }

        parentNodeEl.onmouseleave = () => {
          const nodeEls: HTMLElement[] = this.canvasEl.nativeElement.querySelectorAll('circle['+nodeNameAZ+']')
          const pathEls: HTMLElement[] = this.canvasEl.nativeElement.querySelectorAll('path[parents*="'+nodeName+'"]');  
          this.canvasEl.nativeElement.classList.remove('hovered');
          parentNodeEl.classList.remove('highlighted');
          nodeEls.forEach(node => node.classList.remove('highlighted'));
          pathEls.forEach(node => node.classList.remove('highlighted'));
        }
      }
    }, 100)
  }


  skipSearch() {
    this.searchOptions = [];
    this.searchInput = undefined;
    this.selectedSearchOption = null;
    this._search$.next();
  }

  onGraphSearch(value: string) {
    this.canvasEl.nativeElement.classList.remove('searchedGraph');

    const nodeNameAZ =  value.replace(/[^a-zA-Z]+/g, '');

    const parentNodeEl: HTMLElement = this.canvasEl.nativeElement.querySelector('circle[title="'+value+'"]');

    if (parentNodeEl) {
      this.graphSearch = true;
      const nodeEls: HTMLElement[] = this.canvasEl.nativeElement.querySelectorAll('circle['+nodeNameAZ+']')
      const pathEls: HTMLElement[] = this.canvasEl.nativeElement.querySelectorAll('path[parents*="'+value+'"]');

      this.canvasEl.nativeElement.classList.add('searchedGraph');
      parentNodeEl.classList.add('searched');
      nodeEls.forEach(node => node.classList.add('searched'));
      pathEls.forEach(node => node.classList.add('searched'));
    }
  }

  clearGraphSearch() {
    this.graphSearch = true;
    this.searchGraphInput = null;
    this.canvasEl.nativeElement.classList.remove('searchedGraph');
    this.canvasEl.nativeElement.querySelectorAll('circle.searched, path.searched').forEach(c => c.classList.remove('searched'));
  }

}
