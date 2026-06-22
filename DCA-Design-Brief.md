# DCA Cognitive Operating System — UI/UX Design Brief for Figma AI

## How to use this brief
This document is a complete visual and interaction design specification for the DCA frontend. Provide it to Figma AI (or another design agent) to generate high‑fidelity mockups, interactive prototypes, and a design system. It intentionally contains no code or framework‑specific instructions; all details are about screens, components, states, and user experience.

---

## Project Overview

**Product:** DCA Cognitive Operating System  
**Category:** Professional AI management console  
**Vibe:** Intelligent, calm, precise, trustworthy, data‑dense, slightly futuristic but not sci‑fi  
**Key adjectives:** Legible, quiet, confident, fast, observatory‑grade  
**Primary users:** Power users monitoring an autonomous AI system that manages goals, facts, beliefs, agents, and costs.

---

## Design System Foundation

### Color Palette (Dark Theme – all colors defined as CSS custom properties for future light theme)

| Role | Name | Hex | Usage |
|------|------|-----|-------|
| Background Primary | `--dca-bg-primary` | `#0F172A` | Main app background |
| Background Secondary | `--dca-bg-secondary` | `#1E293B` | Cards, panels, sidebar |
| Background Tertiary | `--dca-bg-tertiary` | `#334155` | Elevated surfaces, hover |
| Text Primary | `--dca-text-primary` | `#F8FAFC` | Headlines, important values |
| Text Secondary | `--dca-text-secondary` | `#CBD5E1` | Body, descriptions |
| Text Tertiary | `--dca-text-tertiary` | `#64748B` | Captions, timestamps |
| Accent Primary | `--dca-accent-primary` | `#22D3EE` (cyan) | Interactive elements, links, selected |
| Accent Secondary | `--dca-accent-secondary` | `#818CF8` (indigo) | Secondary actions, agent indicators |
| Success | `--dca-success` | `#34D399` (green) | Completed, healthy, within budget |
| Warning | `--dca-warning` | `#F59E0B` (amber) | Conflicts, approaching limits |
| Error | `--dca-error` | `#EF4444` (red) | Failed, exceeded, low confidence |
| Info | `--dca-info` | `#60A5FA` (blue) | Perception events, informational |

### Typography

- **UI font:** Inter (sans‑serif)  
- **Monospace font:** JetBrains Mono (for code, JSON, event IDs)  
- **Scale:** 12px (captions), 14px (body), 16px (subheadings), 20px (card titles), 24px (page titles), 32px (hero dashboard numbers)

### Spacing

4px base grid: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64px

### Effects

- **Glass‑morphism cards:** `background: rgba(30,41,59,0.8); backdrop‑blur: 12px; border: 1px solid rgba(51,65,85,0.5)`
- **Animations:** Subtle data‑change pulse (cyan glow 300ms), skeleton shimmer, smooth status transitions, connection‑status pulse

---

## Component Library

Design every component below with **all listed variants and states**. All interactive components must have a visible focus ring (cyan) and be keyboard accessible. **Never use color alone to convey meaning**—always pair with an icon and/or text.

### Button
- Variants: Primary (cyan fill), Secondary (slate fill), Ghost (transparent), Danger (red fill)
- Sizes: sm, md, lg
- States: Default, Hover, Active, Focus, Disabled, Loading (spinner)

### Card
- Variants: Default, Elevated (higher bg + shadow), Interactive (hover lift + border highlight), Glass‑morphism
- Optional header slot with title and action icons
- States: Default, Hover (interactive only)

### Badge / Pill
- Status variants: Active (green), Blocked (amber), Completed (green‑muted), High Confidence (gradient green), Low Confidence (gradient red)
- Always includes a tiny icon + text label

### Modal
- Sizes: Default (480px), Wide (720px), Full‑screen
- Overlay with fade‑in; closes on Escape and overlay click

### Table
- Sortable headers with direction indicator; row hover highlight; single‑row selection; expandable detail rows

### Input
- Types: Text, Search (with icon), Select (custom dropdown), Textarea
- Always with label above; error message below; disabled state

