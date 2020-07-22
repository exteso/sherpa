import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CatalogCreatePage } from './catalog-create.page';

describe('CatalogCreatePage', () => {
  let component: CatalogCreatePage;
  let fixture: ComponentFixture<CatalogCreatePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CatalogCreatePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CatalogCreatePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
