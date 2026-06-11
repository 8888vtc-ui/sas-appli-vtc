import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import TripModal from './components/TripModal';
import { useState } from 'react';

// Pages
import Dashboard from './pages/Dashboard';
import Invoices from './pages/Invoices';
import Vault from './pages/Vault';
import Settings from './pages/Settings';
import SignMode from './pages/SignMode';
import Login from './pages/Login';
import Register from './pages/Register';

import Accounting from './pages/Accounting';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen bg-[#0F172A] flex items-center justify-center text-white">Chargement...</div>;
  if (!user) return <Navigate to="/login" />;

  return <>{children}</>;
}

function AppRoutes() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Private Routes */}
      <Route path="/sign/:id" element={<ProtectedRoute><SignMode /></ProtectedRoute>} />
      <Route path="/controle" element={<ProtectedRoute><Vault controlMode={true} /></ProtectedRoute>} />

      <Route
        path="*"
        element={
          <ProtectedRoute>
            <AppProvider>
              <Layout onNewTrip={() => setIsModalOpen(true)}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/factures" element={<Invoices />} />
                  <Route path="/coffre-fort" element={<Vault />} />
                  <Route path="/parametres" element={<Settings />} />
                  <Route path="/comptabilite" element={<Accounting />} />
                </Routes>
                <TripModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
              </Layout>
            </AppProvider>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}