### Tabs
- Horizontal (underline style), Vertical (sidebar style); optional count badges

### Tooltip
- Dark and light variants; arrow pointing to trigger; appears on hover

### Dropdown
- Sections with dividers; items with icon + label; keyboard shortcuts shown right‑aligned

### Toggle / Switch
- On = cyan, Off = slate; smooth slide animation

### Progress Bar
- Standard: slate track + cyan fill
- Confidence gradient: red‑amber‑green fill based on value 0–100%

### Skeleton Loader
- Three variants only: Card (rectangles + circle), Table row, Text line
- Shimmer animation on all

### Toast Notification
- Types: Success, Warning, Error, Info, Undo (with “Undo” button)
- Auto‑dismiss with progress timer; stack from bottom‑right

### Timeline (Vertical)
- Line with dots, connector lines, label + timestamp pairs

### Radial Gauge
- SVG arc with color segments (green/amber/red); center displays numeric value
- Used for trust scores and budget remaining

### Sparkline
- Inline SVG mini‑chart for trend indicators

### Avatar
- Circle with initials or icon; status dot (online=green, offline=grey, busy=amber)

### Breadcrumb
- Slash‑separated path links; last segment is current page (non‑linked)

### Sidebar Navigation
- Collapsed (icon‑only, 48px wide) and Expanded (icon + label, 200px wide)
- Active item highlighted with cyan accent

---

## App Shell: Layout, Navigation & Global Elements

### Overall Layout

- **Left sidebar** (collapsible) with navigation items: **Dashboard**, **World State**, **Agent Lifecycle**, **Memory Explorer**, **Cost Monitor**, **Settings**
- **Top bar** containing: DCA logo/wordmark, **connection status indicator** (see below), **“Thinking…” indicator** (pulsing cyan dot when Meta‑Cognitive Controller is active), notification bell, user avatar
- **Main content area** renders the current screen

### Connection Status Indicator (Top Bar, always visible)

- **Connected:** Solid green dot + subtle “Connected” label (optional)
- **Reconnecting:** Pulsing amber dot + “Reconnecting…” text + retry count (e.g., “Attempt 3/10”)
- **Disconnected:** Red dot + “Offline” text
- During reconnecting/disconnected, a subtle semi‑transparent banner appears at the top of the content area: “Data may be stale – last update Xs ago”. All destructive actions (Accept belief, Create goal) are disabled with a tooltip explaining why.

### Onboarding Overlay (First‑time users)

Triggered when goal count = 0 AND fact count = 0. Semi‑transparent overlay over the real dashboard. Five steps, each with “Skip” and “Finish onboarding” buttons. Progress dots at bottom.

1. **Welcome** – short value proposition.
2. **Set your first goal** – text input + clickable example chips.
3. **Connect a data source** (optional) – cards for Calendar, Email, GPS with “Skip for now”.
4. **Meet your agents** – card layout showing agent names, capabilities, starting trust score.
5. **Your dashboard** – annotated screenshot explaining key areas.

---

## Screen‑by‑Screen UI/UX Specifications

### Screen 1: System Overview Dashboard
**Route:** `/`  
**Purpose:** Primary screen after login. Gives at‑a‑glance system health, active goals, live events, and cost.

#### Primary Goal Display
- Hero card at top: current primary goal name, status badge, radial progress indicator.
- Subtle glow/pulse when progress updates.

#### Summary Cards Row (4–6 cards)
Glass‑morphism style. Each card clickable and navigates to its detail screen. Footer shows “Updated Xs ago” timestamp. Values briefly pulse cyan on update.

1. **Active Goals** – count + micro sparkline trend. Links to Agent Lifecycle.
2. **Online Agents** – count / total, average trust score. Links to Agent Lifecycle.
3. **Cognitive Spend Today** – dollar amount + % of daily budget radial gauge. Links to Cost Monitor.
4. **World State Facts** – total facts count; if conflicts >0, show amber warning badge. Links to Conflict Resolution if conflicts exist, else World State Viewer.
5. **System Health** – compact indicators: NATS, Postgres, Redis, Ollama each shown as colored dot + icon + label. If Ollama offline, red indicator with “GPU unavailable”. Links to Settings.

