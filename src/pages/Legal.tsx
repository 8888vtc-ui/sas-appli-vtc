
import { ArrowLeft, ShieldCheck, Scale, FileText, Cookie } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Legal() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-300 font-sans selection:bg-blue-500/30 pb-20">
      
      {/* ─── HEADER ─── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0F172A]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 transition-colors text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-black text-white">Mentions Légales & RGPD</h1>
        </div>
      </header>

      <main className="pt-32 px-6 max-w-4xl mx-auto space-y-12">
        
        {/* ─── MENTIONS LÉGALES ─── */}
        <section className="glass p-8 rounded-3xl border border-white/10" aria-labelledby="legal-title">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <Scale className="w-6 h-6 text-blue-400" />
            </div>
            <h2 id="legal-title" className="text-2xl font-black text-white">1. Mentions Légales</h2>
          </div>
          
          <div className="space-y-4 text-sm leading-relaxed">
            <p>Conformément aux dispositions des articles 6-III et 19 de la Loi n° 2004-575 du 21 juin 2004 pour la Confiance dans l'économie numérique, dite L.C.E.N., nous portons à la connaissance des utilisateurs du site et de l'application AppVTC les informations suivantes :</p>
            
            <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5 space-y-2 text-slate-200">
              <p><strong>Dénomination sociale :</strong> DAVID CHEMLA (ECOFUN DRIVE)</p>
              <p><strong>Forme juridique :</strong> SAS, société par actions simplifiée</p>
              <p><strong>Capital social :</strong> 1 500,00 €</p>
              <p><strong>Siège social :</strong> MARINA BAIE DES ANGES - LE DUCAL - APP 1001 AVENUE DE LA BATTERIE 06270 VILLENEUVE-LOUBET</p>
              <p><strong>SIREN :</strong> 912 244 696</p>
              <p><strong>SIRET :</strong> 912 244 696 00015</p>
              <p><strong>N° TVA Intracommunautaire :</strong> FR59 912 244 696</p>
              <p><strong>Activité (Code NAF/APE) :</strong> 49.32Z (Transports de voyageurs par taxis)</p>
              <p><strong>Immatriculation :</strong> Inscrite au RNE (INPI) depuis le 07/04/2022</p>
            </div>

            <p>
              <strong>Directeur de la publication :</strong> M. David CHEMLA<br/>
              <strong>Hébergeur :</strong> Le site est hébergé de manière sécurisée par Netlify / Vercel (ou équivalent) et les données métiers sont hébergées sur Supabase (serveurs localisés en Europe).
            </p>
          </div>
        </section>

        {/* ─── POLITIQUE DE CONFIDENTIALITÉ (RGPD) ─── */}
        <section className="glass p-8 rounded-3xl border border-white/10" aria-labelledby="rgpd-title">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-emerald-500/10 rounded-xl">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <h2 id="rgpd-title" className="text-2xl font-black text-white">2. Politique de Confidentialité (RGPD)</h2>
          </div>

          <div className="space-y-4 text-sm leading-relaxed">
            <p>La société DAVID CHEMLA (ECOFUN DRIVE) s'engage à ce que la collecte et le traitement de vos données soient conformes au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés.</p>
            
            <h3 className="font-bold text-white mt-4">Collecte des données</h3>
            <p>Les données à caractère personnel collectées sur cette application (nom, prénom, email, téléphone, documents administratifs) le sont dans le cadre strict de l'exécution du service proposé : gestion de l'activité VTC, comptabilité, édition de devis et factures.</p>

            <h3 className="font-bold text-white mt-4">Sécurité et Coffre-fort numérique</h3>
            <p>Les documents téléchargés dans la section "Coffre-Fort" (Permis, RC Pro, KBIS, etc.) sont chiffrés et stockés de manière sécurisée. Ils ne sont ni revendus, ni exploités à des fins commerciales. L'utilisateur garde un contrôle total pour les afficher ou les supprimer.</p>

            <h3 className="font-bold text-white mt-4">Vos droits</h3>
            <p>Conformément à la réglementation européenne en vigueur, vous disposez des droits suivants : droit d'accès (article 15 RGPD), de rectification (article 16 RGPD), d'effacement (article 17 RGPD), de limitation du traitement, ou d'opposition. Pour exercer ces droits, vous pouvez contacter le Délégué à la Protection des Données (DPO) à l'adresse du siège social mentionnée ci-dessus.</p>
          </div>
        </section>

        {/* ─── GESTION DES COOKIES ─── */}
        <section className="glass p-8 rounded-3xl border border-white/10" aria-labelledby="cookies-title">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-amber-500/10 rounded-xl">
              <Cookie className="w-6 h-6 text-amber-400" />
            </div>
            <h2 id="cookies-title" className="text-2xl font-black text-white">3. Politique des Cookies</h2>
          </div>

          <div className="space-y-4 text-sm leading-relaxed">
            <p>L'application AppVTC utilise des cookies pour son fonctionnement technique de base et la sécurisation des sessions (cookies strictement nécessaires).</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Cookies de session (Essentiels) :</strong> Permettent de maintenir votre connexion sécurisée à votre tableau de bord sans avoir à vous reconnecter à chaque action.</li>
              <li><strong>Cookies de préférences :</strong> Sauvegardent vos choix d'interface (mode sombre, etc.).</li>
              <li>Nous n'utilisons <strong>aucun cookie publicitaire ou de traçage tiers</strong> intrusif. Les données de navigation restent internes à l'application.</li>
            </ul>
          </div>
        </section>

        {/* ─── CGU ─── */}
        <section className="glass p-8 rounded-3xl border border-white/10" aria-labelledby="cgu-title">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-purple-500/10 rounded-xl">
              <FileText className="w-6 h-6 text-purple-400" />
            </div>
            <h2 id="cgu-title" className="text-2xl font-black text-white">4. Conditions Générales d'Utilisation</h2>
          </div>

          <div className="space-y-4 text-sm leading-relaxed">
            <p>En utilisant AppVTC, le chauffeur déclare être un professionnel en règle et disposer des autorisations nécessaires à l'exercice de l'activité de VTC.</p>
            <p>L'application fournit des outils d'assistance administrative (génération de factures, calcul TVA, détection de courses WhatsApp). Bien que les algorithmes soient optimisés (ex: Factur-X), <strong>l'utilisateur reste l'unique responsable</strong> de la véracité de sa comptabilité et des montants déclarés à l'administration fiscale et à l'URSSAF.</p>
            <p>David Chemla (ECOFUN DRIVE) ne saurait être tenu responsable d'un redressement fiscal ou d'une erreur de déclaration due à une mauvaise saisie de l'utilisateur dans l'application.</p>
          </div>
        </section>

      </main>
    </div>
  );
}
