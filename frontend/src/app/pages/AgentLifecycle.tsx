import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Bot, CheckCircle2, CircleDashed, AlertTriangle, Plus, PlayCircle, PauseCircle, ChevronRight, Activity } from 'lucide-react';
import { cn } from '../components/ui/utils';
import { useGoalStore } from '../../stores/useGoalStore';
import { useAgentStore } from '../../stores/useAgentStore';
import type { Goal } from '../../services/goals';
import type { Agent } from '../../services/agents';

export function AgentLifecycle() {
  const { goals, loading: goalsLoading, fetchGoals, addGoal } = useGoalStore();
  const { agents, loading: agentsLoading, fetchAgents } = useAgentStore();
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'blocked' | 'completed'>('all');

  useEffect(() => {
    fetchGoals();
    fetchAgents();
  }, [fetchGoals, fetchAgents]);

  const filteredGoals = goals.filter(goal => {
    if (filter === 'all') return true;
    if (filter === 'active') return goal.status === 'in_progress' || goal.status === 'pending';
    if (filter === 'blocked') return goal.status === 'blocked';
    if (filter === 'completed') return goal.status === 'completed';
    return true;
  });

  const activeGoals = goals.filter(g => g.status === 'in_progress' || g.status === 'pending');
  const blockedGoals = goals.filter(g => g.status === 'blocked');
  const completedGoals = goals.filter(g => g.status === 'completed');

  const onlineAgents = agents.filter(a => a.active);

  return (
    <div className="flex gap-6 h-full">
      {/* Left Panel: Goals */}
      <Card className="w-80 flex flex-col shrink-0">
        <div className="p-4 border-b border-[var(--dca-bg-tertiary)] flex items-center justify-between">
          <h2 className="font-medium text-lg">Goals</h2>
          <Button variant="default" size="sm" className="h-8 w-8 p-0 rounded-full"><Plus className="w-4 h-4" /></Button>
        </div>
        <div className="p-2 border-b border-[var(--dca-bg-tertiary)] flex gap-1 overflow-x-auto">
          <Badge
            variant={filter === 'all' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setFilter('all')}
          >
            All ({goals.length})
          </Badge>
          <Badge
            variant={filter === 'active' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setFilter('active')}
          >
            Active ({activeGoals.length})
          </Badge>
          <Badge
            variant={filter === 'blocked' ? 'destructive' : 'outline'}
            className="cursor-pointer"
            onClick={() => setFilter('blocked')}
          >
            Blocked ({blockedGoals.length})
          </Badge>
          <Badge
            variant={filter === 'completed' ? 'secondary' : 'outline'}
            className="cursor-pointer"
            onClick={() => setFilter('completed')}
          >
            Done ({completedGoals.length})
          </Badge>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {goalsLoading ? (
            <div className="text-center text-[var(--dca-text-tertiary)] py-4">Loading goals...</div>
          ) : filteredGoals.length === 0 ? (
            <div className="text-center text-[var(--dca-text-tertiary)] py-4">No goals found</div>
          ) : (
            filteredGoals.map(goal => (
              <GoalItem
                key={goal.id}
                goal={goal}
                selected={selectedGoal?.id === goal.id}
                onSelect={() => setSelectedGoal(goal)}
              />
            ))
          )}
        </div>
      </Card>

      {/* Center Panel: Goal Detail */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        {selectedGoal ? (
          <>
            <div className="p-6 border-b border-[var(--dca-bg-tertiary)] shrink-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Badge variant="default" className={
                    selectedGoal.status === 'in_progress' ? 'bg-[var(--dca-success)]' :
                      selectedGoal.status === 'pending' ? 'bg-[var(--dca-accent-primary)]' :
                        selectedGoal.status === 'blocked' ? 'bg-[var(--dca-warning)]' :
                          'bg-[var(--dca-bg-tertiary)]'
                  }>
                    {selectedGoal.status}
                  </Badge>
                  <Badge variant="outline" className="bg-[var(--dca-bg-tertiary)]">Priority: {selectedGoal.priority}</Badge>
                </div>
                <span className="text-sm text-[var(--dca-text-tertiary)]">
                  {selectedGoal.desired_deadline ? `Due: ${new Date(selectedGoal.desired_deadline).toLocaleDateString()}` : 'No deadline'}
                </span>
              </div>
              <h2 className="text-2xl font-semibold mb-2">{selectedGoal.title}</h2>
              <p className="text-[var(--dca-text-secondary)]">{selectedGoal.description || 'No description'}</p>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-[var(--dca-bg-tertiary)]/10">
              <h3 className="text-sm font-medium text-[var(--dca-text-secondary)] uppercase tracking-wider mb-6">Execution Plan</h3>

              <div className="text-[var(--dca-text-tertiary)] text-sm">
                Task assignments and execution steps will be shown here when the goal is assigned to agents.
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[var(--dca-text-tertiary)]">
            Select a goal to view details
          </div>
        )}
      </Card>

      {/* Right Panel: Agents */}
      <Card className="w-80 flex flex-col shrink-0">
        <div className="p-4 border-b border-[var(--dca-bg-tertiary)] flex items-center justify-between">
          <h2 className="font-medium text-lg">Agents</h2>
          <span className="text-xs text-[var(--dca-text-tertiary)]">{onlineAgents.length} Online</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {agentsLoading ? (
            <div className="text-center text-[var(--dca-text-tertiary)] py-4">Loading agents...</div>
          ) : agents.length === 0 ? (
            <div className="text-center text-[var(--dca-text-tertiary)] py-4">No agents available</div>
          ) : (
            agents.map(agent => (
              <AgentCard
                key={agent.agent_id}
                name={agent.agent_name}
                status={agent.active ? (agent.current_load < agent.max_capacity ? 'idle' : 'busy') : 'offline'}
                trust={agent.trust_score}
                task={agent.current_load > 0 ? `${agent.current_load} tasks running` : undefined}
                capabilities={agent.capabilities}
              />
            ))
          )}
        </div>
      </Card>
    </div>
  );
}

