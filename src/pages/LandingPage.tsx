import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Car, Sparkles, MessageCircle, Receipt, Smartphone, ArrowRight, ShieldCheck 
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0F172A] text-white overflow-x-hidden font-sans selection:bg-blue-500/30">
      
      {/* ─── NAV BAR ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0F172A]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Car className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight">AppVTC</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/register')} className="bg-white text-black px-5 py-2.5 rounded-full text-sm font-black hover:bg-slate-200 transition-all active:scale-95 shadow-lg shadow-white/10">
              Rejoindre la liste d'attente
            </button>
          </div>
        </div>
      </nav>

      {/* ─── HERO SECTION ─── */}
      <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-32 px-6">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-6 uppercase tracking-wider">
              <Sparkles className="w-4 h-4" /> Bêta Privée - Places Limitées
            </span>
            <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-[1.1] mb-6">
              Ne conduisez plus à l'aveugle.<br className="hidden sm:block" />
              Reprenez le <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">contrôle total</span> de votre activité VTC.
            </h1>
            <p className="text-lg sm:text-xl text-slate-400 mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
              Gagnez 10 heures de paperasse par semaine, filtrez les meilleures courses instantanément et pilotez votre rentabilité depuis une seule interface premium conçue pour l'action.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button onClick={() => navigate('/register')} className="w-full sm:w-auto bg-white text-slate-900 px-8 py-4 rounded-full font-black text-lg hover:bg-slate-200 transition-all flex items-center justify-center gap-2 shadow-[0_0_40px_rgba(255,255,255,0.2)] active:scale-95">
                Rejoindre la liste d'attente privée <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ─── LA PROBLÉMATIQUE & SOLUTION ─── */}
      <div className="py-20 px-6 border-y border-white/5 bg-[#162032]/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-black mb-8">La route est assez dure. L'administratif ne devrait pas l'être.</h2>
          <p className="text-slate-400 text-lg leading-relaxed mb-6">
            La réalité du métier de chauffeur indépendant est épuisante. Entre les notifications incessantes des dizaines de boucles WhatsApp saturées de messages inutiles, le stress de la comptabilité qui s'accumule dans la boîte à gants, la pression de l'URSSAF et l'angoisse des contrôles des Boers, votre charge mentale explose. Vous passez plus de temps à gérer l'arrière-boutique qu'à conduire et générer du chiffre d'affaires.
          </p>
          <p className="text-slate-300 text-lg leading-relaxed font-semibold">
            Il est temps de dire adieu à cette désorganisation. AppVTC centralise l'intégralité de votre business dans une <span className="text-blue-400">application de gestion et comptabilité automatique pour chauffeur VTC</span>, pensée de A à Z pour être manipulée au volant, en 2 secondes, sans aucune friction.
          </p>
        </div>
      </div>

      {/* ─── LES 3 PILIERS TECHNOLOGIQUES ─── */}
      <div className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-black mb-4">Les 3 Piliers Technologiques d'AppVTC</h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-8">
            {/* Pilier 1 */}
            <div className="glass rounded-3xl p-8 border border-white/10 hover:border-blue-500/30 transition-all bg-gradient-to-b from-white/5 to-transparent">
              <div className="w-14 h-14 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mb-6">
                <MessageCircle className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-2xl font-black text-white mb-4">Radar WhatsApp IA : Ne ratez plus aucune course premium</h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                Oubliez le spam et les demandes non pertinentes. Notre algorithme scanne les dizaines de boucles de chauffeurs en temps réel. Cette <strong>application pour remplacer les groupes WhatsApp de sous-traitance VTC</strong> analyse, trie et ne vous notifie que lorsque c'est pertinent. Que vous rouliez en Berline ou en Van, il n'a jamais été aussi simple de <strong>trouver des courses VTC rentables avec radar WhatsApp IA</strong>, en fonction de vos critères géographiques et tarifaires précis.
              </p>
            </div>

            {/* Pilier 2 */}
            <div className="glass rounded-3xl p-8 border border-white/10 hover:border-indigo-500/30 transition-all bg-gradient-to-b from-white/5 to-transparent">
              <div className="w-14 h-14 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mb-6">
                <Smartphone className="w-7 h-7 text-indigo-400" />
              </div>
              <h3 className="text-2xl font-black text-white mb-4">Le Cockpit du Chauffeur : Tout est à un clic</h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                Votre écran devient un véritable tableau de bord ergonomique. D'une seule touche, lancez la navigation GPS vers votre client, envoyez un SMS automatisé professionnel ("Votre chauffeur est sur place") ou suivez l'arrivée d'un vol en temps réel. Grâce à notre <strong>assistant intelligence artificielle pour chauffeurs VTC indépendants</strong>, chaque manipulation superflue est éliminée. Des boutons géants, un contraste adapté à la conduite nocturne : la sécurité de la route avant tout.
              </p>
            </div>

            {/* Pilier 3 */}
            <div className="glass rounded-3xl p-8 border border-white/10 hover:border-purple-500/30 transition-all bg-gradient-to-b from-white/5 to-transparent">
              <div className="w-14 h-14 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-center mb-6">
                <Receipt className="w-7 h-7 text-purple-400" />
              </div>
              <h3 className="text-2xl font-black text-white mb-4">Comptabilité instantanée & Facturation</h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                Ne perdez plus vos week-ends à trier vos notes de frais. Avec la fonction de scan intelligent, prenez en photo vos tickets de carburant, de péage ou de lavage : l'application extrait les montants et calcule votre TVA récupérable en 3 secondes chrono. Véritable <strong>logiciel VTC automatisation devis et facturation Factur-X</strong>, AppVTC génère vos documents comptables conformes aux normes européennes d'un simple glissement de doigt, prêts à être transmis à votre expert-comptable.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── ABOUT THE CREATOR (AUTHORITY) ─── */}
      <div className="py-20 px-6 bg-gradient-to-b from-[#0F172A] to-[#0A0F1F] border-t border-white/5">
        <div className="max-w-4xl mx-auto glass rounded-3xl p-8 sm:p-12 border border-blue-500/20 flex flex-col sm:flex-row gap-8 items-center text-center sm:text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]" />
          
          <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl bg-blue-500 flex-shrink-0 shadow-[0_0_30px_rgba(59,130,246,0.3)] bg-cover bg-center overflow-hidden border-2 border-white/20 relative z-10">
            <div className="w-full h-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center">
              <ShieldCheck className="w-16 h-16 text-white opacity-80" />
            </div>
          </div>
          <div className="relative z-10">
            <h3 className="text-2xl font-black mb-4">Le Mot du Fondateur</h3>
            <p className="text-slate-300 leading-relaxed text-lg italic mb-6">
              "J'ai géré une flotte de véhicules Tesla pendant 4 ans sur la Côte d'Azur. Je connais parfaitement les galères quotidiennes, les nuits blanches passées sur la comptabilité, le stress des contrôles inopinés des Boers et le casse-tête de la sous-traitance pour optimiser ses plannings.<br/><br/>
              J'ai conçu AppVTC par frustration. L'industrie avait besoin d'un outil premium, fluide et ultra-sécurisé, pensé par un ancien de la route pour ceux qui y sont tous les jours. Nous n'avons pas créé une énième application de dispatch : nous avons construit le premier OS véritablement dédié à l'indépendance et à la rentabilité du chauffeur VTC."
            </p>
            <p className="text-white font-bold text-lg">— David Chemla</p>
            <p className="text-blue-400 font-semibold">Ancien gérant de flotte VTC & Auditeur IA</p>
          </div>
        </div>
      </div>

      {/* ─── FINAL CTA ─── */}
      <div className="py-24 px-6 text-center">
        <h2 className="text-4xl sm:text-5xl font-black mb-6">Prêt à transformer votre entreprise ?</h2>
        <p className="text-slate-400 text-lg mb-10 max-w-2xl mx-auto">
          Les places pour notre bêta privée sont strictement limitées pour garantir un accompagnement premium à nos premiers utilisateurs. Prenez une longueur d'avance.
        </p>
        <button onClick={() => navigate('/register')} className="bg-white text-slate-900 px-10 py-5 rounded-full font-black text-xl hover:bg-slate-200 transition-all flex items-center justify-center gap-3 mx-auto shadow-[0_0_40px_rgba(255,255,255,0.2)] active:scale-95">
          S'inscrire sur la liste d'attente <ArrowRight className="w-6 h-6" />
        </button>
      </div>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-white/10 py-12 text-center text-slate-500 text-sm bg-[#0A0F1F]">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Car className="w-5 h-5 text-slate-400" /> <span className="font-bold text-slate-300 text-lg">AppVTC</span>
        </div>
        <p className="mb-2">Conforme Réglementation Française & Factur-X Ready.</p>
        <p>© 2026 AppVTC. Tous droits réservés.</p>
      </footer>
    </div>
  );
}
