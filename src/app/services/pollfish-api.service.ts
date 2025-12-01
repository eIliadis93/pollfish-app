import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, retry, throwError } from 'rxjs';

import { Question } from '../models/question.model';
import { ApiResponse } from '../models/api-response.model';
import { ErrorTrackingService } from './error-tracking.service';
import { AppError } from '../models/app-error.model';
import { environment } from '../../environments/environment';
import { RequestResult } from '../models/request-result.model';

@Injectable({ providedIn: 'root' })
export class PollfishApiService {
  private readonly http = inject(HttpClient);
  private readonly errorTracking = inject(ErrorTrackingService);

  private readonly baseUrl = environment.apiBaseUrl;
  private readonly totalRetries = 3;

  private buildUrl(path: string): string {
    let url = `${this.baseUrl}${path}`;

    if (environment.production) {
      //setting the env only in production for testing purposes
      const sep = url.includes('?') ? '&' : '?';
      url = `${url}${sep}env=production`;
    }

    return url;
  }

  private handleRequest<ResponseData>(
    operation: string,
    source$: Observable<ApiResponse<ResponseData>>
  ): Observable<RequestResult<ResponseData>> {
    return source$.pipe(
      retry({ count: this.totalRetries - 1, delay: 1000 }),
      map((res) => this.extractDataOrThrow<ResponseData>(operation, res)),
      catchError((error) => this.handleError(operation, error))
    );
  }

  private extractDataOrThrow<ResponseData>(
    operation: string,
    res: ApiResponse<ResponseData>
  ): RequestResult<ResponseData> {
    if (!res.success) {
      const msg = res.error || res.message || 'Unknown API error';
      throw new Error(`(${operation}) ${msg}`);
    }

    return {
      data: res.data as ResponseData,
      message: res.message,
    };
  }

  private handleError(operation: string, error: unknown): Observable<never> {
    const appError: AppError = this.errorTracking.track(operation, error, this.totalRetries);

    return throwError(() => appError);
  }

  loadQuestionnaire(): Observable<RequestResult<Question[]>> {
    const url = this.buildUrl('/questions');

    return this.handleRequest<Question[]>(
      'loadQuestionnaire',
      this.http.get<ApiResponse<Question[]>>(url)
    );
  }

  saveQuestionnaire(questions: Question[]): Observable<RequestResult<Question[]>> {
    const url = this.buildUrl('/questionnaire');

    return this.handleRequest<Question[]>(
      'saveQuestionnaire',
      this.http.post<ApiResponse<Question[]>>(url, questions)
    );
  }

  updateQuestion(questionId: string, patch: Partial<Question>): Observable<RequestResult<void>> {
    const url = this.buildUrl(`/questions/${questionId}`);

    return this.handleRequest<void>('updateQuestion', this.http.put<ApiResponse<void>>(url, patch));
  }

  deleteQuestion(remainingQuestions: Question[]): Observable<RequestResult<Question[]>> {
    return this.saveQuestionnaire(remainingQuestions);
  }
}
