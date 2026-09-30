import type { AppSettings } from '../types';

export interface AIProspect {
  name: string;
  category: 'hotel' | 'entreprise' | 'agence' | 'concierge' | 'restaurant';
  phone: string;
  email?: string;
  notes: string;
}

const SYSTEM_PROMPT = `Tu es un expert en prospection B2B pour les chauffeurs VTC de luxe.
Ton objectif est de trouver 5 véritables entreprises (hôtels 4/5 étoiles, agences événementielles, conciergeries de luxe, ou grandes entreprises) situées aux alentours de la ville de l'utilisateur.
Pour chaque entreprise, donne un nom réel, une catégorie (hotel, entreprise, agence, concierge, restaurant), un numéro de téléphone fictif mais réaliste si tu ne le connais pas (ex: +33 4 93 ...), et un conseil sur la meilleure façon de les aborder (Notes).

Tu dois répondre UNIQUEMENT avec un objet JSON valide ayant cette structure exacte, sans aucun texte avant ou après :
{
  "prospects": [
    {
      "name": "Nom de l'entreprise",
      "category": "hotel",
      "phone": "+33400000000",
      "email": "contact@...",
      "notes": "Demander à parler au Chef Concierge pour proposer..."
    }
  ]
}
Assure-toi que le JSON soit parfaitement valide et sans balises markdown (pas de \`\`\`json).`;

export async function generateProspects(settings: AppSettings): Promise<AIProspect[]> {
  const provider = settings.aiProvider || 'gemini';
  const apiKey = settings.aiApiKey || settings.geminiApiKey;
  
  if (!apiKey) {
    throw new Error('Clé API manquante. Veuillez configurer votre IA dans les réglages.');
  }

  const userPrompt = `Trouve 5 prospects de luxe autour de cette adresse/ville : ${settings.companyAddress || 'Paris'}.`;

  try {
    let responseText = '';

    if (provider === 'gemini') {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ parts: [{ text: userPrompt }] }],
          generationConfig: { response_mime_type: 'application/json' }
        })
      });
      if (!res.ok) throw new Error('Erreur API Gemini');
      const data = await res.json();
      responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } 
    else if (provider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userPrompt }
          ],
          response_format: { type: 'json_object' }
        })
      });
      if (!res.ok) throw new Error('Erreur API OpenAI');
      const data = await res.json();
      responseText = data.choices?.[0]?.message?.content || '';
    }
    else if (provider === 'anthropic') {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true' // Requis pour l'appel client
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 1024,
          system: SYSTEM_PROMPT,
          messages: [
            { role: 'user', content: userPrompt }
          ]
        })
      });
      if (!res.ok) throw new Error('Erreur API Anthropic');
      const data = await res.json();
      responseText = data.content?.[0]?.text || '';
    }

    // Nettoyer la réponse au cas où le modèle renvoie du markdown
    let cleanJson = responseText.trim();
    if (cleanJson.startsWith('```json')) cleanJson = cleanJson.substring(7);
    if (cleanJson.startsWith('```')) cleanJson = cleanJson.substring(3);
    if (cleanJson.endsWith('```')) cleanJson = cleanJson.substring(0, cleanJson.length - 3);

    const parsed = JSON.parse(cleanJson);
    return parsed.prospects || [];

  } catch (error: any) {
    console.error('Erreur IA Prospect:', error);
    throw new Error(error.message || 'Impossible de générer les prospects. Vérifiez votre clé API.');
  }
}
