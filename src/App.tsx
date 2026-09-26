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
import CRM from './pages/CRM';
import ExpenseReports from './pages/ExpenseReports';
import QRCodeHub from './pages/QRCodeHub';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen bg-[#0F172A] flex items-center justify-center text-white">Chargement...</div>;
  if (!user) return <Navigate to="/login" />;

  return <>{children}</>;
}

function ProtectedLayout() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <AppProvider>
      <Routes>
        {/* Fullscreen Dedicated Views inside AppProvider */}
        <Route path="/sign/:id" element={<SignMode />} />
        <Route path="/controle" element={<Vault controlMode={true} />} />

        {/* Standard Views with Layout and Navigation */}
        <Route
          path="*"
          element={
            <Layout onNewTrip={() => setIsModalOpen(true)}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/factures" element={<Invoices />} />
                <Route path="/crm" element={<CRM />} />
                <Route path="/coffre-fort" element={<Vault />} />
                <Route path="/qrcode" element={<QRCodeHub />} />
                <Route path="/parametres" element={<Settings />} />
                <Route path="/comptabilite" element={<Accounting />} />
                <Route path="/notes-de-frais" element={<ExpenseReports />} />
              </Routes>
              <TripModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
            </Layout>
          }
        />
      </Routes>
    </AppProvider>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Private Routes wrapped in ProtectedRoute & AppProvider */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <ProtectedLayout />
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
