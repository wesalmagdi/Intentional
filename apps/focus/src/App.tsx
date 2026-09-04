import { useEffect, useRef, useState } from 'react';

// ---------- store ----------
type Step = { id: string; text: string; done: boolean };
type Task = { id: string; listId: string; title: string; notes: string; due: string | null; important: boolean; myDay: boolean; done: boolean; steps: Step[]; createdAt: number; completedAt: number | null };
type List = { id: string; name: string; color: string };
import { TOPIC_POOLS, DEEP_POOLS } from './pools';
type Discovery = { id: string; category: string; prompt: string; findings: Record<string, string>; sources?: string; folderName?: string; createdAt: string };
type Entry = { id: string; body: string; prompt?: string; createdAt: string; mood?: string; tags?: string[] };
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

let tickCtx: AudioContext | null = null;
function initAudio() {
  if (!tickCtx) {
    try {
      const Ctor = window.AudioContext ?? (window as any).webkitAudioContext;
      if (Ctor) tickCtx = new Ctor();
    } catch (e) {
      console.warn('Audio not available:', e);
    }
  }
  if (tickCtx?.state === 'suspended') {
    tickCtx.resume().catch(() => {});
  }
  return tickCtx;
}
function tick() {
  const ctx = initAudio();
  if (!ctx) return;
  try {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.value = 900;
    g.gain.setValueAtTime(0.1, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 0.06);
  } catch (e) {
    console.warn('Tick failed:', e);
  }
}
function chime() {
  const ctx = initAudio();
  if (!ctx) return;
  try {
    const note = (f: number, at: number) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, ctx.currentTime + at);
      g.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + at + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + at + 0.6);
      o.connect(g);
      g.connect(ctx.destination);
      o.start(ctx.currentTime + at);
      o.stop(ctx.currentTime + at + 0.7);
    };
    note(660, 0);
    note(880, 0.18);
  } catch (e) {
    console.warn('Chime failed:', e);
  }
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
  const fy = 92 - 58 * g;
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
      {dead ? (
        <g>
          <path d={`M43 ${fy - 1} l4 3 M47 ${fy - 1} l-4 3`} stroke="#5B4A63" strokeWidth={1.4} strokeLinecap="round" />
          <path d={`M53 ${fy - 1} l4 3 M57 ${fy - 1} l-4 3`} stroke="#5B4A63" strokeWidth={1.4} strokeLinecap="round" />
          <path d={`M46 ${fy + 6} Q50 ${fy + 4} 54 ${fy + 6}`} stroke="#5B4A63" strokeWidth={1.5} fill="none" strokeLinecap="round" />
        </g>
      ) : (
        <g>
          <circle cx={45} cy={fy} r={2.1} fill="#4A3B5C" />
          <circle cx={55} cy={fy} r={2.1} fill="#4A3B5C" />
          <path d={`M47 ${fy + 3} Q50 ${fy + 5.5} 53 ${fy + 3}`} stroke="#4A3B5C" strokeWidth={1.5} fill="none" strokeLinecap="round" />
          <circle cx={40.5} cy={fy + 2.5} r={2.4} fill="#FF9FB6" opacity={0.75} />
          <circle cx={59.5} cy={fy + 2.5} r={2.4} fill="#FF9FB6" opacity={0.75} />
        </g>
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
  const col = (m: number) => m === 0 ? '#F3EAF3' : m < 25 ? '#D8F0E2' : m < 60 ? '#A9E3C4' : m < 120 ? '#8FCB8B' : '#E3A95C';
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

  const [burstId, setBurstId] = useState<string | null>(null);
  const complete = (t: Task) => {
    const nowDone = !t.done;
    patch(t.id, { done: nowDone, completedAt: nowDone ? Date.now() : null });
    if (nowDone) {
      setBurstId(t.id);
      window.setTimeout(() => setBurstId(b => (b === t.id ? null : b)), 700);
    }
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
        <span className="checkWrap">
          {burstId === t.id && (
            <span className="sparkles">
              {Array.from({ length: 6 }).map((_, i) => (
                <i key={i} className="spk" style={{ '--d': `${i * 60}deg` } as React.CSSProperties} />
              ))}
            </span>
          )}
          <span
            className={`msCheck ${t.done ? 'checked' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              complete(t);
            }}
          />
        </span>
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
              <span>( ᴗ ) all clear!</span>
              <p>press N or add below to catch a tiny task~</p>
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
            <button className="linkBtn danger" onClick={giveUp}>give up (the tree wilts)</button>
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
          {trees.length === 0 && <p className="hint">no trees yet... plant your first seed on the Plant page ( ᴗ )</p>}
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
const WHEEL_COLORS = ['#FFD9E6', '#D8F0E2', '#E6E0FF', '#FFF0D9', '#D9F3F6', '#FFE1E1', '#EAF7EF', '#F3EAF3', '#FFE9F1', '#DDEBFF', '#F6E3EE', '#E4F6D9'];
function segPath(i: number, n: number) {
  const a0 = ((i * 360) / n - 90) * (Math.PI / 180);
  const a1 = (((i + 1) * 360) / n - 90) * (Math.PI / 180);
  const r = 96;
  return `M100 100 L${100 + r * Math.cos(a0)} ${100 + r * Math.sin(a0)} A${r} ${r} 0 0 1 ${100 + r * Math.cos(a1)} ${100 + r * Math.sin(a1)} Z`;
}

function LearnView({ onBegin }: { onBegin: (p: string, c: string) => void }) {
  const [mode, setMode] = useState<'topics' | 'deep' | 'own'>('topics');
  const pools = mode === 'deep' ? DEEP_POOLS : TOPIC_POOLS;
  const keys = Object.keys(pools);
  const [card, setCard] = useState<string | null>(null);
  const [cardCat, setCardCat] = useState<string | null>(null);
  const [cycleTxt, setCycleTxt] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [angle, setAngle] = useState(0);
  const [burst, setBurst] = useState(0);
  const [own, setOwn] = useState('');
  const [used, setUsed] = useStored<Record<string, string>>('it.learn.used', {});
  const [started, setStarted] = useStored<string[]>('it.learn.started', []);
  const [discoveries] = useStored<Discovery[]>('it.discoveries', []);
  const todayStr = today();

  const blocked = (q: string) => used[q] === todayStr || started.includes(q) || discoveries.some(d => d.prompt === q);
  const avail = (cat: string) => (pools[cat] ?? []).filter(q => !blocked(q));
  const totalAvail = keys.reduce((a, k) => a + avail(k).length, 0);
  const total = (Object.values(pools) as string[][]).reduce((a, p) => a + p.length, 0);

  function spin() {
    if (spinning || totalAvail === 0) return;
    setSpinning(true);
    setCard(null);
    const openCats = keys.filter(k => avail(k).length > 0);
    const chosen = openCats[Math.floor(Math.random() * openCats.length)];
    const idx = keys.indexOf(chosen);
    const n = keys.length;
    const seg = 360 / n;
    const targetMod = (360 - (idx * seg + seg / 2)) % 360;
    const currentMod = ((angle % 360) + 360) % 360;
    let delta = 360 * 8 + (targetMod - currentMod);
    if (delta <= 360) delta += 360;
    setAngle(a => a + delta);

    const allAvail = openCats.flatMap(c => avail(c));
    const t0 = performance.now();
    const doCycle = () => {
      const el = performance.now() - t0;
      setCycleTxt(allAvail[Math.floor(Math.random() * allAvail.length)]);
      tick();
      if (el < 4000) {
        const p = el / 4000;
        window.setTimeout(doCycle, 45 + p * p * 320);
      }
    };
    doCycle();

    window.setTimeout(() => {
      const arr = avail(chosen);
      const pickQ = arr[Math.floor(Math.random() * arr.length)];
      setCardCat(chosen);
      setCard(pickQ);
      setUsed(u => ({ ...u, [pickQ]: todayStr }));
      setCycleTxt(null);
      setSpinning(false);
      setBurst(b => b + 1);
      chime();
    }, 4200);
  }

  function begin() {
    if (!card || !cardCat) return;
    setStarted(s => (s.includes(card) ? s : [...s, card]));
    onBegin(card, cardCat);
  }

  return (
    <div className="narrow">
      <h1 className="pageTitle">Learn</h1>
      <div className="tabs">
        {([['topics', 'Curiosities'], ['deep', 'Ponder'], ['own', 'My own']] as ['topics' | 'deep' | 'own', string][]).map(([m, l]) => (
          <button key={m} className={`tab ${mode === m ? 'on' : ''}`} onClick={() => { setMode(m); setCard(null); setCardCat(null); }}>{l}</button>
        ))}
      </div>
      {mode !== 'own' ? (
        <>
          <p className="modeDesc">{mode === 'topics' ? `small wonders from the everyday` : `physics, philosophy, and the strange hows of everything`} · {totalAvail} fresh of {total} today</p>
          <div className="wheelWrap">
            <div className="wheelPointer" />
            <div className="wheel" style={{ transform: `rotate(${angle}deg)` }}>
              <svg viewBox="0 0 200 200">
                {keys.map((k, i) => (
                  <path key={k} d={segPath(i, keys.length)} fill={WHEEL_COLORS[i % WHEEL_COLORS.length]} stroke="#fff" strokeWidth={2} opacity={avail(k).length > 0 ? 1 : 0.35} />
                ))}
                <circle cx={100} cy={100} r={27} fill="#fff" />
                <circle cx={92} cy={96} r={3} fill="#4A3B5C" />
                <circle cx={108} cy={96} r={3} fill="#4A3B5C" />
                <path d="M93 104 Q100 110 107 104" stroke="#4A3B5C" strokeWidth={2.4} fill="none" strokeLinecap="round" />
                <circle cx={85} cy={102} r={3.4} fill="#FF9FB6" opacity={0.7} />
                <circle cx={115} cy={102} r={3.4} fill="#FF9FB6" opacity={0.7} />
              </svg>
            </div>
            {burst > 0 && !spinning && card && (
              <span className="confetti" key={burst}>
                {Array.from({ length: 16 }).map((_, i) => {
                  const h = hashN('cf' + burst + '_' + i);
                  return <i key={i} style={{ left: `${6 + (h % 88)}%`, background: WHEEL_COLORS[h % WHEEL_COLORS.length], animationDelay: `${(h % 40) / 100}s`, transform: `rotate(${h % 360}deg)` }} />;
                })}
              </span>
            )}
          </div>
          <div className="spinCard">
            {cardCat && !spinning && card && <span className="eyebrow">{cardCat.toUpperCase()}</span>}
            <p className={`spinText ${spinning ? 'spinBlur' : ''}`}>
              {spinning ? cycleTxt : (card ?? (totalAvail === 0 ? 'the deck is resting~' : 'Ready.'))}
            </p>
          </div>
          {totalAvail === 0 ? (
            <div className="btnRow center">
              <p className="modeDesc">everything fresh has been spun today. come back tomorrow, or</p>
              <button className="btn ghost" onClick={() => setUsed({})}>reset today's spins</button>
            </div>
          ) : (
            <div className="btnRow center">
              <button className="btn" onClick={spin} disabled={spinning}>{spinning ? 'Spinning...' : (card ? 'Spin again' : 'Spin the wheel')}</button>
              <button className="btn ghost" disabled={!card || spinning} onClick={begin}>Begin 10 minutes</button>
            </div>
          )}
        </>
      ) : (
        <>
          <p className="modeDesc">you bring the question.</p>
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
const JOURNAL_DECK = [
  'What have you been thinking about lately that you haven\'t said out loud?',
  'What did you feel today that you usually skip past?',
  'What are you carrying that isn\'t yours to carry?',
  'What small thing went unnoticed today?',
  'What made you laugh recently?',
  'What would you do today if you weren\'t afraid?',
  'Who crossed your mind today, and why?',
  'What did you learn the hard way this week?',
  'What are you looking forward to?',
  'What would make today feel complete?',
  'What habit is quietly serving you?',
  'What habit is quietly costing you?',
  'Where did you feel most alive this month?',
  'What do you want to remember a year from now?',
];

const MOODS = [
  { id: 'radiant', name: 'Radiant', color: '#E8C15A', grad: 'radial-gradient(circle at 35% 30%, #FFEDB0, #E8C15A 55%, #A9713B)' },
  { id: 'good', name: 'Good', color: '#8FCB8B', grad: 'radial-gradient(circle at 35% 30%, #D6F2CF, #8FCB8B 55%, #4E8A57)' },
  { id: 'steady', name: 'Steady', color: '#6BA8C9', grad: 'radial-gradient(circle at 35% 30%, #D3EAF6, #6BA8C9 55%, #41708C)' },
  { id: 'heavy', name: 'Heavy', color: '#9A7FD1', grad: 'radial-gradient(circle at 35% 30%, #E4D9F6, #9A7FD1 55%, #6A529B)' },
  { id: 'stormy', name: 'Stormy', color: '#E08573', grad: 'radial-gradient(circle at 35% 30%, #F6D3CA, #E08573 55%, #A9503F)' },
];
const moodOf = (id?: string) => MOODS.find(m => m.id === id);
const wordsOf = (s: string) => (s.trim() ? s.trim().split(/\s+/).length : 0);

function JWrite({ onSaved }: { onSaved: (e: Entry) => void }) {
  const [draft, setDraft] = useStored<string>('it.journal.draft', '');
  const [mood, setMood] = useState<string | null>(null);
  const [tags, setTags] = useState('');
  const [prompt, setPrompt] = useState<string | null>(null);
  const [promptKey, setPromptKey] = useState(0);
  const [kept, setKept] = useState(false);
  const words = wordsOf(draft);

  function shuffle() {
    setPrompt(() => {
      let n = JOURNAL_DECK[Math.floor(Math.random() * JOURNAL_DECK.length)];
      while (n === prompt) n = JOURNAL_DECK[Math.floor(Math.random() * JOURNAL_DECK.length)];
      return n;
    });
    setPromptKey(k => k + 1);
  }
  function save() {
    if (!draft.trim()) return;
    onSaved({ id: uid(), body: draft.trim(), prompt: prompt ?? undefined, createdAt: new Date().toISOString(), mood: mood ?? undefined, tags: tags.split(',').map(t => t.trim()).filter(Boolean) });
    setDraft(''); setMood(null); setTags(''); setPrompt(null);
    setKept(true); window.setTimeout(() => setKept(false), 1800);
  }

  return (
    <div className="jWrite">
      <div className="jPromptCard">
        <div className="row1">
          <span className="eyebrow">NEED A SPARK?</span>
          <button className="btn ghost small" onClick={shuffle}>Shuffle prompt</button>
        </div>
        {prompt && <p key={promptKey} className="jPromptLine">{prompt}</p>}
        {!prompt && <p className="jPromptLine dim">Shuffle for a question worth answering.</p>}
      </div>

      <div className="jMoodRow">
        <span className="eyebrow">HOW IS IT GOING?</span>
        <div className="jMoods">
          {MOODS.map(m => (
            <button key={m.id} className={`jMood ${mood === m.id ? 'on' : ''}`} onClick={() => setMood(mood === m.id ? null : m.id)} title={m.name}>
              <span className="mOrb" style={{ background: m.grad }} />
              <span className="jMoodName">{m.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="jEditorWrap">
        <textarea className="jEditor" placeholder="Start writing... the page autosaves as you go." value={draft} onChange={e => setDraft(e.target.value)} />
        <div className="jEditorFoot">
          <span className="hint" style={{ margin: 0 }}>{words} words · ~{Math.max(1, Math.round(words / 200))} min read · saved locally</span>
          <input className="jTags" placeholder="tags, comma, separated" value={tags} onChange={e => setTags(e.target.value)} />
          <button className="btn" onClick={save} disabled={!draft.trim()}>Keep entry</button>
        </div>
      </div>
      {kept && <div className="flash">Kept.</div>}
    </div>
  );
}

function JTimeline({ entries }: { entries: Entry[] }) {
  const [q, setQ] = useState('');
  const [tag, setTag] = useState<string | null>(null);
  const [sel, setSel] = useState<Entry | null>(null);
  const allTags = Array.from(new Set(entries.flatMap(e => e.tags ?? [])));
  const ql = q.toLowerCase();
  const filtered = entries.filter(e =>
    (!ql || e.body.toLowerCase().includes(ql) || (e.tags ?? []).some(t => t.toLowerCase().includes(ql))) &&
    (!tag || (e.tags ?? []).includes(tag)));

  const groups: { label: string; items: Entry[] }[] = [];
  for (const e of filtered) {
    const label = new Date(e.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    let g = groups.find(x => x.label === label);
    if (!g) { g = { label, items: [] }; groups.push(g); }
    g.items.push(e);
  }

  if (sel) {
    const m = moodOf(sel.mood);
    return (
      <div className="jReader">
        <button className="linkBtn" onClick={() => setSel(null)}>Back to timeline</button>
        <div className="jReaderHead">
          <span className="eyebrow">{new Date(sel.createdAt).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
          <div className="jReaderMeta">
            {m && <span className="mOrb small" style={{ background: m.grad }} title={m.name} />}
            {(sel.tags ?? []).map(t => <span key={t} className="badge">{t}</span>)}
          </div>
        </div>
        {sel.prompt && <p className="jPromptLine">{sel.prompt}</p>}
        <p className="jReaderBody">{sel.body}</p>
        <span className="hint">{wordsOf(sel.body)} words</span>
      </div>
    );
  }

  return (
    <div className="jTimeline">
      <div className="row1">
        <input className="msSearch" placeholder="Search everything you wrote..." value={q} onChange={e => setQ(e.target.value)} />
      </div>
      {allTags.length > 0 && (
        <div className="chips">
          {allTags.map(t => <button key={t} className={`chip ${tag === t ? 'on' : ''}`} onClick={() => setTag(tag === t ? null : t)}>{t}</button>)}
        </div>
      )}
      {filtered.length === 0 && <p className="hint">nothing written yet... your page is waiting ( ᴗ )</p>}
      {groups.map(g => (
        <div key={g.label} className="jMonth">
          <span className="jMonthLabel">{g.label}</span>
          {g.items.map(e => {
            const m = moodOf(e.mood);
            return (
              <button key={e.id} className="jEntryCard" onClick={() => setSel(e)}>
                <span className="jEntryDate">{new Date(e.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                <span className="jEntryBody">{e.body.slice(0, 140)}{e.body.length > 140 ? '...' : ''}</span>
                <span className="jEntrySide">
                  {m && <span className="mOrb small" style={{ background: m.grad }} />}
                  <span className="hint" style={{ margin: 0 }}>{wordsOf(e.body)}w</span>
                </span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function JInsights({ entries }: { entries: Entry[] }) {
  const totalWords = entries.reduce((a, e) => a + wordsOf(e.body), 0);
  const streak = (() => {
    const days = new Set(entries.map(e => new Date(e.createdAt).toISOString().slice(0, 10)));
    let s = 0; const d = new Date();
    if (!days.has(d.toISOString().slice(0, 10))) d.setDate(d.getDate() - 1);
    while (days.has(d.toISOString().slice(0, 10))) { s++; d.setDate(d.getDate() - 1); }
    return s;
  })();
  const moodCounts = MOODS.map(m => ({ m, n: entries.filter(e => e.mood === m.id).length })).filter(x => x.n > 0);
  const maxMood = Math.max(1, ...moodCounts.map(x => x.n));
  const tagCounts = (() => {
    const map = new Map<string, number>();
    entries.forEach(e => (e.tags ?? []).forEach(t => map.set(t, (map.get(t) ?? 0) + 1)));
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  })();

  const start = new Date('2026-01-01');
  const now = new Date();
  const days = Math.max(1, Math.floor((now.getTime() - start.getTime()) / 86400000) + 1);
  const per = new Map<string, number>();
  entries.forEach(e => { const k = new Date(e.createdAt).toISOString().slice(0, 10); per.set(k, (per.get(k) ?? 0) + wordsOf(e.body)); });
  const cells: { k: string; w: number }[] = [];
  for (let i = 0; i < days; i++) { const d = new Date(start); d.setDate(start.getDate() + i); const k = d.toISOString().slice(0, 10); cells.push({ k, w: per.get(k) ?? 0 }); }
  const col = (w: number) => w === 0 ? '#F3EAF3' : w < 80 ? '#D8F0E2' : w < 200 ? '#A9E3C4' : w < 400 ? '#8FCB8B' : '#E3A95C';

  return (
    <div className="jInsights">
      <div className="progStats">
        <div className="statCard big"><b>{entries.length}</b><span>entries</span></div>
        <div className="statCard big"><b>{streak}</b><span>day streak</span></div>
        <div className="statCard big"><b>{totalWords.toLocaleString()}</b><span>words written</span></div>
        <div className="statCard big"><b>{entries.length ? Math.round(totalWords / entries.length) : 0}</b><span>avg words</span></div>
      </div>
      <section className="card">
        <span className="eyebrow">WRITING ACTIVITY · SINCE JAN 2026</span>
        <div className="heat">{cells.map(c => <span key={c.k} title={`${c.k} · ${c.w} words`} className="hCell" style={{ background: col(c.w) }} />)}</div>
      </section>
      <div className="jInsRow">
        <section className="card">
          <span className="eyebrow">MOOD BALANCE</span>
          <div className="moodBars">
            {moodCounts.length === 0 && <p className="hint">Log moods while writing to see your balance.</p>}
            {moodCounts.map(({ m, n }) => (
              <div key={m.id} className="moodBarRow">
                <span className="mOrb small" style={{ background: m.grad }} />
                <span className="moodName">{m.name}</span>
                <div className="moodTrack"><div className="moodFill" style={{ width: `${(n / maxMood) * 100}%`, background: m.color }} /></div>
                <span className="hint" style={{ margin: 0 }}>{n}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="card">
          <span className="eyebrow">TOP TAGS</span>
          <div className="chips" style={{ marginTop: 12 }}>
            {tagCounts.length === 0 && <p className="hint">Tag entries to see patterns.</p>}
            {tagCounts.map(([t, n]) => <span key={t} className="chip on">{t} · {n}</span>)}
          </div>
        </section>
      </div>
    </div>
  );
}

function JournalView() {
  const [entries, setEntries] = useStored<Entry[]>('it.journal', []);
  const [tab, setTab] = useState<'write' | 'timeline' | 'insights'>('write');
  const dateLabel = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="jApp">
      <header className="jHead">
        <div>
          <span className="eyebrow">{dateLabel.toUpperCase()}</span>
          <h1 className="pageTitle" style={{ marginBottom: 0 }}>Journal</h1>
        </div>
        <div className="jTabs">
          {([['write', 'Write'], ['timeline', 'Timeline'], ['insights', 'Insights']] as ['write' | 'timeline' | 'insights', string][]).map(([id, label]) => (
            <button key={id} className={`fpTab ${tab === id ? 'on' : ''}`} onClick={() => setTab(id)}>{label}</button>
          ))}
        </div>
      </header>
      {tab === 'write' && <JWrite onSaved={e => setEntries(es => [e, ...es])} />}
      {tab === 'timeline' && <JTimeline entries={entries} />}
      {tab === 'insights' && <JInsights entries={entries} />}
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
    a.addEventListener('error', () => {
      console.warn('Breath guide audio not available');
      setHasAudio(false);
    });
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

function Deco() {
  return (
    <div className="deco" aria-hidden>
      <svg className="dd d1" viewBox="0 0 24 24"><path d="M12 2l2.6 6.6L21 11l-6.4 2.4L12 20l-2.6-6.6L3 11l6.4-2.4z" fill="#FFD9E6" /></svg>
      <svg className="dd d2" viewBox="0 0 24 24"><path d="M12 21s-7-4.6-9.5-9C.6 8.6 2.6 5 6 5c2 0 3.2 1 4 2.2C10.8 6 12 5 14 5c3.4 0 5.4 3.6 3.5 7C19 16.4 12 21 12 21z" fill="#BFE6CD" /></svg>
      <svg className="dd d3" viewBox="0 0 32 20"><ellipse cx="11" cy="13" rx="9" ry="6" fill="#E6E0FF" /><ellipse cx="20" cy="10" rx="10" ry="7" fill="#E6E0FF" /></svg>
      <svg className="dd d4" viewBox="0 0 24 24"><path d="M12 0c1 6 5 10 12 12-7 2-11 6-12 12-1-6-5-10-12-12 7-2 11-6 12-12z" fill="#FFF0D9" /></svg>
      <svg className="dd d5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" fill="#FFD9E6" /><g fill="#FFE9F1"><circle cx="12" cy="4" r="3.4" /><circle cx="12" cy="20" r="3.4" /><circle cx="4" cy="12" r="3.4" /><circle cx="20" cy="12" r="3.4" /></g></svg>
      <svg className="dd d6" viewBox="0 0 24 24"><path d="M20 14A8.5 8.5 0 1 1 10 3.5 7 7 0 0 0 20 14z" fill="#DDEBFF" /></svg>
    </div>
  );
}

const ICON_PATHS: Record<string, string> = {
  home: 'M3 10.5 12 3l9 7.5V21h-6v-6h-6v6H3z',
  leaf: 'M12 3C7 8 5 13 12 21c7-8 5-13 0-18z M12 9v8',
  book: 'M4 4h7v16H6a2 2 0 0 0-2 2z M20 4h-7v16h5a2 2 0 0 1 2 2z',
  pen: 'M12 20h9 M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z',
  eye: 'M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0',
  fork: 'M6 3v6a6 6 0 0 0 12 0V3 M12 15v6',
  globe: 'M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0-18 0 M3 12h18 M12 3a15 15 0 0 1 0 18 M12 3a15 15 0 0 0 0 18',
  mark: 'M6 3h12v18l-6-4-6 4z',
  refresh: 'M23 4v6h-6 M1 20v-6h6 M4 9a8 8 0 0 1 13-4l6 5 M20 15a8 8 0 0 1-13 4l-6-5',
  download: 'M12 3v12 M6 11l6 6 6-6 M4 21h16',
  upload: 'M12 21V9 M6 13l6-6 6 6 M4 3h16',
};
function Icon({ name }: { name: string }) {
  return (
    <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d={ICON_PATHS[name] ?? ''} />
    </svg>
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

  function exportData() {
    const data: Record<string, unknown> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)!;
      if (k.startsWith('it.')) {
        try { data[k] = JSON.parse(localStorage.getItem(k) ?? 'null'); } catch { data[k] = null; }
      }
    }
    const blob = new Blob([JSON.stringify({ app: 'intentional', version: 1, exportedAt: new Date().toISOString(), data }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `intentional-backup-${today()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function importData(file: File) {
    const r = new FileReader();
    r.onload = () => {
      try {
        const parsed = JSON.parse(String(r.result));
        const data = (parsed && parsed.data) ? parsed.data : parsed;
        Object.entries(data).forEach(([k, v]) => {
          if (k.startsWith('it.')) localStorage.setItem(k, JSON.stringify(v));
        });
        window.location.reload();
      } catch {
        window.alert('that file did not look like an Intentional backup ( ᴗ )');
      }
    };
    r.readAsText(file);
  }

  const NAV: [string, string, string][] = [
    ['home', 'Home', 'home'], ['focus', 'Focus', 'leaf'], ['learn', 'Learn', 'book'],
    ['journal', 'Journal', 'pen'], ['notice', 'Notice', 'eye'], ['choose', 'Choose', 'fork'],
    ['zoom', 'Zoom Out', 'globe'], ['library', 'Library', 'mark'], ['revisit', 'Revisit', 'refresh'],
  ];

  return (
    <div className="shell2">
      <Deco />
      <header className="topBar">
        <span className="sideBrand">
          <svg className="mascot" width="26" height="26" viewBox="0 0 40 40"><circle cx="20" cy="22" r="14" fill="#FFD9E6" /><circle cx="15" cy="21" r="1.8" fill="#4A3B5C" /><circle cx="25" cy="21" r="1.8" fill="#4A3B5C" /><path d="M17 25 Q20 28 23 25" stroke="#4A3B5C" strokeWidth="1.6" fill="none" strokeLinecap="round" /><circle cx="11.5" cy="24" r="2.4" fill="#FF9FB6" opacity=".7" /><circle cx="28.5" cy="24" r="2.4" fill="#FF9FB6" opacity=".7" /><path d="M20 8 Q23 3 28 6 Q24 11 20 8" fill="#8FD6A8" /></svg>
          Intentional
        </span>
        <span className="topDate">{dateLabel}</span>
        <div className="topActions">
          <button className="iconBtn" title="Export backup" onClick={exportData}><Icon name="download" /></button>
          <label className="iconBtn" title="Import backup">
            <Icon name="upload" />
            <input type="file" accept=".json,application/json" style={{ display: 'none' }}
              onChange={e => { const f = e.target.files?.[0]; if (f) importData(f); }} />
          </label>
        </div>
      </header>

      <main className="main2">
        {savedFlash && <div className="flash">Kept.</div>}
        {nav === 'home' && (
          <div className="narrow">
            <span className="eyebrow">{dateLabel.toUpperCase()}</span>
            <h1 className="pageTitle">A quiet place to begin.</h1>
            <div className="homeGrid">
              {([['focus', 'Focus', 'Plant a tree. Do the work.'], ['learn', 'Learn', 'Spin a question, chase it for 10 minutes.'], ['journal', 'Journal', 'Think without performing.'], ['notice', 'Notice', 'One quiet minute.'], ['choose', 'Choose', 'Attention is a choice.'], ['zoom', 'Zoom Out', 'See it from further away.'], ['library', 'Library', 'What you have kept.'], ['revisit', 'Revisit', 'Meet your old mind.']] as [string, string, string][]).map(([id, t, s]) => (
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

      <div className="dockHot" />
      <nav className="dock">
        {NAV.map(([id, label, icon]) => (
          <button key={id} className={`dockBtn ${nav === id ? 'on' : ''}`} onClick={() => { setNav(id); setChallenge(null); setReflect(null); }}>
            <Icon name={icon} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
