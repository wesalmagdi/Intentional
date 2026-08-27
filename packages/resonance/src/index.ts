export interface NoteRef {
  id: string;
  kind: 'discovery' | 'journal';
  text: string;
  createdAt: string;
}

export interface ResonantMatch {
  note: NoteRef;
  score: number;
}

const DIM = 512;

const STOPWORDS = new Set([
  'the','a','an','and','or','but','if','then','than','so','too','very','of','to','in','on',
  'for','with','about','as','at','by','from','into','over','under','again','once','here',
  'there','all','any','both','each','few','more','most','other','some','such','only','own',
  'same','just','not','no','nor','yes','is','am','are','was','were','be','been','being',
  'have','has','had','having','do','does','did','doing','will','would','can','could',
  'shall','should','may','might','must','what','which','who','whom','this','that','these',
  'those','it','its','you','your','yours','i','me','my','mine','we','our','ours','they',
  'them','their','theirs','he','him','his','she','her','hers','how','why','when','where',
  'think','feel','want','need','know','like','get','got','make','made','thing','things',
]);

function stem(word: string): string {
  if (word.length > 5 && word.endsWith('ing')) return word.slice(0, -3);
  if (word.length > 4 && word.endsWith('ed')) return word.slice(0, -2);
  if (word.length > 4 && word.endsWith('ly')) return word.slice(0, -2);
  if (word.length > 3 && word.endsWith('s') && !word.endsWith('ss')) return word.slice(0, -1);
  return word;
}

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOPWORDS.has(w))
    .map(stem);
}

function hash(token: string): number {
  let h = 2166136261;
  for (let i = 0; i < token.length; i++) {
    h ^= token.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) % DIM;
}

export function embed(text: string): Float64Array {
  const vec = new Float64Array(DIM);
  for (const t of tokenize(text)) vec[hash(t)] += 1;
  let norm = 0;
  for (let i = 0; i < DIM; i++) norm += vec[i] * vec[i];
  norm = Math.sqrt(norm);
  if (norm > 0) for (let i = 0; i < DIM; i++) vec[i] /= norm;
  return vec;
}

export function similarity(a: Float64Array, b: Float64Array): number {
  let dot = 0;
  for (let i = 0; i < DIM; i++) dot += a[i] * b[i];
  return dot;
}

export function findResonant(
  query: string,
  notes: NoteRef[],
  options: { threshold?: number; excludeId?: string; limit?: number } = {}
): ResonantMatch[] {
  const { threshold = 0.12, excludeId, limit = 1 } = options;
  const q = embed(query);
  return notes
    .filter(n => n.id !== excludeId)
    .map(note => ({ note, score: similarity(q, embed(note.text)) }))
    .filter(m => m.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function keyConcepts(text: string, limit = 5): string[] {
  const counts = new Map<string, number>();
  for (const t of tokenize(text)) counts.set(t, (counts.get(t) ?? 0) + 1);
  return [...counts.entries()]
    .filter(([w]) => w.length > 3)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([w]) => w);
}

export function questionSeeds(text: string, title: string, limit = 3): string[] {
  const concepts = keyConcepts(text, 6);
  const templates = [
    (c: string) => `What does "${title}" really mean by "${c}"?`,
    (c: string) => `How does "${c}" connect to what you already know?`,
    (c: string) => `Where does the reading change your mind about "${c}"?`,
  ];
  const seeds: string[] = [];
  concepts.forEach((c, i) => seeds.push(templates[i % templates.length](c)));
  return seeds.slice(0, limit);
}
