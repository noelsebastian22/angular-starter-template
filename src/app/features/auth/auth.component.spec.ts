import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthComponent } from './auth.component';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import * as AuthActions from './store';

describe('AuthComponent', () => {
  let fixture: ComponentFixture<AuthComponent>;
  let component: AuthComponent;
  let store: MockStore;
  const initialState = {
    auth: {
      user: null,
      loading: false,
      error: null,
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthComponent, FormsModule],
      providers: [provideMockStore({ initialState })],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render login form', () => {
    const inputs = fixture.debugElement.queryAll(By.css('input'));
    const button = fixture.debugElement.query(By.css('button'));
    expect(inputs.length).toBe(2);
    expect(button.nativeElement.textContent).toContain('Login');
  });

  it('should dispatch login action on form submit', () => {
    const dispatchSpy = jest.spyOn(store, 'dispatch');

    component.username = 'testuser';
    component.password = 'testpass';

    fixture.debugElement
      .query(By.css('form'))
      .triggerEventHandler('submit', {});
    fixture.detectChanges();

    expect(dispatchSpy).toHaveBeenCalledWith(
      AuthActions.login({ username: 'testuser', password: 'testpass' }),
    );
  });

  it('should not dispatch if fields are empty', () => {
    const dispatchSpy = jest.spyOn(store, 'dispatch');
    component.username = '';
    component.password = '';
    fixture.debugElement
      .query(By.css('form'))
      .triggerEventHandler('submit', {});
    expect(dispatchSpy).not.toHaveBeenCalled();
  });
});
