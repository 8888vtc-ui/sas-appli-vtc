import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, User, MessageSquare, FileText } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateBonDeCommande } from '../lib/pdfGenerators';
import type { Trip } from '../types';

export default function AICopilot({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { settings } = useApp();
  const [messages, setMessages] = useState([
    { role: 'assistant', text: `Bonjour ${settings.driverName?.split(' ')[0] || 'Chauffeur'}, je suis votre Copilote IA. Comment puis-je vous aider aujourd'hui ?` }
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
  "clientName": "Nom du client (ou Client Anonyme)",
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

      // Check for JSON action
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
            
            generateBonDeCommande(mockTrip, settings);
            
            setMessages(prev => [...prev, { role: 'assistant', text: `✅ Le PDF pour ${data.clientName} a été généré et téléchargé avec succès !` }]);
          }
        } catch (e) {
          setMessages(prev => [...prev, { role: 'assistant', text: "J'ai essayé de générer le PDF mais il y a eu une erreur de formatage." }]);
        }
      } else {
        setMessages(prev => [...prev, { role: 'assistant', text: responseText }]);
      }

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', text: "❌ Erreur de connexion à Gemini. Vérifiez votre clé API." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          />

          {/* AI Drawer */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-[110] bg-[#1c1c1e] rounded-t-[30px] border-t border-white/10 shadow-2xl flex flex-col h-[85vh] max-w-md mx-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-[17px] font-bold text-white leading-tight">Copilote IA (Gemini)</h3>
                  <p className="text-[11px] text-purple-400 font-medium">Connecté à l'API Google</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white active:scale-90 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Suggestions rapides */}
            <div className="flex gap-2 p-3 overflow-x-auto no-scrollbar border-b border-white/5 bg-black/20">
              <button 
                onClick={() => setInput("Génère un bon de commande en PDF pour M. Martin, départ Gare de Lyon, arrivée Orly à 14h00, pour 65€")}
                className="whitespace-nowrap px-3 py-1.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold flex items-center gap-1.5 border border-purple-500/30"
              >
                <FileText className="w-3.5 h-3.5" /> Créer Devis PDF
              </button>
              <button 
                onClick={() => setInput("Rédige un SMS très poli en anglais pour dire à mon client que je suis au Terminal 2E porte 5")}
                className="whitespace-nowrap px-3 py-1.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold flex items-center gap-1.5 border border-blue-500/30"
              >
                <MessageSquare className="w-3.5 h-3.5" /> SMS Anglais
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      msg.role === 'user' ? 'bg-blue-600' : 'bg-gradient-to-tr from-purple-500 to-indigo-500'
                    }`}>
                      {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Sparkles className="w-4 h-4 text-white" />}
                    </div>
                    <div className={`p-3 rounded-2xl text-[14px] leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-tr-sm' 
                        : 'bg-[#2c2c2e] text-slate-200 rounded-tl-sm'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex gap-2 max-w-[85%]">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-gradient-to-tr from-purple-500 to-indigo-500">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div className="p-4 rounded-2xl bg-[#2c2c2e] rounded-tl-sm flex items-center gap-1.5">
                      <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                      <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                      <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/5 bg-[#1c1c1e] pb-[max(env(safe-area-inset-bottom,0px),16px)]">
              <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-full p-1.5 pl-4 focus-within:border-purple-500/50 transition-colors">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Posez une question ou demandez un PDF..."
                  className="flex-1 bg-transparent border-none text-white text-[15px] focus:ring-0 outline-none"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    input.trim() 
                      ? 'bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]' 
                      : 'bg-white/5 text-slate-500'
                  }`}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
