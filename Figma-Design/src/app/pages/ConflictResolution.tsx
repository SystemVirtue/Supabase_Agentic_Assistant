import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { AlertTriangle, Check, X, Clock, Edit2, ShieldAlert, ArrowRight, User } from 'lucide-react';
import { cn } from '../components/ui/Badge';

export function ConflictResolution() {
  const [resolved, setResolved] = useState(false);

  return (
    <div className="flex flex-col gap-6 h-full max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Conflict Resolution</h1>
        <div className="flex gap-2">
          <Button variant="secondary">Snooze All</Button>
          <Button variant="primary">Auto-Resolve Selected</Button>
        </div>
      </div>

      {!resolved ? (
        <div className="flex flex-col gap-6">
          {/* Impact Summary */}
          <div className="bg-[var(--dca-warning)]/10 border border-[var(--dca-warning)]/30 rounded-lg p-4 flex items-center gap-4">
            <AlertTriangle className="w-5 h-5 text-[var(--dca-warning)] shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-[var(--dca-warning)] font-medium">This conflict is blocking 2 active goals.</p>
              <div className="flex gap-2 mt-2">
                <Badge variant="blocked" className="bg-[var(--dca-warning)]/20 text-xs py-0.5">Send Location Update</Badge>
                <Badge variant="blocked" className="bg-[var(--dca-warning)]/20 text-xs py-0.5">Schedule Meeting</Badge>
              </div>
            </div>
          </div>

          <Card className="flex flex-col overflow-hidden">
            <div className="p-4 border-b border-[var(--dca-bg-tertiary)] bg-[var(--dca-bg-tertiary)]/20 flex items-center gap-3">
              <User className="w-5 h-5 text-[var(--dca-text-secondary)]" />
              <h2 className="font-medium text-lg">Mike Johnson <span className="text-[var(--dca-text-tertiary)] mx-2">·</span> Location</h2>
            </div>
            
            <div className="flex divide-x divide-[var(--dca-bg-tertiary)]">
              {/* Belief A */}
              <div className="flex-1 p-6 flex flex-col gap-6 hover:bg-[var(--dca-bg-tertiary)]/5 transition-colors group relative">
                <div className="absolute top-4 right-4 text-[var(--dca-success)] opacity-0 group-hover:opacity-100 transition-opacity flex items-center text-xs font-medium bg-[var(--dca-success)]/10 px-2 py-1 rounded">
                  <Check className="w-3 h-3 mr-1" /> Provisional Winner
                </div>
                
                <div>
                  <span className="text-xs text-[var(--dca-text-tertiary)] uppercase font-semibold">Asserted Value</span>
                  <div className="text-2xl font-medium mt-1">Seattle Office (Desk 4B)</div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--dca-text-secondary)]">Confidence</span>
                    <span className="font-mono text-[var(--dca-success)]">85%</span>
                  </div>
                  <div className="w-full h-2 bg-[var(--dca-bg-tertiary)] rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--dca-success)]" style={{ width: '85%' }} />
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm text-[var(--dca-text-secondary)] border-t border-[var(--dca-bg-tertiary)] pt-4">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Source: <strong className="text-[var(--dca-text-primary)]">Wifi Logs</strong></span>
                  <span className="text-[var(--dca-text-tertiary)] ml-auto">Observed 5 min ago</span>
                </div>

                <div className="flex gap-2 mt-auto pt-4">
                  <Button variant="primary" className="flex-1" onClick={() => setResolved(true)}>Accept This</Button>
                  <Button variant="secondary" className="px-3" title="Edit"><Edit2 className="w-4 h-4" /></Button>
                  <Button variant="secondary" className="px-3" title="Snooze"><Clock className="w-4 h-4" /></Button>
                </div>
              </div>

              {/* Belief B */}
              <div className="flex-1 p-6 flex flex-col gap-6 hover:bg-[var(--dca-bg-tertiary)]/5 transition-colors">
                <div>
                  <span className="text-xs text-[var(--dca-text-tertiary)] uppercase font-semibold">Asserted Value</span>
                  <div className="text-2xl font-medium mt-1">Working from Home</div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--dca-text-secondary)]">Confidence</span>
                    <span className="font-mono text-[var(--dca-warning)]">72%</span>
                  </div>
                  <div className="w-full h-2 bg-[var(--dca-bg-tertiary)] rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--dca-warning)]" style={{ width: '72%' }} />
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm text-[var(--dca-text-secondary)] border-t border-[var(--dca-bg-tertiary)] pt-4">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Source: <strong className="text-[var(--dca-text-primary)]">Slack Status</strong></span>
                  <span className="text-[var(--dca-text-tertiary)] ml-auto">Observed 2 hrs ago</span>
                </div>

                <div className="flex gap-2 mt-auto pt-4">
                  <Button variant="ghost" className="flex-1 border border-[var(--dca-bg-tertiary)] text-[var(--dca-text-primary)] hover:bg-[var(--dca-accent-primary)] hover:text-black hover:border-[var(--dca-accent-primary)]" onClick={() => setResolved(true)}>Accept This</Button>
                  <Button variant="secondary" className="px-3" title="Edit"><Edit2 className="w-4 h-4" /></Button>
                  <Button variant="secondary" className="px-3" title="Snooze"><Clock className="w-4 h-4" /></Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center p-12 text-center h-[400px]">
          <div className="w-16 h-16 bg-[var(--dca-success)]/20 rounded-full flex items-center justify-center mb-4">
            <Check className="w-8 h-8 text-[var(--dca-success)]" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">All beliefs are consistent</h2>
          <p className="text-[var(--dca-text-secondary)] mb-6">No conflicts detected in the current world state.</p>
          <Button variant="secondary" onClick={() => setResolved(false)}>Reset Demo</Button>
        </Card>
      )}
      
      {/* Toast Overlay Demo */}
      {resolved && (
        <div className="fixed bottom-6 right-6 bg-[var(--dca-bg-secondary)] border border-[var(--dca-success)]/50 shadow-lg rounded-lg p-4 flex items-center gap-4 animate-in slide-in-from-bottom-5">
          <Check className="w-5 h-5 text-[var(--dca-success)]" />
          <div>
            <p className="text-sm font-medium">Belief accepted for Mike · Location</p>
            <p className="text-xs text-[var(--dca-text-tertiary)]">World state updated.</p>
          </div>
          <div className="ml-4 flex items-center gap-2 border-l border-[var(--dca-bg-tertiary)] pl-4">
            <Button variant="ghost" size="sm" className="h-8" onClick={() => setResolved(false)}>Undo</Button>
          </div>
          {/* Progress bar for auto dismiss */}
          <div className="absolute bottom-0 left-0 h-1 bg-[var(--dca-success)] rounded-b-lg animate-[shrink_5s_linear_forwards]" style={{ width: '100%' }} />
        </div>
      )}
    </div>
  );
}
