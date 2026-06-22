-- Goals table for Agent Lifecycle Manager
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority INTEGER NOT NULL DEFAULT 5 CHECK (
    priority >= 1
    AND priority <= 10
  ),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN (
      'pending',
      'in_progress',
      'completed',
      'failed',
      'cancelled'
    )
  ),
  parent_goal_id UUID,
  desired_deadline TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS goals_user_idx ON goals(user_id, status);
CREATE INDEX IF NOT EXISTS goals_parent_idx ON goals(parent_goal_id);
CREATE INDEX IF NOT EXISTS goals_deadline_idx ON goals(desired_deadline);
-- Agent registry for multi-agent governance
CREATE TABLE IF NOT EXISTS agents (
  agent_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_name TEXT NOT NULL UNIQUE,
  agent_type TEXT NOT NULL,
  capabilities TEXT [] NOT NULL DEFAULT ARRAY []::TEXT [],
  trust_score DOUBLE PRECISION NOT NULL DEFAULT 0.5 CHECK (
    trust_score >= 0.0
    AND trust_score <= 1.0
  ),
  current_load INTEGER NOT NULL DEFAULT 0 CHECK (current_load >= 0),
  max_capacity INTEGER NOT NULL DEFAULT 10 CHECK (max_capacity > 0),
  active BOOLEAN NOT NULL DEFAULT true,
  last_heartbeat TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS agents_type_idx ON agents(agent_type);
CREATE INDEX IF NOT EXISTS agents_active_idx ON agents(active, trust_score DESC);
-- Task assignments for tracking agent work
CREATE TABLE IF NOT EXISTS task_assignments (
  assignment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL,
  agent_id UUID NOT NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'assigned' CHECK (
    status IN ('assigned', 'started', 'completed', 'failed')
  ),
  result JSONB,
  UNIQUE(goal_id, agent_id)
);
CREATE INDEX IF NOT EXISTS task_assignments_goal_idx ON task_assignments(goal_id);
CREATE INDEX IF NOT EXISTS task_assignments_agent_idx ON task_assignments(agent_id, status);
-- Add foreign key constraints after tables are created
ALTER TABLE goals
ADD CONSTRAINT goals_parent_goal_id_fkey FOREIGN KEY (parent_goal_id) REFERENCES goals(id) ON DELETE CASCADE;
ALTER TABLE task_assignments
ADD CONSTRAINT task_assignments_goal_id_fkey FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE;
ALTER TABLE task_assignments
ADD CONSTRAINT task_assignments_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES agents(agent_id) ON DELETE CASCADE;
-- Enable Row Level Security
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_assignments ENABLE ROW LEVEL SECURITY;