import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, Bot, User, Car, Calculator, MessageSquare } from 'lucide-react';
import { useApp } from '../context/AppContext';

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

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsTyping(true);

    // Simulation de réponse IA pour le moment (MVP)
    setTimeout(() => {
      let reply = "Je suis en version de démonstration. Bientôt, je pourrai analyser vos courses en temps réel et rédiger vos devis.";
      
      if (userMsg.toLowerCase().includes('devis') || userMsg.toLowerCase().includes('prix')) {
        reply = "Pour calculer un devis précis, veuillez m'indiquer l'adresse de départ, d'arrivée et l'heure prévue. Je prendrai en compte la circulation et vos tarifs habituels.";
      } else if (userMsg.toLowerCase().includes('sms') || userMsg.toLowerCase().includes('message')) {
        reply = "Bien sûr. Voici un modèle de SMS professionnel :\n\n« Bonjour, votre chauffeur VTC privé est en route. Arrivée estimée dans 5 minutes. À tout de suite. »";
      }

      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
      setIsTyping(false);
    }, 1500);
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
            className="fixed bottom-0 left-0 right-0 z-[110] bg-[#1c1c1e] rounded-t-[30px] border-t border-white/10 shadow-2xl flex flex-col h-[80vh] max-w-md mx-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-[17px] font-bold text-white leading-tight">Copilote IA</h3>
                  <p className="text-[11px] text-purple-400 font-medium">Assistant Personnel VTC</p>
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
                onClick={() => setInput("Calcule un devis pour une course Paris -> Orly")}
                className="whitespace-nowrap px-3 py-1.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold flex items-center gap-1.5 border border-purple-500/30"
              >
                <Calculator className="w-3.5 h-3.5" /> Devis
              </button>
              <button 
                onClick={() => setInput("Rédige un SMS d'attente pour mon client")}
                className="whitespace-nowrap px-3 py-1.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold flex items-center gap-1.5 border border-blue-500/30"
              >
                <MessageSquare className="w-3.5 h-3.5" /> SMS Client
              </button>
              <button 
                onClick={() => setInput("Résume mes gains de la journée")}
                className="whitespace-nowrap px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 border border-emerald-500/30"
              >
                <Car className="w-3.5 h-3.5" /> Bilan Journée
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      msg.role === 'user' ? 'bg-blue-600' : 'bg-[#2c2c2e]'
                    }`}>
                      {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                    </div>
                    <div className={`p-3 rounded-2xl text-[14px] leading-relaxed ${
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
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-[#2c2c2e]">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="p-4 rounded-2xl bg-[#2c2c2e] rounded-tl-sm flex items-center gap-1.5">
                      <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-slate-400" />
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
                  placeholder="Posez une question..."
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
