import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { DashboardNav } from './components/layout/DashboardNav';
import { Footer } from './components/layout/Footer';
import { ProtectedRoute } from './components/security/ProtectedRoute';

// New Pages (bolt.new spec)
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Clone } from './pages/Clone';

// Existing Pages
import { DashboardPage } from './pages/DashboardPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { PreviewPage } from './pages/PreviewPage';
import { PerformancePage } from './pages/PerformancePage';
import { OptimizationPage } from './pages/OptimizationPage';
import { ExportPage } from './pages/ExportPage';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { GHLPastePage } from './pages/GHLPastePage';
import { GHLConverterPage } from './pages/GHLConverterPage';
import { DetectionPage } from './pages/DetectionPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <DashboardNav />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/clone"
                element={
                  <ProtectedRoute>
                    <Clone />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/projects"
                element={
                  <ProtectedRoute>
                    <ProjectsPage />
                  </ProtectedRoute>
                }
              />

              {/* Other Protected Routes */}
              <Route
                path="/preview/:projectId"
                element={
                  <ProtectedRoute>
                    <PreviewPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/preview"
                element={
                  <ProtectedRoute>
                    <PreviewPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/performance/:projectId"
                element={
                  <ProtectedRoute>
                    <PerformancePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/performance"
                element={
                  <ProtectedRoute>
                    <PerformancePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/optimization/:projectId"
                element={
                  <ProtectedRoute>
                    <OptimizationPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/optimize"
                element={
                  <ProtectedRoute>
                    <OptimizationPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/export/:projectId"
                element={
                  <ProtectedRoute>
                    <ExportPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/export"
                element={
                  <ProtectedRoute>
                    <ExportPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ai-assistant/:projectId"
                element={
                  <ProtectedRoute>
                    <AIAssistantPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ai-assistant"
                element={
                  <ProtectedRoute>
                    <AIAssistantPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ghl-paste"
                element={
                  <ProtectedRoute>
                    <GHLPastePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ghl-converter"
                element={
                  <ProtectedRoute>
                    <GHLConverterPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ghl-converter/:projectId"
                element={
                  <ProtectedRoute>
                    <GHLConverterPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/detection"
                element={
                  <ProtectedRoute>
                    <DetectionPage />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
