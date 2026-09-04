import { useEffect, useState } from 'react';

type Todo = { id: string; text: string; done: boolean; createdAt: number };
type Mode = 'focus' | 'break' | 'long';
type Stats = { date: string; sessions: number; minutes: number };

const today = () => new Date().toISOString().slice(0, 10);

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function save(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* private mode */ }
}

function chime() {
  try {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    const ctx = new Ctor();
    const note = (freq: number, at: number) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, ctx.currentTime + at);
      g.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + at + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + at + 0.6);
      o.connect(g); g.connect(ctx.destination);
      o.start(ctx.currentTime + at); o.stop(ctx.currentTime + at + 0.7);
    };
    note(660, 0); note(880, 0.18);
  } catch { /* no audio */ }
}

const FOCUS_PRESETS = [15, 25, 50, 90];
const BREAK_PRESETS = [5, 10, 15];

export default function App() {
  const [todos, setTodos] = useState<Todo[]>(() => load<Todo[]>('if.todos', []));
  const [text, setText] = useState('');
  const [oneId, setOneId] = useState<string | null>(() => load<string | null>('if.one', null));

  const [focusMin, setFocusMin] = useState<number>(() => load<number>('if.focusMin', 25));
  const [breakMin, setBreakMin] = useState<number>(() => load<number>('if.breakMin', 5));
  const [mode, setMode] = useState<Mode>('focus');
  const [total, setTotal] = useState<number>(() => load<number>('if.focusMin', 25) * 60);
  const [left, setLeft] = useState<number>(() => load<number>('if.focusMin', 25) * 60);
  const [running, setRunning] = useState(false);

  const [stats, setStats] = useState<Stats>(() => {
    const s = load<Stats>('if.stats', { date: today(), sessions: 0, minutes: 0 });
    return s.date === today() ? s : { date: today(), sessions: 0, minutes: 0 };
  });

  useEffect(() => save('if.todos', todos), [todos]);
  useEffect(() => save('if.one', oneId), [oneId]);
  useEffect(() => save('if.focusMin', focusMin), [focusMin]);
  useEffect(() => save('if.breakMin', breakMin), [breakMin]);
  useEffect(() => save('if.stats', stats), [stats]);

  useEffect(() => {
    if (!running) return;
    const t = window.setInterval(() => setLeft(l => l - 1), 1000);
    return () => window.clearInterval(t);
  }, [running]);

  useEffect(() => {
    if (left > 0 || !running) return;
    setRunning(false);
    chime();
    if (mode === 'focus') {
      const next: Stats = { ...stats, sessions: stats.sessions + 1, minutes: stats.minutes + focusMin };
      setStats(next);
      const m: Mode = next.sessions % 4 === 0 ? 'long' : 'break';
      const secs = (m === 'long' ? 15 : breakMin) * 60;
      setMode(m); setLeft(secs); setTotal(secs);
    } else {
      const secs = focusMin * 60;
      setMode('focus'); setLeft(secs); setTotal(secs);
    }
  }, [left, running]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const mm = String(Math.floor(Math.max(0, left) / 60)).padStart(2, '0');
    const ss = String(Math.max(0, left) % 60).padStart(2, '0');
    document.title = running ? `${mm}:${ss} · ${mode === 'focus' ? 'Focus' : 'Break'}` : 'Intentional Focus';
  }, [left, running, mode]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.code === 'Space') { e.preventDefault(); setRunning(r => !r); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  function addTodo(e: React.FormEvent) {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    setTodos([{ id: String(Date.now()), text: t, done: false, createdAt: Date.now() }, ...todos]);
    setText('');
  }

  function setFocusPreset(min: number) {
    setFocusMin(min);
    if (mode === 'focus' && !running) { setLeft(min * 60); setTotal(min * 60); }
  }
  function setBreakPreset(min: number) {
    setBreakMin(min);
    if (mode !== 'focus' && !running) { setLeft(min * 60); setTotal(min * 60); }
  }
  function reset() {
    setRunning(false);
    const secs = (mode === 'focus' ? focusMin : mode === 'long' ? 15 : breakMin) * 60;
    setLeft(secs); setTotal(secs);
  }
  function skip() {
    setRunning(false);
    if (mode === 'focus') {
      const secs = breakMin * 60; setMode('break'); setLeft(secs); setTotal(secs);
    } else {
      const secs = focusMin * 60; setMode('focus'); setLeft(secs); setTotal(secs);
    }
  }

  const one = todos.find(t => t.id === oneId) ?? null;
  const open = todos.filter(t => !t.done);
  const done = todos.filter(t => t.done);
  const mm = String(Math.floor(Math.max(0, left) / 60)).padStart(2, '0');
  const ss = String(Math.max(0, left) % 60).padStart(2, '0');
  const progress = total > 0 ? 1 - Math.max(0, left) / total : 0;
  const dateLabel = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="page">
      <header className="head">
        <div>
          <span className="eyebrow">INTENTIONAL FOCUS</span>
          <h1>{dateLabel}</h1>
        </div>
        <span className="stat">{stats.sessions} sessions · {stats.minutes} min today</span>
      </header>

      <main className="grid">
        <section className="card timer">
          <div className="modeRow">
            <span className={`modeTag ${mode === 'focus' ? 'on' : ''}`}>Focus</span>
            <span className={`modeTag ${mode !== 'focus' ? 'on' : ''}`}>{mode === 'long' ? 'Long break' : 'Break'}</span>
            <span className="dots">
              {[0, 1, 2, 3].map(i => (
                <span key={i} className={`dot ${i < stats.sessions % 4 ? 'filled' : ''}`} />
              ))}
            </span>
          </div>

          <div className="clock">{mm}:{ss}</div>
          <div className="track"><div className="fill" style={{ width: `${(progress * 100).toFixed(1)}%` }} /></div>

          <div className="controls">
            <button className="btn" onClick={() => setRunning(r => !r)}>{running ? 'Pause' : 'Start'}</button>
            <button className="btn ghost" onClick={reset}>Reset</button>
            <button className="btn ghost" onClick={skip}>Skip</button>
          </div>

          <div className="presets">
            <span className="pLabel">Focus</span>
            {FOCUS_PRESETS.map(p => (
              <button key={p} className={`chip ${focusMin === p ? 'on' : ''}`} onClick={() => setFocusPreset(p)}>{p}</button>
            ))}
            <span className="pLabel">Break</span>
            {BREAK_PRESETS.map(p => (
              <button key={p} className={`chip ${breakMin === p ? 'on' : ''}`} onClick={() => setBreakPreset(p)}>{p}</button>
            ))}
          </div>
          <p className="hint">Space starts and pauses. Every 4th focus earns a long break.</p>
        </section>

        <div className="col">
          <section className="card one">
            <span className="eyebrow">THE ONE THING</span>
            {one ? <p className="oneText">{one.text}</p> : <p className="oneEmpty">Star a task below to make it the one thing.</p>}
          </section>

          <section className="card list">
            <form className="addRow" onSubmit={addTodo}>
              <input
                className="addInput"
                placeholder="Add a thing to do..."
                value={text}
                onChange={e => setText(e.target.value)}
              />
              <button className="btn" type="submit">Add</button>
            </form>

            {open.length === 0 && done.length === 0 && (
              <p className="empty">Nothing on the list. Add the first thing.</p>
            )}

            <ul>
              {open.map(t => (
                <li key={t.id} className="row">
                  <button className="check" aria-label="complete" onClick={() => setTodos(todos.map(x => x.id === t.id ? { ...x, done: true } : x))} />
                  <span className="task">{t.text}</span>
                  <button className={`star ${oneId === t.id ? 'on' : ''}`} title="Make it the one thing" onClick={() => setOneId(oneId === t.id ? null : t.id)}>•</button>
                  <button className="del" aria-label="delete" onClick={() => setTodos(todos.filter(x => x.id !== t.id))}>×</button>
                </li>
              ))}
              {done.map(t => (
                <li key={t.id} className="row done">
                  <button className="check filled" aria-label="reopen" onClick={() => setTodos(todos.map(x => x.id === t.id ? { ...x, done: false } : x))} />
                  <span className="task">{t.text}</span>
                  <button className="del" aria-label="delete" onClick={() => setTodos(todos.filter(x => x.id !== t.id))}>×</button>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}
