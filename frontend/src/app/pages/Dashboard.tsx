import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Activity, Target, Brain, Database, AlertTriangle, Eye, ShieldAlert, Cpu } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { useGoalStore } from '../../stores/useGoalStore';
import { useAgentStore } from '../../stores/useAgentStore';
import { useCostStore } from '../../stores/useCostStore';
import { useSystemHealthStore } from '../../stores/useSystemHealthStore';
import { useConnectionStore } from '../../stores/useConnectionStore';

const dummyTrend = Array.from({ length: 20 }, () => ({ value: Math.random() * 100 }));

export function Dashboard() {
  const { goals, loading: goalsLoading, fetchGoals } = useGoalStore();
  const { agents, loading: agentsLoading, fetchAgents } = useAgentStore();
  const { todayCost, loading: costLoading, fetchTodayCost } = useCostStore();
  const { services, loading: healthLoading, fetchSystemHealth } = useSystemHealthStore();
  const { status: connectionStatus } = useConnectionStore();

  useEffect(() => {
    fetchGoals();
    fetchAgents();
    fetchTodayCost('user-id-placeholder');
    fetchSystemHealth();
  }, [fetchGoals, fetchAgents, fetchTodayCost, fetchSystemHealth]);

  const primaryGoal = goals.find(g => g.status === 'in_progress') || goals[0];
  const activeGoals = goals.filter(g => g.status === 'in_progress' || g.status === 'pending');
  const onlineAgents = agents.filter(a => a.active);
  const avgTrust = onlineAgents.length > 0
    ? (onlineAgents.reduce((sum, a) => sum + a.trust_score, 0) / onlineAgents.length).toFixed(2)
    : '0.00';

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Primary Goal Hero */}
      <Card className="relative overflow-hidden border-[var(--dca-accent-primary)]/30 bg-[var(--dca-bg-secondary)]/80 backdrop-blur-md">
        <div className="absolute inset-0 bg-[var(--dca-accent-primary)]/5 opacity-50" />
        <CardContent className="p-8 flex items-center justify-between relative z-10">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-[var(--dca-text-tertiary)] uppercase tracking-wider">
                {primaryGoal ? 'Primary Active Goal' : 'No Active Goals'}
              </span>
              {primaryGoal && <Badge variant="default" className="bg-[var(--dca-success)]">{primaryGoal.status}</Badge>}
            </div>
            <h1 className="text-3xl font-semibold text-[var(--dca-text-primary)]">
              {primaryGoal ? primaryGoal.title : 'Create your first goal'}
            </h1>
            <p className="text-[var(--dca-text-secondary)]">
              {primaryGoal ? primaryGoal.description : 'Start by defining a goal for the system to work on.'}
            </p>
          </div>
          <div className="shrink-0 flex items-center justify-center w-32 h-32 rounded-full border-[8px] border-[var(--dca-bg-tertiary)] relative">
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="45%"
                className="stroke-[var(--dca-success)] fill-none stroke-[8px]"
                strokeDasharray="283"
                strokeDashoffset={primaryGoal ? '70' : '283'}
              />
            </svg>
            <span className="text-2xl font-bold">{primaryGoal ? '75%' : '0%'}</span>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <SummaryCard
          title="Active Goals"
          value={activeGoals.length.toString()}
          icon={Target}
          trend={dummyTrend}
          color="var(--dca-accent-primary)"
          loading={goalsLoading}
        />
        <SummaryCard
          title="Online Agents"
          value={`${onlineAgents.length} / ${agents.length}`}
          icon={Brain}
          subtext={`Avg Trust: ${avgTrust}`}
          color="var(--dca-success)"
          loading={agentsLoading}
        />
        <SummaryCard
          title="Cognitive Spend"
          value={todayCost ? `$${todayCost.daily_cost_usd.toFixed(2)}` : '$0.00'}
          icon={Activity}
          subtext={todayCost ? `${((todayCost.daily_cost_usd / todayCost.budget_usd) * 100).toFixed(0)}% of daily budget` : '0% of daily budget'}
          color="var(--dca-warning)"
          loading={costLoading}
        />
        <SummaryCard
          title="World State Facts"
          value="1,430"
          icon={Database}
          alert={true}
          color="var(--dca-info)"
        />
        <SummaryCard
          title="System Health"
          value={connectionStatus === 'connected' ? '100%' : '0%'}
          icon={Cpu}
          subtext={connectionStatus === 'connected' ? 'All services operational' : 'Reconnecting...'}
          color={connectionStatus === 'connected' ? 'var(--dca-success)' : 'var(--dca-warning)'}
          loading={healthLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px]">
        {/* Live Event Stream */}
        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader className="pb-4 border-b border-[var(--dca-bg-tertiary)] flex flex-row items-center justify-between">
            <CardTitle>Live Event Stream</CardTitle>
            <div className="flex gap-2">
              <Badge variant="default" className="bg-[var(--dca-bg-tertiary)]">All</Badge>
              <Badge variant="default" className="opacity-50">Perception</Badge>
              <Badge variant="default" className="opacity-50">Cognition</Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-0">
            <div className="flex flex-col">
              {[
                { time: '14:32:05', type: 'cognition', icon: Brain, color: 'var(--dca-success)', text: 'Task completed: AWS Cost Analysis' },
                { time: '14:31:42', type: 'perception', icon: Eye, color: 'var(--dca-info)', text: 'New document ingested: Q3 Architecture diagram' },
                { time: '14:30:10', type: 'governance', icon: ShieldAlert, color: 'var(--dca-accent-secondary)', text: 'Agent assigned: OptimizerBot assigned to Goal #402' },
                { time: '14:28:55', type: 'error', icon: AlertTriangle, color: 'var(--dca-warning)', text: 'Conflict detected on Entity: US-East-1 Region Status' },
                { time: '14:25:01', type: 'cognition', icon: Brain, color: 'var(--dca-success)', text: 'Routing decision: Complex query routed to GPT-4o' },
              ].map((evt, i) => (
                <div key={i} className="flex items-start gap-4 p-4 border-b border-[var(--dca-bg-tertiary)] hover:bg-[var(--dca-bg-tertiary)]/30 transition-colors">
                  <span className="text-xs text-[var(--dca-text-tertiary)] whitespace-nowrap mt-1">{evt.time}</span>
                  <div className="mt-1" style={{ color: evt.color }}>
                    <evt.icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm text-[var(--dca-text-primary)]">{evt.text}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Health Detail */}
        <Card>
          <CardHeader>
            <CardTitle>Service Status</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <ServiceStatus name="Supabase Edge Functions" latency="45ms" status="ok" />
            <ServiceStatus name="PostgreSQL" latency="12ms" status="ok" />
            <ServiceStatus name="OpenRouter API" latency="200ms" status="ok" />
            <ServiceStatus name="Realtime" latency="5ms" status="ok" />
            <ServiceStatus name="Auth" latency="15ms" status="ok" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SummaryCard({ title, value, icon: Icon, trend, subtext, color, alert, loading }: any) {
  if (loading) {
    return (
      <Card className="hover:border-[var(--dca-accent-primary)]/50 transition-colors cursor-pointer bg-[var(--dca-bg-secondary)]/80 backdrop-blur-md">
        <CardContent className="p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--dca-text-secondary)]">{title}</span>
            <Icon className="w-4 h-4" style={{ color }} />
          </div>
          <div className="flex items-end justify-between">
            <div className="h-6 w-16 bg-[var(--dca-bg-tertiary)] animate-pulse rounded" />
          </div>
          <div className="text-[10px] text-[var(--dca-text-tertiary)] mt-2">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:border-[var(--dca-accent-primary)]/50 transition-colors cursor-pointer bg-[var(--dca-bg-secondary)]/80 backdrop-blur-md">
      <CardContent className="p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--dca-text-secondary)]">{title}</span>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        <div className="flex items-end justify-between">
          <span className="text-2xl font-bold text-[var(--dca-text-primary)]">{value}</span>
          {trend && (
            <div className="h-8 w-16">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend}>
                  <YAxis domain={['dataMin', 'dataMax']} hide />
                  <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
        {(subtext || alert) && (
          <div className="flex items-center justify-between text-xs mt-1">
            {subtext && <span className="text-[var(--dca-text-tertiary)]">{subtext}</span>}
            {alert && <Badge variant="blocked" className="text-[10px] px-1.5">1 Conflict</Badge>}
          </div>
        )}
        <div className="text-[10px] text-[var(--dca-text-tertiary)] mt-2">Updated just now</div>
      </CardContent>
    </Card>
  );
}

function ServiceStatus({ name, latency, status }: any) {
  const isOk = status === 'ok';
  return (
    <div className="flex items-center justify-between p-3 rounded-md bg-[var(--dca-bg-tertiary)]/50">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${isOk ? 'bg-[var(--dca-success)]' : 'bg-[var(--dca-error)]'}`} />
        <span className="text-sm font-medium">{name}</span>
      </div>
      <span className="text-xs text-[var(--dca-text-tertiary)]">{latency}</span>
    </div>
  );
}