#### Live Event Stream Panel
- Virtualized list of last 50 events (scrollable with smooth performance).
- Each row: timestamp, color‑coded type icon/badge (perception=blue, cognition=green, governance=purple‑indigo, error=red), event summary text.
- New events animate in from top with subtle slide‑down.
- Filter tabs above stream: All | Perception | Cognition | Governance | Errors.
- When disconnected: placeholder “Waiting for connection…”; when reconnecting: “Reconnecting…” with retry count.

#### System Health Detail Strip
- Horizontal row of service indicators with uptime % and latency ms.
- If any service degraded, highlight that indicator in red.

#### States to Design
1. Normal operation (all green, moderate event flow)
2. High activity (accelerated event stream, pulsing “Thinking…” dot, event count badge on stream tab)
3. Conflict detected (conflicts card shows amber warning badge, links to Conflict Resolution)
4. System degraded (one service red, degraded warning banner at top)
5. First‑time user (onboarding overlay)
6. Loading / skeleton (card skeletons, table row skeleton, text skeleton)

---

### Screen 2: Temporal World State Viewer
**Route:** `/world-state`  
**Purpose:** Explore the system’s facts and beliefs about entities at any point in time.

#### Timeline Scrubber (Hero Element)
- Horizontal bar with tick marks for significant state changes.
- Draggable handle; click to jump; arrow keys step by 1 min / 1 hour / 1 day (interval selector dropdown).
- Gradient from dim (past) to vibrant (present).
- Large timestamp above scrubber: “As of: 2026‑06‑12 14:32:05 UTC”.
- **Live / Historical Toggle:** Pill button pair [Live] [Historical].
  - “Live” snaps to right edge (“Now”), values update in real‑time with cyan pulses.
  - When scrubbing to history, auto‑switches to “Historical”; shows subtle “Viewing history” banner; live updates pause.
- Keyboard hints overlay: Space = play/pause, arrows = step.

#### Split‑View Content
- **Left panel:** Entity list, filterable by type (Person, Project, Device, Location, Document) with distinct icons. Searchable by name.
- **Right panel:** Selected entity’s attributes. Each shows value, confidence % (thin horizontal bar behind text, filled proportionally), and source label. Click confidence badge → opens evidence side panel.

#### Evidence Chain Side Panel
- Vertical breadcrumb trail: Observation (raw data icon) → Evidence → Belief → Fact.
- Each node expandable to show raw content (e.g., camera thumbnail for observation).

#### Diff Mode
- User places two markers on timeline (click + Shift+click).
- Content switches to side‑by‑side: left = Time A, right = Time B.
- Added attributes: green‑tinted background + “+” prefix.
- Removed attributes: red‑tinted background + “−” prefix.
- Changed: amber background, both values shown.
- Banner: “Viewing Diff: [Time A] vs [Time B]”.

#### States to Design
1. Current time with Live toggle active
2. Historical time (scrubbed to past, “Viewing history” banner)
3. Entity selected, multiple attributes visible
4. Evidence panel open
5. Diff mode active
6. Conflict indicator on attribute (amber highlight + “Resolve” button)
7. No entity selected (empty state)
8. Loading (shimmer overlay on entity panel)

---

### Screen 3: Agent Lifecycle Manager
**Route:** `/agents`  
**Purpose:** View and manage goals, plans, tasks, and agents.

#### Three‑Panel Layout
- **Left:** Goal hierarchy tree (expandable, lazy‑loaded). Status icons: Active (green circle), Blocked (amber triangle), Completed (green check). Filter: All/Active/Blocked/Completed; sort by Priority/Deadline.
- **Center:** Selected goal detail.
  - Description, deadline, priority badge.
  - Plan visualization: vertical timeline of steps with dependency connecting lines.
  - Each task card: assigned agent avatar+name, status indicator (queued=grey dot, running=pulsing cyan dot, completed=green dot, failed=red dot), duration. Task cards animate when status changes.
  - **Plan recovery UI:** Blocked goal shows highlighted blocking dependency with “What’s blocking this?”. Failed task shows “Retry” button with attempt count and backoff timer. “Manual Override” (force‑complete/fail) with confirmation. “Abandon Plan” button with option to create recovery goal.
