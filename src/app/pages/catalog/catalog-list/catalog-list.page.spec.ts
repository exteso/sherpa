import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CatalogListPage } from './catalog-list.page';

describe('CatalogListPage', () => {
  let component: CatalogListPage;
  let fixture: ComponentFixture<CatalogListPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CatalogListPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CatalogListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
