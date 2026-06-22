import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router';
import { 
  LayoutDashboard, 
  Globe, 
  Bot, 
  BrainCircuit, 
  CircleDollarSign, 
  Settings,
  Bell,
  Menu
} from 'lucide-react';
import { cn } from '../ui/Badge';

export function AppLayout() {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'World State', path: '/world-state', icon: Globe },
    { name: 'Agent Lifecycle', path: '/agents', icon: Bot },
    { name: 'Conflict Resolution', path: '/conflicts', icon: BrainCircuit },
    { name: 'Memory Explorer', path: '/memory', icon: BrainCircuit },
    { name: 'Cost Monitor', path: '/costs', icon: CircleDollarSign },
  ];

  return (
    <div className="flex h-screen bg-[var(--dca-bg-primary)] text-[var(--dca-text-primary)] font-sans overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-[var(--dca-bg-secondary)] border-r border-[var(--dca-bg-tertiary)] flex flex-col transition-all duration-300",
          sidebarExpanded ? "w-64" : "w-16"
        )}
      >
        <div className="h-16 flex items-center px-4 border-b border-[var(--dca-bg-tertiary)] justify-between">
          {sidebarExpanded && <span className="font-bold text-lg text-[var(--dca-text-primary)]">DCA</span>}
          <button onClick={() => setSidebarExpanded(!sidebarExpanded)} className="p-1 hover:bg-[var(--dca-bg-tertiary)] rounded text-[var(--dca-text-secondary)]">
            <Menu className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 flex flex-col gap-1 px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                  isActive 
                    ? "bg-[var(--dca-accent-primary)]/10 text-[var(--dca-accent-primary)]" 
                    : "text-[var(--dca-text-secondary)] hover:bg-[var(--dca-bg-tertiary)] hover:text-[var(--dca-text-primary)]"
                )}
                title={!sidebarExpanded ? item.name : undefined}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {sidebarExpanded && <span>{item.name}</span>}
              </NavLink>
            );
          })}
        </nav>
        <div className="p-4 border-t border-[var(--dca-bg-tertiary)]">
          <button className="flex items-center gap-3 text-[var(--dca-text-secondary)] hover:text-[var(--dca-text-primary)] w-full px-3 py-2 rounded-md hover:bg-[var(--dca-bg-tertiary)] transition-colors">
            <Settings className="w-5 h-5 shrink-0" />
            {sidebarExpanded && <span>Settings</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-[var(--dca-bg-secondary)]/50 backdrop-blur-md border-b border-[var(--dca-bg-tertiary)] flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[var(--dca-success)]" />
              <span className="text-sm text-[var(--dca-text-secondary)]">Connected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[var(--dca-accent-primary)] animate-pulse" />
              <span className="text-sm text-[var(--dca-text-secondary)]">Thinking...</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-[var(--dca-text-secondary)] hover:text-[var(--dca-text-primary)] transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded-full bg-[var(--dca-bg-tertiary)] flex items-center justify-center text-sm font-medium border border-[var(--dca-text-tertiary)]">
              US
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-[var(--dca-bg-primary)] p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
