export { getDashboardMetrics } from './metrics';
export type { DashboardMetrics } from './metrics';

// Eventos de tracking
export {
  analyticsTracker,
  trackAIRequest,
  trackAIResponse,
  trackToolCall,
  trackProductSearch
} from './events/tracker';

export {
  getAIPerformanceMetrics,
  getWooCommerceMetrics
} from './events/aggregator';

export type {
  EventType,
  AnalyticsEvent,
  AIRequestEvent,
  AIResponseEvent,
  ToolCallEvent,
  ProductSearchEvent
} from './events/types';
