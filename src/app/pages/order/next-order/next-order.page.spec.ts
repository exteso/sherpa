import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { NextOrderPage } from './next-order.page';

describe('NextOrderPage', () => {
  let component: NextOrderPage;
  let fixture: ComponentFixture<NextOrderPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NextOrderPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(NextOrderPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
