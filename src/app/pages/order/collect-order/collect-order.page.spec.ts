import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CollectOrderPage } from './collect-order.page';

describe('CollectOrderPage', () => {
  let component: CollectOrderPage;
  let fixture: ComponentFixture<CollectOrderPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CollectOrderPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CollectOrderPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
