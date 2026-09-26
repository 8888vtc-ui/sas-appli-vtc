import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, User, Car, Building2, XCircle, FileWarning, AlertTriangle,
  CheckCircle2, Eye, Upload, Trash2, X, Download, Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getDocExpiryStatus, getDocExpiryDays } from '../lib/utils';

export default function Vault({ controlMode = false }: { controlMode?: boolean }) {
  const {
    legalDocs, compliance, updateDocExpiry, triggerUpload, settings,
    fileInputRef, handleFileChange, removeDocumentFile
  } = useApp();
  const navigate = useNavigate();
  const [previewDoc, setPreviewDoc] = useState<{ name: string; data: string } | null>(null);

  const catIcon = (c: string) => c === 'driver' ? <User className="w-5 h-5" /> : c === 'vehicle' ? <Car className="w-5 h-5" /> : <Building2 className="w-5 h-5" />;
  const catLabel = (c: string) => c === 'driver' ? 'Conducteur' : c === 'vehicle' ? 'Véhicule' : 'Administratif';

  const viewFile = (name: string, data: string) => {
    setPreviewDoc({ name, data });
  };

  if (controlMode) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 overflow-y-auto"
        style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1e293b 100%)' }}>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,.pdf" />
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-900/30" style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
                <ShieldCheck className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Mode Contrôle Routier</h1>
                <p className="text-sm text-slate-400">{settings.companyName} — {settings.driverName}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-3xl font-bold" style={{ color: compliance.percent === 100 ? '#22c55e' : compliance.percent >= 70 ? '#f59e0b' : '#ef4444' }}>
                  {compliance.percent}%
                </div>
                <div className="text-xs text-slate-400">Conformité légale</div>
              </div>
              <button onClick={() => navigate('/coffre-fort')} className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs flex items-center gap-1.5 transition-all">
                <X className="w-4 h-4" /> Quitter
              </button>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
            <div className="glass rounded-2xl p-5 border border-white/10">
              <h3 className="text-xs uppercase font-bold mb-3 flex items-center gap-2 tracking-wider text-slate-400"><User className="w-4 h-4 text-blue-400" /> Chauffeur VTC</h3>
              <p className="text-lg font-bold text-white">{settings.driverName || '—'}</p>
              <p className="text-sm text-slate-400 mt-1">Carte Pro: <span className="text-white font-mono">{settings.driverCardNumber || '—'}</span></p>
              <p className="text-sm text-slate-400">Tél: <span className="text-white">{settings.driverPhone || '—'}</span></p>
            </div>
            <div className="glass rounded-2xl p-5 border border-white/10">
              <h3 className="text-xs uppercase font-bold mb-3 flex items-center gap-2 tracking-wider text-slate-400"><Car className="w-4 h-4 text-emerald-400" /> Véhicule & Exploitation</h3>
              <p className="text-lg font-bold text-white">{settings.vehicleModel || '—'}</p>
              <p className="text-sm text-slate-400 mt-1">Immat: <span className="text-white font-mono font-bold">{settings.vehiclePlate || '—'}</span></p>
              <p className="text-sm text-slate-400">Registre VTC: <span className="text-white font-mono">{settings.registreVTC || '—'}</span></p>
            </div>
          </div>

          {(['driver', 'vehicle', 'admin'] as const).map(cat => (
            <div key={cat} className="mb-6">
              <h3 className="flex items-center gap-2 text-base font-bold text-white mb-3">{catIcon(cat)} {catLabel(cat)}</h3>
              <div className="grid gap-3">
                {legalDocs.filter(d => d.category === cat).map(doc => {
                  const status = getDocExpiryStatus(doc);
                  const days = getDocExpiryDays(doc);
                  return (
                    <div key={doc.id} className="glass rounded-xl p-4 flex items-center justify-between border border-white/10">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{
                          background: !doc.fileData ? 'rgba(239,68,68,0.15)' : status === 'expired' ? 'rgba(239,68,68,0.15)' : status === 'soon' ? 'rgba(245,158,11,0.15)' : 'rgba(34,197,94,0.15)'
                        }}>
                          {!doc.fileData ? <XCircle className="w-5 h-5 text-red-500" /> :
                           status === 'expired' ? <FileWarning className="w-5 h-5 text-red-500" /> :
                           status === 'soon' ? <AlertTriangle className="w-5 h-5 text-amber-500" /> :
                           <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">
                            {doc.name} {doc.isRequired && <span className="text-red-400 text-xs font-normal">*obligatoire</span>}
                          </p>
                          <p className="text-xs mt-0.5 truncate" style={{ color: !doc.fileData ? '#ef4444' : '#94A3B8' }}>
                            {!doc.fileData ? '✗ Document manquant' : `✓ ${doc.fileName || 'Fichier validé'}`}
                            {days !== null && ` — ${days < 0 ? `Expiré depuis ${Math.abs(days)}j` : `Expire dans ${days}j`}`}
                          </p>
                        </div>
                      </div>
                      {doc.fileData && (
                        <button onClick={() => viewFile(doc.name, doc.fileData!)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/30 text-xs font-bold flex items-center gap-1.5 ml-2 transition-all">
                          <Eye className="w-3.5 h-3.5" /> Visualiser
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Modal de prévisualisation */}
        <AnimatePresence>
          {previewDoc && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <div className="glass max-w-4xl w-full p-6 rounded-3xl max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-emerald-400" /> {previewDoc.name}
                  </h3>
                  <button onClick={() => setPreviewDoc(null)} className="p-2 hover:bg-white/10 rounded-full text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex-1 overflow-auto rounded-xl bg-black/40 p-2 flex items-center justify-center min-h-[300px]">
                  {previewDoc.data.startsWith('data:application/pdf') ? (
                    <iframe src={previewDoc.data} className="w-full h-[65vh] rounded-lg border-0" title={previewDoc.name} />
                  ) : (
                    <img src={previewDoc.data} alt={previewDoc.name} className="max-h-[65vh] max-w-full object-contain rounded-lg" />
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Hidden File Input for uploading documents */}
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,.pdf" />

      {/* Progress & Compliance Banner */}
      <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" /> Coffre-Fort & Conformité Contrôle Routier
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Conforme décret du 6 août 2025 (Art. R.3122-1 Code des transports). {compliance.valid}/{compliance.total} documents obligatoires valides.
            </p>
          </div>
          <button onClick={() => navigate('/controle')}
            className="px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold transition-all text-white shadow-lg shadow-emerald-900/20 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
            <ShieldCheck className="w-4 h-4" /> Activer Mode Contrôle
          </button>
        </div>
        <div className="w-full bg-white/10 rounded-full h-3.5 overflow-hidden p-0.5">
          <motion.div initial={{ width: 0 }} animate={{ width: `${compliance.percent}%` }} transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ background: compliance.percent === 100 ? 'linear-gradient(90deg, #22c55e, #16a34a)' : compliance.percent >= 70 ? 'linear-gradient(90deg, #f59e0b, #d97706)' : 'linear-gradient(90deg, #ef4444, #dc2626)' }} />
        </div>
      </div>

      {(['driver', 'vehicle', 'admin'] as const).map(cat => (
        <div key={cat} className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10">
          <h3 className="flex items-center gap-2 text-lg font-bold mb-4 text-white">{catIcon(cat)} {catLabel(cat)}</h3>
          <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
            {legalDocs.filter(d => d.category === cat).map(doc => {
              const status = getDocExpiryStatus(doc);
              const days = getDocExpiryDays(doc);
              return (
                <div key={doc.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 gap-3 hover:border-white/20 transition-all">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-white flex items-center gap-1.5">
                      {doc.name} {doc.isRequired && <span className="text-red-400 text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-red-500/10 rounded">obligatoire</span>}
                    </p>
                    {doc.fileName ? (
                      <p className="text-xs mt-1 text-emerald-400 flex items-center gap-1 truncate">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> {doc.fileName} {doc.uploadDate && `(${doc.uploadDate})`}
                      </p>
                    ) : (
                      <p className="text-xs mt-1 text-red-400 flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5 shrink-0" /> Non téléchargé
                      </p>
                    )}
                    {days !== null && (
                      <p className="text-[11px] mt-1 font-medium" style={{ color: status === 'expired' ? '#ef4444' : status === 'soon' ? '#f59e0b' : '#94A3B8' }}>
                        {status === 'expired' ? `⚠️ Expiré depuis ${Math.abs(days)} jour(s)` :
                         status === 'soon' ? `⏳ Expire dans ${days} jour(s)` :
                         `✓ Valide (${days}j restants)`}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <input type="date" value={doc.expiryDate || ''}
                      onChange={e => updateDocExpiry(doc.id, e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-lg p-1.5 text-xs w-32 outline-none text-white focus:border-blue-500" title="Date d'expiration" />
                    <button onClick={() => triggerUpload(doc.id)}
                      title="Télécharger / Mettre à jour le fichier"
                      className="p-2 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-400 transition-all">
                      <Upload className="w-4 h-4" />
                    </button>
                    {doc.fileData && (
                      <>
                        <button onClick={() => viewFile(doc.name, doc.fileData!)}
                          title="Visualiser le document"
                          className="p-2 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 transition-all">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => removeDocumentFile(doc.id)}
                          title="Supprimer le fichier"
                          className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Modal Visualisation */}
      <AnimatePresence>
        {previewDoc && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="glass max-w-4xl w-full p-6 rounded-3xl max-h-[90vh] flex flex-col border border-white/20">
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-400" /> {previewDoc.name}
                </h3>
                <div className="flex items-center gap-2">
                  <a href={previewDoc.data} download={previewDoc.name}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white" title="Télécharger">
                    <Download className="w-4 h-4" />
                  </a>
                  <button onClick={() => setPreviewDoc(null)} className="p-2 hover:bg-white/10 rounded-full text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-auto rounded-xl bg-black/40 p-2 flex items-center justify-center min-h-[300px]">
                {previewDoc.data.startsWith('data:application/pdf') ? (
                  <iframe src={previewDoc.data} className="w-full h-[65vh] rounded-lg border-0" title={previewDoc.name} />
                ) : (
                  <img src={previewDoc.data} alt={previewDoc.name} className="max-h-[65vh] max-w-full object-contain rounded-lg" />
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
