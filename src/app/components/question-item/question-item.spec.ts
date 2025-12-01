import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionItem } from './question-item';

describe('QuestionItem', () => {
  let component: QuestionItem;
  let fixture: ComponentFixture<QuestionItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestionItem]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuestionItem);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
