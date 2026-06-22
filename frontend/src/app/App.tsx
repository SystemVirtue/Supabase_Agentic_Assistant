import { RouterProvider } from 'react-router';
import { router } from './routes';
import { useAuth } from '../hooks/useAuth';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--dca-bg-primary)]">
        <div className="text-[var(--dca-text-secondary)]">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--dca-bg-primary)]">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-[var(--dca-text-primary)] mb-4">DCA Cognitive Operating System</h1>
          <p className="text-[var(--dca-text-secondary)] mb-4">Please sign in to continue</p>
          <button
            onClick={() => {
              // For demo purposes, we'll just show a message
              // In production, this would redirect to a login page
              alert('Authentication required. Configure Supabase Auth in .env');
            }}
            className="px-4 py-2 bg-[var(--dca-accent-primary)] text-white rounded-md hover:opacity-90"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return <RouterProvider router={router} />;
}

export default App;