function GoalItem({ goal, selected, onSelect }: { goal: Goal; selected: boolean; onSelect: () => void }) {
  const getStatusIcon = () => {
    switch (goal.status) {
      case 'in_progress':
        return <div className="w-4 h-4 shrink-0 rounded-full border-2 border-[var(--dca-accent-primary)] border-t-transparent animate-spin" />;
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 shrink-0 text-[var(--dca-success)]" />;
      case 'blocked':
        return <AlertTriangle className="w-4 h-4 shrink-0 text-[var(--dca-warning)]" />;
      default:
        return <CircleDashed className="w-4 h-4 shrink-0" />;
    }
  };

  return (
    <button
      onClick={onSelect}
      className={cn(
        "flex items-center gap-2 p-2 w-full text-left rounded transition-colors",
        selected ? "bg-[var(--dca-accent-primary)]/10 text-[var(--dca-accent-primary)]" : "hover:bg-[var(--dca-bg-tertiary)]/50 text-[var(--dca-text-secondary)]"
      )}
    >
      {getStatusIcon()}
      <span className="text-sm font-medium truncate">{goal.title}</span>
    </button>
  );
}

function PlanStep({ status, title, agent, duration }: any) {
  const isCompleted = status === 'completed';
  const isRunning = status === 'running';

  return (
    <div className="relative pl-8">
      <div className={cn(
        "absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 bg-[var(--dca-bg-secondary)]",
        isCompleted ? "border-[var(--dca-success)] bg-[var(--dca-success)]" : isRunning ? "border-[var(--dca-accent-primary)] animate-pulse" : "border-[var(--dca-bg-tertiary)]"
      )}>
        {isCompleted && <CheckCircle2 className="w-full h-full text-white absolute inset-0 -m-[2px]" />}
      </div>

      <Card className={cn(
        "p-4 border",
        isRunning ? "border-[var(--dca-accent-primary)]/50 shadow-[0_0_15px_rgba(34,211,238,0.1)]" : "border-[var(--dca-bg-tertiary)]"
      )}>
        <div className="flex items-start justify-between mb-2">
          <h4 className={cn("font-medium text-sm", isCompleted ? "text-[var(--dca-text-secondary)] line-through" : "text-[var(--dca-text-primary)]")}>{title}</h4>
          {isRunning && <Badge variant="default" className="ml-2 bg-[var(--dca-accent-primary)]">Running</Badge>}
        </div>
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-[var(--dca-text-secondary)]">
            <Bot className="w-3 h-3" /> {agent}
          </div>
          <span className="text-[var(--dca-text-tertiary)] font-mono">{duration}</span>
        </div>
      </Card>
    </div>
  );
}

function AgentCard({ name, status, trust, task, capabilities }: any) {
  const isBusy = status === 'busy';
  const isIdle = status === 'idle';
  const isOffline = status === 'offline';

  return (
    <div className="p-3 rounded-lg border border-[var(--dca-bg-tertiary)] bg-[var(--dca-bg-tertiary)]/20 hover:border-[var(--dca-accent-primary)]/50 transition-colors cursor-pointer group">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-[var(--dca-bg-secondary)] border border-[var(--dca-bg-tertiary)] flex items-center justify-center">
              <Bot className="w-4 h-4 text-[var(--dca-text-secondary)]" />
            </div>
            <div className={cn(
              "absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-[var(--dca-bg-secondary)]",
              isBusy ? "bg-[var(--dca-warning)]" : isIdle ? "bg-[var(--dca-success)]" : "bg-[var(--dca-text-tertiary)]"
            )} />
          </div>
          <div>
            <div className="text-sm font-medium">{name}</div>
            <div className="text-xs text-[var(--dca-text-tertiary)] capitalize">{status}</div>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs text-[var(--dca-text-secondary)]">Trust</span>
          <span className={cn(
            "text-sm font-mono font-medium",
            trust >= 0.9 ? "text-[var(--dca-success)]" : "text-[var(--dca-warning)]"
          )}>{trust.toFixed(2)}</span>
        </div>
      </div>
      {task && (
        <div className="mt-2 pt-2 border-t border-[var(--dca-bg-tertiary)] flex items-center justify-between text-xs">
          <span className="text-[var(--dca-text-secondary)] truncate flex-1">{task}</span>
          <ChevronRight className="w-3 h-3 text-[var(--dca-text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      )}
      {capabilities && capabilities.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {capabilities.slice(0, 3).map((cap: string, idx: number) => (
            <Badge key={idx} variant="outline" className="text-[10px] px-1.5 py-0.5">
              {cap}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
