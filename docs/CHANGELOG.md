# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.7.0] - 2025-10-09

### 🗺️ Roadmap Documentation
- **Multi-Agent Ecosystem roadmap** for Q1-Q2 2025 documented
- Created **ROADMAP_MEDIO_PRAZO.md** - Complete medium-term planning
- **5 specialized agents** documented:
  - 💬 Chat Agent (90% complete) - Customer service
  - 🎨 Designer Agent (Q2 2025) - Visual creation with DALL-E 3, Midjourney
  - ✍️ Copy Agent (Q2 2025) - Copywriting with GPT-4, Claude
  - 📱 Social Media Agent (Q2 2025) - Social media management (Meta API, TikTok)
  - 📈 Analytics Agent (40% → Q2 2025) - Advanced analytics + ML
- **ROI analysis** showing 443-850% annual return
- **Cost breakdown** - $200-350/month operational costs
- **Implementation timeline** - Q1-Q2 2025 detailed schedule
- **Automated workflows** documented (Black Friday, product launches, evergreen content)

### 📋 Issues Roadmap
- **SNKH-16 to SNKH-20:** Complete Chat Agent (Q1 2025)
- **SNKH-30 to SNKH-39:** Designer Agent implementation
- **SNKH-40 to SNKH-49:** Copy Agent implementation
- **SNKH-50 to SNKH-59:** Social Media Agent implementation
- **SNKH-60 to SNKH-69:** Analytics ML expansion
- **SNKH-70 to SNKH-71:** Multi-Agent Hub orchestration

### 📝 Documentation Updates
- **ARCHITECTURE.md** - Added "Visão Futura" section with multi-agent architecture
- **README.md** - Added roadmap section with ROI highlights
- Complete tech stack decisions documented for each agent
- Case studies for end-to-end automated workflows

### 🎯 Strategic Planning
- Investment: R$ 0 development (Claude Code) + $2,400-4,200/year infrastructure
- Annual savings vs agency: R$ 114,000
- Payback period: 1.5-2 months
- Time savings: 93-95% reduction in manual work

**Note:** This is PLANNING DOCUMENTATION ONLY - no code implementation in this version

## [0.6.0] - 2025-10-09

### 📊 Metrics Collection (SNKH-15)
- **Real-time event tracking system** replacing mocked data with actual metrics
- Created `analytics_events` table in Supabase for event storage
- Implemented buffered tracking system (50 events or 5s interval)
- **AI Performance metrics now REAL**:
  - Success rate calculated from actual responses
  - Average tokens based on real usage
  - Tool calls counted from executed tools
- **WooCommerce metrics now REAL**:
  - Products searched tracked automatically
  - Top 5 products dynamically ranked by searches
- Event types: ai_request, ai_response, tool_call, product_search

### 🔧 New Features
- `packages/analytics/src/events/` - Complete event system
  - `types.ts` - TypeScript types for all events
  - `tracker.ts` - Buffered tracking with auto-flush
  - `aggregator.ts` - Real-time metrics aggregation
- `trackAIRequest()` - Track AI requests with token estimation
- `trackAIResponse()` - Track AI responses with success/failure
- `trackToolCall()` - Track tool executions with timing
- `trackProductSearch()` - Track product searches and views

### 🎯 Integration Points
- `apps/widget/src/app/api/chat/route.ts` - AI tracking integrated
- `packages/ai-agent/src/tools/handlers.ts` - Tool tracking integrated
- `packages/analytics/src/metrics.ts` - Dashboard now uses real data

### 📝 Documentation
- docs/15-metrics-collection.md - Complete implementation guide
- Supabase migration: `20250109_analytics_events.sql`
- Test script: `scripts/test-metrics-collection.ts`
- Migration helper: `scripts/apply-analytics-migration.ts`

### 🧪 Testing
- Complete test suite for event tracking
- Validation of AI and WooCommerce metrics
- Buffer flush testing
- Aggregation accuracy testing

### 🔄 Improvements
- Dashboard metrics are now based on real data instead of hardcoded values
- Better insights into AI performance and user behavior
- Historical data preservation for future analysis
- JSONB flexibility for adding new event fields

## [0.5.0] - 2025-10-08

### 🎯 Governance & Standards
- Added **MCP_GUIDE.md** - Complete guide for all 9 MCP servers
- Added **DEVELOPMENT_GUIDELINES.md** - Code quality and workflow standards
- Added **ARCHITECTURE.md** - Complete system architecture documentation
- Established zero-tolerance policies for code quality
- Created comprehensive checklist for all tasks

### 📊 Analytics Dashboard (SNKH-14)
- Implemented complete analytics dashboard at `/analytics`
- Created `@snkhouse/analytics` package with metrics collection
- 11 different metrics tracked in real-time
- ISR (Incremental Static Regeneration) with 60s revalidation
- Native SVG charts (no external dependencies)
- Top 5 most active customers tracking
- Messages per hour visualization (last 24h)
- Average response time calculation

### 🔧 Code Quality Improvements
- **Zero `any` types** - All TypeScript properly typed
- Added 4 internal interfaces for type safety:
  - `ConversationWithCustomer`
  - `ConversationStatus`
  - `MessageData`
  - `MessageWithRole`
- Complete JSDoc documentation with @returns, @throws, examples
- Structured logging with emojis throughout

### 📝 Documentation
- docs/14-analytics-dashboard.md - Feature documentation
- docs/SNKH-14-AUDIT-REPORT.md - Complete audit report
- Package README for @snkhouse/analytics
- Architecture diagrams and data flow documentation

### 🧪 Testing
- Created scripts/test-analytics.ts
- 100% test coverage for analytics metrics
- Validated all data flows and calculations

### Added
- Initial project setup
- GitHub Projects automation
- Issue templates
- Workflow automations

---
*This changelog is automatically updated by GitHub Actions*
