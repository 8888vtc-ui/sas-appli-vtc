import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Car, Sparkles, CheckCircle2, Zap, ArrowRight, ShieldCheck, 
  MessageCircle, Receipt, Smartphone
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0F172A] text-white overflow-x-hidden">
      
      {/* ─── NAV BAR ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0F172A]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Car className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight">AppVTC</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/login')} className="text-sm font-bold text-slate-300 hover:text-white hidden sm:block">
              Connexion
            </button>
            <button onClick={() => navigate('/register')} className="bg-white text-black px-5 py-2.5 rounded-full text-sm font-black hover:bg-slate-200 transition-all active:scale-95 shadow-lg shadow-white/10">
              Essai Gratuit
            </button>
          </div>
        </div>
      </nav>

      {/* ─── HERO SECTION ─── */}
      <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-32 px-6">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold mb-6">
              <Sparkles className="w-4 h-4" /> La 1ère application VTC propulsée par l'IA
            </span>
            <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-[1.1] mb-6">
              L'outil <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">définitif</span> pour<br className="hidden sm:block" />
              les chauffeurs VTC.
            </h1>
            <p className="text-lg sm:text-xl text-slate-400 mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
              Créé par un ancien chauffeur pour les chauffeurs. Automatisez votre comptabilité, déléguez la recherche de courses à l'IA et gérez vos clients depuis votre téléphone.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button onClick={() => navigate('/register')} className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 rounded-full text-white font-black text-lg hover:shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:scale-105 transition-all flex items-center justify-center gap-2">
                Démarrer maintenant <ArrowRight className="w-5 h-5" />
              </button>
              <span className="text-sm text-slate-500 font-medium">14 jours d'essai • Sans CB</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ─── KILLER FEATURES SECTION ─── */}
      <div className="py-20 bg-[#162032] border-y border-white/5 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black mb-4">Gagnez 10 heures par semaine.</h2>
            <p className="text-slate-400">Tout ce dont vous avez besoin, réuni dans une seule application ultra-rapide.</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            <FeatureCard 
              icon={<MessageCircle className="w-8 h-8 text-green-400" />}
              title="Radar WhatsApp IA"
              desc="L'IA lit vos groupes WhatsApp H24, repère les courses qui correspondent à vos critères (Lieu, Prix, Van/Berline) et vous notifie instantanément."
              color="bg-green-500/10 border-green-500/20"
            />
            <FeatureCard 
              icon={<Receipt className="w-8 h-8 text-purple-400" />}
              title="Comptabilité Automatique"
              desc="Prenez vos tickets de carburant ou péage en photo. Le scanner IA lit le montant et calcule la TVA déductible en 3 secondes."
              color="bg-purple-500/10 border-purple-500/20"
            />
            <FeatureCard 
              icon={<Smartphone className="w-8 h-8 text-blue-400" />}
              title="Le Cockpit du Chauffeur"
              desc="Sur une seule carte : lancez Waze en 1 clic, envoyez un SMS 'Je suis là' automatique, et vérifiez l'heure d'atterrissage du vol de votre client."
              color="bg-blue-500/10 border-blue-500/20"
            />
          </div>
        </div>
      </div>

      {/* ─── PRICING ─── */}
      <div className="py-24 px-6 relative">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black mb-4">Rentabilisé dès votre 1ère course.</h2>
            <p className="text-slate-400">Choisissez le plan adapté à vos ambitions.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Plan Basic */}
            <div className="glass rounded-3xl p-8 border border-white/10 hover:border-white/20 transition-all flex flex-col">
              <h3 className="text-2xl font-black text-white mb-2">Standard</h3>
              <p className="text-slate-400 text-sm mb-6">Pour gérer son activité sereinement.</p>
              <div className="mb-8">
                <span className="text-5xl font-black text-white">15€</span>
                <span className="text-slate-500">/mois</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <PricingFeature text="Tableau de bord VTC 1-clic" />
                <PricingFeature text="Génération de factures PDF & Devis" />
                <PricingFeature text="Calcul des Indemnités Kilométriques (URSSAF)" />
                <PricingFeature text="Coffre-Fort (Conformité Contrôle Routier)" />
                <PricingFeature text="Pancarte Aéroport Numérique (iPad)" />
              </ul>
              <button onClick={() => navigate('/register')} className="w-full py-4 rounded-2xl bg-white/10 text-white font-bold hover:bg-white/20 transition-all">
                Commencer Standard
              </button>
            </div>

            {/* Plan Premium IA */}
            <div className="glass rounded-3xl p-8 border-2 border-purple-500 relative flex flex-col shadow-[0_0_40px_rgba(168,85,247,0.2)]">
              <div className="absolute top-0 right-8 -translate-y-1/2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                Le plus populaire
              </div>
              <h3 className="text-2xl font-black text-purple-400 mb-2">Premium IA</h3>
              <p className="text-slate-400 text-sm mb-6">Pour exploser son chiffre d'affaires.</p>
              <div className="mb-8">
                <span className="text-5xl font-black text-white">39€</span>
                <span className="text-slate-500">/mois</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <PricingFeature text="Tout le plan Standard" />
                <PricingFeature text="Radar WhatsApp (Recherche auto de courses)" color="text-purple-400" icon={<Sparkles className="w-5 h-5 text-purple-400"/>} />
                <PricingFeature text="Scanner de reçus IA (Compta magique)" color="text-purple-400" icon={<Zap className="w-5 h-5 text-purple-400"/>} />
                <PricingFeature text="Générateur de Prospects B2B IA" color="text-purple-400" />
              </ul>
              <button onClick={() => navigate('/register')} className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all">
                Débloquer l'IA
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── ABOUT THE CREATOR (AUTHORITY) ─── */}
      <div className="py-20 px-6 bg-gradient-to-b from-[#0F172A] to-[#0A0F1F]">
        <div className="max-w-3xl mx-auto glass rounded-3xl p-8 sm:p-12 border border-blue-500/20 flex flex-col sm:flex-row gap-8 items-center text-center sm:text-left">
          <div className="w-32 h-32 rounded-3xl bg-blue-500 flex-shrink-0 shadow-[0_0_30px_rgba(59,130,246,0.3)] bg-cover bg-center overflow-hidden border-2 border-white/20">
            {/* Si David a une photo, on peut la mettre ici. En attendant, on met un dégradé */}
            <div className="w-full h-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center">
              <ShieldCheck className="w-12 h-12 text-white" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black mb-2">Conçu par un ancien chauffeur VTC.</h3>
            <p className="text-slate-400 leading-relaxed font-medium">
              "J'ai géré une flotte de Tesla pendant 4 ans sur la Côte d'Azur. Je connais les galères de compta, les groupes WhatsApp saturés et les contrôles des Boers. J'ai créé AppVTC parce que ce logiciel n'existait pas."
            </p>
            <p className="text-blue-400 font-bold mt-4">— David Chemla, Auditeur IA & Fondateur</p>
          </div>
        </div>
      </div>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-white/10 py-12 text-center text-slate-500 text-sm">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Car className="w-5 h-5 text-slate-400" /> <span className="font-bold text-slate-300">AppVTC</span>
        </div>
        <p>© {new Date().getFullYear()} AppVTC. Tous droits réservés.</p>
        <p className="mt-2">Conforme Réglementation Française & Factur-X Ready.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc, color }: { icon: any, title: string, desc: string, color: string }) {
  return (
    <div className={`glass rounded-3xl p-6 border transition-all hover:scale-[1.02] ${color}`}>
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

function PricingFeature({ text, color = "text-slate-300", icon = <CheckCircle2 className="w-5 h-5 text-emerald-400" /> }: { text: string, color?: string, icon?: any }) {
  return (
    <li className="flex items-start gap-3">
      <div className="shrink-0 mt-0.5">{icon}</div>
      <span className={`text-sm font-medium ${color}`}>{text}</span>
    </li>
  );
}
