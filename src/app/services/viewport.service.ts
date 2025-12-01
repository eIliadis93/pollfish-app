import { Injectable, inject, signal, computed, DestroyRef } from '@angular/core';
import { fromEvent } from 'rxjs';
import { startWith, map, distinctUntilChanged } from 'rxjs/operators';
import { ViewportSize, ViewportState } from '../models/viewport.model';

@Injectable({ providedIn: 'root' })
export class ViewportService {
  private readonly destroyRef = inject(DestroyRef);

  private readonly _width = signal<number>(window.innerWidth);
  private readonly _height = signal<number>(window.innerHeight);

  readonly width = this._width.asReadonly();
  readonly height = this._height.asReadonly();

  readonly size = computed<ViewportSize>(() => {
    const w = this._width();

    if (w < 480) return 'xs';
    if (w < 768) return 'sm';
    if (w < 1024) return 'md';
    return 'lg';
  });

  readonly state = computed<ViewportState>(() => {
    const size = this.size();
    const width = this._width();
    const height = this._height();

    return {
      width,
      height,
      size,
      isMobile: size === 'xs' || size === 'sm',
      isTablet: size === 'md',
      isDesktop: size === 'lg',
    };
  });

  constructor() {
    const resize$ = fromEvent(window, 'resize').pipe(
      startWith(null),
      map(() => ({
        width: window.innerWidth,
        height: window.innerHeight,
      })),
      distinctUntilChanged((prev, curr) => prev.width === curr.width && prev.height === curr.height)
    );

    const sub = resize$.subscribe(({ width, height }) => {
      this._width.set(width);
      this._height.set(height);
    });

    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }
}
