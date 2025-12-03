import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnswerItem } from './answer-item';

describe('AnswerItem', () => {
  let component: AnswerItem;
  let fixture: ComponentFixture<AnswerItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnswerItem]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnswerItem);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
