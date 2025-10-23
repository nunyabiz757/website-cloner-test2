import { useEffect } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useProjectStore } from '../stores/projectStore';
import { Dashboard } from '../components/Dashboard';

export function DashboardPage() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const { loadProjects } = useProjectStore();

  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [loadProjects, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const state = location.state as { cloneUrl?: string } | null;
  return <Dashboard initialUrl={state?.cloneUrl} />;
}
