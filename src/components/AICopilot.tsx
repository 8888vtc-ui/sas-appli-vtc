import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, ChevronDown, Send, FileText, 
  Mic, Volume2, ArrowUp, Lock, Receipt, Plane, TrendingUp, Download
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateBonDeCommande } from '../lib/pdfGenerators';
import { formatEUR } from '../lib/utils';
import { showToast } from '../components/Toast';
import type { Trip } from '../types';

const c = {
  surfaceContainerHighest: '#353534',
  surfaceContainerHigh: '#2a2a2a',
  surfaceContainer: '#201f1f',
  surfaceContainerLow: '#1c1b1b',
  surfaceContainerLowest: '#0e0e0e',
  surfaceVariant: '#353534',
  onSurface: '#e5e2e1',
  onSurfaceVariant: '#b9cbb9',
  primary: '#f1ffef',
  primaryContainer: '#00ff87',
  onPrimaryContainer: '#007138',
  secondaryContainer: '#0566d9',
  onSecondaryContainer: '#e6ecff',
  secondaryFixed: '#d8e2ff',
  tertiaryFixedDim: '#ffb95f',
  outline: '#849585'
};

type Message = {
  role: 'user' | 'assistant';
  text: string;
  isPdf?: boolean;
  pdfData?: any;
};

