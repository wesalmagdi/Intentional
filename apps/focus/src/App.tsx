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
function hashN(s: string) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); }
const fmtT = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

function HeroTree({ sp, growth, size = 150, dead }: { sp: string; growth: number; size?: number; dead?: boolean }) {
  const s = SPECIES.find(x => x.id === sp) ?? SPECIES[0];
  const c = dead ? '#A39E93' : s.color;
  const g = Math.max(0.14, growth);
  const top = 92 - 52 * g;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={dead ? 'treeDead' : 'treeSway'}>
      <ellipse cx={50} cy={93} rx={24} ry={4} fill="rgba(0,0,0,0.25)" />
      <path d={`M48 92 C48 ${92 - 30 * g} 49 ${top + 8} 50 ${top} L52 ${top} C52 ${top + 8} 52 ${92 - 30 * g} 52 92 Z`} fill={dead ? '#8B8377' : '#7A6652'} />
      {s.id === 'pine' ? (
        <g>
          <polygon points={`50,${92 - 80 * g} ${50 - 18 * g},${92 - 44 * g} ${50 + 18 * g},${92 - 44 * g}`} fill={c} />
          <polygon points={`50,${92 - 66 * g} ${50 - 24 * g},${92 - 28 * g} ${50 + 24 * g},${92 - 28 * g}`} fill={c} opacity={0.85} />
        </g>
      ) : s.id === 'cherry' ? (
        <g>
          <circle cx={50} cy={92 - 64 * g} r={15 * g} fill={c} />
          <circle cx={38} cy={92 - 50 * g} r={11 * g} fill={c} opacity={0.85} />
          <circle cx={62} cy={92 - 50 * g} r={11 * g} fill={c} opacity={0.85} />
        </g>
      ) : s.id === 'oak' ? (
        <g>
          <ellipse cx={50} cy={92 - 60 * g} rx={22 * g} ry={17 * g} fill={c} />
          <ellipse cx={35} cy={92 - 46 * g} rx={12 * g} ry={10 * g} fill={c} opacity={0.85} />
          <ellipse cx={65} cy={92 - 46 * g} rx={12 * g} ry={10 * g} fill={c} opacity={0.85} />
        </g>
      ) : (
        <ellipse cx={50} cy={92 - 62 * g} rx={14 * g} ry={20 * g} fill={c} />
      )}
    </svg>
  );
}

// ----- Codeforces-style progress -----
type Prog = { at: number; rating: number; delta: number; dead: boolean; minutes: number; species: string };
const RANKS: [number, string, string][] = [
  [0, 'Seed', '#8B8377'], [100, 'Sprout', '#8FCB8B'], [250, 'Sapling', '#5FA46B'],
  [500, 'Grove', '#6BA8C9'], [900, 'Forest Keeper', '#9A7FD1'], [1400, 'Elderwood', '#E3A95C'], [2000, 'Ancient Forest', '#E08573'],
];
function rankOf(r: number): [number, string, string] { let cur = RANKS[0]; for (const rk of RANKS) if (r >= rk[0]) cur = rk; return cur; }
function computeProg(trees: Tree[]) {
  const sorted = [...trees].sort((a, b) => a.plantedAt - b.plantedAt);
  let r = 0, max = 0;
  const hist: Prog[] = sorted.map(t => {
    const delta = t.dead ? -Math.max(5, Math.round(t.minutes / 6)) : Math.round(t.minutes / 5);
    r = Math.max(0, r + delta);
    max = Math.max(max, r);
    return { at: t.plantedAt, rating: r, delta, dead: t.dead, minutes: t.minutes, species: t.species };
  });
  return { hist, current: r, max };
}

