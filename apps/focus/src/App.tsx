import { useEffect, useRef, useState } from 'react';

// ---------- store ----------
type Step = { id: string; text: string; done: boolean };
type Task = { id: string; listId: string; title: string; notes: string; due: string | null; important: boolean; myDay: boolean; done: boolean; steps: Step[]; createdAt: number; completedAt: number | null };
type List = { id: string; name: string; color: string };
type Discovery = { id: string; category: string; prompt: string; findings: Record<string, string>; sources?: string; folderName?: string; createdAt: string };
type Entry = { id: string; body: string; prompt?: string; createdAt: string };
type Tree = { id: string; minutes: number; species: string; plantedAt: number; dead: boolean };

const uid = () => String(Date.now() + Math.floor(Math.random() * 10000));
const today = () => new Date().toISOString().slice(0, 10);
function load<T>(k: string, f: T): T { try { const r = localStorage.getItem(k); return r ? (JSON.parse(r) as T) : f; } catch { return f; } }
function useStored<T>(k: string, init: T) {
  const [v, setV] = useState<T>(() => load(k, init));
  useEffect(() => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }, [k, v]);
  return [v, setV] as const;
}

const COLORS = ['#B0793F', '#5A7A5A', '#8A4A3E', '#7A6652', '#A08B73', '#59422C'];
const SPECIES = [
  { id: 'pine', name: 'Pine', cost: 0, color: '#5A7A5A' },
  { id: 'cherry', name: 'Cherry', cost: 60, color: '#C98BA5' },
  { id: 'oak', name: 'Oak', cost: 150, color: '#6B8F5A' },
  { id: 'birch', name: 'Birch', cost: 300, color: '#8FA3AD' },
];

const TOPIC_POOLS: Record<string, string[]> = {
  General: ['Why do we keep souvenirs?', 'What makes a room feel calm?', 'Why do we hum?', 'Why do queues form?', 'What is the oldest thing you own?'],
  Everyday: ['Who invented the sandwich?', 'Why is coffee the default ritual?', 'Where does the weekend go?', 'What makes comfort food comforting?'],
  Nature: ['How do birds know when to leave?', 'Why is the sea salty?', 'How do trees talk underground?', 'Where do butterflies winter?'],
  Objects: ['Who decided the shape of a fork?', 'Why do clocks go clockwise?', 'How did the mirror change us?', 'Why is paper still here?'],
  People: ['Why do we blush?', 'How did handshakes start?', 'Why do strangers help strangers?', 'How do accents form?'],
};
const DEEP_POOLS: Record<string, string[]> = {
  Society: ['Why do civilizations collapse?', 'What makes a society trust itself?', 'Why does inequality keep returning?'],
  Mind: ['Why do we dream?', 'Is attention the same as thought?', 'Why does time feel faster as we age?'],
  Time: ['What did the printing press change quietly?', 'Which ideas spread faster than armies?', 'What will this decade be remembered for?'],
  Meaning: ['What makes work feel meaningful?', 'Why do we keep old letters?', 'What is a quiet life worth?'],
};
const JOURNAL_PROMPTS = ['What have you been thinking about lately that you haven\'t said out loud?', 'What did you feel today that you usually skip past?', 'What are you carrying that isn\'t yours to carry?', 'What small thing went unnoticed today?'];

let tickCtx: AudioContext | null = null;
function tick() {
  try {
    tickCtx = tickCtx ?? new AudioContext();
    const o = tickCtx.createOscillator(); const g = tickCtx.createGain();
    o.frequency.value = 900;
    g.gain.setValueAtTime(0.1, tickCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, tickCtx.currentTime + 0.05);
    o.connect(g); g.connect(tickCtx.destination); o.start(); o.stop(tickCtx.currentTime + 0.06);
  } catch {}
}
function chime() {
  try {
    tickCtx = tickCtx ?? new AudioContext();
    const note = (f: number, at: number) => {
      const o = tickCtx!.createOscillator(); const g = tickCtx!.createGain();
      o.type = 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, tickCtx!.currentTime + at);
      g.gain.exponentialRampToValueAtTime(0.18, tickCtx!.currentTime + at + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, tickCtx!.currentTime + at + 0.6);
      o.connect(g); g.connect(tickCtx!.destination); o.start(tickCtx!.currentTime + at); o.stop(tickCtx!.currentTime + at + 0.7);
    };
    note(660, 0); note(880, 0.18);
  } catch {}
}

