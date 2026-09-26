import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  QrCode, Download, Share2, Phone, MessageCircle, Star,
  Globe, CreditCard, Sparkles, Check, Copy, Printer, Car, ShieldCheck
} from 'lucide-react';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import { useApp } from '../context/AppContext';

type QRType = 'vcard' | 'whatsapp' | 'call' | 'google_review' | 'payment' | 'custom';

interface ColorTheme {
  id: string;
  name: string;
  dark: string;
  light: string;
  accent: string;
  border: string;
}

const COLOR_THEMES: ColorTheme[] = [
  { id: 'gold', name: 'Or Luxe', dark: '#000000', light: '#fef08a', accent: '#eab308', border: 'border-yellow-500/40' },
  { id: 'blue', name: 'Bleu Royal', dark: '#0b192c', light: '#e0f2fe', accent: '#38bdf8', border: 'border-sky-500/40' },
  { id: 'emerald', name: 'Émeraude VIP', dark: '#052e16', light: '#dcfce7', accent: '#22c55e', border: 'border-emerald-500/40' },
  { id: 'purple', name: 'Violet Prestige', dark: '#1e1b4b', light: '#f3e8ff', accent: '#a855f7', border: 'border-purple-500/40' },
  { id: 'classic', name: 'Noir & Blanc', dark: '#000000', light: '#ffffff', accent: '#94a3b8', border: 'border-white/20' },
];

