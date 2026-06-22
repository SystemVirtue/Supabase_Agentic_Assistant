import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Search, User, Briefcase, MapPin, FileText, Smartphone, History, Play, SkipBack, SkipForward, ArrowRight } from 'lucide-react';
import { cn } from '../components/ui/Badge';

export function WorldState() {
  const [isLive, setIsLive] = useState(true);
  const [selectedEntity, setSelectedEntity] = useState<number | null>(1);

  const entities = [
    { id: 1, type: 'person', name: 'Mike Johnson', icon: User },
    { id: 2, type: 'project', name: 'Project Alpha Migration', icon: Briefcase },
    { id: 3, type: 'device', name: 'Server-DB-01', icon: Smartphone },
    { id: 4, type: 'location', name: 'AWS US-East-1', icon: MapPin },
    { id: 5, type: 'document', name: 'Q3 Financial Report', icon: FileText },
  ];

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Timeline Scrubber */}
      <Card className="p-4 shrink-0 flex flex-col gap-4 border-[var(--dca-bg-tertiary)]">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-[var(--dca-text-tertiary)] uppercase font-semibold">Temporal View</span>
            <span className="text-xl font-mono">
              {isLive ? 'As of: 2026-06-13 14:32:05 UTC' : 'As of: 2026-06-12 09:00:00 UTC'}
            </span>
          </div>
          <div className="flex p-1 bg-[var(--dca-bg-tertiary)] rounded-lg">
            <button 
              onClick={() => setIsLive(true)}
              className={cn("px-4 py-1.5 text-sm font-medium rounded-md transition-colors", isLive ? "bg-[var(--dca-accent-primary)] text-black shadow" : "text-[var(--dca-text-secondary)]")}
            >
              Live
            </button>
            <button 
              onClick={() => setIsLive(false)}
              className={cn("px-4 py-1.5 text-sm font-medium rounded-md transition-colors", !isLive ? "bg-[var(--dca-bg-secondary)] text-[var(--dca-text-primary)] shadow border border-[var(--dca-bg-tertiary)]" : "text-[var(--dca-text-secondary)]")}
            >
              Historical
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 shrink-0 text-[var(--dca-text-secondary)]">
            <Button variant="ghost" size="sm" className="px-2"><SkipBack className="w-4 h-4" /></Button>
            <Button variant="ghost" size="sm" className="px-2"><Play className="w-4 h-4" /></Button>
            <Button variant="ghost" size="sm" className="px-2"><SkipForward className="w-4 h-4" /></Button>
          </div>
          <div className="flex-1 h-2 bg-[var(--dca-bg-tertiary)] rounded-full relative">
            <div className="absolute inset-y-0 right-0 left-1/4 bg-gradient-to-r from-[var(--dca-bg-tertiary)] to-[var(--dca-accent-primary)]/50 rounded-full" />
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-[var(--dca-accent-primary)] rounded-full border-2 border-[var(--dca-bg-primary)] cursor-grab" 
              style={{ left: isLive ? '100%' : '75%', transform: 'translate(-50%, -50%)' }}
            />
          </div>
        </div>
      </Card>

      {!isLive && (
        <div className="bg-[var(--dca-bg-tertiary)]/50 border border-[var(--dca-bg-tertiary)] rounded-md px-4 py-2 flex items-center justify-center text-sm text-[var(--dca-text-secondary)] shrink-0">
          <History className="w-4 h-4 mr-2" />
          Viewing history. Live updates are paused.
        </div>
      )}

      {/* Split View */}
      <div className="flex-1 flex gap-6 min-h-0">
        {/* Left Panel */}
        <Card className="w-80 flex flex-col shrink-0">
          <div className="p-4 border-b border-[var(--dca-bg-tertiary)]">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--dca-text-tertiary)]" />
              <input 
                type="text" 
                placeholder="Search entities..." 
                className="w-full bg-[var(--dca-bg-tertiary)] text-[var(--dca-text-primary)] rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--dca-accent-primary)]"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
            {entities.map(e => (
              <button 
                key={e.id}
                onClick={() => setSelectedEntity(e.id)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-md text-left transition-colors",
                  selectedEntity === e.id ? "bg-[var(--dca-accent-primary)]/10 text-[var(--dca-text-primary)]" : "hover:bg-[var(--dca-bg-tertiary)]/50 text-[var(--dca-text-secondary)]"
                )}
              >
                <e.icon className="w-5 h-5 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{e.name}</span>
                  <span className="text-xs text-[var(--dca-text-tertiary)] capitalize">{e.type}</span>
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Right Panel */}
        <Card className="flex-1 flex flex-col overflow-hidden">
          {selectedEntity ? (
            <>
              <div className="p-6 border-b border-[var(--dca-bg-tertiary)] shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[var(--dca-bg-tertiary)] rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-[var(--dca-text-secondary)]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Mike Johnson</h2>
                    <span className="text-sm text-[var(--dca-text-tertiary)]">Person · ID: 9f8a-23b1</span>
                  </div>
                </div>
                <Button variant="secondary" size="sm">View in Memory</Button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
                <h3 className="text-sm font-medium text-[var(--dca-text-secondary)] uppercase tracking-wider mb-2">Attributes</h3>
                
                <AttributeRow 
                  name="Role" 
                  value="Lead Cloud Architect" 
                  confidence={98} 
                  source="HR DB" 
                />
                <AttributeRow 
                  name="Location" 
                  value="Seattle Office (Desk 4B)" 
                  confidence={85} 
                  source="Wifi Logs" 
                  conflict
                />
                <AttributeRow 
                  name="Current Task" 
                  value="Reviewing Project Alpha Migration" 
                  confidence={60} 
                  source="Slack Status" 
                />
                <AttributeRow 
                  name="Clearance Level" 
                  value="Tier 3 (Confidential)" 
                  confidence={99} 
                  source="Active Directory" 
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-[var(--dca-text-tertiary)]">
              Select an entity to view its state
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function AttributeRow({ name, value, confidence, source, conflict }: any) {
  return (
    <div className={cn(
      "flex flex-col gap-2 p-4 rounded-lg border",
      conflict ? "bg-[var(--dca-warning)]/5 border-[var(--dca-warning)]/30" : "bg-[var(--dca-bg-tertiary)]/30 border-transparent hover:border-[var(--dca-bg-tertiary)]"
    )}>
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <span className="text-sm text-[var(--dca-text-tertiary)]">{name}</span>
          <span className="text-base font-medium text-[var(--dca-text-primary)] mt-1">{value}</span>
        </div>
        {conflict && (
          <Button variant="danger" size="sm" className="h-7 text-xs bg-[var(--dca-warning)] hover:bg-[var(--dca-warning)]/90">Resolve Conflict</Button>
        )}
      </div>
      <div className="flex items-center gap-4 mt-2 border-t border-[var(--dca-bg-tertiary)]/50 pt-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--dca-text-secondary)]">Confidence:</span>
          <div className="w-24 h-1.5 bg-[var(--dca-bg-tertiary)] rounded-full overflow-hidden">
            <div 
              className={cn("h-full", confidence > 90 ? "bg-[var(--dca-success)]" : confidence > 70 ? "bg-[var(--dca-info)]" : "bg-[var(--dca-warning)]")}
              style={{ width: `${confidence}%` }}
            />
          </div>
          <span className="text-xs font-mono">{confidence}%</span>
        </div>
        <div className="w-px h-3 bg-[var(--dca-bg-tertiary)]" />
        <span className="text-xs text-[var(--dca-text-secondary)] flex items-center gap-1">
          Source: <Badge variant="default" className="text-[10px] py-0">{source}</Badge>
        </span>
        <button className="ml-auto text-xs text-[var(--dca-accent-primary)] hover:underline flex items-center">
          Evidence <ArrowRight className="w-3 h-3 ml-1" />
        </button>
      </div>
    </div>
  );
}
