import { createBrowserRouter } from "react-router";
import { AppLayout } from "./components/layout/AppLayout";
import { Dashboard } from "./pages/Dashboard";
import { WorldState } from "./pages/WorldState";
import { AgentLifecycle } from "./pages/AgentLifecycle";
import { ConflictResolution } from "./pages/ConflictResolution";
import { MemoryExplorer } from "./pages/MemoryExplorer";
import { CostMonitor } from "./pages/CostMonitor";
import Chat from "./pages/Chat";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: AppLayout,
    children: [
      { index: true, Component: Chat },
      { path: "chat", Component: Chat },
      { path: "dashboard", Component: Dashboard },
      { path: "world-state", Component: WorldState },
      { path: "agents", Component: AgentLifecycle },
      { path: "conflicts", Component: ConflictResolution },
      { path: "memory", Component: MemoryExplorer },
      { path: "costs", Component: CostMonitor },
    ],
  },
]);
