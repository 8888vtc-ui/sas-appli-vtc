import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

import Accounting from './pages/Accounting';
import CRM from './pages/CRM';
import ExpenseReports from './pages/ExpenseReports';
import QRCodeHub from './pages/QRCodeHub';
import FinancesHub from './pages/FinancesHub';
import ToolsHub from './pages/ToolsHub';
import WhatsAppRadar from './pages/WhatsAppRadar';
import CreatorProfile from './pages/CreatorProfile';
import LandingPage from './pages/LandingPage';
import Legal from './pages/Legal';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="min-h-screen bg-[#0F172A] flex items-center justify-center text-white">Chargement...</div>;
  
  if (!user) {
    if (location.pathname === '/') return <Navigate to="/landing" />;
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}

function ProtectedLayout() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <AppProvider>
      <Routes>
        {/* Fullscreen Dedicated Views inside AppProvider */}
        <Route path="/sign" element={<SignMode />} />
        <Route path="/sign/:id" element={<SignMode />} />
        <Route path="/controle" element={<Vault controlMode={true} />} />

        {/* Standard Views with Layout and Navigation */}
        <Route
          path="*"
          element={
            <Layout onNewTrip={() => setIsModalOpen(true)}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/finances" element={<FinancesHub />} />
                <Route path="/outils" element={<ToolsHub />} />
                
                {/* Legacy individual routes kept for direct linking from ToolsHub */}
                <Route path="/factures" element={<Invoices />} />
                <Route path="/crm" element={<CRM />} />
                <Route path="/coffre-fort" element={<Vault />} />
                <Route path="/qrcode" element={<QRCodeHub />} />
                <Route path="/parametres" element={<Settings />} />
                <Route path="/comptabilite" element={<Accounting />} />
                <Route path="/notes-de-frais" element={<ExpenseReports />} />
                <Route path="/whatsapp-radar" element={<WhatsAppRadar />} />
                <Route path="/creator" element={<CreatorProfile />} />
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
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/legal" element={<Legal />} />

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

import ToastContainer from './components/Toast';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
        <ToastContainer />
      </AuthProvider>
    </Router>
  );
}
