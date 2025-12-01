export type ViewportSize = 'xs' | 'sm' | 'md' | 'lg';

export interface ViewportState {
  width: number;
  height: number;
  size: ViewportSize;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}