export default function AICopilot({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { settings } = useApp();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: `Bonjour ${settings.driverName?.split(' ')[0] || 'Chauffeur'}, je suis votre Assistant Exécutif Gemini. Comment puis-je vous aider aujourd'hui ?` }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsTyping(true);

    if (!settings.geminiApiKey) {
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'assistant', text: "⚠️ Clé API Gemini manquante. Veuillez ajouter votre clé dans les Réglages pour utiliser l'IA." }]);
        setIsTyping(false);
      }, 800);
      return;
    }

    try {
      const genAI = new GoogleGenerativeAI(settings.geminiApiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `
Tu es l'assistant IA d'un chauffeur VTC indépendant en France.
Le nom du chauffeur est ${settings.driverName}.
Si le chauffeur demande de rédiger un message client (attente, retard, confirmation), rédige-le de manière polie et professionnelle.

CRITIQUE: Si le chauffeur te demande de créer un "devis", un "bon de commande" ou une "facture" (et te donne des infos comme point A, point B, prix), TU DOIS OBLIGATOIREMENT renvoyer UNIQUEMENT un bloc JSON formaté comme ceci, sans aucun autre texte avant ou après :
\`\`\`json
{
  "_action": "generate_pdf",
  "clientName": "Nom du client",
  "pickUpLocation": "Adresse de départ",
  "dropOffLocation": "Adresse d'arrivée",
  "price": 50,
  "date": "JJ/MM/AAAA",
  "time": "HH:MM"
}
\`\`\`
Si des informations manquent (prix, heure), invente des valeurs plausibles basées sur la demande ou mets des valeurs par défaut pour que ça marche.

Demande de l'utilisateur : ${userMsg}
`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        try {
          const data = JSON.parse(jsonMatch[1]);
          if (data._action === 'generate_pdf') {
            const mockTrip: Trip = {
              id: Date.now().toString(),
              clientName: data.clientName || 'Client',
              clientPhone: '',
              pickUpLocation: data.pickUpLocation || 'À définir',
              dropOffLocation: data.dropOffLocation || 'À définir',
              date: data.date || new Date().toLocaleDateString('fr-FR'),
              time: data.time || '12:00',
              bookingDateTime: new Date().toLocaleString('fr-FR'),
              passengerCount: 1,
              price: Number(data.price) || 0,
              tripType: 'transfer',
              status: 'scheduled'
            };
            
            // Auto-generate the PDF directly
            generateBonDeCommande(mockTrip, settings);
            
            setMessages(prev => [...prev, { 
              role: 'assistant', 
              text: `Bon de commande VTC généré avec succès pour **${data.clientName}**.\nMontant : **${formatEUR(data.price)} TTC**. Prise en charge : **${data.pickUpLocation}** à ${data.time}.`,
              isPdf: true,
              pdfData: mockTrip
            }]);
          }
        } catch (e) {
          setMessages(prev => [...prev, { role: 'assistant', text: "Erreur lors de la génération du document PDF (Format invalide)." }]);
        }
      } else {
        setMessages(prev => [...prev, { role: 'assistant', text: responseText.replace(/\*\*/g, '') }]);
      }

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', text: "❌ Erreur de connexion à Gemini. Vérifiez votre clé API ou votre connexion internet." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleDownloadPDF = (trip: Trip) => {
    generateBonDeCommande(trip, settings);
    showToast('Téléchargement du PDF en cours...', 'success');
  };

  const handleShareWhatsApp = (trip: Trip) => {
    const text = `Bonjour ${trip.clientName}, voici la confirmation de votre course. Départ : ${trip.pickUpLocation}. Tarif : ${formatEUR(trip.price)}. ${settings.companyName}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* OVERLAY FLOU SOMBRE HAUT DE GAMME */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] backdrop-blur-md"
            style={{ backgroundColor: 'rgba(14, 14, 14, 0.7)' }}
          />

          {/* BOTTOM SHEET IA: TIROIR COPILOTE GEMINI DÉPLOYÉ */}
          <motion.section
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-[110] flex flex-col backdrop-blur-2xl rounded-t-[24px] shadow-[0_-12px_48px_rgba(0,0,0,0.85)] overflow-hidden max-w-2xl mx-auto h-[90vh]"
            style={{ backgroundColor: 'rgba(42, 42, 42, 0.95)' }}
          >
            {/* Lueur subtile diffuse Indigo / Violette en haut */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 blur-2xl pointer-events-none" style={{ background: 'linear-gradient(to bottom, rgba(5,102,217,0.2), transparent)' }}></div>
            
            {/* Poignée Tactile Ergo-Grab */}
            <div className="w-full pt-3 pb-2 flex justify-center items-center cursor-grab active:cursor-grabbing">
              <div className="w-12 h-1.5 rounded-full transition-colors" style={{ backgroundColor: 'rgba(132, 149, 133, 0.4)' }}></div>
            </div>

            <div className="flex flex-col flex-1 overflow-hidden px-4">
              {/* HEADER COPILOTE MAGIQUE */}
              <div className="flex items-center justify-between mt-2 mb-4 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl shadow-[0_0_20px_rgba(99,102,241,0.35)] shrink-0" style={{ backgroundColor: c.surfaceContainerHighest }}>
                    <Sparkles className="w-6 h-6" style={{ color: c.secondaryFixed }} />
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: c.primaryContainer }}></span>
                      <span className="relative inline-flex rounded-full h-3 w-3" style={{ backgroundColor: c.primaryContainer }}></span>
                    </span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="text-[18px] font-bold tracking-tight" style={{ color: c.primary }}>Copilote IA Gemini</h2>
                      <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider" style={{ backgroundColor: 'rgba(5,102,217,0.3)', color: c.secondaryFixed }}>Pro</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Mic className="w-3.5 h-3.5" style={{ color: c.primaryContainer }} />
                      <span className="text-[11px] font-medium" style={{ color: c.primaryContainer }}>À l'écoute en mains libres</span>
                    </div>
                  </div>
                </div>
                <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90" style={{ backgroundColor: 'rgba(53, 53, 52, 0.5)', color: c.onSurfaceVariant }}>
                  <ChevronDown className="w-6 h-6" />
                </button>
              </div>

              {/* SUGGESTIONS RAPIDES (1-TAP PROMPTS) */}
              <div className="overflow-x-auto -mx-4 px-4 pb-2 shrink-0" style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
                <div className="flex items-center gap-2 w-max">
                  <button onClick={() => setInput("Génère un bon de commande de 50€ pour M. Martin ce soir 22h à Gare de Lyon.")} className="flex items-center gap-1.5 px-3.5 py-2 rounded-full transition-all active:scale-95 shadow-sm" style={{ backgroundColor: c.surfaceContainer, color: c.onSurface }}>
                    <Receipt className="w-4 h-4" style={{ color: c.secondaryContainer }} />
                    <span className="text-[11px] font-medium whitespace-nowrap">Bon de commande 50€ M. Martin</span>
                  </button>
                  <button onClick={() => setInput("Calcule moi la rentabilité de la journée.")} className="flex items-center gap-1.5 px-3.5 py-2 rounded-full transition-all active:scale-95 shadow-sm" style={{ backgroundColor: c.surfaceContainer, color: c.onSurface }}>
                    <TrendingUp className="w-4 h-4" style={{ color: c.tertiaryFixedDim }} />
                    <span className="text-[11px] font-medium whitespace-nowrap">Calculer rentabilité du jour</span>
                  </button>
                  <button onClick={() => setInput("Rédige un message pour dire au passager du vol AF1234 que je l'attends au terminal.")} className="flex items-center gap-1.5 px-3.5 py-2 rounded-full transition-all active:scale-95 shadow-sm" style={{ backgroundColor: c.surfaceContainer, color: c.onSurface }}>
                    <Plane className="w-4 h-4" style={{ color: c.secondaryFixed }} />
                    <span className="text-[11px] font-medium whitespace-nowrap">Rappeler vol AF1234 CDG</span>
                  </button>
                </div>
              </div>

              {/* HISTORIQUE DU DIALOGUE */}
              <div className="flex flex-col flex-1 overflow-y-auto space-y-4 py-2" style={{ scrollbarWidth: 'none' }}>
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex flex-col max-w-[92%] space-y-1 ${msg.role === 'user' ? 'items-end self-end' : 'items-start self-start'}`}>
                    
                    {msg.role === 'user' ? (
                      <>
                        <div className="flex items-center gap-1.5 mr-1">
                          <Volume2 className="w-3.5 h-3.5" style={{ color: c.onSurfaceVariant }} />
                          <span className="text-[11px] font-medium" style={{ color: c.onSurfaceVariant }}>Dicté à l'instant</span>
                        </div>
                        <div className="p-3.5 rounded-2xl rounded-tr-[4px] shadow-md" style={{ backgroundColor: c.surfaceContainer }}>
                          <p className="text-[15px] leading-snug" style={{ color: c.onSurface }}>{msg.text}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-1.5 ml-1">
                          <Sparkles className="w-3.5 h-3.5" style={{ color: c.secondaryFixed }} />
                          <span className="text-[11px] font-medium" style={{ color: c.secondaryFixed }}>Assistant Exécutif Gemini</span>
                        </div>
                        <div className="p-4 rounded-2xl rounded-tl-[4px] shadow-lg space-y-3 w-full" style={{ backgroundColor: 'rgba(14, 14, 14, 0.9)' }}>
                          <p className="text-[15px] leading-relaxed" style={{ color: c.primary }} dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, `<span style="font-weight: 700; color: ${c.secondaryFixed}">$1</span>`) }} />
                          
                          {/* MINI-CARTE INTERACTIVE : BON DE COMMANDE APERÇU */}
                          {msg.isPdf && msg.pdfData && (
                            <div className="p-3 rounded-xl mt-2 flex flex-col gap-2.5" style={{ backgroundColor: c.surfaceContainer }}>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: c.surfaceContainerHigh }}>
                                    <FileText className="w-4 h-4" style={{ color: c.secondaryFixed }} />
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-[13px] font-medium" style={{ color: c.onSurface }}>Bon_Commande_{msg.pdfData.clientName.replace(/\s+/g,'')}.pdf</span>
                                    <span className="text-[11px] font-medium" style={{ color: c.onSurfaceVariant }}>Prêt pour signature & validation</span>
                                  </div>
                                </div>
                                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold" style={{ backgroundColor: 'rgba(0, 255, 135, 0.2)', color: c.primaryContainer }}>
                                  {formatEUR(msg.pdfData.price)}
                                </span>
                              </div>
                              {/* ACTIONS RAPIDES */}
                              <div className="grid grid-cols-2 gap-2 pt-1">
                                <button onClick={() => handleShareWhatsApp(msg.pdfData)} className="min-h-[44px] px-3 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-[0_0_16px_rgba(0,255,135,0.3)] hover:brightness-110 active:scale-95 transition-all" style={{ backgroundColor: c.primaryContainer, color: c.onPrimaryContainer }}>
                                  <Send className="w-4 h-4" />
                                  <span>WhatsApp Client</span>
                                </button>
                                <button onClick={() => handleDownloadPDF(msg.pdfData)} className="min-h-[44px] px-3 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1.5 active:scale-95 transition-all" style={{ backgroundColor: c.surfaceContainerHigh, color: c.onSurface }}>
                                  <Download className="w-4 h-4" />
                                  <span>Télécharger PDF</span>
                                </button>
                              </div>
                            </div>
                          )}

                        </div>
                      </>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="flex flex-col items-start self-start max-w-[92%] space-y-1">
                    <div className="flex items-center gap-1.5 ml-1">
                      <Sparkles className="w-3.5 h-3.5" style={{ color: c.secondaryFixed }} />
                      <span className="text-[11px] font-medium" style={{ color: c.secondaryFixed }}>Assistant Exécutif Gemini réfléchit...</span>
                    </div>
                    <div className="p-4 rounded-2xl rounded-tl-[4px] shadow-lg flex items-center gap-1.5" style={{ backgroundColor: 'rgba(14, 14, 14, 0.9)' }}>
                      <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.secondaryFixed }} />
                      <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.secondaryFixed }} />
                      <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.secondaryFixed }} />
                    </div>
                  </div>
                )}
                <div ref={bottomRef} className="h-2" />
              </div>

              {/* ZONE DE SAISIE TACTILE GÉANTE */}
              <div className="pt-2 pb-6 shrink-0 mt-auto bg-transparent">
                <div className="relative flex items-center gap-2">
                  <div className="relative flex-1 flex items-center min-h-[58px] rounded-2xl px-3.5 shadow-inner transition-all focus-within:shadow-[0_0_0_2px_rgba(99,102,241,0.5)]" style={{ backgroundColor: c.surfaceContainerLowest }}>
                    {/* Bouton Micro Vocal Pulsant */}
                    <button className="relative w-11 h-11 rounded-xl flex items-center justify-center active:scale-90 transition-transform shrink-0 shadow-[0_0_18px_rgba(5,102,217,0.5)]" style={{ backgroundColor: c.secondaryContainer, color: c.onSecondaryContainer }}>
                      <Mic className="w-5 h-5" />
                      <span className="absolute inset-0 rounded-xl animate-ping opacity-25 pointer-events-none" style={{ backgroundColor: c.secondaryContainer }}></span>
                    </button>
                    {/* Input Champ Chauffeur */}
                    <input 
                      type="text" 
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Dictée au volant ou commande..."
                      className="w-full bg-transparent px-3 text-[15px] focus:outline-none" 
                      style={{ color: c.onSurface }}
                    />
                    {/* Indicateur Audio Fluide */}
                    <div className="flex items-center gap-0.5 px-1 shrink-0">
                      <span className="w-1 h-3 rounded-full animate-pulse" style={{ backgroundColor: 'rgba(216, 226, 255, 0.5)' }}></span>
                      <span className="w-1 h-5 rounded-full animate-pulse" style={{ backgroundColor: c.secondaryFixed, animationDelay: '150ms' }}></span>
                      <span className="w-1 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'rgba(216, 226, 255, 0.4)', animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                  {/* Bouton Validation */}
                  <button 
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className={`min-h-[58px] min-w-[58px] rounded-2xl flex items-center justify-center shadow-lg transition-all shrink-0 ${input.trim() ? 'active:scale-95' : 'opacity-50'}`}
                    style={{ backgroundColor: c.surfaceContainerHighest }}
                  >
                    <ArrowUp className="w-6 h-6" style={{ color: input.trim() ? c.secondaryFixed : c.onSurfaceVariant }} />
                  </button>
                </div>
                {/* Mini-statut de sécurité routière */}
                <div className="mt-2.5 flex items-center justify-center gap-1.5 opacity-80" style={{ color: c.onSurfaceVariant }}>
                  <Lock className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-medium">Conforme conduite sécurisée mains libres • Annulation bruit</span>
                </div>
              </div>

            </div>
          </motion.section>
        </>
      )}
    </AnimatePresence>
  );
}