- **Right:** Agent status panel. Compact list with trust score arc gauge (green >0.8, amber >0.5, red <0.5). Expandable to show:
  - Trust score history sparkline.
  - Last 10 tasks mini‑feed.
  - Capabilities list.
  - Pause/Resume toggle.
  - **Trust drill‑down:** Clicking gauge shows “Trust History” sub‑panel with recent outcomes, user feedback, ground‑truth comparison, trend indicator.

#### Modals & Overlays
- **New Goal modal:** Natural language input, example chips, priority selector, deadline picker.
- **Goal Arbitration overlay:** Side‑by‑side comparison of two competing goals with scoring breakdown bars (urgency, importance, deadline proximity, dependency count).
- **Focus Mode toggle:** Hides left/right panels, center panel goes full width.
- **Goal completed:** Subtle glow on completed card.

#### States to Design
1. Multiple active goals mixed statuses
2. Goal selected with plan (completed, running, pending tasks)
3. Agent detail expanded with trust gauge and history
4. New Goal modal open
5. Goal Arbitration overlay active
6. Blocked goal with dependency highlighted
7. Empty state (“No goals yet”)
8. Goal completed (glow effect)

---

### Screen 4: Conflict Resolution
**Route:** `/conflicts`  
**Purpose:** Review and resolve contradictory beliefs.

#### Conflict List View
- When multiple: list of preview cards (entity, attribute, competing values, severity, blocked‑goal count).
- Click to expand full comparison.
- **Bulk controls** at top: “Select All” checkbox, “Resolve Selected Using [Source]” dropdown, severity filter (“Show only conflicts blocking goals”), bulk action bar (Accept/Reject Selected).

#### Single Conflict Full Comparison
- Header: “Mike · Location”.
- Two belief cards side‑by‑side, each with:
  - Asserted value (large text).
  - Confidence % with gradient bar.
  - Source label + icon.
  - Timestamp (“Observed 5 min ago”).
  - Expandable evidence chain.
  - “Winner” indicator: subtle checkmark on currently‑used belief, with “provisional” label.
- Resolution actions per card:
  - “Accept this” (requires double‑click or confirm).
  - “Reject this” (requires confirm).
  - “Edit” (inline text correction).
  - “Snooze” (choose duration, shows countdown timer).
- **Impact summary:** “This conflict is blocking 2 goals: [Goal A], [Goal B]” – clickable links.
- **Auto‑resolution display:** When system auto‑resolved, shows winner with expandable “Why?” (rationale, trust score comparison).

#### Undo Mechanism
- After any resolution, a toast appears: “Belief accepted for Mike · Location” with “Undo” button. Button active for 5 seconds, then action is permanent.

#### States to Design
1. Single conflict, moderate severity
2. Multiple conflicts queued (list view with previews)
3. Evidence chain expanded
4. Resolution in progress (undo toast visible)
5. Snoozed conflict (greyed out, countdown)
6. Auto‑resolved (“Why?” expanded)
7. No conflicts (empty state: checkmark icon, “All beliefs are consistent”)

---

### Screen 5: Memory Explorer
**Route:** `/memory`  
**Purpose:** Semantic search across facts, episodes, entities, with graph visualization and temporal filtering.

#### Search Interface
- Large search bar with “Ask anything…” placeholder.
- “Typing…” indicator while processing.
- Search history chips below.

#### Temporal Scrubber (Secondary)
- Same design as World State scrubber, positioned below search bar.
- Filters all result tabs to “what the system knew at that time”.

#### Three‑Tab Results
- **Facts:** Fact text, confidence badge, similarity % badge, link to World State, “How do I know this?” button.
- **Episodes:** Time‑ordered event sequences grouped by date (Today, Yesterday, Last Week, Earlier). Expandable to show narrative.
- **Related Entities:** Entity cards with type icon, name, relationship summary, link to entity detail.

