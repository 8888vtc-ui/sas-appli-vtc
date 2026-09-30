import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Cpu, Car, ShieldCheck, Zap, Mail, Briefcase, Bot } from 'lucide-react';

export default function CreatorProfile() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-4 sm:p-6 max-w-3xl mx-auto pb-32 space-y-8"
    >
      {/* Header Retour */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-5 h-5" /> Retour
      </button>

      {/* Hero Section */}
      <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
        <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-purple-500/30 flex-shrink-0 border-4 border-[#1c1c1e]">
          <Bot className="w-16 h-16 text-white" />
        </div>
        <div className="text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 tracking-tight">
            David Chemla
          </h1>
          <p className="text-lg text-indigo-400 font-bold mt-1">Auditeur & Intégrateur IA sur-mesure</p>
          <p className="text-sm text-slate-400 mt-2 font-medium max-w-xl leading-relaxed">
            Basé sur la Côte d'Azur (Villeneuve-Loubet). J'allie une expérience opérationnelle du terrain à une expertise de pointe en ingénierie logicielle et Intelligence Artificielle.
          </p>
        </div>
      </div>

      {/* L'Histoire : VTC -> IA */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="glass rounded-3xl p-6 relative overflow-hidden border border-emerald-500/20 bg-emerald-500/5">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl" />
          <Car className="w-8 h-8 text-emerald-400 mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">4 ans d'expérience VTC</h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            Fondateur d'EcoFunDrive, j'ai géré moi-même les courses, la rentabilité, l'administratif complexe et la transition électrique de ma flotte (Tesla, vans). 
            Je connais parfaitement <strong>les douleurs et les besoins réels</strong> d'un chauffeur au quotidien. C'est pour cela que cet outil est si pragmatique.
          </p>
        </div>

        <div className="glass rounded-3xl p-6 relative overflow-hidden border-purple-500/20 bg-purple-500/5">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl" />
          <Cpu className="w-8 h-8 text-purple-400 mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Expertise IA & Développement</h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            J'ai arrêté le VTC pour me consacrer à 100% à l'informatique moderne et à l'Intelligence Artificielle. Mon objectif : créer des <strong>outils ultra-optimisés</strong>, 
            comme ce SaaS VTC, qui automatisent ce qui doit l'être.
          </p>
        </div>
      </div>

      {/* L'offre aux entreprises */}
      <div className="glass rounded-3xl p-8 border border-white/10 relative">
        <Zap className="absolute top-8 right-8 w-12 h-12 text-yellow-500/10" />
        <h2 className="text-2xl font-black text-white mb-4 flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-blue-400" /> Mon métier : Auditeur IA
        </h2>
        <p className="text-slate-300 mb-6 leading-relaxed text-sm sm:text-base">
          Aujourd'hui, j'accompagne les entreprises (tous secteurs) dans leur transformation digitale. Je n'écris pas juste du code, j'audite vos processus pour trouver où vous perdez du temps et de l'argent.
        </p>
        
        <ul className="space-y-4 mb-8">
          <li className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <strong className="text-white block text-sm">Audit sur-mesure</strong>
              <span className="text-slate-400 text-sm">Analyse pragmatique de votre rentabilité et de vos outils actuels. Zéro blabla, orienté résultats immédiats.</span>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <strong className="text-white block text-sm">Développement d'outils intelligents</strong>
              <span className="text-slate-400 text-sm">Création de SaaS, CRM ou applications métiers intégrant l'IA (comme ce radar WhatsApp) pour automatiser vos processus.</span>
            </div>
          </li>
        </ul>

        <a 
          href="mailto:contact@davidchemla.com"
          className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 rounded-2xl bg-white text-black font-black text-sm hover:bg-slate-200 transition-all shadow-lg shadow-white/20 active:scale-95"
        >
          <Mail className="w-5 h-5" />
          Me contacter pour un Audit IA
        </a>
      </div>
      
    </motion.div>
  );
}