export default function QRCodeHub() {
  const { settings } = useApp();

  const [qrType, setQrType] = useState<QRType>('vcard');
  const [selectedTheme, setSelectedTheme] = useState<ColorTheme>(COLOR_THEMES[0]);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Champs personnalisables
  const [vcardData, setVcardData] = useState({
    name: settings.driverName || 'Chauffeur VTC',
    company: settings.companyName || 'Mon Entreprise VTC',
    phone: settings.driverPhone || settings.companyPhone || '+33600000000',
    email: settings.companyEmail || 'contact@vtc-pro.fr',
    title: 'Chauffeur Privé VTC',
  });

  const [whatsappMsg, setWhatsappMsg] = useState(
    `Bonjour ${settings.companyName || 'VTC'}, je souhaite réserver une course. Quels sont vos tarifs ?`
  );
  const [googleReviewUrl, setGoogleReviewUrl] = useState('https://g.page/r/');
  const [paymentUrl, setPaymentUrl] = useState('https://revolut.me/');
  const [customUrl, setCustomUrl] = useState('https://');

  const [headline, setHeadline] = useState('Scannez pour réserver votre prochain trajet');
  const [subHeadline, setSubHeadline] = useState('WiFi · Chargeurs smartphone · Boissons fraîches à bord');

  // Construction du contenu du QR code
  const getQRContent = (): string => {
    switch (qrType) {
      case 'vcard': {
        const cleanPhone = vcardData.phone.replace(/[^0-9+]/g, '');
        return [
          'BEGIN:VCARD',
          'VERSION:3.0',
          `FN:${vcardData.name}`,
          `ORG:${vcardData.company}`,
          `TITLE:${vcardData.title}`,
          `TEL;TYPE=CELL:${cleanPhone}`,
          `EMAIL:${vcardData.email}`,
          `NOTE:Réservation Chauffeur Privé VTC 24/7`,
          'END:VCARD'
        ].join('\n');
      }
      case 'whatsapp': {
        const cleanPhone = (settings.driverPhone || settings.companyPhone || '').replace(/[^0-9]/g, '');
        return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappMsg)}`;
      }
      case 'call': {
        const cleanPhone = (settings.driverPhone || settings.companyPhone || '').replace(/[^0-9+]/g, '');
        return `tel:${cleanPhone}`;
      }
      case 'google_review':
        return googleReviewUrl;
      case 'payment':
        return paymentUrl;
      case 'custom':
        return customUrl;
    }
  };

  // Génération du QR Code
  useEffect(() => {
    const rawContent = getQRContent();
    if (!rawContent) return;

    QRCode.toDataURL(rawContent, {
      width: 600,
      margin: 2,
      color: {
        dark: selectedTheme.dark,
        light: selectedTheme.light,
      },
      errorCorrectionLevel: 'H',
    })
      .then(url => {
        setQrDataUrl(url);
      })
      .catch(err => {
        console.error('Erreur génération QR Code', err);
      });
  }, [qrType, selectedTheme, vcardData, whatsappMsg, googleReviewUrl, paymentUrl, customUrl, settings]);

  // Télécharger l'image PNG haute résolution
  const downloadPNG = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `QRCode_VTC_${settings.companyName || 'Pro'}_${qrType}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Télécharger l'affiche de bord A5 en PDF Haute Résolution
  const downloadBoardPosterPDF = () => {
    if (!qrDataUrl) return;

    // Format A5 (148 x 210 mm) Portrait
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a5',
    });

    const w = 148;
    const h = 210;

    // Fond dégradé sombre luxe
    doc.setFillColor(15, 23, 42); // #0F172A
    doc.rect(0, 0, w, h, 'F');

    // Cadre doré / accent
    doc.setDrawColor(234, 179, 8); // Gold #EAB308
    doc.setLineWidth(0.8);
    doc.roundedRect(8, 8, w - 16, h - 16, 4, 4, 'S');
    doc.setLineWidth(0.3);
    doc.roundedRect(10, 10, w - 20, h - 20, 3, 3, 'S');

    // En-tête : Société VTC
    doc.setTextColor(234, 179, 8);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text((settings.companyName || 'VTC EXCELLENCE').toUpperCase(), w / 2, 24, { align: 'center' });

    doc.setTextColor(226, 232, 240);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('TRANSPORT PRIVÉ DE PERSONNES HAUT DE GAMME', w / 2, 30, { align: 'center' });

    // Titre accroche
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(headline, w / 2, 44, { align: 'center' });

    // Cadre blanc pour le QR Code
    const qrBoxSize = 70;
    const qrX = (w - qrBoxSize) / 2;
    const qrY = 50;

    doc.setFillColor(255, 255, 255);
    doc.roundedRect(qrX - 4, qrY - 4, qrBoxSize + 8, qrBoxSize + 8, 4, 4, 'F');
    doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrBoxSize, qrBoxSize);

    // Chauffeur & Coordonnées
    let textY = 135;
    doc.setTextColor(234, 179, 8);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(settings.driverName ? `Votre Chauffeur : ${settings.driverName}` : 'Votre Chauffeur Privé', w / 2, textY, { align: 'center' });

    textY += 7;
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text(`Tél / WhatsApp : ${settings.driverPhone || settings.companyPhone || '06 00 00 00 00'}`, w / 2, textY, { align: 'center' });

    if (settings.companyEmail) {
      textY += 6;
      doc.setTextColor(148, 163, 184);
      doc.setFontSize(8.5);
      doc.text(`Email : ${settings.companyEmail}`, w / 2, textY, { align: 'center' });
    }

    // Services à bord (Bandeau)
    const bandY = 160;
    doc.setFillColor(30, 41, 59);
    doc.roundedRect(14, bandY, w - 28, 22, 2, 2, 'F');

    doc.setTextColor(234, 179, 8);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('SERVICES & CONFORT À BORD', w / 2, bandY + 6, { align: 'center' });

    doc.setTextColor(203, 213, 225);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text('📶 WiFi gratuit   •   🔋 Chargeurs multimarques   •   🥤 Boissons fraîches', w / 2, bandY + 12, { align: 'center' });
    doc.text('💳 CB & Paiements sans contact acceptés   •   ⭐ Véhicule climatisé', w / 2, bandY + 17, { align: 'center' });

    // Pied de page légal
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(6.5);
    doc.text(
      `SIRET : ${settings.siret || 'Enregistré'} | Registre VTC : ${settings.registreVTC || 'Conforme'} | Loi L.3120-1`,
      w / 2,
      198,
      { align: 'center' }
    );

    doc.save(`Affiche_Bord_VTC_${(settings.companyName || 'Pro').replace(/\s+/g, '_')}.pdf`);
  };

  const copyContent = () => {
    navigator.clipboard.writeText(getQRContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* ══════════ HEADER ══════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center text-black font-bold shadow-lg shadow-amber-500/20">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">Générateur QR Code Pro & Chevalet de Bord</h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Fidélisez vos clients, facilitez les réservations directes et imprimez vos fiches pour appuie-tête.
              </p>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="flex items-center gap-2">
          <button
            onClick={downloadPNG}
            className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-2 transition-all border border-white/10"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>Image PNG</span>
          </button>
          <button
            onClick={downloadBoardPosterPDF}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimer Chevalet A5</span>
          </button>
        </div>
      </div>

      {/* ══════════ GRILLE PRINCIPALE ══════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ─── Colonne Gauche : Configuration (7 cols) ─── */}
        <div className="lg:col-span-7 space-y-5">
          {/* Choix du type de QR Code */}
          <div className="glass rounded-2xl p-5 border border-white/10 space-y-4">
            <label className="text-xs uppercase font-bold text-slate-400 tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              1. Type d'action au scan
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {[
                { id: 'vcard', label: 'Contact vCard', icon: Phone, desc: 'Ajoute votre contact au répertoire' },
                { id: 'whatsapp', label: 'WhatsApp Direct', icon: MessageCircle, desc: 'Ouvre un chat de réservation' },
                { id: 'call', label: 'Appel Téléphone', icon: Phone, desc: 'Compose votre numéro direct' },
                { id: 'google_review', label: 'Avis Google 5⭐', icon: Star, desc: 'Collecte des avis clients' },
                { id: 'payment', label: 'Paiement CB', icon: CreditCard, desc: 'Lien Stripe / Revolut / Wero' },
                { id: 'custom', label: 'Lien Libre', icon: Globe, desc: 'Site web ou lien personnalisé' },
              ].map(type => (
                <button
                  key={type.id}
                  onClick={() => setQrType(type.id as QRType)}
                  className={`p-3 rounded-xl text-left border transition-all flex flex-col justify-between ${
                    qrType === type.id
                      ? 'bg-amber-500/15 border-amber-500/50 text-white shadow-md'
                      : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <type.icon className={`w-4 h-4 ${qrType === type.id ? 'text-amber-400' : 'text-slate-400'}`} />
                    {qrType === type.id && <span className="w-2 h-2 rounded-full bg-amber-400" />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{type.label}</p>
                    <p className="text-[10px] text-slate-400 leading-tight mt-0.5">{type.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Formulaire spécifique au type */}
          <div className="glass rounded-2xl p-5 border border-white/10 space-y-4">
            <label className="text-xs uppercase font-bold text-slate-400 tracking-wider flex items-center gap-2">
              <Share2 className="w-4 h-4 text-blue-400" />
              2. Informations encodées
            </label>

            {qrType === 'vcard' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-slate-400 mb-1 block">Nom du Chauffeur</label>
                  <input
                    type="text"
                    value={vcardData.name}
                    onChange={e => setVcardData({ ...vcardData, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 mb-1 block">Société VTC</label>
                  <input
                    type="text"
                    value={vcardData.company}
                    onChange={e => setVcardData({ ...vcardData, company: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 mb-1 block">Numéro de Téléphone</label>
                  <input
                    type="tel"
                    value={vcardData.phone}
                    onChange={e => setVcardData({ ...vcardData, phone: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 mb-1 block">Email</label>
                  <input
                    type="email"
                    value={vcardData.email}
                    onChange={e => setVcardData({ ...vcardData, email: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            )}

            {qrType === 'whatsapp' && (
              <div className="space-y-2 text-xs">
                <label className="text-slate-400 block">Message pré-rempli envoyé par le client</label>
                <textarea
                  rows={3}
                  value={whatsappMsg}
                  onChange={e => setWhatsappMsg(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white outline-none focus:border-amber-500"
                />
              </div>
            )}

            {qrType === 'google_review' && (
              <div className="space-y-2 text-xs">
                <label className="text-slate-400 block">Lien direct de votre fiche d'avis Google Maps</label>
                <input
                  type="url"
                  placeholder="https://g.page/r/..."
                  value={googleReviewUrl}
                  onChange={e => setGoogleReviewUrl(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white outline-none focus:border-amber-500"
                />
              </div>
            )}

            {qrType === 'payment' && (
              <div className="space-y-2 text-xs">
                <label className="text-slate-400 block">Lien de paiement (Revolut, Stripe, Lydia, Wero)</label>
                <input
                  type="url"
                  placeholder="https://revolut.me/..."
                  value={paymentUrl}
                  onChange={e => setPaymentUrl(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white outline-none focus:border-amber-500"
                />
              </div>
            )}

            {qrType === 'custom' && (
              <div className="space-y-2 text-xs">
                <label className="text-slate-400 block">URL / Lien personnalisé</label>
                <input
                  type="url"
                  placeholder="https://mon-site-vtc.fr"
                  value={customUrl}
                  onChange={e => setCustomUrl(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white outline-none focus:border-amber-500"
                />
              </div>
            )}

            {qrType === 'call' && (
              <div className="space-y-2 text-xs text-slate-300">
                <p>Le scan déclenchera immédiatement l'appel vers votre numéro : <span className="font-bold text-amber-400">{settings.driverPhone || settings.companyPhone || 'Non renseigné'}</span></p>
              </div>
            )}
          </div>

          {/* Personnalisation Affiche / Chevalet */}
          <div className="glass rounded-2xl p-5 border border-white/10 space-y-4">
            <label className="text-xs uppercase font-bold text-slate-400 tracking-wider flex items-center gap-2">
              <Car className="w-4 h-4 text-emerald-400" />
              3. Textes de l'affiche de bord (Appuie-tête)
            </label>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 mb-1 block">Titre principal</label>
                <input
                  type="text"
                  value={headline}
                  onChange={e => setHeadline(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="text-slate-400 mb-1 block">Services & Équipements à bord</label>
                <input
                  type="text"
                  value={subHeadline}
                  onChange={e => setSubHeadline(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ─── Colonne Droite : Aperçu Visuel & Export (5 cols) ─── */}
        <div className="lg:col-span-5 space-y-5">
          {/* Palette de thèmes */}
          <div className="glass rounded-2xl p-4 border border-white/10">
            <p className="text-xs text-slate-400 mb-3 font-semibold">Style du QR Code :</p>
            <div className="flex items-center gap-2 flex-wrap">
              {COLOR_THEMES.map(theme => (
                <button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border ${
                    selectedTheme.id === theme.id
                      ? `${theme.border} bg-white/15 text-white`
                      : 'border-white/5 bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: theme.accent }} />
                  {theme.name}
                </button>
              ))}
            </div>
          </div>

          {/* Aperçu Chevalet de Bord / Carte */}
          <div className="glass rounded-3xl p-6 border border-white/10 relative overflow-hidden text-center shadow-2xl">
            {/* Badge haut */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider mb-4 border border-amber-500/30">
              <ShieldCheck className="w-3 h-3" />
              {settings.companyName || 'VTC EXCELLENCE'}
            </div>

            <h3 className="text-base font-bold text-white mb-1 px-4 leading-snug">{headline}</h3>
            <p className="text-[11px] text-slate-400 mb-5">{subHeadline}</p>

            {/* QR Code Container */}
            <div className="inline-block p-4 rounded-2xl bg-white shadow-xl mb-4">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="QR Code VTC" className="w-48 h-48 sm:w-56 sm:h-56 mx-auto rounded-lg" />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-slate-400 text-xs">
                  Génération...
                </div>
              )}
            </div>

            {/* Chauffeur info badge */}
            <div className="bg-white/5 rounded-xl p-3 border border-white/5 text-left mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">{settings.driverName || 'Votre Chauffeur Privé'}</p>
                <p className="text-[10px] text-amber-400">{settings.driverPhone || settings.companyPhone || '+33 6 00 00 00 00'}</p>
              </div>
              <button
                onClick={copyContent}
                title="Copier le lien"
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 transition-all"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Boutons d'export */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={downloadPNG}
                className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4 text-amber-400" />
                PNG HD
              </button>
              <button
                onClick={downloadBoardPosterPDF}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20"
              >
                <Printer className="w-4 h-4" />
                Chevalet PDF A5
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
