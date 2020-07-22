import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SelectUsersPage } from './select-users.page';

describe('SelectUsersPage', () => {
  let component: SelectUsersPage;
  let fixture: ComponentFixture<SelectUsersPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectUsersPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SelectUsersPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
