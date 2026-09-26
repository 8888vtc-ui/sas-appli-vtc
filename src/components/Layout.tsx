import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Calendar, Receipt, Shield, Settings as SettingsIcon,
  Plus, PieChart, Users, LogOut, ShieldCheck,
  Wallet, QrCode, Plane, LayoutGrid, X,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

/* ───────────────────────────────────────────────
   iOS-style Tab Bar (Bottom)
   ─────────────────────────────────────────────── */
const tabs = [
  { to: '/', label: 'Courses', icon: Calendar },
  { to: '/factures', label: 'Factures', icon: Receipt },
  { to: '/notes-de-frais', label: 'Frais', icon: Wallet },
  { to: '/crm', label: 'Clients', icon: Users },
  { to: '#menu', label: 'Plus', icon: LayoutGrid },
];

/* ───────────────────────────────────────────────
   Side Menu items (all apps)
   ─────────────────────────────────────────────── */
const menuItems = [
  { to: '/', label: 'Courses', icon: Calendar, color: '#0a84ff' },
  { to: '/factures', label: 'Factures', icon: Receipt, color: '#30d158' },
  { to: '/notes-de-frais', label: 'Notes de Frais', icon: Wallet, color: '#bf5af2' },
  { to: '/crm', label: 'Clients CRM', icon: Users, color: '#64d2ff' },
  { to: '/comptabilite', label: 'Comptabilité', icon: PieChart, color: '#ff9f0a' },
  { to: '/qrcode', label: 'QR Code Pro', icon: QrCode, color: '#ffd60a' },
  { to: '/sign', label: 'Aéroport', icon: Plane, color: '#ff9f0a' },
  { to: '/controle', label: 'Mode Contrôle', icon: ShieldCheck, color: '#30d158' },
  { to: '/coffre-fort', label: 'Coffre-Fort', icon: Shield, color: '#5e5ce6' },
  { to: '/parametres', label: 'Réglages', icon: SettingsIcon, color: '#8e8e93' },
];

export default function Layout({ children, onNewTrip }: { children: React.ReactNode; onNewTrip: () => void }) {
  const { settings, trips } = useApp();
  const { signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await signOut(); } catch { /* */ }
    window.location.href = '/login';
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div style={{ minHeight: '100dvh', paddingBottom: '80px' }}>

      {/* ═══════ HEADER ═══════ */}
      <header className="animate-fade-in" style={{
        padding: '16px 20px 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        maxWidth: 600,
        margin: '0 auto',
      }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', color: '#fff' }}>
            {settings.companyName || 'VTC Pro'}
          </h1>
        </div>
        <button
          onClick={onNewTrip}
          style={{
            width: 36, height: 36,
            borderRadius: '50%',
            background: '#0a84ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(10, 132, 255, 0.4)',
          }}>
          <Plus style={{ width: 18, height: 18, color: '#fff', strokeWidth: 2.5 }} />
        </button>
      </header>

      {/* ═══════ MAIN CONTENT ═══════ */}
      <main style={{
        padding: '0 16px',
        maxWidth: 600,
        margin: '0 auto',
      }}>
        {children}
      </main>

      {/* ═══════ BOTTOM TAB BAR (iOS Native) ═══════ */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: 'rgba(28, 28, 30, 0.92)',
        backdropFilter: 'saturate(180%) blur(20px)',
        WebkitBackdropFilter: 'saturate(180%) blur(20px)',
        borderTop: '0.5px solid rgba(84, 84, 88, 0.36)',
        paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 0px)',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          maxWidth: 500,
          margin: '0 auto',
          padding: '6px 0 8px',
        }}>
          {tabs.map(({ to, label, icon: Icon }) => {
            const active = to === '#menu' ? false : isActive(to);
            const handleClick = () => {
              if (to === '#menu') setMenuOpen(true);
              else navigate(to);
            };
            return (
              <button key={to} onClick={handleClick}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                  background: 'none',
                  padding: '4px 0',
                  minHeight: 44,
                  justifyContent: 'center',
                }}>
                <Icon style={{
                  width: 22, height: 22,
                  color: active ? '#0a84ff' : '#8e8e93',
                  strokeWidth: active ? 2 : 1.5,
                  transition: 'color 0.2s',
                }} />
                <span style={{
                  fontSize: 10,
                  fontWeight: active ? 600 : 500,
                  color: active ? '#0a84ff' : '#8e8e93',
                  letterSpacing: '-0.01em',
                  transition: 'color 0.2s',
                }}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* ═══════ SLIDE-OVER MENU ═══════ */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              style={{
                position: 'fixed', inset: 0, zIndex: 60,
                background: 'rgba(0, 0, 0, 0.5)',
              }}
            />
            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              style={{
                position: 'fixed',
                top: 0, right: 0, bottom: 0,
                width: 280,
                zIndex: 60,
                background: '#1c1c1e',
                borderLeft: '0.5px solid rgba(84, 84, 88, 0.36)',
                overflowY: 'auto',
                paddingBottom: 'max(env(safe-area-inset-bottom, 20px), 20px)',
              }}>

              {/* Panel header */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '20px 20px 16px',
              }}>
                <span style={{ fontSize: 17, fontWeight: 700, color: '#fff' }}>Menu</span>
                <button onClick={() => setMenuOpen(false)}
                  style={{
                    width: 30, height: 30, borderRadius: '50%',
                    background: 'rgba(84, 84, 88, 0.36)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                  <X style={{ width: 14, height: 14, color: '#ebebf5cc' }} />
                </button>
              </div>

              {/* Menu list — iOS Settings style */}
              <div style={{ padding: '0 16px' }}>
                <div style={{
                  background: '#2c2c2e',
                  borderRadius: 12,
                  overflow: 'hidden',
                }}>
                  {menuItems.map((item, i) => (
                    <button key={item.to}
                      onClick={() => { navigate(item.to); setMenuOpen(false); }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '12px 16px',
                        background: isActive(item.to) ? 'rgba(10, 132, 255, 0.12)' : 'transparent',
                        borderBottom: i < menuItems.length - 1 ? '0.5px solid rgba(84, 84, 88, 0.36)' : 'none',
                        textAlign: 'left',
                      }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: 7,
                        background: item.color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <item.icon style={{ width: 16, height: 16, color: '#fff' }} />
                      </div>
                      <span style={{
                        flex: 1,
                        fontSize: 15,
                        fontWeight: isActive(item.to) ? 600 : 400,
                        color: '#fff',
                      }}>
                        {item.label}
                      </span>
                      <ChevronRight style={{ width: 14, height: 14, color: '#48484a' }} />
                    </button>
                  ))}
                </div>

                {/* Stats + Déconnexion */}
                <div style={{ marginTop: 24, padding: '0 4px' }}>
                  <p style={{ fontSize: 13, color: '#8e8e93', marginBottom: 12 }}>
                    {trips.length} course{trips.length !== 1 ? 's' : ''} enregistrée{trips.length !== 1 ? 's' : ''}
                  </p>
                  <button onClick={handleLogout}
                    style={{
                      width: '100%',
                      padding: '12px 0',
                      borderRadius: 12,
                      background: 'rgba(255, 69, 58, 0.12)',
                      color: '#ff453a',
                      fontSize: 15,
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                    }}>
                    <LogOut style={{ width: 16, height: 16 }} />
                    Déconnexion
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