#### Evidence Panel (How do I know this?)
- Side panel showing full evidence chain for any fact/belief.

#### Graph View Toggle
- Switches results to force‑directed graph (for <30 nodes; otherwise auto‑list/tree).
- Nodes colored by entity type (people=cyan, projects=green, documents=amber).
- Edges labeled with relationship type.
- Click node to expand direct connections; double‑click to navigate to World State.
- Hover edge to see tooltip with relationship type + evidence.

#### States to Design
1. Search with mixed results across tabs
2. Graph view active (force‑directed, <30 nodes)
3. Empty search (“Ask a question about anything DCA knows”)
4. No results (“I don't know about that yet. Try a different query or add this information.”)
5. Evidence panel open
6. Episodic timeline expanded
7. Loading (skeleton cards/table rows)

---

### Screen 6: Cognitive Cost & Budget Monitor
**Route:** `/costs`  
**Purpose:** Track cognitive spending, set budgets, analyze per‑goal costs.

#### Summary Cards
- Today’s cost, This month’s cost, Projected monthly cost (all currency formatted to 2 decimals).
- Budget remaining: radial gauge (green >50%, amber 25–50%, red <25%) with exact dollar amount in center.

#### Cost Over Time Chart
- Line chart with daily/weekly/monthly toggle.
- Dashed amber budget line.
- Hover tooltip with exact cost.
- **Toggle “Cost by Goal” view:** bar chart of each goal’s total cognitive spend, sorted descending.

#### Reasoning Operations Table
- Columns: Timestamp, Task (expandable), Complexity Class badge, Model Used badge, Tokens, Cost (USD), Goal (linked).
- Sortable/filterable by model, complexity, date range, goal.
- Expandable row: full prompt, response, routing decision metadata.

#### Cost by Goal Breakdown (Collapsible Section)
- Table: Goal name, Status, Total Cost, Task Count, Avg Cost/Task. Each row links to goal in Agent Lifecycle.

#### Budget Settings Panel (Collapsible)
- Daily/monthly/per‑task budget inputs.
- Complexity tier restrictions: toggle rules like “Never use Opus without confirmation”.
- Save with confirmation toast.

#### Alerts Configuration
- “Notify when daily spend exceeds $X”
- “Notify when monthly projection exceeds budget” toggle.

#### What‑If Calculator (Simplified)
- Dropdown: complexity class + target model.
- Static projection text: “Based on current usage, upgrading all Complex tasks to Opus would increase monthly cost by ~$X (from $Y to $Z).”
- Before/after bar comparison.

#### States to Design
1. Normal usage (green gauge, all within limits)
2. Budget warning (amber alert banner, “85% of daily budget consumed”)
3. Budget exceeded (red banner, “Automatic downgrade to cheaper models now active”)
4. Empty state (no costs yet)
5. Task detail expanded
6. Budget settings panel open
7. What‑if calculator with projection

---

## Cross‑Screen Navigation & Polish

- All summary cards on Dashboard link to their respective detail screens.
- Conflict “blocking goals” links → Agent Lifecycle (pre‑filtered).
- Memory Explorer entity links → World State Viewer.
- World State “view in Memory” links → Memory Explorer (pre‑filled search).
- Cost Monitor goal links → Agent Lifecycle.
- Agent Lifecycle trust score → expands trust history panel.

**Global “Thinking…” indicator:** Pulsing cyan dot in top bar when Meta‑Cognitive Controller is active; also subtle processing animation on the affected goal/task card.

**Data Freshness:** Every data point shows “Updated Xs ago” with a ticking timer.

**Subtle Change Animations:** When a value updates via real‑time event, that element briefly pulses cyan then settles.

---

## Accessibility Requirements

- All interactive components must have a visible focus ring (cyan outline) when focused via keyboard.
- Use icons + text for status, never color alone.
- Ensure all text meets WCAG AA contrast ratio against dark backgrounds.
- Modals and dialogs close on Escape, trap focus.
- Provide ARIA‑friendly labels implicitly through good semantic structure.

---

*End of Design Brief*