function RatingGraph({ hist }: { hist: Prog[] }) {
  if (hist.length < 2) return <p className="hint">Grow a few trees to draw your rating curve.</p>;
  const W = 560, H = 180, P = 22;
  const rs = hist.map(h => h.rating);
  const min = Math.min(...rs), max = Math.max(...rs);
  const x = (i: number) => P + (i * (W - 2 * P)) / (hist.length - 1);
  const y = (v: number) => (max === min ? H / 2 : H - P - ((v - min) * (H - 2 * P)) / (max - min));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="rGraph">
      {[0.25, 0.5, 0.75].map(f => <line key={f} x1={P} x2={W - P} y1={P + f * (H - 2 * P)} y2={P + f * (H - 2 * P)} stroke="rgba(255,255,255,0.06)" />)}
      <polyline points={hist.map((h, i) => `${x(i)},${y(h.rating)}`).join(' ')} fill="none" stroke="rgba(227,169,92,0.75)" strokeWidth={2} />
      {hist.map((h, i) => <circle key={i} cx={x(i)} cy={y(h.rating)} r={4} fill={rankOf(h.rating)[2]} stroke="#0B120E" strokeWidth={1.5} />)}
      <text x={4} y={y(max) + 4} className="gLabel">{max}</text>
      <text x={4} y={y(min) + 4} className="gLabel">{min}</text>
    </svg>
  );
}

function Heatmap({ trees }: { trees: Tree[] }) {
  const days = 105;
  const per = new Map<string, number>();
  trees.filter(t => !t.dead).forEach(t => { const k = new Date(t.plantedAt).toISOString().slice(0, 10); per.set(k, (per.get(k) ?? 0) + t.minutes); });
  const start = new Date(); start.setDate(start.getDate() - (days - 1));
  const cells: { k: string; m: number }[] = [];
  for (let i = 0; i < days; i++) { const d = new Date(start); d.setDate(start.getDate() + i); const k = d.toISOString().slice(0, 10); cells.push({ k, m: per.get(k) ?? 0 }); }
  const col = (m: number) => m === 0 ? 'rgba(255,255,255,0.06)' : m < 25 ? 'rgba(143,203,139,0.35)' : m < 60 ? 'rgba(143,203,139,0.6)' : m < 120 ? '#8FCB8B' : '#E3A95C';
  return <div className="heat">{cells.map(c => <span key={c.k} title={`${c.k} · ${c.m} min`} className="hCell" style={{ background: col(c.m) }} />)}</div>;
}

