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
      { title: 'Gruppi Grom', url: '/group-list', direct: 'forward', icon: 'people' },
      { title: 'Catalogo Prodotti Settimanale', url: '/catalog-list', direct: 'forward', icon: 'calendar' },
      { title: 'Ordine Settimanale Gruppo Roncaccio', url: '/order-list', direct: 'forward', icon: 'cart' }
    ];
  }

  ngOnInit() {
  }

}
