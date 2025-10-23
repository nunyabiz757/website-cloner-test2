import { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useProjectStore } from '../stores/projectStore';
import { ProjectCard } from '../components/dashboard/ProjectCard';
import { Plus } from 'lucide-react';
import { Button } from '../components/ui/Button';
import type { CloneProject } from '../types';

export function ProjectsPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { projects, setCurrentProject, deleteProject, loadProjects } = useProjectStore();

  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user, loadProjects]);

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

  const handleViewProject = (project: CloneProject) => {
    setCurrentProject(project);
    navigate(`/performance/${project.id}`);
  };

  const handleCloneWebsite = (url: string) => {
    navigate('/dashboard', { state: { cloneUrl: url } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
            <p className="text-gray-600 mt-2">
              {projects.length} {projects.length === 1 ? 'project' : 'projects'} total
            </p>
          </div>
          <Button onClick={() => navigate('/dashboard')}>
            <Plus size={18} className="mr-2" />
            New Project
          </Button>
        </div>

        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onView={handleViewProject}
                onDelete={deleteProject}
                onClone={handleCloneWebsite}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
              <Plus className="text-gray-400" size={40} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No projects yet</h3>
            <p className="text-gray-600 mb-6">Get started by cloning your first website</p>
            <Button>Create Your First Project</Button>
          </div>
        )}
      </div>
    </div>
  );
}
