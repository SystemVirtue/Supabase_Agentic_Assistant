import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Bot, CheckCircle2, CircleDashed, AlertTriangle, Plus, PlayCircle, PauseCircle, ChevronRight, Activity } from 'lucide-react';
import { cn } from '../components/ui/Badge';

export function AgentLifecycle() {
  return (
    <div className="flex gap-6 h-full">
      {/* Left Panel: Goals */}
      <Card className="w-80 flex flex-col shrink-0">
        <div className="p-4 border-b border-[var(--dca-bg-tertiary)] flex items-center justify-between">
          <h2 className="font-medium text-lg">Goals</h2>
          <Button variant="primary" size="sm" className="h-8 w-8 p-0 rounded-full"><Plus className="w-4 h-4" /></Button>
        </div>
        <div className="p-2 border-b border-[var(--dca-bg-tertiary)] flex gap-1 overflow-x-auto">
          <Badge variant="active" className="cursor-pointer">Active (3)</Badge>
          <Badge variant="blocked" className="cursor-pointer opacity-50">Blocked (1)</Badge>
          <Badge variant="completed" className="cursor-pointer opacity-50">Done (12)</Badge>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {/* Goal Item */}
          <div className="flex flex-col gap-1">
            <button className="flex items-center gap-2 p-2 w-full text-left rounded bg-[var(--dca-accent-primary)]/10 text-[var(--dca-accent-primary)]">
              <CircleDashed className="w-4 h-4 shrink-0" />
              <span className="text-sm font-medium truncate">Optimize Cloud Spend</span>
            </button>
            <div className="pl-6 flex flex-col gap-1 border-l ml-4 border-[var(--dca-bg-tertiary)]">
              <button className="flex items-center gap-2 p-2 w-full text-left rounded hover:bg-[var(--dca-bg-tertiary)]/50 text-[var(--dca-text-secondary)]">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-[var(--dca-success)]" />
                <span className="text-sm truncate">Analyze Usage</span>
              </button>
              <button className="flex items-center gap-2 p-2 w-full text-left rounded hover:bg-[var(--dca-bg-tertiary)]/50 text-[var(--dca-text-secondary)]">
                <div className="w-4 h-4 shrink-0 rounded-full border-2 border-[var(--dca-accent-primary)] border-t-transparent animate-spin" />
                <span className="text-sm truncate">Provision Reserved Instances</span>
              </button>
            </div>
          </div>
          <button className="flex items-center gap-2 p-2 w-full text-left rounded hover:bg-[var(--dca-bg-tertiary)]/50 text-[var(--dca-text-secondary)] mt-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-[var(--dca-warning)]" />
            <span className="text-sm font-medium truncate">Update Marketing Site</span>
          </button>
        </div>
      </Card>

      {/* Center Panel: Goal Detail */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-[var(--dca-bg-tertiary)] shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Badge variant="active">Active</Badge>
              <Badge variant="default" className="bg-[var(--dca-bg-tertiary)]">Priority: High</Badge>
            </div>
            <span className="text-sm text-[var(--dca-text-tertiary)]">Due in 2 days</span>
          </div>
          <h2 className="text-2xl font-semibold mb-2">Optimize Cloud Infrastructure Spend</h2>
          <p className="text-[var(--dca-text-secondary)]">Analyze historical usage across all regions and deploy reserved instances to reduce monthly run rate by 15%.</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 bg-[var(--dca-bg-tertiary)]/10">
          <h3 className="text-sm font-medium text-[var(--dca-text-secondary)] uppercase tracking-wider mb-6">Execution Plan</h3>
          
          <div className="relative border-l-2 border-[var(--dca-bg-tertiary)] ml-4 space-y-8 pb-8">
            <PlanStep 
              status="completed" 
              title="Gather historical AWS billing data" 
              agent="DataFetcherBot"
              duration="45s"
            />
            <PlanStep 
              status="completed" 
              title="Analyze usage patterns and identify RI candidates" 
              agent="AnalyzerBot"
              duration="2m 10s"
            />
            <PlanStep 
              status="running" 
              title="Draft Terraform configuration for RIs" 
              agent="DevOpsBot"
              duration="Running (1m 15s)"
            />
            <PlanStep 
              status="queued" 
              title="Apply Terraform changes to staging" 
              agent="DevOpsBot"
              duration="Pending"
            />
          </div>
        </div>
      </Card>

      {/* Right Panel: Agents */}
      <Card className="w-80 flex flex-col shrink-0">
        <div className="p-4 border-b border-[var(--dca-bg-tertiary)] flex items-center justify-between">
          <h2 className="font-medium text-lg">Agents</h2>
          <span className="text-xs text-[var(--dca-text-tertiary)]">8 Online</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          <AgentCard name="DevOpsBot" status="busy" trust={0.98} task="Draft Terraform..." />
          <AgentCard name="AnalyzerBot" status="idle" trust={0.95} />
          <AgentCard name="DataFetcherBot" status="idle" trust={0.88} />
          <AgentCard name="CopywriterBot" status="offline" trust={0.91} />
        </div>
      </Card>
    </div>
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
          {isRunning && <Badge variant="active" className="ml-2">Running</Badge>}
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

function AgentCard({ name, status, trust, task }: any) {
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
    </div>
  );
}
