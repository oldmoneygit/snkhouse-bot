export { getDashboardMetrics } from './metrics';
export type { DashboardMetrics } from './metrics';

// Eventos de tracking
export {
  analyticsTracker,
  trackAIRequest,
  trackAIResponse,
  trackToolCall,
  trackProductSearch,
  trackProductCardViewed,
  trackProductCardClicked,
  trackProductAddToCart
} from './events/tracker';

export {
  getAIPerformanceMetrics,
  getWooCommerceMetrics,
  getProductCardMetrics
} from './events/aggregator';

export type {
  ProductCardMetrics
} from './events/aggregator';

export type {
  EventType,
  AnalyticsEvent,
  AIRequestEvent,
  AIResponseEvent,
  ToolCallEvent,
  ProductSearchEvent,
  ProductCardEvent
} from './events/types';
