import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Search, BrainCircuit, Calendar, Link2, Share2, CornerDownRight } from 'lucide-react';
import { cn } from '../components/ui/Badge';

export function MemoryExplorer() {
  const [query, setQuery] = useState('project alpha migration');
  const [activeTab, setActiveTab] = useState('facts');

  return (
    <div className="flex flex-col gap-6 h-full max-w-6xl mx-auto">
      {/* Search Header */}
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-[var(--dca-text-tertiary)]" />
          <input 
            type="text" 
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Ask anything about the system's memory..."
            className="w-full bg-[var(--dca-bg-secondary)] border border-[var(--dca-bg-tertiary)] rounded-xl pl-14 pr-4 py-4 text-lg focus:outline-none focus:border-[var(--dca-accent-primary)] focus:ring-1 focus:ring-[var(--dca-accent-primary)] transition-all shadow-sm"
          />
        </div>
        <div className="flex gap-2">
          <Badge variant="default" className="cursor-pointer hover:bg-[var(--dca-bg-tertiary)]">Mike Johnson</Badge>
          <Badge variant="default" className="cursor-pointer hover:bg-[var(--dca-bg-tertiary)]">AWS Costs Q3</Badge>
          <Badge variant="default" className="cursor-pointer hover:bg-[var(--dca-bg-tertiary)]">Deployments</Badge>
        </div>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        <div className="flex-1 flex flex-col min-w-0">
          {/* Tabs */}
          <div className="flex border-b border-[var(--dca-bg-tertiary)] shrink-0">
            {['Facts', 'Episodes', 'Related Entities'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase())}
                className={cn(
                  "px-6 py-3 font-medium text-sm border-b-2 transition-colors",
                  activeTab === tab.toLowerCase() 
                    ? "border-[var(--dca-accent-primary)] text-[var(--dca-accent-primary)]" 
                    : "border-transparent text-[var(--dca-text-secondary)] hover:text-[var(--dca-text-primary)] hover:border-[var(--dca-bg-tertiary)]"
                )}
              >
                {tab}
              </button>
            ))}
            <div className="ml-auto flex items-center px-4">
              <button className="flex items-center gap-2 text-sm text-[var(--dca-text-secondary)] hover:text-[var(--dca-text-primary)] bg-[var(--dca-bg-tertiary)]/50 px-3 py-1.5 rounded-md">
                <Share2 className="w-4 h-4" /> Graph View
              </button>
            </div>
          </div>

          {/* Results Area */}
          <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-4 pr-2">
            {activeTab === 'facts' && (
              <>
                <FactCard 
                  fact="Project Alpha Migration is scheduled for Q3 2026." 
                  confidence={99} 
                  sim="95%"
                  entity="Project Alpha"
                />
                <FactCard 
                  fact="Mike Johnson is the Lead Architect for the migration." 
                  confidence={95} 
                  sim="88%"
                  entity="Mike Johnson"
                />
                <FactCard 
                  fact="Current infrastructure spend is $42.50/day, which is 12% over budget." 
                  confidence={82} 
                  sim="75%"
                  entity="AWS Costs"
                />
              </>
            )}
            {activeTab === 'episodes' && (
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[var(--dca-bg-tertiary)] flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-medium">Yesterday</h3>
                </div>
                <div className="pl-5 ml-5 border-l border-[var(--dca-bg-tertiary)] flex flex-col gap-4">
                  <EpisodeCard time="14:00" desc="Meeting: Migration Kickoff. Mike Johnson presented the architecture." />
                  <EpisodeCard time="15:30" desc="Fact inferred: Project Alpha will use AWS US-East-1 primarily." />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Evidence Panel */}
        <Card className="w-80 shrink-0 bg-[var(--dca-bg-tertiary)]/10 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-[var(--dca-bg-tertiary)] flex items-center gap-2 bg-[var(--dca-bg-secondary)]">
            <BrainCircuit className="w-5 h-5 text-[var(--dca-accent-primary)]" />
            <h3 className="font-medium">How do I know this?</h3>
          </div>
          <div className="p-4 flex-1 overflow-y-auto">
            <p className="text-sm text-[var(--dca-text-secondary)] italic mb-6">Select a fact to see its evidence chain.</p>
            <div className="flex flex-col gap-4 relative before:absolute before:inset-y-0 before:left-[11px] before:w-px before:bg-[var(--dca-bg-tertiary)]">
              <EvidenceNode icon={Link2} label="Belief" text="Project Alpha is Q3 2026" />
              <EvidenceNode icon={CornerDownRight} label="Evidence" text="Extracted from meeting notes" />
              <EvidenceNode icon={Search} label="Observation" text="Transcription: 'We are locked in for Q3'" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function FactCard({ fact, confidence, sim, entity }: any) {
  return (
    <Card className="p-4 flex flex-col gap-3 hover:border-[var(--dca-accent-primary)]/50 transition-colors cursor-pointer group">
      <p className="text-lg text-[var(--dca-text-primary)]">{fact}</p>
      <div className="flex items-center gap-4">
        <Badge variant="high-confidence">Conf: {confidence}%</Badge>
        <div className="flex items-center gap-1.5 text-sm text-[var(--dca-text-secondary)]">
          <Search className="w-3.5 h-3.5" /> Sim: {sim}
        </div>
        <div className="w-px h-3 bg-[var(--dca-bg-tertiary)]" />
        <span className="text-sm text-[var(--dca-accent-primary)] hover:underline">{entity}</span>
        <button className="ml-auto text-xs font-medium text-[var(--dca-text-secondary)] bg-[var(--dca-bg-tertiary)] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
          View Evidence
        </button>
      </div>
    </Card>
  );
}

function EpisodeCard({ time, desc }: any) {
  return (
    <Card className="p-3 relative">
      <div className="absolute -left-[27px] top-4 w-3 h-3 rounded-full bg-[var(--dca-bg-tertiary)] border-2 border-[var(--dca-bg-primary)]" />
      <span className="text-xs font-mono text-[var(--dca-text-tertiary)] block mb-1">{time}</span>
      <p className="text-sm text-[var(--dca-text-primary)]">{desc}</p>
    </Card>
  );
}

function EvidenceNode({ icon: Icon, label, text }: any) {
  return (
    <div className="relative pl-8">
      <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-[var(--dca-bg-secondary)] border border-[var(--dca-bg-tertiary)] flex items-center justify-center z-10">
        <Icon className="w-3 h-3 text-[var(--dca-text-secondary)]" />
      </div>
      <div className="text-xs text-[var(--dca-text-tertiary)] uppercase font-semibold mb-0.5">{label}</div>
      <div className="text-sm text-[var(--dca-text-primary)] bg-[var(--dca-bg-secondary)] p-2 rounded border border-[var(--dca-bg-tertiary)]">{text}</div>
    </div>
  );
}