function TreeSVG({ sp, g, dead, size = 64 }: { sp: string; g: number; dead?: boolean; size?: number }) {
  const s = SPECIES.find(x => x.id === sp) ?? SPECIES[0];
  const c = dead ? '#A39E93' : s.color;
  const h = 12 + 34 * g;
  const top = 62 - h;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64">
      <rect x={30} y={top} width={4} height={h} rx={2} fill={dead ? '#8B8377' : '#7A6652'} transform={dead ? 'rotate(6 32 62)' : undefined} />
      {s.id === 'pine'
        ? <polygon points={`32,${top - 16 * g - 4} ${32 - 6 - 10 * g},${top + 10} ${32 + 6 + 10 * g},${top + 10}`} fill={c} opacity={dead ? 0.5 : 1} />
        : s.id === 'cherry'
          ? <circle cx={32} cy={top - 6 * g - 2} r={5 + 9 * g} fill={c} opacity={dead ? 0.5 : 1} />
          : <ellipse cx={32} cy={top - 6 * g - 2} rx={7 + 9 * g} ry={5 + 8 * g} fill={c} opacity={dead ? 0.5 : 1} />}
    </svg>
  );
}

// ---------- Focus (Forest + To-Do) ----------
function FocusView() {
  const [lists, setLists] = useStored<List[]>('it.lists', [{ id: 'inbox', name: 'Inbox', color: COLORS[0] }]);
  const [tasks, setTasks] = useStored<Task[]>('it.tasks', []);
  const [trees, setTrees] = useStored<Tree[]>('it.trees', []);
  const [coins, setCoins] = useStored<number>('it.coins', 0);
  const [view, setView] = useState<'myday' | 'important' | 'planned' | 'all' | 'done' | string>('myday');
  const [search, setSearch] = useState('');
  const [newList, setNewList] = useState('');
  const [newTask, setNewTask] = useState('');
  const [openTask, setOpenTask] = useState<string | null>(null);
  const [newStep, setNewStep] = useState('');

  const [species, setSpecies] = useState('pine');
  const [mins, setMins] = useState(25);
  const [custom, setCustom] = useState('');
  const [session, setSession] = useState<{ left: number; total: number; species: string } | null>(null);
  const sRef = useRef(session); sRef.current = session;

  useEffect(() => {
    if (!session) return;
    const t = window.setInterval(() => {
      setSession(s => {
        if (!s) return null;
        if (s.left <= 1) {
          setTrees(tr => [...tr, { id: uid(), minutes: Math.round(s.total / 60), species: s.species, plantedAt: Date.now(), dead: false }]);
          setCoins(c => c + Math.round(s.total / 60));
          chime();
          return null;
        }
        return { ...s, left: s.left - 1 };
      });
    }, 1000);
    return () => window.clearInterval(t);
  }, [session !== null]); // eslint-disable-line react-hooks/exhaustive-deps

  function plant() {
    if (session) return;
    setSession({ left: mins * 60, total: mins * 60, species });
  }
  function giveUp() {
    const s = sRef.current;
    if (!s) return;
    setTrees(tr => [...tr, { id: uid(), minutes: Math.round(s.total / 60), species: s.species, plantedAt: Date.now(), dead: true }]);
    setSession(null);
  }

  const q = search.toLowerCase();
  const match = (t: Task) => !q || t.title.toLowerCase().includes(q) || t.notes.toLowerCase().includes(q);
  const open = tasks.filter(t => !t.done && match(t));
  const visible: Task[] =
    view === 'myday' ? open.filter(t => t.myDay)
    : view === 'important' ? open.filter(t => t.important)
    : view === 'planned' ? open.filter(t => t.due).sort((a, b) => (a.due! < b.due! ? -1 : 1))
    : view === 'all' ? open
    : view === 'done' ? tasks.filter(t => t.done && match(t))
    : open.filter(t => t.listId === view);

  const patch = (id: string, p: Partial<Task>) => setTasks(ts => ts.map(t => t.id === id ? { ...t, ...p } : t));
  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    const listId = lists.some(l => l.id === view) ? view : 'inbox';
    setTasks(ts => [{ id: uid(), listId, title: newTask.trim(), notes: '', due: null, important: false, myDay: view === 'myday', done: false, steps: [], createdAt: Date.now(), completedAt: null }, ...ts]);
    setNewTask('');
  };
  const addList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newList.trim()) return;
    setLists(ls => [...ls, { id: uid(), name: newList.trim(), color: COLORS[ls.length % COLORS.length] }]);
    setNewList('');
  };

  const mm = String(Math.floor((session?.left ?? 0) / 60)).padStart(2, '0');
  const ss = String((session?.left ?? 0) % 60).padStart(2, '0');
  const growth = session ? 1 - session.left / session.total : 1;
  const alive = trees.filter(t => !t.dead);
  const deadN = trees.length - alive.length;

  return (
    <div className="focusWrap">
      <div className="timerCard card">
        {!session ? (
          <>
            <div className="row1">
              <span className="eyebrow">PLANT A TREE</span>
              <span className="coins">{coins} coins</span>
            </div>
            <div className="speciesRow">
              {SPECIES.map(s => (
                <button key={s.id} className={`spBtn ${species === s.id ? 'on' : ''} ${coins < s.cost ? 'locked' : ''}`} disabled={coins < s.cost}
                  onClick={() => setSpecies(s.id)} title={coins < s.cost ? `Unlocks at ${s.cost} coins` : s.name}>
                  <TreeSVG sp={s.id} g={1} size={34} />
                  <span>{coins < s.cost ? `${s.cost}` : s.name}</span>
                </button>
              ))}
            </div>
            <div className="minRow">
              {[15, 25, 50, 90].map(p => <button key={p} className={`chip ${mins === p ? 'on' : ''}`} onClick={() => setMins(p)}>{p}</button>)}
              <input className="customInput" type="number" placeholder="Any minutes" value={custom} onChange={e => setCustom(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { const m = parseInt(custom, 10); if (m > 0 && m < 600) { setMins(m); setCustom(''); } } }} />
            </div>
            <button className="btn plant" onClick={plant}>Plant and focus · {mins} min</button>
            <div className="forestMini">
              {trees.slice(-10).map(t => <TreeSVG key={t.id} sp={t.species} g={1} dead={t.dead} size={30} />)}
            </div>
            <p className="hint">{alive.length} trees grown · {deadN} withered</p>
          </>
        ) : (
          <div className="growing">
            <TreeSVG sp={session.species} g={growth} size={120} />
            <div className="growClock">{mm}:{ss}</div>
            <p className="hint">Stay. Your tree is growing.</p>
            <button className="btn ghost danger" onClick={giveUp}>Give up (tree dies)</button>
          </div>
        )}
      </div>

      <div className="todoWrap">
        <aside className="rail card">
          {([['myday', 'My Day'], ['important', 'Important'], ['planned', 'Planned'], ['all', 'All Tasks'], ['done', 'Completed']] as [string, string][]).map(([id, label]) => (
            <button key={id} className={`railBtn ${view === id ? 'on' : ''}`} onClick={() => setView(id)}>{label}</button>
          ))}
          <div className="railLabel">LISTS</div>
          {lists.map(l => (
            <button key={l.id} className={`railBtn ${view === l.id ? 'on' : ''}`} onClick={() => setView(l.id)}>
              <span className="dot" style={{ backgroundColor: l.color }} />{l.name}
            </button>
          ))}
          <form onSubmit={addList} className="railAdd"><input placeholder="New list..." value={newList} onChange={e => setNewList(e.target.value)} /></form>
        </aside>

        <section className="tasks card">
          <div className="row1">
            <span className="viewTitle">{view === 'myday' ? 'My Day' : view === 'important' ? 'Important' : view === 'planned' ? 'Planned' : view === 'all' ? 'All Tasks' : view === 'done' ? 'Completed' : lists.find(l => l.id === view)?.name}</span>
            <input className="search" placeholder="Search tasks..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {view !== 'done' && (
            <form className="addRow" onSubmit={addTask}>
              <input placeholder="Add a task..." value={newTask} onChange={e => setNewTask(e.target.value)} />
              <button className="btn" type="submit">Add</button>
            </form>
          )}
          {visible.length === 0 && <p className="hint">Nothing here.</p>}
          {visible.map(t => (
            <div key={t.id} className={`tItem ${t.done ? 'done' : ''}`}>
              <div className="tRow">
                <button className="check" onClick={() => patch(t.id, { done: !t.done, completedAt: t.done ? null : Date.now() })} />
                <span className="tTitle" onClick={() => setOpenTask(openTask === t.id ? null : t.id)}>{t.title}</span>
                {t.due && <span className={`due ${t.due < today() && !t.done ? 'over' : ''}`}>{t.due.slice(5)}</span>}
                {t.steps.length > 0 && <span className="stepsBadge">{t.steps.filter(s => s.done).length}/{t.steps.length}</span>}
                <button className={`starBtn ${t.important ? 'on' : ''}`} onClick={() => patch(t.id, { important: !t.important })}>★</button>
                <button className={`sunBtn ${t.myDay ? 'on' : ''}`} title="My Day" onClick={() => patch(t.id, { myDay: !t.myDay })}>☀</button>
              </div>
              {openTask === t.id && (
                <div className="tExpand">
                  <textarea placeholder="Notes..." value={t.notes} onChange={e => patch(t.id, { notes: e.target.value })} />
                  <div className="tMeta">
                    <label>Due <input type="date" value={t.due ?? ''} onChange={e => patch(t.id, { due: e.target.value || null })} /></label>
                    <button className="btn ghost small" onClick={() => setTasks(ts => ts.filter(x => x.id !== t.id))}>Delete</button>
                  </div>
                  <div className="stepsList">
                    {t.steps.map(s => (
                      <div key={s.id} className="stepRow">
                        <button className={`check tiny ${s.done ? 'filled' : ''}`} onClick={() => patch(t.id, { steps: t.steps.map(x => x.id === s.id ? { ...x, done: !x.done } : x) })} />
                        <span className={s.done ? 'stepDone' : ''}>{s.text}</span>
                      </div>
                    ))}
                    <form className="stepAdd" onSubmit={e => { e.preventDefault(); if (!newStep.trim()) return; patch(t.id, { steps: [...t.steps, { id: uid(), text: newStep.trim(), done: false }] }); setNewStep(''); }}>
                      <input placeholder="Add a step..." value={newStep} onChange={e => setNewStep(e.target.value)} />
                    </form>
                  </div>
                </div>
              )}
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

// ---------- Learn ----------
function LearnView({ onBegin }: { onBegin: (p: string, c: string) => void }) {
  const [mode, setMode] = useState<'topics' | 'deep' | 'own'>('topics');
  const tKeys = Object.keys(TOPIC_POOLS); const dKeys = Object.keys(DEEP_POOLS);
  const [tCat, setTCat] = useState(tKeys[0]); const [dCat, setDCat] = useState(dKeys[0]);
  const [card, setCard] = useState<string | null>(null);
  const [spinTxt, setSpinTxt] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [own, setOwn] = useState('');
  const keys = mode === 'deep' ? dKeys : tKeys;
  const cat = mode === 'deep' ? dCat : tCat;
  const pool = (mode === 'deep' ? DEEP_POOLS[dCat] : TOPIC_POOLS[tCat]) ?? [];

  function spin() {
    if (spinning || pool.length === 0) return;
    setSpinning(true);
    let cycle = 0;
    const doCycle = () => {
      setSpinTxt(pool[Math.floor(Math.random() * pool.length)]);
      tick();
      cycle++;
      if (cycle >= 16) { setSpinTxt(null); setCard(pool[Math.floor(Math.random() * pool.length)]); setSpinning(false); return; }
      window.setTimeout(doCycle, 25 + Math.pow(cycle, 1.8) * 8);
    };
    doCycle();
  }

  return (
    <div className="narrow">
      <h1 className="pageTitle">Learn</h1>
      <div className="tabs">
        {([['topics', 'Topics'], ['deep', 'Deep'], ['own', 'My own']] as ['topics' | 'deep' | 'own', string][]).map(([m, l]) => (
          <button key={m} className={`tab ${mode === m ? 'on' : ''}`} onClick={() => { setMode(m); setCard(null); }}>{l}</button>
        ))}
      </div>
      {mode !== 'own' ? (
        <>
          <p className="modeDesc">{mode === 'topics' ? 'Light curiosities. Follow the pull.' : 'Big questions. Honest search.'}</p>
          <div className="chips">{keys.map(k => <button key={k} className={`chip ${cat === k ? 'on' : ''}`} onClick={() => { if (mode === 'deep') setDCat(k); else setTCat(k); setCard(null); }}>{k}</button>)}</div>
          <div className="spinCard">
            <span className="eyebrow">{cat.toUpperCase()}</span>
            <p className="spinText">{spinning ? spinTxt : (card ?? 'Ready.')}</p>
          </div>
          <div className="btnRow">
            <button className="btn ghost" onClick={spin} disabled={spinning}>{spinning ? 'Spinning' : 'Spin'}</button>
            <button className="btn" disabled={!card} onClick={() => card && onBegin(card, cat)}>Begin 10 minutes</button>
          </div>
        </>
      ) : (
        <>
          <p className="modeDesc">You bring the question.</p>
          <textarea className="bigInput" placeholder="Ask a question..." value={own} onChange={e => setOwn(e.target.value)} />
          <div className="btnRow"><button className="btn" disabled={!own.trim()} onClick={() => onBegin(own.trim(), 'Curiosity')}>Begin 10 minutes</button></div>
        </>
      )}
    </div>
  );
}

function ChallengeView({ prompt, category, onDone }: { prompt: string; category: string; onDone: () => void }) {
  const [left, setLeft] = useState(600);
  const [running, setRunning] = useState(true);
  useEffect(() => {
    if (!running) return;
    const t = window.setInterval(() => setLeft(l => { if (l <= 1) { setRunning(false); onDone(); return 0; } return l - 1; }), 1000);
    return () => window.clearInterval(t);
  }, [running]); // eslint-disable-line react-hooks/exhaustive-deps
  const C = 2 * Math.PI * 108;
  const prog = (600 - left) / 600;
  return (
    <div className="darkView">
      <span className="eyebrow light">LEARN</span>
      <h2 className="darkTitle">{prompt}</h2>
      <div className="ringWrap">
        <svg width={250} height={250} viewBox="0 0 250 250">
          <circle cx={125} cy={125} r={108} stroke="#2E2820" strokeWidth={5} fill="none" />
          <circle cx={125} cy={125} r={108} stroke="#C89B6A" strokeWidth={5} fill="none" strokeDasharray={`${C}`} strokeDashoffset={C * (1 - prog)} strokeLinecap="round" transform="rotate(-90 125 125)" />
        </svg>
        <div className="ringCenter">
          <div className="ringTime">{String(Math.floor(left / 60)).padStart(2, '0')}:{String(left % 60).padStart(2, '0')}</div>
          <div className="ringSub">remaining</div>
        </div>
      </div>
      <p className="darkCopy">Search. Read. Think.<br />Go find out for yourself.</p>
      <div className="btnRow center">
        <button className="btn ghost light" onClick={() => setRunning(r => !r)}>{running ? 'Pause' : 'Resume'}</button>
        <button className="btn ghost light" onClick={onDone}>Finish early</button>
      </div>
      <span className="hiddenCat">{category}</span>
    </div>
  );
}

function ReflectView({ prompt, category, onSaved }: { prompt: string; category: string; onSaved: (d: Discovery) => void }) {
  const [learned, setLearned] = useState('');
  const [surprised, setSurprised] = useState('');
  const [changed, setChanged] = useState('');
  const [sources, setSources] = useState('');
  const [folder, setFolder] = useState('');
  function save() {
    if (!learned.trim()) return;
    onSaved({ id: uid(), category, prompt, findings: { learned, surprised, changed }, sources: sources || undefined, folderName: folder || undefined, createdAt: new Date().toISOString() });
  }
  return (
    <div className="narrow">
      <h1 className="pageTitle">Capture what you discovered.</h1>
      <label className="fld">What did you learn?<textarea value={learned} onChange={e => setLearned(e.target.value)} placeholder="Start writing..." /></label>
      <label className="fld">What surprised you?<input value={surprised} onChange={e => setSurprised(e.target.value)} placeholder="Optional" /></label>
      <label className="fld">Did anything change your thinking?<input value={changed} onChange={e => setChanged(e.target.value)} placeholder="Optional" /></label>
      <label className="fld">Sources<input value={sources} onChange={e => setSources(e.target.value)} placeholder="Book, article, conversation..." /></label>
      <label className="fld">Folder<input value={folder} onChange={e => setFolder(e.target.value)} placeholder="Where should this live?" /></label>
      <div className="btnRow"><button className="btn" onClick={save}>Save</button></div>
    </div>
  );
}

// ---------- Journal ----------
function JournalView() {
  const [entries, setEntries] = useStored<Entry[]>('it.journal', []);
  const [text, setText] = useState('');
  const [prompt, setPrompt] = useState<string | null>(null);
  const [viewing, setViewing] = useState<Entry | null>(null);
  function keep() {
    if (!text.trim()) return;
    setEntries(es => [{ id: uid(), body: text.trim(), prompt: prompt ?? undefined, createdAt: new Date().toISOString() }, ...es]);
    setText(''); setPrompt(null);
  }
  if (viewing) return (
    <div className="narrow">
      <button className="linkBtn" onClick={() => setViewing(null)}>Back to Journal</button>
      <span className="eyebrow">{new Date(viewing.createdAt).toLocaleDateString()}</span>
      {viewing.prompt && <p className="jPrompt">{viewing.prompt}</p>}
      <p className="jBody">{viewing.body}</p>
    </div>
  );
  return (
    <div className="narrow">
      <h1 className="pageTitle">Journal</h1>
      {prompt && <p className="jPrompt">{prompt}</p>}
      <textarea className="bigInput tall" placeholder="Start writing..." value={text} onChange={e => setText(e.target.value)} />
      <div className="btnRow">
        <button className="btn" onClick={keep}>Keep</button>
        <button className="btn ghost" onClick={() => setPrompt(JOURNAL_PROMPTS[Math.floor(Math.random() * JOURNAL_PROMPTS.length)])}>Give me a question</button>
      </div>
      {entries.map(e => (
        <button key={e.id} className="entryRow" onClick={() => setViewing(e)}>
          <span className="entryDate">{new Date(e.createdAt).toLocaleDateString()}</span>
          <span className="entrySnippet">{e.body.slice(0, 80)}</span>
        </button>
      ))}
    </div>
  );
}

// ---------- Notice ----------
function NoticeView({ onKeep }: { onKeep: (d: Discovery) => void }) {
  const [phase, setPhase] = useState<'arrive' | 'wait' | 'write'>('arrive');
  const [text, setText] = useState('');
  const [label, setLabel] = useState('Settle in.');
  const [left60, setLeft60] = useState(60);
  const scaleRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [hasAudio, setHasAudio] = useState(true);

  useEffect(() => {
    if (phase !== 'arrive') return;
    const a = new Audio('/breathguide.wav');
    audioRef.current = a;
    a.play().catch(() => setHasAudio(false));
    const t = window.setInterval(() => {
      const cur = hasAudio && !a.paused ? a.currentTime : (Date.now() / 1000) % 600;
      if (cur < 8) { setLabel('Settle in.'); }
      else if (cur >= 589) { setLabel('Well done.'); }
      else {
        const m = (cur - 8) % 14;
        if (m < 4) { setLabel('Breathe in.'); scaleRef.current?.style.setProperty('transform', `scale(${1 + 0.4 * (m / 4)})`); }
        else if (m < 8) { setLabel('Hold.'); scaleRef.current?.style.setProperty('transform', 'scale(1.4)'); }
        else { setLabel('Let it go.'); scaleRef.current?.style.setProperty('transform', `scale(${1.4 - 0.4 * ((m - 8) / 6)})`); }
      }
      if (a.duration && cur >= a.duration - 0.5) { a.pause(); setPhase('wait'); }
    }, 100);
    return () => { window.clearInterval(t); a.pause(); };
  }, [phase, hasAudio]);

  useEffect(() => {
    if (phase !== 'wait') return;
    const t = window.setInterval(() => setLeft60(l => { if (l <= 1) { window.clearInterval(t); setPhase('write'); return 0; } return l - 1; }), 1000);
    return () => window.clearInterval(t);
  }, [phase]);

  if (phase === 'write') return (
    <div className="narrow">
      <h1 className="pageTitle">What do you notice right now?</h1>
      <textarea className="bigInput" placeholder="One line is enough." value={text} onChange={e => setText(e.target.value)} />
      <div className="btnRow"><button className="btn" onClick={() => { if (text.trim()) onKeep({ id: uid(), category: 'Notice', prompt: 'What do you notice right now?', findings: { noticed: text.trim() }, createdAt: new Date().toISOString() }); }}>Keep this.</button></div>
    </div>
  );
  if (phase === 'wait') return (
    <div className="narrow centerCol">
      <span className="eyebrow">NOTICE</span>
      <h1 className="pageTitle">Look up.</h1>
      <p className="modeDesc">For one minute, just notice.</p>
      <div className="waitNum">{left60}</div>
      <button className="linkBtn" onClick={() => setPhase('write')}>I'm ready</button>
    </div>
  );
  return (
    <div className="narrow centerCol">
      <span className="eyebrow">NOTICE</span>
      <h1 className="pageTitle">Arrive first.</h1>
      <div className="breathOuter"><div ref={scaleRef} className="breathCircle" /></div>
      <p className="modeDesc">{label}</p>
      <button className="linkBtn" onClick={() => { audioRef.current?.pause(); setPhase('wait'); }}>I'm here already</button>
    </div>
  );
}

// ---------- Choose / ZoomOut ----------
function ChooseView({ onKeep }: { onKeep: (d: Discovery) => void }) {
  const [more, setMore] = useState(''); const [less, setLess] = useState('');
  function save() {
    if (!more.trim() && !less.trim()) return;
    onKeep({ id: uid(), category: 'Choose', prompt: 'What deserves your attention today?', findings: { attention: more.trim(), setdown: less.trim() }, createdAt: new Date().toISOString() });
    setMore(''); setLess('');
  }
  return (
    <div className="narrow">
      <h1 className="pageTitle">Attention is a choice.</h1>
      <label className="fld">What deserves more of you?<textarea value={more} onChange={e => setMore(e.target.value)} /></label>
      <label className="fld">What deserves less of you?<textarea value={less} onChange={e => setLess(e.target.value)} /></label>
      <div className="btnRow"><button className="btn" onClick={save}>Keep this.</button></div>
    </div>
  );
}

function ZoomView({ discoveries, onKeep }: { discoveries: Discovery[]; onKeep: (d: Discovery) => void }) {
  const subj = discoveries[0];
  const [part, setPart] = useState(''); const [connect, setConnect] = useState('');
  if (!subj) return <div className="narrow"><h1 className="pageTitle">Zoom out.</h1><p className="modeDesc">Finish a Learn challenge first.</p></div>;
  function save() {
    if (!part.trim() && !connect.trim()) return;
    onKeep({ id: uid(), category: 'Zoom Out', prompt: subj!.prompt, findings: { part: part.trim(), connect: connect.trim() }, createdAt: new Date().toISOString() });
  }
  return (
    <div className="narrow">
      <span className="eyebrow">RECENTLY KEPT</span>
      <h1 className="pageTitle">"{subj.prompt}"</h1>
      <label className="fld">What is this part of?<textarea value={part} onChange={e => setPart(e.target.value)} /></label>
      <label className="fld">How does it connect to the rest of your life?<textarea value={connect} onChange={e => setConnect(e.target.value)} /></label>
      <div className="btnRow"><button className="btn" onClick={save}>Keep this.</button></div>
    </div>
  );
}

// ---------- Library / Revisit ----------
function LibraryView({ discoveries }: { discoveries: Discovery[] }) {
  const [filter, setFilter] = useState('All');
  const [sel, setSel] = useState<Discovery | null>(null);
  const shelves = ['All', ...Array.from(new Set(discoveries.map(d => d.folderName || d.category)))];
  const visible = filter === 'All' ? discoveries : discoveries.filter(d => (d.folderName || d.category) === filter);
  if (sel) return (
    <div className="narrow">
      <button className="linkBtn" onClick={() => setSel(null)}>Back to Library</button>
      <span className="eyebrow">{sel.folderName || sel.category}</span>
      <h1 className="pageTitle">{sel.prompt}</h1>
      {Object.entries(sel.findings).filter(([, v]) => v && v.trim()).map(([k, v]) => (
        <div key={k} className="libSection"><span className="libLabel">{k.toUpperCase()}</span><p className="libBody">{v}</p></div>
      ))}
      {sel.sources && <p className="libSources">Sources: {sel.sources}</p>}
    </div>
  );
  return (
    <div className="narrow">
      <h1 className="pageTitle">Library</h1>
      <div className="chips">{shelves.map(s => <button key={s} className={`chip ${filter === s ? 'on' : ''}`} onClick={() => setFilter(s)}>{s}</button>)}</div>
      {visible.length === 0 && <p className="hint">Nothing kept yet.</p>}
      {visible.map(d => (
        <button key={d.id} className="libCard" onClick={() => setSel(d)}>
          <span className="eyebrow">{d.folderName || d.category}</span>
          <p className="libPrompt">"{d.prompt}"</p>
          <span className="libDate">{new Date(d.createdAt).toLocaleDateString()}</span>
        </button>
      ))}
    </div>
  );
}

function RevisitView({ discoveries, onKeep }: { discoveries: Discovery[]; onKeep: (d: Discovery) => void }) {
  const ripe = discoveries.find(d => Date.now() - new Date(d.createdAt).getTime() > 3 * 86400000);
  const [memory, setMemory] = useState('');
  const [now, setNow] = useState('');
  const [revealed, setRevealed] = useState(false);
  if (!ripe) return <div className="narrow centerCol"><h1 className="pageTitle">Nothing is ready yet.</h1><p className="modeDesc">Discoveries ripen for a few days.</p></div>;
  const original = Object.values(ripe.findings).filter(v => v && v.trim()).join('\n\n');
  function done() {
    onKeep({ id: uid(), category: 'Revisit', prompt: ripe!.prompt, findings: { remembered: memory.trim(), now: now.trim() }, createdAt: new Date().toISOString() });
  }
  return (
    <div className="narrow">
      <span className="eyebrow">YOU EXPLORED THIS {new Date(ripe.createdAt).toLocaleDateString()}</span>
      <h1 className="pageTitle">{ripe.prompt}</h1>
      {!revealed ? (
        <>
          <label className="fld">What do you remember?<textarea value={memory} onChange={e => setMemory(e.target.value)} placeholder="Write what you recall..." /></label>
          <div className="btnRow"><button className="btn dark" onClick={() => setRevealed(true)}>Reveal my old notes</button></div>
        </>
      ) : (
        <>
          <div className="oldCard"><p className="libBody">{original || '...'}</p></div>
          <label className="fld">What do you think now?<textarea value={now} onChange={e => setNow(e.target.value)} /></label>
          <div className="btnRow"><button className="btn" onClick={done}>Done</button></div>
        </>
      )}
    </div>
  );
}

// ---------- App shell ----------
export default function App() {
  const [nav, setNav] = useState<string>('home');
  const [challenge, setChallenge] = useState<{ prompt: string; category: string } | null>(null);
  const [reflect, setReflect] = useState<{ prompt: string; category: string } | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);
  const [discoveries, setDiscoveries] = useStored<Discovery[]>('it.discoveries', []);

  const addDiscovery = (d: Discovery) => {
    setDiscoveries(ds => [d, ...ds]);
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 2500);
  };

  const dateLabel = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="shell">
      <aside className="side">
        <span className="sideBrand">Intentional</span>
        {([['home', 'Home'], ['focus', 'Focus'], ['learn', 'Learn'], ['journal', 'Journal'], ['notice', 'Notice'], ['choose', 'Choose'], ['zoom', 'Zoom Out'], ['library', 'Library'], ['revisit', 'Revisit']] as [string, string][]).map(([id, label]) => (
          <button key={id} className={`sideBtn ${nav === id ? 'on' : ''}`} onClick={() => { setNav(id); setChallenge(null); setReflect(null); }}>{label}</button>
        ))}
      </aside>
      <main className="main">
        {savedFlash && <div className="flash">Kept.</div>}
        {nav === 'home' && (
          <div className="narrow">
            <span className="eyebrow">{dateLabel.toUpperCase()}</span>
            <h1 className="pageTitle">A quiet place to begin.</h1>
            <div className="homeGrid">
              {([['focus', 'Focus', 'Plant a tree. Do the work.'], ['learn', 'Learn', 'A 10-minute search for what matters.'], ['journal', 'Journal', 'Think without performing.'], ['notice', 'Notice', 'One quiet minute.'], ['choose', 'Choose', 'Attention is a choice.'], ['zoom', 'Zoom Out', 'See it from further away.'], ['library', 'Library', 'What you have kept.'], ['revisit', 'Revisit', 'Meet your old mind.']] as [string, string, string][]).map(([id, t, s]) => (
                <button key={id} className="homeCard" onClick={() => setNav(id)}>
                  <span className="homeTitle">{t}</span>
                  <span className="homeSub">{s}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        {nav === 'focus' && <FocusView />}
        {nav === 'learn' && !challenge && !reflect && <LearnView onBegin={(p, c) => setChallenge({ prompt: p, category: c })} />}
        {challenge && <ChallengeView prompt={challenge.prompt} category={challenge.category} onDone={() => { setReflect(challenge); setChallenge(null); }} />}
        {reflect && <ReflectView prompt={reflect.prompt} category={reflect.category} onSaved={d => { addDiscovery(d); setReflect(null); setNav('library'); }} />}
        {nav === 'journal' && <JournalView />}
        {nav === 'notice' && <NoticeView onKeep={addDiscovery} />}
        {nav === 'choose' && <ChooseView onKeep={addDiscovery} />}
        {nav === 'zoom' && <ZoomView discoveries={discoveries} onKeep={addDiscovery} />}
        {nav === 'library' && <LibraryView discoveries={discoveries} />}
        {nav === 'revisit' && <RevisitView discoveries={discoveries} onKeep={addDiscovery} />}
      </main>
    </div>
  );
}
