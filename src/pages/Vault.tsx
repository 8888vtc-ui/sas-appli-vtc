import { motion } from 'framer-motion';
import {
  ShieldCheck, User, Car, Building2, XCircle, FileWarning, AlertTriangle, CheckCircle2, Eye, Upload
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getDocExpiryStatus, getDocExpiryDays } from '../lib/utils';

export default function Vault({ controlMode = false }: { controlMode?: boolean }) {
  const { legalDocs, compliance, updateDocExpiry, triggerUpload, settings } = useApp();
  const navigate = useNavigate();

  const catIcon = (c: string) => c === 'driver' ? <User className="w-5 h-5" /> : c === 'vehicle' ? <Car className="w-5 h-5" /> : <Building2 className="w-5 h-5" />;
  const catLabel = (c: string) => c === 'driver' ? 'Conducteur' : c === 'vehicle' ? 'Véhicule' : 'Administratif';

  const viewFile = (data: string) => {
    const w = window.open();
    w?.document.write(
      data.startsWith('data:application/pdf')
        ? `<iframe src="${data}" style="width:100%;height:100%;border:none"></iframe>`
        : `<img src="${data}" style="max-width:100%;margin:auto;display:block"/>`
    );
  };

  if (controlMode) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 overflow-y-auto"
        style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1e293b 100%)' }}>
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
                <ShieldCheck className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Mode Contrôle</h1>
                <p className="text-sm" style={{ color: '#94A3B8' }}>{settings.companyName} — {settings.driverName}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-3xl font-bold" style={{ color: compliance.percent === 100 ? '#22c55e' : compliance.percent >= 70 ? '#f59e0b' : '#ef4444' }}>
                  {compliance.percent}%
                </div>
                <div className="text-xs" style={{ color: '#94A3B8' }}>Conformité</div>
              </div>
              <button onClick={() => navigate('/coffre-fort')} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white">
                <CheckCircle2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="glass rounded-2xl p-5">
              <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: '#94A3B8' }}><User className="w-4 h-4" /> Chauffeur</h3>
              <p className="text-lg font-bold text-white">{settings.driverName || '—'}</p>
              <p className="text-sm" style={{ color: '#94A3B8' }}>Carte Pro: {settings.driverCardNumber || '—'}</p>
              <p className="text-sm" style={{ color: '#94A3B8' }}>Registre VTC: {settings.registreVTC || '—'}</p>
            </div>
            <div className="glass rounded-2xl p-5">
              <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: '#94A3B8' }}><Car className="w-4 h-4" /> Véhicule</h3>
              <p className="text-lg font-bold text-white">{settings.vehicleModel || '—'}</p>
              <p className="text-sm" style={{ color: '#94A3B8' }}>Immat: {settings.vehiclePlate || '—'}</p>
              <p className="text-sm" style={{ color: '#94A3B8' }}>SIRET: {settings.siret || '—'}</p>
            </div>
          </div>

          {(['driver', 'vehicle', 'admin'] as const).map(cat => (
            <div key={cat} className="mb-6">
              <h3 className="flex items-center gap-2 text-lg font-bold text-white mb-3">{catIcon(cat)} {catLabel(cat)}</h3>
              <div className="grid gap-3">
                {legalDocs.filter(d => d.category === cat).map(doc => {
                  const status = getDocExpiryStatus(doc);
                  const days = getDocExpiryDays(doc);
                  return (
                    <div key={doc.id} className="glass rounded-xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
                          background: !doc.fileData ? 'rgba(239,68,68,0.15)' : status === 'expired' ? 'rgba(239,68,68,0.15)' : status === 'soon' ? 'rgba(245,158,11,0.15)' : 'rgba(34,197,94,0.15)'
                        }}>
                          {!doc.fileData ? <XCircle className="w-5 h-5" style={{ color: '#ef4444' }} /> :
                           status === 'expired' ? <FileWarning className="w-5 h-5" style={{ color: '#ef4444' }} /> :
                           status === 'soon' ? <AlertTriangle className="w-5 h-5" style={{ color: '#f59e0b' }} /> :
                           <CheckCircle2 className="w-5 h-5" style={{ color: '#22c55e' }} />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">
                            {doc.name} {doc.isRequired && <span className="text-red-400 text-xs">*</span>}
                          </p>
                          <p className="text-xs" style={{ color: !doc.fileData ? '#ef4444' : '#94A3B8' }}>
                            {!doc.fileData ? '✗ Document manquant' : `✓ ${doc.fileName}`}
                            {days !== null && ` — ${days < 0 ? `Expiré depuis ${Math.abs(days)}j` : `Expire dans ${days}j`}`}
                          </p>
                        </div>
                      </div>
                      {doc.fileData && (
                        <button onClick={() => viewFile(doc.fileData!)}
                          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white ml-2">
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white">Conformité Contrôle Routier</h3>
            <p className="text-sm" style={{ color: '#94A3B8' }}>{compliance.valid}/{compliance.total} documents obligatoires valides</p>
          </div>
          <button onClick={() => navigate('/controle')}
            className="px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium transition-all text-white"
            style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
            <ShieldCheck className="w-4 h-4" /> Mode Contrôle
          </button>
        </div>
        <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${compliance.percent}%` }} transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ background: compliance.percent === 100 ? 'linear-gradient(90deg, #22c55e, #16a34a)' : compliance.percent >= 70 ? 'linear-gradient(90deg, #f59e0b, #d97706)' : 'linear-gradient(90deg, #ef4444, #dc2626)' }} />
        </div>
      </div>

      {(['driver', 'vehicle', 'admin'] as const).map(cat => (
        <div key={cat} className="glass rounded-2xl p-6">
          <h3 className="flex items-center gap-2 text-lg font-bold mb-4 text-white">{catIcon(cat)} {catLabel(cat)}</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {legalDocs.filter(d => d.category === cat).map(doc => {
              const status = getDocExpiryStatus(doc);
              const days = getDocExpiryDays(doc);
              return (
                <div key={doc.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-white">
                      {doc.name} {doc.isRequired && <span className="text-red-400 text-xs ml-1">obligatoire</span>}
                    </p>
                    {doc.fileName ? (
                      <p className="text-xs mt-1" style={{ color: '#22c55e' }}>✓ {doc.fileName} ({doc.uploadDate})</p>
                    ) : (
                      <p className="text-xs mt-1" style={{ color: '#ef4444' }}>✗ Non téléchargé</p>
                    )}
                    {days !== null && (
                      <p className="text-xs mt-1" style={{ color: status === 'expired' ? '#ef4444' : status === 'soon' ? '#f59e0b' : '#94A3B8' }}>
                        {status === 'expired' ? `⚠ Expiré depuis ${Math.abs(days)} jour(s)` :
                         status === 'soon' ? `⏳ Expire dans ${days} jour(s)` :
                         `Valide (${days}j restants)`}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <input type="date" value={doc.expiryDate || ''}
                      onChange={e => updateDocExpiry(doc.id, e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-lg p-1.5 text-xs w-32 outline-none text-white" title="Date expiration" />
                    <button onClick={() => triggerUpload(doc.id)}
                      className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20" style={{ color: '#3b82f6' }}><Upload className="w-4 h-4" /></button>
                    {doc.fileData && (
                      <button onClick={() => viewFile(doc.fileData!)}
                        className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20" style={{ color: '#22c55e' }}><Eye className="w-4 h-4" /></button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </motion.div>
  );
}
