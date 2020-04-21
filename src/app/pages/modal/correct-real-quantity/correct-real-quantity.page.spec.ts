import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CorrectRealQuantityPage } from './correct-real-quantity.page';

describe('CorrectRealQuantityPage', () => {
  let component: CorrectRealQuantityPage;
  let fixture: ComponentFixture<CorrectRealQuantityPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CorrectRealQuantityPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CorrectRealQuantityPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
