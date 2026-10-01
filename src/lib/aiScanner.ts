import type { AppSettings, ExpenseCategory } from '../types';

export interface ScanResult {
  amount: number;
  date: string;
  category: ExpenseCategory;
  tvaRate: number;
  merchantName?: string;
}

const SYSTEM_PROMPT = `Tu es un expert-comptable IA. Ton rôle est d'analyser le ticket de caisse ou la facture fourni en image et d'extraire les informations suivantes.
Réponds UNIQUEMENT avec un objet JSON valide, sans markdown, avec la structure suivante :
{
  "amount": 50.20, // Montant TTC en format nombre (float)
  "date": "YYYY-MM-DD", // Date au format ISO
  "tvaRate": 20, // Taux de TVA principal (20, 10, 5.5 ou 0 si non spécifié)
  "category": "fuel", // Choisir parmi: fuel, toll, parking, wash, maintenance, insurance, phone, fees, lease, fine, supplies, accounting, training, other
  "merchantName": "TotalEnergies" // Nom du commerçant ou de la station
}`;

export async function scanReceiptWithAI(settings: AppSettings, base64Image: string): Promise<ScanResult> {
  const provider = settings.aiProvider || 'gemini';
  const apiKey = settings.geminiApiKey || settings.geminiApiKey;
  
  if (!apiKey) {
    throw new Error('Clé API IA manquante. Veuillez configurer votre IA dans les réglages.');
  }

  try {
    let responseText = '';
    // Extraire le format mime de la chaîne base64 (ex: data:image/jpeg;base64,...)
    const mimeMatch = base64Image.match(/^data:(image\/[a-zA-Z]+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const base64Data = base64Image.replace(/^data:image\/[a-zA-Z]+;base64,/, '');

    if (provider === 'gemini') {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{
            parts: [
              { text: "Extrais les informations comptables de ce reçu." },
              { inline_data: { mime_type: mimeType, data: base64Data } }
            ]
          }],
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
          model: 'gpt-4o-mini', // GPT-4o-mini supporte la vision
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: [
                { type: 'text', text: 'Extrais les données de ce ticket.' },
                { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64Data}` } }
              ] 
            }
          ],
          response_format: { type: 'json_object' }
        })
      });
      if (!res.ok) throw new Error('Erreur API OpenAI');
      const data = await res.json();
      responseText = data.choices?.[0]?.message?.content || '';
    }
    else if (provider === 'anthropic') {
      // Claude Vision
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307', // Haiku supporte la vision et est rapide
          max_tokens: 1024,
          system: SYSTEM_PROMPT,
          messages: [
            { role: 'user', content: [
              { type: 'image', source: { type: 'base64', media_type: mimeType, data: base64Data } },
              { type: 'text', text: 'Analyse ce ticket et renvoie le JSON demandé.' }
            ]}
          ]
        })
      });
      if (!res.ok) throw new Error('Erreur API Anthropic');
      const data = await res.json();
      responseText = data.content?.[0]?.text || '';
    }

    let cleanJson = responseText.trim();
    if (cleanJson.startsWith('```json')) cleanJson = cleanJson.substring(7);
    if (cleanJson.startsWith('```')) cleanJson = cleanJson.substring(3);
    if (cleanJson.endsWith('```')) cleanJson = cleanJson.substring(0, cleanJson.length - 3);

    return JSON.parse(cleanJson);
  } catch (error: any) {
    console.error('Erreur IA Scanner:', error);
    throw new Error(error.message || 'Impossible d\'analyser le ticket. Veuillez vérifier votre clé API ou réessayer.', { cause: error });
  }
}
