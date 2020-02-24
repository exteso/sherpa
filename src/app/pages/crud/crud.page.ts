import { Component, OnInit } from '@angular/core';

import { Pages } from '../../interfaces/pages';

@Component({
  selector: 'app-crud',
  templateUrl: './crud.page.html',
  styleUrls: ['./crud.page.scss'],
})

export class CrudPage implements OnInit {
  pages: Array<Pages>;

  constructor() {
    this.pages = [
      { title: 'Group List', url: '/group-list', direct: 'forward', icon: 'people' },
      { title: 'WeeklyCatalog List', url: '/catalog-list', direct: 'forward', icon: 'calendar' },
      { title: 'Order List', url: '/order-list', direct: 'forward', icon: 'cart' }
    ];
  }

  ngOnInit() {
  }

}
