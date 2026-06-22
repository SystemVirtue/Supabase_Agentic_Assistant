-- Frontend UI State Schema for DCA
-- These tables support the UI components and real-time updates

-- Goals table (already exists in Phase 4, adding real-time support)
ALTER PUBLICATION supabase_realtime ADD TABLE goals;

-- Agents table (already exists in Phase 4, adding real-time support)
ALTER PUBLICATION supabase_realtime ADD TABLE agents;

-- Task assignments table (already exists in Phase 4, adding real-time support)
ALTER PUBLICATION supabase_realtime ADD TABLE task_assignments;

-- UI-specific tables for frontend state management

-- User preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  preference_key TEXT NOT NULL,
  preference_value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, preference_key)
);

CREATE INDEX IF NOT EXISTS user_preferences_user_idx ON user_preferences(user_id);

-- Dashboard state table (for persisted dashboard configurations)
CREATE TABLE IF NOT EXISTS dashboard_state (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  layout JSONB NOT NULL DEFAULT '{}'::jsonb,
  filters JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Notification logs table
CREATE TABLE IF NOT EXISTS notification_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notification_logs_user_idx ON notification_logs(user_id, created_at DESC);

-- System health cache table (for faster dashboard loading)
CREATE TABLE IF NOT EXISTS system_health_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_name TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL,
  uptime_seconds INTEGER NOT NULL DEFAULT 0,
  last_check TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS system_health_cache_service_idx ON system_health_cache(service_name);

-- Cost tracking cache table (for cost monitor)
CREATE TABLE IF NOT EXISTS cost_tracking_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  daily_cost_usd DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  budget_usd DECIMAL(10, 2) NOT NULL DEFAULT 10.00,
  tasks_completed INTEGER NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS cost_tracking_cache_user_date_idx ON cost_tracking_cache(user_id, date DESC);

-- Enable real-time for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE user_preferences;
ALTER PUBLICATION supabase_realtime ADD TABLE dashboard_state;
ALTER PUBLICATION supabase_realtime ADD TABLE notification_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE system_health_cache;
ALTER PUBLICATION supabase_realtime ADD TABLE cost_tracking_cache;

-- Row Level Security policies
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_health_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_tracking_cache ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_preferences
CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS policies for dashboard_state
CREATE POLICY "Users can view own dashboard state" ON dashboard_state
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own dashboard state" ON dashboard_state
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own dashboard state" ON dashboard_state
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS policies for notification_logs
CREATE POLICY "Users can view own notifications" ON notification_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notification_logs
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS policies for system_health_cache (read-only for authenticated users)
CREATE POLICY "Authenticated users can view system health" ON system_health_cache
  FOR SELECT USING (auth.role() = 'authenticated');

-- RLS policies for cost_tracking_cache
CREATE POLICY "Users can view own cost tracking" ON cost_tracking_cache
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cost tracking" ON cost_tracking_cache
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cost tracking" ON cost_tracking_cache
  FOR UPDATE USING (auth.uid() = user_id);
