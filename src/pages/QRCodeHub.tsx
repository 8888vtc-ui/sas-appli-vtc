import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  QrCode, Download, Share2, Printer, Check, Copy, Car, Sparkles
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
  const [selectedTheme] = useState<ColorTheme>(COLOR_THEMES[0]);
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
        const cleanPhone = (vcardData.phone).replace(/[^0-9]/g, '');
        return `https://wa.me/${cleanPhone}`;
      }
      case 'call': {
        const cleanPhone = (vcardData.phone).replace(/[^0-9+]/g, '');
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
  }, [qrType, selectedTheme, vcardData, googleReviewUrl, paymentUrl, customUrl, settings]);

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
    doc.text(subHeadline.split('\n')[0] || '📶 WiFi gratuit   •   🔋 Chargeurs multimarques', w / 2, bandY + 12, { align: 'center' });
    
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
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pb-40 space-y-6 max-w-lg mx-auto">
      
      {/* HEADER BANNER */}
      <div className="flex items-center justify-between bg-gray-900 rounded-xl p-4 border border-gray-800 shadow-md">
        <span className="font-bold text-white text-lg tracking-tight">Sasu David chemla</span>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 text-green-400 rounded-full text-xs font-black tracking-wider">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          EN SERVICE
        </div>
      </div>

      {/* TITRE ET BOUTONS */}
      <div className="text-center space-y-4 pt-2">
        <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-600 items-center justify-center text-black font-bold shadow-lg shadow-amber-500/20 mb-2">
          <QrCode className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">Générateur QR Code Pro <br/><span className="text-amber-500">& Chevalet de Bord</span></h1>
        <p className="text-sm text-gray-400">
          Générez votre QR code personnalisé pour faciliter les réservations et paiements de vos clients.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
          <button onClick={downloadPNG} className="flex-1 py-4 rounded-xl bg-gray-800 border border-gray-700 hover:border-amber-500/50 text-amber-500 font-bold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md">
            <Download className="w-5 h-5" /> Image PNG
          </button>
          <button onClick={downloadBoardPosterPDF} className="flex-1 py-4 rounded-xl bg-gray-800 border border-gray-700 hover:border-amber-500/50 text-amber-500 font-bold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md">
            <Printer className="w-5 h-5" /> Imprimer Chevalet A5
          </button>
        </div>
      </div>

      {/* SECTION 1: TYPE D'ACTION */}
      <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700 space-y-4 mt-8 shadow-lg">
        <label className="text-xs uppercase font-bold text-gray-400 tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          1. Type d'action au scan
        </label>
        
        <div className="relative">
          <select
            value={qrType}
            onChange={(e) => setQrType(e.target.value as QRType)}
            className="w-full h-14 bg-gray-900 border border-gray-700 rounded-xl px-4 text-white font-medium appearance-none outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
          >
            <option value="vcard">Contact vCard</option>
            <option value="whatsapp">WhatsApp Direct</option>
            <option value="call">Appel Téléphone</option>
            <option value="google_review">Avis Google 5★</option>
            <option value="payment">Paiement CB</option>
            <option value="custom">Lien Libre</option>
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
            ▼
          </div>
        </div>
      </div>

      {/* SECTION 2: INFORMATIONS ENCODEES */}
      <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700 space-y-4 shadow-lg">
        <label className="text-xs uppercase font-bold text-gray-400 tracking-wider flex items-center gap-2">
          <Share2 className="w-4 h-4 text-blue-400" />
          2. Informations encodées
        </label>

        <div className="space-y-4">
          {qrType === 'vcard' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div>
                <label className="text-gray-400 text-xs font-medium ml-1 block mb-1">Nom du Chauffeur</label>
                <input type="text" value={vcardData.name} onChange={e => setVcardData({...vcardData, name: e.target.value})} className="w-full h-14 bg-gray-900 border border-gray-700 rounded-xl px-4 text-white outline-none focus:ring-2 focus:ring-amber-500" />
              </div>
              <div>
                <label className="text-gray-400 text-xs font-medium ml-1 block mb-1">Société VTC</label>
                <input type="text" value={vcardData.company} onChange={e => setVcardData({...vcardData, company: e.target.value})} className="w-full h-14 bg-gray-900 border border-gray-700 rounded-xl px-4 text-white outline-none focus:ring-2 focus:ring-amber-500" />
              </div>
              <div>
                <label className="text-gray-400 text-xs font-medium ml-1 block mb-1">Numéro de Téléphone</label>
                <input type="tel" value={vcardData.phone} onChange={e => setVcardData({...vcardData, phone: e.target.value})} className="w-full h-14 bg-gray-900 border border-gray-700 rounded-xl px-4 text-white outline-none focus:ring-2 focus:ring-amber-500" />
              </div>
              <div>
                <label className="text-gray-400 text-xs font-medium ml-1 block mb-1">Email</label>
                <input type="email" value={vcardData.email} onChange={e => setVcardData({...vcardData, email: e.target.value})} className="w-full h-14 bg-gray-900 border border-gray-700 rounded-xl px-4 text-white outline-none focus:ring-2 focus:ring-amber-500" />
              </div>
            </motion.div>
          )}

          {(qrType === 'whatsapp' || qrType === 'call') && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <label className="text-gray-400 text-xs font-medium ml-1 block mb-1">Numéro de Téléphone</label>
                <input type="tel" value={vcardData.phone} onChange={e => setVcardData({...vcardData, phone: e.target.value})} className="w-full h-14 bg-gray-900 border border-gray-700 rounded-xl px-4 text-white outline-none focus:ring-2 focus:ring-amber-500" />
             </motion.div>
          )}

          {(qrType === 'google_review' || qrType === 'payment' || qrType === 'custom') && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <label className="text-gray-400 text-xs font-medium ml-1 block mb-1">URL du lien</label>
                <input type="url" 
                  value={qrType === 'google_review' ? googleReviewUrl : qrType === 'payment' ? paymentUrl : customUrl} 
                  onChange={e => {
                    if(qrType === 'google_review') setGoogleReviewUrl(e.target.value);
                    if(qrType === 'payment') setPaymentUrl(e.target.value);
                    if(qrType === 'custom') setCustomUrl(e.target.value);
                  }}
                  className="w-full h-14 bg-gray-900 border border-gray-700 rounded-xl px-4 text-white outline-none focus:ring-2 focus:ring-amber-500" />
             </motion.div>
          )}
        </div>
      </div>

      {/* SECTION 3: TEXTES AFFICHE DE BORD */}
      <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700 space-y-4 shadow-lg">
        <label className="text-xs uppercase font-bold text-gray-400 tracking-wider flex items-center gap-2">
          <Car className="w-4 h-4 text-emerald-400" />
          3. Textes de l'affiche de bord (Appuie-tête)
        </label>

        <div className="space-y-4">
          <div>
            <label className="text-gray-400 text-xs font-medium ml-1 block mb-1">Titre principal</label>
            <input 
              type="text" 
              placeholder="Scannez pour réserver votre prochain trajet"
              value={headline}
              onChange={e => setHeadline(e.target.value)}
              className="w-full h-14 bg-gray-900 border border-gray-700 rounded-xl px-4 text-white outline-none focus:ring-2 focus:ring-amber-500" 
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs font-medium ml-1 block mb-1">Services & Équipements à bord</label>
            <textarea 
              rows={3}
              placeholder="Ex: WiFi · Chargeurs smartphone..."
              value={subHeadline}
              onChange={e => setSubHeadline(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl p-4 text-white outline-none focus:ring-2 focus:ring-amber-500 resize-none leading-relaxed" 
            />
          </div>
        </div>
      </div>

      {/* QR CODE CONTAINER (BOTTOM) */}
      <div className="bg-gray-800 rounded-3xl p-8 border border-gray-700 text-center shadow-2xl mt-8">
        <h3 className="text-white font-bold mb-6">Aperçu de votre QR Code</h3>
        <div className="inline-block p-4 rounded-2xl bg-white shadow-xl mx-auto border border-gray-200">
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="QR Code" className="w-56 h-56 mx-auto rounded-lg" />
          ) : (
            <div className="w-56 h-56 flex items-center justify-center text-gray-400">Génération...</div>
          )}
        </div>
        
        <button onClick={copyContent} className="mt-8 mx-auto w-full max-w-[250px] h-14 bg-gray-900 border border-gray-700 hover:border-amber-500/50 rounded-xl flex items-center justify-center gap-2 text-gray-300 font-bold active:scale-95 transition-all shadow-md">
          {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
          {copied ? 'Lien copié' : 'Copier le lien'}
        </button>
      </div>

    </motion.div>
  );
}
