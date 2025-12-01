import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionDialog } from './question-dialog';

describe('QuestionDialog', () => {
  let component: QuestionDialog;
  let fixture: ComponentFixture<QuestionDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestionDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuestionDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