// ----- Pages -----
function TasksPage({ lists, setLists, tasks, setTasks }: {
  lists: List[]; setLists: (u: (p: List[]) => List[]) => void;
  tasks: Task[]; setTasks: (u: (p: Task[]) => Task[]) => void;
}) {
  const [view, setView] = useState<string>('myday');
  const [search, setSearch] = useState('');
  const [newList, setNewList] = useState('');
  const [newTask, setNewTask] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newStep, setNewStep] = useState('');
  const addRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        addRef.current?.focus();
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  const selected = selectedId ? tasks.find(t => t.id === selectedId) ?? null : null;
  const q = search.trim().toLowerCase();

  const belongsToView = (t: Task) => {
    if (view === 'myday') return t.myDay;
    if (view === 'important') return t.important;
    if (view === 'planned') return !!t.due;
    if (view === 'all') return true;
    if (view === 'done') return t.done;
    return t.listId === view;
  };

  const matchesSearch = (t: Task) => {
    if (!q) return true;
    return (
      t.title.toLowerCase().includes(q) ||
      t.notes.toLowerCase().includes(q) ||
      t.steps.some(s => s.text.toLowerCase().includes(q))
    );
  };

  const filtered = tasks.filter(t => belongsToView(t) && matchesSearch(t));
  const openTasks = filtered.filter(t => !t.done);
  const doneTasks = filtered.filter(t => t.done);

  const patch = (id: string, patch: Partial<Task>) => {
    setTasks(ts => ts.map(t => t.id === id ? { ...t, ...patch } : t));
  };

  const complete = (t: Task) => {
    patch(t.id, { done: !t.done, completedAt: t.done ? null : Date.now() });
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    const title = newTask.trim();
    if (!title) return;

    const listId = lists.some(l => l.id === view) ? view : 'inbox';
    const task: Task = {
      id: uid(),
      listId,
      title,
      notes: '',
      due: null,
      important: view === 'important',
      myDay: view === 'myday',
      done: false,
      steps: [],
      createdAt: Date.now(),
      completedAt: null,
    };

    setTasks(ts => [task, ...ts]);
    setSelectedId(task.id);
    setNewTask('');
    window.setTimeout(() => addRef.current?.focus(), 0);
  };

  const addList = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newList.trim();
    if (!name) return;
    const list: List = { id: uid(), name, color: COLORS[lists.length % COLORS.length] };
    setLists(ls => [...ls, list]);
    setView(list.id);
    setNewList('');
  };

  const addStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !newStep.trim()) return;
    patch(selected.id, {
      steps: [...selected.steps, { id: uid(), text: newStep.trim(), done: false }],
    });
    setNewStep('');
  };

  const deleteTask = (id: string) => {
    setTasks(ts => ts.filter(t => t.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const viewTitle =
    view === 'myday' ? 'My Day'
    : view === 'important' ? 'Important'
    : view === 'planned' ? 'Planned'
    : view === 'all' ? 'All Tasks'
    : view === 'done' ? 'Completed'
    : lists.find(l => l.id === view)?.name ?? 'Tasks';

  const viewSubtitle =
    view === 'myday' ? 'Tasks you chose for today.'
    : view === 'important' ? 'Starred work that matters most.'
    : view === 'planned' ? 'Everything with a due date.'
    : view === 'all' ? 'Every open task across your lists.'
    : view === 'done' ? 'A quiet record of what you finished.'
    : `${openTasks.length} open · ${doneTasks.length} completed`;

  const smartCount = {
    myday: tasks.filter(t => !t.done && t.myDay).length,
    important: tasks.filter(t => !t.done && t.important).length,
    planned: tasks.filter(t => !t.done && !!t.due).length,
    all: tasks.filter(t => !t.done).length,
    done: tasks.filter(t => t.done).length,
  };

  const dueText = (due: string | null) => {
    if (!due) return null;
    const [, m, d] = due.split('-');
    return `${m}/${d}`;
  };

  const TaskRow = ({ t }: { t: Task }) => {
    const stepDone = t.steps.filter(s => s.done).length;
    const overdue = !!t.due && t.due < today() && !t.done;

    return (
      <button
        className={`msTaskRow ${selectedId === t.id ? 'selected' : ''} ${t.done ? 'done' : ''}`}
        onClick={() => setSelectedId(t.id)}
      >
        <span
          className={`msCheck ${t.done ? 'checked' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            complete(t);
          }}
        />
        <span className="msTaskMain">
          <span className="msTaskTitle">{t.title}</span>
          <span className="msTaskMeta">
            {lists.find(l => l.id === t.listId)?.name ?? 'Inbox'}
            {t.due && <span className={overdue ? 'overdue' : ''}> · Due {dueText(t.due)}</span>}
            {t.myDay && <span> · My Day</span>}
            {t.steps.length > 0 && <span> · {stepDone}/{t.steps.length} steps</span>}
          </span>
        </span>
        <span
          className={`msStar ${t.important ? 'on' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            patch(t.id, { important: !t.important });
          }}
        >
          ★
        </span>
      </button>
    );
  };

  return (
    <div className="msTodo">
      <aside className="msSidebar">
        <div className="msSideBlock">
          {([
            ['myday', 'My Day', smartCount.myday],
            ['important', 'Important', smartCount.important],
            ['planned', 'Planned', smartCount.planned],
            ['all', 'All', smartCount.all],
            ['done', 'Completed', smartCount.done],
          ] as [string, string, number][]).map(([id, label, count]) => (
            <button key={id} className={`msNavItem ${view === id ? 'on' : ''}`} onClick={() => setView(id)}>
              <span>{label}</span>
              {count > 0 && <b>{count}</b>}
            </button>
          ))}
        </div>

        <div className="msSideLabel">Lists</div>

        <div className="msSideBlock">
          {lists.map(l => {
            const count = tasks.filter(t => !t.done && t.listId === l.id).length;
            return (
              <button key={l.id} className={`msNavItem ${view === l.id ? 'on' : ''}`} onClick={() => setView(l.id)}>
                <span className="msListName">
                  <i style={{ backgroundColor: l.color }} />
                  {l.name}
                </span>
                {count > 0 && <b>{count}</b>}
              </button>
            );
          })}
        </div>

        <form className="msNewList" onSubmit={addList}>
          <input value={newList} onChange={e => setNewList(e.target.value)} placeholder="New list" />
        </form>
      </aside>

      <main className="msList">
        <header className="msListHeader">
          <div>
            <h2>{viewTitle}</h2>
            <p>{viewSubtitle}</p>
          </div>
          <input className="msSearch" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search" />
        </header>

        {view !== 'done' && (
          <form className="msAddTask" onSubmit={addTask}>
            <span>+</span>
            <input ref={addRef} value={newTask} onChange={e => setNewTask(e.target.value)} placeholder="Add a task" />
          </form>
        )}

        <section className="msTasks">
          {openTasks.length === 0 && doneTasks.length === 0 && (
            <div className="msEmpty">
              <span>No tasks here.</span>
              <p>Press N or use the add box to capture something quickly.</p>
            </div>
          )}

          {openTasks.map(t => <TaskRow key={t.id} t={t} />)}

          {view !== 'done' && doneTasks.length > 0 && (
            <details className="msCompleted">
              <summary>Completed · {doneTasks.length}</summary>
              {doneTasks.map(t => <TaskRow key={t.id} t={t} />)}
            </details>
          )}

          {view === 'done' && doneTasks.map(t => <TaskRow key={t.id} t={t} />)}
        </section>
      </main>

      <aside className={`msDetail ${selected ? 'open' : ''}`}>
        {!selected ? (
          <div className="msNoSelection">
            <span>Select a task</span>
            <p>Details, steps, notes, dates, and list controls appear here.</p>
          </div>
        ) : (
          <>
            <div className="msDetailTop">
              <button className={`msCheck big ${selected.done ? 'checked' : ''}`} onClick={() => complete(selected)} />
              <input
                className="msTitleInput"
                value={selected.title}
                onChange={e => patch(selected.id, { title: e.target.value })}
              />
              <button className={`msStar big ${selected.important ? 'on' : ''}`} onClick={() => patch(selected.id, { important: !selected.important })}>★</button>
            </div>

            <form className="msStepAdd" onSubmit={addStep}>
              <span>+</span>
              <input value={newStep} onChange={e => setNewStep(e.target.value)} placeholder="Add step" />
            </form>

            <div className="msSteps">
              {selected.steps.map(s => (
                <div key={s.id} className="msStep">
                  <button
                    className={`msCheck small ${s.done ? 'checked' : ''}`}
                    onClick={() => patch(selected.id, {
                      steps: selected.steps.map(x => x.id === s.id ? { ...x, done: !x.done } : x),
                    })}
                  />
                  <span className={s.done ? 'done' : ''}>{s.text}</span>
                  <button
                    className="msTinyDelete"
                    onClick={() => patch(selected.id, { steps: selected.steps.filter(x => x.id !== s.id) })}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="msDetailActions">
              <button className={selected.myDay ? 'on' : ''} onClick={() => patch(selected.id, { myDay: !selected.myDay })}>
                {selected.myDay ? 'Added to My Day' : 'Add to My Day'}
              </button>

              <label>
                Due date
                <input type="date" value={selected.due ?? ''} onChange={e => patch(selected.id, { due: e.target.value || null })} />
              </label>

              <label>
                List
                <select value={selected.listId} onChange={e => patch(selected.id, { listId: e.target.value })}>
                  {lists.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </label>
            </div>

            <textarea
              className="msNotes"
              value={selected.notes}
              onChange={e => patch(selected.id, { notes: e.target.value })}
              placeholder="Add notes"
            />

            <div className="msDetailFooter">
              <span>Created {new Date(selected.createdAt).toLocaleDateString()}</span>
              <button onClick={() => deleteTask(selected.id)}>Delete task</button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

function PlantPage({ session, plant, giveUp, trees, coins, breakOffer, setBreakOffer, breakLeft, setBreakLeft }: {
  session: { left: number; total: number; species: string } | null;
  plant: (species: string, mins: number) => void; giveUp: () => void;
  trees: Tree[]; coins: number;
  breakOffer: boolean; setBreakOffer: (b: boolean) => void;
  breakLeft: number | null; setBreakLeft: (n: number | null) => void;
}) {
  const [species, setSpecies] = useState('pine');
  const [mins, setMins] = useState(25);
  const [custom, setCustom] = useState('');
  const growth = session ? 1 - session.left / session.total : 0;
  const todayStr = today();
  const todayTrees = trees.filter(t => new Date(t.plantedAt).toISOString().slice(0, 10) === todayStr);

  return (
    <div className="plantWrap">
      <section className="card plantCard">
        {!session ? (
          <>
            <span className="eyebrow">PLANT A TREE</span>
            <div className="ffHero"><HeroTree sp={species} growth={1} size={150} /></div>
            <div className="speciesRow">
              {SPECIES.map(s => (
                <button key={s.id} className={`spBtn ${species === s.id ? 'on' : ''} ${coins < s.cost ? 'locked' : ''}`} disabled={coins < s.cost}
                  onClick={() => setSpecies(s.id)} title={coins < s.cost ? `Unlocks at ${s.cost} coins` : s.name}>
                  <HeroTree sp={s.id} growth={1} size={34} />
                  <span>{coins < s.cost ? `${s.cost}` : s.name}</span>
                </button>
              ))}
            </div>
            <div className="minRow">
              {[15, 25, 50, 90].map(p => <button key={p} className={`chip ${mins === p ? 'on' : ''}`} onClick={() => setMins(p)}>{p}</button>)}
              <input className="customInput" type="number" placeholder="Any min" value={custom} onChange={e => setCustom(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { const m = parseInt(custom, 10); if (m > 0 && m < 600) { setMins(m); setCustom(''); } } }} />
            </div>
            <button className="btn plant" onClick={() => plant(species, mins)}>Plant and focus · {mins} min</button>
            {breakOffer && (
              <div className="breakCard">
                <p className="breakTitle">You earned a break.</p>
                <div className="btnRow">
                  <button className="btn ghost" onClick={() => { setBreakLeft(300); setBreakOffer(false); }}>Take 5 min</button>
                  <button className="linkBtn" onClick={() => setBreakOffer(false)}>Skip</button>
                </div>
              </div>
            )}
            {breakLeft !== null && (
              <div className="breakCard">
                <p className="breakTime">{fmtT(breakLeft)}</p>
                <p className="hint">Breathe. Look far away.</p>
              </div>
            )}
          </>
        ) : (
          <div className="sessionLive">
            <div className="liveTree" style={{ transform: `scale(${0.4 + 0.6 * growth})`, transition: 'transform 1s linear' }}>
              <HeroTree sp={session.species} growth={1} size={190} />
            </div>
            <div className="growClock">{fmtT(session.left)}</div>
            <div className="liveBar"><div className="liveFill" style={{ width: `${(growth * 100).toFixed(1)}%`, transition: 'width 1s linear' }} /></div>
            <p className="hint">Stay. It is growing.</p>
            <button className="linkBtn danger" onClick={giveUp}>Give up — the tree dies</button>
          </div>
        )}
      </section>
      {todayTrees.length > 0 && (
        <section className="card todayStrip">
          <span className="eyebrow">TODAY</span>
          <div className="garden">
            {todayTrees.map(t => <span key={t.id} className="gTree"><HeroTree sp={t.species} growth={1} dead={t.dead} size={44} /></span>)}
            <div className="soil" />
          </div>
        </section>
      )}
    </div>
  );
}

function ForestPage({ trees, coins }: { trees: Tree[]; coins: number }) {
  const alive = trees.filter(t => !t.dead);
  const deadN = trees.length - alive.length;
  return (
    <div className="plantWrap">
      <section className="card">
        <div className="row1">
          <span className="viewTitle">Your forest</span>
          <span className="hint" style={{ margin: 0 }}>{alive.length} grown · {deadN} withered</span>
        </div>
        <div className="garden big">
          {trees.length === 0 && <p className="hint">No trees yet. Plant your first on the Plant page.</p>}
          {[...trees].reverse().map(t => {
            const h = hashN(t.id);
            return (
              <span key={t.id} className="gTree" style={{ transform: `rotate(${(h % 7) - 3}deg) scale(${0.85 + ((h >> 3) % 4) * 0.07})` }}
                title={`${t.minutes} min · ${t.dead ? 'withered' : 'grown'}`}>
                <HeroTree sp={t.species} growth={1} dead={t.dead} size={52} />
              </span>
            );
          })}
          <div className="soil" />
        </div>
      </section>
      <section className="card">
        <span className="eyebrow">COLLECTION</span>
        <div className="collRow">
          {SPECIES.map(s => {
            const n = alive.filter(t => t.species === s.id).length;
            const locked = coins < s.cost && n === 0;
            return (
              <div key={s.id} className={`collCard ${locked ? 'locked' : ''}`}>
                <HeroTree sp={s.id} growth={1} size={44} dead={locked} />
                <span className="collName">{s.name}</span>
                <span className="collCount">{locked ? `unlock ${s.cost}` : `${n} grown`}</span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function ProgressPage({ trees, coins }: { trees: Tree[]; coins: number }) {
  const { hist, current, max } = computeProg(trees);
  const rank = rankOf(current);
  const totalMin = trees.filter(t => !t.dead).reduce((a, t) => a + t.minutes, 0);
  const doneN = trees.filter(t => !t.dead).length;
  const rate = trees.length ? Math.round((doneN / trees.length) * 100) : 0;
  const streak = (() => {
    const days = new Set(trees.filter(t => !t.dead).map(t => new Date(t.plantedAt).toISOString().slice(0, 10)));
    let s = 0; const d = new Date();
    if (!days.has(d.toISOString().slice(0, 10))) d.setDate(d.getDate() - 1);
    while (days.has(d.toISOString().slice(0, 10))) { s++; d.setDate(d.getDate() - 1); }
    return s;
  })();
  return (
    <div className="progWrap">
      <section className="card progHead">
        <div>
          <span className="eyebrow">FOCUS RATING</span>
          <div className="ratingRow">
            <span className="ratingNum">{current}</span>
            <span className="rankPill" style={{ color: rank[2], borderColor: rank[2] }}>{rank[1]}</span>
          </div>
          <p className="hint">max {max} · {coins} coins</p>
        </div>
        <div className="progStats">
          <div className="statCard"><b>{Math.floor(totalMin / 60)}h {totalMin % 60}m</b><span>total focus</span></div>
          <div className="statCard"><b>{doneN}</b><span>trees grown</span></div>
          <div className="statCard"><b>{rate}%</b><span>completion</span></div>
          <div className="statCard"><b>{streak}</b><span>day streak</span></div>
        </div>
      </section>
      <section className="card">
        <span className="eyebrow">RATING GRAPH</span>
        <RatingGraph hist={hist} />
      </section>
      <section className="card">
        <span className="eyebrow">ACTIVITY · LAST 15 WEEKS</span>
        <Heatmap trees={trees} />
      </section>
      <section className="card">
        <span className="eyebrow">SESSION HISTORY</span>
        <table className="sessTable">
          <thead><tr><th>When</th><th>Length</th><th>Tree</th><th>Result</th><th>Rating</th></tr></thead>
          <tbody>
            {[...hist].reverse().slice(0, 12).map((h, i) => (
              <tr key={i}>
                <td>{new Date(h.at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} · {new Date(h.at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</td>
                <td>{h.minutes} min</td>
                <td>{SPECIES.find(s => s.id === h.species)?.name}</td>
                <td className={h.dead ? 'deltaDown' : 'deltaUp'}>{h.dead ? 'Withered' : 'Grown'}</td>
                <td className={h.delta >= 0 ? 'deltaUp' : 'deltaDown'}>{h.delta >= 0 ? `+${h.delta}` : h.delta}</td>
              </tr>
            ))}
            {hist.length === 0 && <tr><td colSpan={5} className="hint">No sessions yet.</td></tr>}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function FocusView() {
  const [lists, setLists] = useStored<List[]>('it.lists', [{ id: 'inbox', name: 'Inbox', color: COLORS[0] }]);
  const [tasks, setTasks] = useStored<Task[]>('it.tasks', []);
  const [trees, setTrees] = useStored<Tree[]>('it.trees', []);
  const [coins, setCoins] = useStored<number>('it.coins', 0);
  const [page, setPage] = useState<'tasks' | 'plant' | 'forest' | 'progress'>('tasks');
  const [session, setSession] = useState<{ left: number; total: number; species: string } | null>(null);
  const [breakOffer, setBreakOffer] = useState(false);
  const [breakLeft, setBreakLeft] = useState<number | null>(null);
  const [justEarned, setJustEarned] = useState<number | null>(null);
  const sRef = useRef(session); sRef.current = session;

  useEffect(() => {
    if (!session) return;
    const t = window.setInterval(() => {
      setSession(s => {
        if (!s) return null;
        if (s.left <= 1) {
          const m = Math.round(s.total / 60);
          setTrees(tr => [...tr, { id: uid(), minutes: m, species: s.species, plantedAt: Date.now(), dead: false }]);
          setCoins(c => c + m);
          setJustEarned(m);
          window.setTimeout(() => setJustEarned(null), 1800);
          setBreakOffer(true);
          chime();
          return null;
        }
        return { ...s, left: s.left - 1 };
      });
    }, 1000);
    return () => window.clearInterval(t);
  }, [session !== null]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (breakLeft === null) return;
    const t = window.setInterval(() => setBreakLeft(b => (b === null ? null : b <= 1 ? (chime(), null) : b - 1)), 1000);
    return () => window.clearInterval(t);
  }, [breakLeft !== null]); // eslint-disable-line react-hooks/exhaustive-deps

  function plant(species: string, mins: number) { if (!session) setSession({ left: mins * 60, total: mins * 60, species }); }
  function giveUp() {
    const s = sRef.current; if (!s) return;
    setTrees(tr => [...tr, { id: uid(), minutes: Math.round(s.total / 60), species: s.species, plantedAt: Date.now(), dead: true }]);
    setSession(null);
  }

  const todayMin = trees.filter(t => !t.dead && new Date(t.plantedAt).toISOString().slice(0, 10) === today()).reduce((a, t) => a + t.minutes, 0);

  return (
    <div className="f2wrap">
      <div className="fpNav">
        {([['tasks', 'Tasks'], ['plant', 'Plant'], ['forest', 'Forest'], ['progress', 'Progress']] as ['tasks' | 'plant' | 'forest' | 'progress', string][]).map(([id, label]) => (
          <button key={id} className={`fpTab ${page === id ? 'on' : ''}`} onClick={() => setPage(id)}>
            {label}
            {id === 'plant' && session && <span className="liveDot" />}
          </button>
        ))}
        <div className="fpStats">
          <span className="statChip"><b>{todayMin}</b> min today</span>
          <span className="statChip"><b>{coins}</b> coins{justEarned !== null && <span className="coinPop">+{justEarned}</span>}</span>
        </div>
      </div>
      {page === 'tasks' && <TasksPage lists={lists} setLists={setLists} tasks={tasks} setTasks={setTasks} />}
      {page === 'plant' && <PlantPage session={session} plant={plant} giveUp={giveUp} trees={trees} coins={coins} breakOffer={breakOffer} setBreakOffer={setBreakOffer} breakLeft={breakLeft} setBreakLeft={setBreakLeft} />}
      {page === 'forest' && <ForestPage trees={trees} coins={coins} />}
      {page === 'progress' && <ProgressPage trees={trees} coins={coins} />}
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
const CALM_STARS = Array.from({ length: 70 }, (_, i) => {
  const h = hashN('star' + i);
  return { left: h % 100, top: (h >> 4) % 60, size: 1 + ((h >> 7) % 3) * 0.8, delay: (h % 50) / 10, dur: 2.5 + ((h >> 9) % 40) / 10 };
});
const CALM_FLIES = Array.from({ length: 9 }, (_, i) => {
  const h = hashN('fly' + i);
  return { left: 8 + (h % 84), bottom: 8 + ((h >> 5) % 26), delay: (h % 70) / 10, dur: 7 + ((h >> 8) % 60) / 10 };
});

function CalmScene({ children }: { children: React.ReactNode }) {
  return (
    <div className="calmScene">
      <div className="calmSky" />
      {CALM_STARS.map((s, i) => (
        <span key={i} className="cStar" style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size, animationDelay: `${s.delay}s`, animationDuration: `${s.dur}s` }} />
      ))}
      <div className="calmMist m1" />
      <div className="calmMist m2" />
      {CALM_FLIES.map((f, i) => (
        <span key={i} className="cFly" style={{ left: `${f.left}%`, bottom: `${f.bottom}%`, animationDelay: `${f.delay}s`, animationDuration: `${f.dur}s` }} />
      ))}
      <svg className="calmMounts" viewBox="0 0 1440 320" preserveAspectRatio="none">
        <path d="M0 220 L240 120 L480 210 L760 90 L1040 200 L1260 130 L1440 190 L1440 320 L0 320 Z" fill="#161D33" opacity="0.85" />
        <path d="M0 262 L200 192 L430 252 L700 172 L980 252 L1240 202 L1440 242 L1440 320 L0 320 Z" fill="#0D1424" />
      </svg>
      <div className="calmContent">{children}</div>
    </div>
  );
}

function NoticeView({ onKeep }: { onKeep: (d: Discovery) => void }) {
  const [phase, setPhase] = useState<'arrive' | 'wait' | 'write'>('arrive');
  const [text, setText] = useState('');
  const [label, setLabel] = useState('Settle in.');
  const [fadeKey, setFadeKey] = useState(0);
  const [left60, setLeft60] = useState(60);
  const orbRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const startRef = useRef(Date.now());
  const [hasAudio, setHasAudio] = useState(true);

  useEffect(() => { setFadeKey(k => k + 1); }, [label]);

  useEffect(() => {
    if (phase !== 'arrive') return;
    startRef.current = Date.now();
    const a = new Audio('/breathguide.wav');
    audioRef.current = a;
    a.play().catch(() => setHasAudio(false));
    const t = window.setInterval(() => {
      const cur = hasAudio && !a.paused ? a.currentTime : (Date.now() - startRef.current) / 1000;
      let next = 'Settle in.';
      let scale = 1;
      if (cur >= 8 && cur < 589) {
        const m = (cur - 8) % 14;
        if (m < 4) { next = 'Breathe in.'; scale = 1 + 0.45 * (m / 4); }
        else if (m < 8) { next = 'Hold.'; scale = 1.45; }
        else { next = 'Let it go.'; scale = 1.45 - 0.45 * ((m - 8) / 6); }
      } else if (cur >= 589) next = 'Well done.';
      setLabel(next);
      if (orbRef.current) orbRef.current.style.transform = `scale(${scale})`;
      if ((a.duration && cur >= a.duration - 0.5) || (!hasAudio && cur >= 600)) { a.pause(); setPhase('wait'); }
    }, 100);
    return () => { window.clearInterval(t); a.pause(); };
  }, [phase, hasAudio]);

  useEffect(() => {
    if (phase !== 'wait') return;
    const t = window.setInterval(() => setLeft60(l => { if (l <= 1) { window.clearInterval(t); setPhase('write'); return 0; } return l - 1; }), 1000);
    return () => window.clearInterval(t);
  }, [phase]);

  if (phase === 'write') return (
    <CalmScene>
      <div className="calmCard">
        <span className="calmEyebrow">WHAT DID YOU NOTICE?</span>
        <textarea className="calmInput" placeholder="One line is enough..." value={text} onChange={e => setText(e.target.value)} />
        <button className="btn" onClick={() => { if (text.trim()) onKeep({ id: uid(), category: 'Notice', prompt: 'What do you notice right now?', findings: { noticed: text.trim() }, createdAt: new Date().toISOString() }); }}>Keep this.</button>
      </div>
    </CalmScene>
  );

  if (phase === 'wait') return (
    <CalmScene>
      <span className="calmEyebrow">NOTICE</span>
      <h2 className="calmTitle">Look up.</h2>
      <p className="calmSub">For one minute, just notice the world around you.</p>
      <div className="calmCount">{left60}</div>
      <button className="calmSkip" onClick={() => setPhase('write')}>I'm ready</button>
    </CalmScene>
  );

  return (
    <CalmScene>
      <span className="calmEyebrow">A QUIET MINUTE</span>
      <div className="calmOrbWrap"><div ref={orbRef} className="calmOrb" /></div>
      <p key={fadeKey} className="calmText">{label}</p>
      <button className="calmSkip" onClick={() => { audioRef.current?.pause(); setPhase('wait'); }}>I'm here already</button>
    </CalmScene>
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
