import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import type { EquipmentItem } from '@/types/equipment';

export type GeminiGenerateTextResponse = { text: string };

type GenerateContentPart =
  | { type: 'text'; text: string }
  | { type: 'inline_data'; inline_data: { mime_type: string; data: string } };

type GenerateContentRequest = {
  contents: Array<{
    role?: 'user' | 'model' | 'system';
    parts: GenerateContentPart[];
  }>;
  safetySettings?: unknown;
  generationConfig?: {
    temperature?: number;
    topP?: number;
    topK?: number;
    maxOutputTokens?: number;
  };
};

type GenerateContentCandidate = {
  content?: { parts?: Array<{ text?: string }> };
};

type GenerateContentResponse = {
  candidates?: GenerateContentCandidate[];
};

const GEMINI_MODEL = 'gemini-1.5-flash';

const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '';

async function callGemini(body: GenerateContentRequest): Promise<string> {
  if (!apiKey) {
    throw new Error('Missing EXPO_PUBLIC_GEMINI_API_KEY');
  }
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(
    apiKey,
  )}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gemini error ${res.status}: ${text}`);
  }
  const json = (await res.json()) as GenerateContentResponse;
  const out = json.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  return out;
}

async function uriToBase64(uri: string): Promise<{ data: string; mime: string }> {
  if (Platform.OS === 'web') {
    const response = await fetch(uri);
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i += 1) {
      binary += String.fromCharCode(bytes[i] as number);
    }
    const data = (typeof btoa !== 'undefined' ? btoa(binary) : Buffer.from(binary, 'binary').toString('base64')) as string;
    return { data, mime: blob.type || 'image/jpeg' };
  }
  const info = await FileSystem.getInfoAsync(uri);
  if (!info.exists) {
    throw new Error('File not found');
  }
  const data = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
  const ext = uri.split('.').pop() ?? 'jpg';
  const mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
  return { data, mime };
}

export async function geminiGenerateText(prompt: string, imageUris?: string[]): Promise<GeminiGenerateTextResponse> {
  const parts: GenerateContentPart[] = [{ type: 'text', text: prompt }];
  if (imageUris && imageUris.length > 0) {
    for (const uri of imageUris) {
      try {
        const { data, mime } = await uriToBase64(uri);
        parts.push({ type: 'inline_data', inline_data: { mime_type: mime, data } });
      } catch (e) {
        console.log('gemini image load failed', e);
      }
    }
  }
  const text = await callGemini({ contents: [{ role: 'user', parts }], generationConfig: { temperature: 0.6, maxOutputTokens: 512 } });
  return { text };
}

export type RankedItem = { id: string; score: number; reason: string };

export async function geminiRankEquipment(query: string, items: EquipmentItem[]): Promise<RankedItem[]> {
  const catalog = items
    .slice(0, 50)
    .map((it) => ({ id: it.id, name: it.name, category: it.category, description: it.description, specs: it.specifications?.map((s) => `${s.label}:${s.value}`).join(', ') ?? '' }))
    .map((o) => `- id:${o.id}; name:${o.name}; category:${o.category}; desc:${o.description}; specs:${o.specs}`)
    .join('\n');
  const prompt = `You are ranking rental gear for a user query. Consider semantic fit, use case, and specs. Respond ONLY with JSON array of {id, score, reason}. Query: "${query}". Catalog:\n${catalog}`;
  const { text } = await geminiGenerateText(prompt);
  try {
    const parsed = JSON.parse(text) as Array<{ id: string; score: number; reason?: string }>;
    const normalized = parsed
      .filter((x) => typeof x.id === 'string' && typeof x.score === 'number')
      .map((x) => ({ id: x.id, score: x.score, reason: x.reason ?? '' })) as RankedItem[];
    return normalized;
  } catch (e) {
    console.log('gemini rank parse error', e, text);
    return [];
  }
}

export type ListingEnhancement = {
  title: string;
  description: string;
  specs: Array<{ label: string; value: string }>;
  priceHint: string;
};

export async function geminiEnhanceListing(input: { keywords?: string; images?: string[]; locale?: string; currency?: string; comparableSamples?: Array<{ title: string; dailyRate: number }> }): Promise<ListingEnhancement> {
  const compText = (input.comparableSamples ?? [])
    .slice(0, 10)
    .map((c) => `${c.title} - ${c.dailyRate}`)
    .join('\n');
  const parts: GenerateContentPart[] = [
    {
      type: 'text',
      text: `Create a suggested listing with title, description, top 5 specs, and a fair price hint in ${input.currency ?? 'USD'}. Consider locale ${input.locale ?? 'en-US'}. Keywords: ${input.keywords ?? ''}. Comparables:\n${compText}. Respond as JSON {title, description, specs:[{label,value}], priceHint}.`,
    },
  ];
  if (input.images && input.images.length > 0) {
    for (const uri of input.images) {
      try {
        const { data, mime } = await uriToBase64(uri);
        parts.push({ type: 'inline_data', inline_data: { mime_type: mime, data } });
      } catch (e) {
        console.log('gemini image load failed', e);
      }
    }
  }
  const text = await callGemini({ contents: [{ role: 'user', parts }], generationConfig: { temperature: 0.5, maxOutputTokens: 600 } });
  try {
    const obj = JSON.parse(text) as ListingEnhancement;
    return {
      title: obj.title ?? '',
      description: obj.description ?? '',
      specs: Array.isArray(obj.specs) ? obj.specs.filter((s: any) => s && s.label && s.value).slice(0, 8) : [],
      priceHint: obj.priceHint ?? '',
    } as ListingEnhancement;
  } catch (e) {
    console.log('gemini enhance parse error', e, text);
    return { title: '', description: '', specs: [], priceHint: '' };
  }
}

export type ImageAnalysis = { typeGuess: string; modelGuess?: string; quality: 'ok' | 'blurry' | 'low_light'; tags: string[] };

export async function geminiAnalyzeImage(uri: string): Promise<ImageAnalysis> {
  const { data, mime } = await uriToBase64(uri);
  const parts: GenerateContentPart[] = [
    { type: 'text', text: 'Identify gear type and model if possible. Assess if photo is blurry or low light. Return JSON {typeGuess, modelGuess, quality:"ok|blurry|low_light", tags: string[] }.' },
    { type: 'inline_data', inline_data: { mime_type: mime, data } },
  ];
  const text = await callGemini({ contents: [{ role: 'user', parts }], generationConfig: { temperature: 0.2, maxOutputTokens: 200 } });
  try {
    const obj = JSON.parse(text) as ImageAnalysis;
    return obj;
  } catch (e) {
    console.log('gemini image analysis parse error', e, text);
    return { typeGuess: '', quality: 'ok', tags: [] } as ImageAnalysis;
  }
}
