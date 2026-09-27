import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, User, Car, XCircle, FileWarning, AlertTriangle,
  CheckCircle2, Eye, Upload, Trash2, X, Download, Shield, FileText,
  FileCheck, AlertOctagon, Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getDocExpiryStatus, getDocExpiryDays } from '../lib/utils';

export default function Vault({ controlMode = false }: { controlMode?: boolean }) {
  const {
    legalDocs, updateDocExpiry, triggerUpload, settings,
    fileInputRef, handleFileChange, removeDocumentFile, trips, generateBon
  } = useApp();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'road_control' | 'platform_compliance'>('road_control');
  const [previewDoc, setPreviewDoc] = useState<{ name: string; data: string } | null>(null);

  // Trouver la course en cours ou la plus proche pour le bon de commande préalable
  const activeTrip = useMemo(() => {
    return trips.find(t => t.status === 'in_progress') ||
      trips.filter(t => t.status === 'scheduled').sort((a, b) => new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime())[0] ||
      null;
  }, [trips]);

  // Filtrage strict : Pièces exigibles en contrôle routier VS Dossier entreprise/plateforme
  const roadControlDocs = useMemo(() => {
    return legalDocs.filter(d => d.scope === 'road_control' || !d.scope);
  }, [legalDocs]);

  const platformDocs = useMemo(() => {
    return legalDocs.filter(d => d.scope === 'platform_compliance');
  }, [legalDocs]);

  const displayedDocs = activeTab === 'road_control' ? roadControlDocs : platformDocs;

  // Calcul conformité spécifique au contrôle routier strict
  const roadControlCompliance = useMemo(() => {
    const required = roadControlDocs.filter(d => d.isRequired);
    const valid = required.filter(d => {
      const status = getDocExpiryStatus(d);
      return d.fileData && (status === 'ok' || status === 'unknown');
    });
    return {
      valid: valid.length,
      total: required.length,
      percent: required.length > 0 ? Math.round((valid.length / required.length) * 100) : 100
    };
  }, [roadControlDocs]);

  const viewFile = (name: string, data: string) => {
    setPreviewDoc({ name, data });
  };

  /* ═══════════════════════════════════════════════════════════════════
     MODE CONTRÔLE ROUTIER (Forces de l'ordre : Police, Gendarmerie, Boers)
     ═══════════════════════════════════════════════════════════════════ */
  if (controlMode) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 overflow-y-auto bg-[#0a0f1d] text-white"
      >
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,.pdf" />

        <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-20">
          {/* Header Contrôle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10 mb-6">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-600 to-red-500 flex items-center justify-center shadow-lg shadow-red-500/25 shrink-0">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-white">Contrôle Routier VTC</h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-bold uppercase tracking-wider">
                    Police • Boers
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                  Présentation des justificatifs obligatoires à bord (Code des transports & Code de la route)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-center">
              <div className="text-right">
                <div className="text-2xl font-black text-emerald-400">
                  {roadControlCompliance.valid} / {roadControlCompliance.total}
                </div>
                <div className="text-[11px] text-slate-400">Pièces à bord valides</div>
              </div>
              <button
                onClick={() => navigate('/coffre-fort')}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" /> Quitter le mode
              </button>
            </div>
          </div>

          {/* ════════ PRIORITÉ ABSOLUE N°1 : BON DE COMMANDE EN COURS ════════ */}
          <div className="mb-6 rounded-2xl bg-gradient-to-br from-blue-900/40 via-blue-950/30 to-black border border-blue-500/40 p-5 shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-ping" />
                <h2 className="text-sm font-black uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                  <FileText className="w-4 h-4" /> 1. Réservation Préalable Horodatée (Art. L. 3122-9)
                </h2>
              </div>
              {activeTrip && (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
                  {activeTrip.status === 'in_progress' ? '🚗 Course en cours' : '📅 Prochaine prise en charge'}
                </span>
              )}
            </div>

            {activeTrip ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-black/40 p-4 rounded-xl border border-white/5 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Client & Réservation :</span>
                    <span className="font-bold text-white text-sm">{activeTrip.clientName}</span>
                    <div className="text-slate-300 text-[11px] mt-0.5">Tél : {activeTrip.clientPhone || 'Non renseigné'}</div>
                    <div className="text-slate-400 text-[11px]">Horodatage commande : {activeTrip.bookingDateTime || `${activeTrip.date} ${activeTrip.time}`}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Véhicule & Exploitant :</span>
                    <span className="font-semibold text-white">{settings.companyName} (EVTC: {settings.registreVTC || 'EVTC060240098'})</span>
                    <div className="text-slate-300 text-[11px] mt-0.5">Immatriculation : <span className="font-mono font-bold text-white">{settings.vehiclePlate}</span></div>
                    <div className="text-slate-300 text-[11px]">Chauffeur : {settings.driverName} (Carte : {settings.driverCardNumber})</div>
                  </div>
                  <div className="sm:col-span-2 pt-2 border-t border-white/10">
                    <div className="flex items-center justify-between text-slate-300">
                      <div>
                        <span className="text-blue-400 font-bold">Départ :</span> {activeTrip.pickUpLocation}
                      </div>
                      <div className="font-bold text-white font-mono">{activeTrip.price} € TTC</div>
                    </div>
                    <div className="text-slate-400 mt-1">
                      <span className="text-emerald-400 font-bold">Arrivée :</span> {activeTrip.dropOffLocation || 'Mise à disposition'}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => generateBon(activeTrip)}
                    className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
                  >
                    <FileCheck className="w-4 h-4" /> Présenter / Télécharger le Bon de Commande VTC Officiel (PDF)
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2.5">
                <AlertOctagon className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <strong>Aucune course active enregistrée :</strong> En l'absence de client à bord ou en route vers une prise en charge, le véhicule doit être en retour au lieu de stationnement ou garage (interdiction formelle de maraude sur voie publique selon l'Art. L. 3120-2).
                </div>
              </div>
            )}
          </div>

          {/* ════════ IDENTIFIATION VÉHICULE & CHAUFFEUR ════════ */}
          <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
            <div className="rounded-2xl p-4 bg-white/[0.04] border border-white/10">
              <h3 className="text-xs uppercase font-bold mb-2 flex items-center gap-2 tracking-wider text-slate-400">
                <User className="w-4 h-4 text-blue-400" /> Chauffeur VTC Titulaire
              </h3>
              <p className="text-base font-bold text-white">{settings.driverName || '—'}</p>
              <div className="text-xs text-slate-300 mt-1">
                Carte Professionnelle : <span className="text-white font-mono font-bold">{settings.driverCardNumber || '—'}</span>
              </div>
              <div className="text-xs text-slate-400">Tél : {settings.driverPhone || '—'}</div>
            </div>

            <div className="rounded-2xl p-4 bg-white/[0.04] border border-white/10">
              <h3 className="text-xs uppercase font-bold mb-2 flex items-center gap-2 tracking-wider text-slate-400">
                <Car className="w-4 h-4 text-emerald-400" /> Véhicule & Macarons Réglementaires
              </h3>
              <p className="text-base font-bold text-white">{settings.vehicleModel || '—'}</p>
              <div className="text-xs text-slate-300 mt-1">
                Plaque : <span className="text-white font-mono font-bold bg-white/10 px-1.5 py-0.5 rounded">{settings.vehiclePlate || '—'}</span>
              </div>
              <div className="text-xs text-slate-400">
                Registre REVTC : <span className="text-white font-mono">{settings.registreVTC || '—'}</span>
              </div>
            </div>
          </div>

          {/* ════════ PIÈCES STRICTEMENT EXIGIBLES EN CONTRÔLE ROUTIER ════════ */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1">
              <h3 className="text-sm font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> 2. Pièces Justificatives Obligatoires à Bord
              </h3>
              <span className="text-[11px] text-slate-400">Forces de l'ordre (Police / Boers)</span>
            </div>

            <div className="grid gap-2.5">
              {roadControlDocs.map(doc => {
                const status = getDocExpiryStatus(doc);
                const days = getDocExpiryDays(doc);
                return (
                  <div
                    key={doc.id}
                    className="rounded-2xl p-3.5 bg-white/[0.03] border border-white/10 flex items-center justify-between gap-3 hover:border-white/20 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{
                          background: !doc.fileData
                            ? 'rgba(239,68,68,0.15)'
                            : status === 'expired'
                            ? 'rgba(239,68,68,0.15)'
                            : status === 'soon'
                            ? 'rgba(245,158,11,0.15)'
                            : 'rgba(34,197,94,0.15)',
                        }}
                      >
                        {!doc.fileData ? (
                          <XCircle className="w-5 h-5 text-red-500" />
                        ) : status === 'expired' ? (
                          <FileWarning className="w-5 h-5 text-red-500" />
                        ) : status === 'soon' ? (
                          <AlertTriangle className="w-5 h-5 text-amber-500" />
                        ) : (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-white">{doc.name}</span>
                          {doc.isRequired && (
                            <span className="text-[10px] uppercase font-bold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">
                              Obligatoire
                            </span>
                          )}
                        </div>
                        {doc.legalBasis && (
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">{doc.legalBasis}</div>
                        )}
                        <div
                          className="text-[11px] mt-0.5 font-medium truncate"
                          style={{
                            color: !doc.fileData
                              ? '#ef4444'
                              : status === 'expired'
                              ? '#ef4444'
                              : status === 'soon'
                              ? '#f59e0b'
                              : '#94a3b8',
                          }}
                        >
                          {!doc.fileData
                            ? '✗ Scan manquant dans le coffre-fort'
                            : `✓ Fichier disponible : ${doc.fileName || 'document.pdf'}`}
                          {days !== null &&
                            ` (${days < 0 ? `Expiré depuis ${Math.abs(days)}j` : `Valide - expire dans ${days}j`})`}
                        </div>
                      </div>
                    </div>

                    {doc.fileData && (
                      <button
                        type="button"
                        onClick={() => viewFile(doc.name, doc.fileData!)}
                        className="px-3.5 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" /> Voir
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Visualisation Document */}
        <AnimatePresence>
          {previewDoc && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
            >
              <div className="bg-[#1c1c1e] border border-white/20 max-w-4xl w-full p-5 sm:p-6 rounded-3xl max-h-[90vh] flex flex-col shadow-2xl">
                <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-emerald-400" /> {previewDoc.name}
                  </h3>
                  <button
                    onClick={() => setPreviewDoc(null)}
                    className="p-2 hover:bg-white/10 rounded-full text-white cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex-1 overflow-auto rounded-xl bg-black/50 p-2 flex items-center justify-center min-h-[300px]">
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

  /* ═══════════════════════════════════════════════════════════════════
     COFFRE-FORT GÉNÉRAL & CONFORMITÉ ENTREPRISE
     ═══════════════════════════════════════════════════════════════════ */
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,.pdf" />

      {/* Progress & Compliance Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white/[0.03] border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-emerald-400" /> Coffre-Fort Documentaire VTC
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Distinction stricte entre le Contrôle Routier immédiat et la Conformité Entreprise / Plateformes.
            </p>
          </div>

          <button
            onClick={() => navigate('/controle')}
            className="px-5 py-3 rounded-2xl flex items-center gap-2 text-xs font-bold text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 shadow-lg shadow-red-500/25 active:scale-95 transition-all cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" /> Activer Mode Contrôle Police (Boers)
          </button>
        </div>

        {/* 2 ONGLETS DISTINCTS : CONTRÔLE ROUTIER VS ENTREPRISE / PLATEFORMES */}
        <div className="flex gap-2 p-1 bg-black/40 rounded-2xl border border-white/10">
          <button
            type="button"
            onClick={() => setActiveTab('road_control')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all text-center ${
              activeTab === 'road_control'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🚨 1. Contrôle Routier à Bord ({roadControlDocs.length} pièces)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('platform_compliance')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all text-center ${
              activeTab === 'platform_compliance'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🏢 2. Dossier Entreprise & Plateformes ({platformDocs.length} pièces)
          </button>
        </div>

        {/* Note d'explication juridique */}
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-slate-300 flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          {activeTab === 'road_control' ? (
            <span>
              <strong>Cadre légal Contrôle Routier :</strong> Ce volet regroupe uniquement les documents et macarons exigibles par les officiers de police et agents Boers lors d'un contrôle de circulation (Code des transports et Code de la route).
            </span>
          ) : (
            <span>
              <strong>Cadre réglementaire Entreprise & Plateformes :</strong> Ce volet regroupe les pièces nécessaires pour votre gestion administrative, votre expert-comptable, les audits des plateformes (Uber/Bolt) pour la lutte contre le travail dissimulé, et le renouvellement quinquennal préfecture. <em>Ces pièces ne sont pas exigées au bord de la route.</em>
            </span>
          )}
        </div>
      </div>

      {/* LISTE DES DOCUMENTS DE L'ONGLET ACTIF */}
      <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
        {displayedDocs.map(doc => {
          const status = getDocExpiryStatus(doc);
          const days = getDocExpiryDays(doc);
          return (
            <div
              key={doc.id}
              className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 flex flex-col justify-between gap-3 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="font-bold text-sm text-white flex items-center gap-1.5 flex-wrap">
                      {doc.name}
                      {doc.isRequired && (
                        <span className="text-[10px] uppercase font-bold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">
                          Obligatoire à bord
                        </span>
                      )}
                    </p>
                    {doc.legalBasis && (
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">{doc.legalBasis}</p>
                    )}
                    {doc.description && (
                      <p className="text-xs text-slate-300 mt-1">{doc.description}</p>
                    )}
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                  {doc.fileName ? (
                    <span className="text-emerald-400 font-medium flex items-center gap-1 truncate">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> {doc.fileName}
                    </span>
                  ) : (
                    <span className="text-red-400 flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5 shrink-0" /> Non téléchargé
                    </span>
                  )}

                  {days !== null && (
                    <span
                      className="text-[11px] font-semibold"
                      style={{ color: status === 'expired' ? '#ef4444' : status === 'soon' ? '#f59e0b' : '#30d158' }}
                    >
                      {status === 'expired' ? `Expiré (${Math.abs(days)}j)` : `${days}j restants`}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions Téléversement / Expiration */}
              <div className="flex items-center gap-2 pt-2 border-t border-white/5 flex-wrap">
                <div className="flex items-center gap-1 flex-1 min-w-[130px]">
                  <span className="text-[10px] text-slate-400">Expire le :</span>
                  <input
                    type="date"
                    value={doc.expiryDate || ''}
                    onChange={e => updateDocExpiry(doc.id, e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-lg p-1.5 text-xs text-white outline-none focus:border-blue-500 flex-1"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => triggerUpload(doc.id)}
                  title="Téléverser le fichier"
                  className="p-2 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-400 transition-all cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                </button>

                {doc.fileData && (
                  <>
                    <button
                      type="button"
                      onClick={() => viewFile(doc.name, doc.fileData!)}
                      title="Visualiser le document"
                      className="p-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 transition-all cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeDocumentFile(doc.id)}
                      title="Supprimer le fichier"
                      className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Visualisation */}
      <AnimatePresence>
        {previewDoc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          >
            <div className="bg-[#1c1c1e] border border-white/20 max-w-4xl w-full p-5 sm:p-6 rounded-3xl max-h-[90vh] flex flex-col shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-400" /> {previewDoc.name}
                </h3>
                <div className="flex items-center gap-2">
                  <a
                    href={previewDoc.data}
                    download={previewDoc.name}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                    title="Télécharger"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => setPreviewDoc(null)}
                    className="p-2 hover:bg-white/10 rounded-full text-white cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-auto rounded-xl bg-black/50 p-2 flex items-center justify-center min-h-[300px]">
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
