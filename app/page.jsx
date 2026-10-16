"use client";

import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Check, ChevronDown, CircleHelp, Clock3, Flag, GraduationCap, RotateCcw, Send, Sparkles, X } from 'lucide-react';
import weekData from '../data/questions.json';

const allQuestions = weekData.flatMap((w) => w.questions);
const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);
const fmt = (seconds) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

export default function Home() {
  const [view, setView] = useState('home');
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [testMode, setTestMode] = useState('week');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [marked, setMarked] = useState({});
  const [index, setIndex] = useState(0);
  const [seconds, setSeconds] = useState(20 * 60);
  const [duration, setDuration] = useState(20);
  const [submitted, setSubmitted] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    try { setHistory(JSON.parse(localStorage.getItem('nptel-mock-history') || '[]')); } catch {}
  }, []);

  useEffect(() => {
    if (view !== 'test' || submitted) return;
    if (seconds <= 0) { finishTest(); return; }
    const timer = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [view, submitted, seconds]);

  const current = questions[index];
  const answeredCount = Object.keys(answers).filter((id) => answers[id] !== undefined).length;
  const score = questions.reduce((sum, q) => sum + (answers[q.id] === q.answer ? 1 : 0), 0);
  const percent = questions.length ? Math.round((score / questions.length) * 100) : 0;
  const grouped = useMemo(() => weekData, []);

  function startTest(mode, week = selectedWeek, shuffleQuestions = false) {
    let qs = mode === 'full' ? allQuestions : (weekData.find((w) => w.week === week)?.questions || []);
    if (shuffleQuestions) qs = shuffle(qs);
    setQuestions(qs.map((q) => ({ ...q, options: q.options })));
    setAnswers({}); setMarked({}); setIndex(0); setSubmitted(false); setConfirmSubmit(false); setShowAnswers(false);
    setTestMode(mode); setSelectedWeek(week);
    const mins = mode === 'full' ? 130 : 20;
    setDuration(mins); setSeconds(mins * 60); setView('test');
  }

  function finishTest() {
    setSubmitted(true); setConfirmSubmit(false);
    const record = { date: new Date().toLocaleString(), mode: testMode, week: selectedWeek, score, total: questions.length, percent };
    setHistory((prev) => {
      const next = [record, ...prev].slice(0, 8);
      try { localStorage.setItem('nptel-mock-history', JSON.stringify(next)); } catch {}
      return next;
    });
  }

  function chooseAnswer(key) { if (!submitted) setAnswers((prev) => ({ ...prev, [current.id]: key })); }
  function toggleMark() { setMarked((prev) => ({ ...prev, [current.id]: !prev[current.id] })); }
  function goTo(i) { setIndex(Math.max(0, Math.min(questions.length - 1, i))); }

  if (view === 'test' && current) {
    const status = (q, i) => submitted ? (answers[q.id] === q.answer ? 'correct' : answers[q.id] ? 'wrong' : 'unanswered') : answers[q.id] ? 'answered' : marked[q.id] ? 'marked' : 'unanswered';
    return <main className="exam-shell">
      <header className="exam-topbar">
        <button className="brand brand-button" onClick={() => setView('home')}><span className="brand-icon"><GraduationCap size={21}/></span><span><b>Mock<span className="brand-accent">Lab</span></b><small>NPTEL · Psychology of Learning</small></span></button>
        <div className="exam-top-right"><span className="mode-pill">{testMode === 'full' ? 'Full-length mock' : `Week ${selectedWeek}`}</span><div className={`timer ${seconds < 120 ? 'timer-low' : ''}`}><Clock3 size={17}/><span>{submitted ? 'Completed' : fmt(seconds)}</span></div></div>
      </header>
      <div className="exam-progress"><span style={{ width: `${((index + 1) / questions.length) * 100}%` }} /></div>
      <div className="exam-layout">
        <section className="question-panel">
          <div className="question-meta"><span>QUESTION {index + 1} <span className="muted">/ {questions.length}</span></span><span className="question-type">Single correct answer</span></div>
          <h1 className="question-title">{current.question}</h1>
          <p className="instruction">Choose the most appropriate option.</p>
          <div className="options-list">
            {current.options.map((opt) => {
              const chosen = answers[current.id] === opt.key;
              const isRight = submitted && current.answer === opt.key;
              const isWrong = submitted && chosen && current.answer !== opt.key;
              return <button key={opt.key} className={`option ${chosen ? 'option-selected' : ''} ${isRight ? 'option-correct' : ''} ${isWrong ? 'option-wrong' : ''}`} onClick={() => chooseAnswer(opt.key)} disabled={submitted}>
                <span className="option-key">{opt.key}</span><span className="option-text">{opt.text}</span>{chosen && !submitted && <span className="option-check"><Check size={17}/></span>}{isRight && <span className="option-check"><Check size={17}/></span>}{isWrong && <span className="option-check"><X size={17}/></span>}
              </button>;
            })}
          </div>
          {submitted && <div className={`answer-feedback ${answers[current.id] === current.answer ? 'feedback-good' : 'feedback-bad'}`}><b>{answers[current.id] === current.answer ? 'Correct answer' : 'Correct answer: ' + current.answer}</b><span>{current.options.find((o) => o.key === current.answer)?.text}</span>{current.sourceNote && <small>{current.sourceNote}</small>}</div>}
          <div className="question-actions"><button className={`btn btn-quiet ${marked[current.id] ? 'marked-button' : ''}`} onClick={toggleMark} disabled={submitted}><Flag size={16}/>{marked[current.id] ? 'Marked for review' : 'Mark for review'}</button><div className="action-spacer"/><button className="btn btn-outline" onClick={() => goTo(index - 1)} disabled={index === 0}><ArrowLeft size={16}/> Previous</button>{index < questions.length - 1 ? <button className="btn btn-primary" onClick={() => goTo(index + 1)}>Next <ArrowRight size={16}/></button> : submitted ? <button className="btn btn-primary" onClick={() => setView('results')}>View results <ArrowRight size={16}/></button> : <button className="btn btn-primary" onClick={() => setConfirmSubmit(true)}><Send size={16}/> Submit test</button>}</div>
        </section>
        <aside className="question-sidebar">
          <div className="side-card"><div className="side-card-title"><h3>Question palette</h3><span>{answeredCount}/{questions.length} answered</span></div><div className="palette-legend"><span><i className="legend-dot legend-answered"/>Answered</span><span><i className="legend-dot legend-marked"/>Review</span><span><i className="legend-dot legend-empty"/>Unvisited</span></div><div className="palette-grid">{questions.map((q, i) => <button key={q.id} onClick={() => goTo(i)} className={`palette-number ${i === index ? 'palette-current' : ''} ${status(q, i)} ${marked[q.id] && !submitted ? 'palette-marked' : ''}`} aria-label={`Question ${i + 1}`}>{i + 1}</button>)}</div><div className="side-stats"><div><span>Answered</span><b>{answeredCount}</b></div><div><span>Remaining</span><b>{questions.length - answeredCount}</b></div><div><span>For review</span><b>{Object.values(marked).filter(Boolean).length}</b></div></div></div>
          <div className="side-card test-info"><div className="side-card-title"><h3>Test instructions</h3><CircleHelp size={17}/></div><ul><li>Select one option for each question.</li><li>Use the palette to jump between questions.</li><li>Mark questions to revisit before submitting.</li><li>Correct answers appear after submission.</li></ul>{!submitted && <button className="btn btn-submit-wide" onClick={() => setConfirmSubmit(true)}>Submit test <ArrowRight size={16}/></button>}</div>
        </aside>
      </div>
      {confirmSubmit && <div className="modal-backdrop"><div className="confirm-modal"><button className="modal-close" onClick={() => setConfirmSubmit(false)}><X size={18}/></button><div className="modal-icon"><Send size={21}/></div><h2>Submit your test?</h2><p>You have answered <b>{answeredCount} of {questions.length}</b> questions. Unanswered questions will be marked incorrect.</p><div className="modal-actions"><button className="btn btn-outline" onClick={() => setConfirmSubmit(false)}>Keep practising</button><button className="btn btn-primary" onClick={finishTest}>Submit test</button></div></div></div>}
    </main>;
  }

  if (view === 'results') return <main className="site-shell"><header className="topbar"><Brand onHome={() => setView('home')}/><button className="btn btn-outline" onClick={() => setView('home')}><ArrowLeft size={16}/> Dashboard</button></header><section className="results-wrap"><div className="results-hero"><div className="result-icon"><Sparkles size={24}/></div><p className="eyebrow">TEST COMPLETED</p><h1>Your practice report</h1><p className="subtext">Review your answers and use the results to plan your next revision session.</p><div className="score-ring" style={{'--score':`${percent}%`}}><div><b>{score}<small>/{questions.length}</small></b><span>{percent}% score</span></div></div><div className="result-stats"><div><span>Correct</span><b className="green-text">{score}</b></div><div><span>Incorrect</span><b className="red-text">{answeredCount - score}</b></div><div><span>Unanswered</span><b>{questions.length - answeredCount}</b></div></div><div className="result-buttons"><button className="btn btn-primary" onClick={() => {setView('test');setSubmitted(true);setIndex(0)}}><BookOpen size={16}/> Review answers</button><button className="btn btn-outline" onClick={() => startTest(testMode, selectedWeek, true)}><RotateCcw size={16}/> Retake test</button><button className="btn btn-quiet" onClick={() => setView('home')}>Dashboard</button></div></div><div className="review-list"><div className="section-heading"><div><p className="eyebrow">ANSWER KEY</p><h2>Question review</h2></div><span className="review-count">{questions.length} questions</span></div>{questions.map((q,i)=><div className="review-item" key={q.id}><div className={`review-status ${answers[q.id]===q.answer?'review-correct':'review-wrong'}`}>{answers[q.id]===q.answer?<Check size={16}/>:<X size={16}/>}</div><div className="review-content"><span className="review-q-label">QUESTION {i+1}</span><h3>{q.question}</h3><p className={answers[q.id]===q.answer?'green-text':'red-text'}>Your answer: {answers[q.id] ? `${answers[q.id]}. ${q.options.find(o=>o.key===answers[q.id])?.text}` : 'Not answered'}</p><p className="green-text">Correct answer: {q.answer}. {q.options.find(o=>o.key===q.answer)?.text}</p>{q.sourceNote&&<small className="source-note">{q.sourceNote}</small>}</div></div>)}</div></section></main>;

  return <main className="site-shell"><header className="topbar"><Brand onHome={() => setView('home')}/><div className="topbar-right"><span className="status-chip"><span/> Ready to practise</span><button className="avatar">PL</button></div></header>
    <section className="hero"><div className="hero-copy"><div className="course-label"><span className="course-dot"/> NPTEL · JULY 2026</div><h1>Learn it. Test it.<br/><span>Master it.</span></h1><p>Practice Psychology of Learning assignments with a focused mock-test experience. Work week by week or challenge yourself with a full-length mock.</p><div className="hero-buttons"><button className="btn btn-primary btn-large" onClick={() => startTest('week',selectedWeek)}><BookOpen size={18}/> Continue practice <ArrowRight size={17}/></button><button className="btn btn-glass btn-large" onClick={() => startTest('full')}><Sparkles size={17}/> Full mock test</button></div><div className="hero-proof"><span><Check size={15}/> 13 assignment sets</span><span><Check size={15}/> 130 questions</span><span><Check size={15}/> Instant scoring</span></div></div><div className="hero-art"><div className="art-glow"/><div className="art-card art-card-back"><div className="art-mini-line"/><div className="art-mini-line short"/><div className="art-mini-line"/><div className="art-mini-line medium"/></div><div className="art-card art-card-front"><div className="art-card-top"><span className="art-icon"><GraduationCap size={21}/></span><span className="art-live">PRACTICE MODE</span></div><div className="art-card-heading">Your next<br/>best score.</div><div className="art-progress-label"><span>Weekly progress</span><b>72%</b></div><div className="art-progress"><span/></div><div className="art-bottom"><span><Check size={14}/> Stay consistent</span><span>✦</span></div></div><div className="floating-score"><div className="floating-score-icon"><Check size={17}/></div><div><b>Keep going!</b><small>Every question counts</small></div></div></div></section>
    <section className="stats-strip"><Stat value="13" label="Assignment sets"/><Stat value="130" label="Practice questions"/><Stat value="2 modes" label="Week-wise + full mock"/><Stat value="∞" label="Retakes"/></section>
    <section className="content-section"><div className="section-heading"><div><p className="eyebrow">YOUR WORKSPACE</p><h2>Choose your practice</h2><p className="section-sub">Pick a week to revise specific concepts or test your overall preparation.</p></div><div className="view-tag"><span/> Question bank loaded</div></div><div className="practice-grid"><article className="practice-card weekly-card"><div className="practice-card-top"><div className="practice-icon purple-icon"><BookOpen size={21}/></div><span className="tag tag-purple">FOCUSED PRACTICE</span></div><h3>Week-wise practice</h3><p>Take one assignment at a time. Review your accuracy and strengthen the concepts you find tricky.</p><label className="select-label" htmlFor="week-select">Select assignment week</label><div className="select-wrap"><select id="week-select" value={selectedWeek} onChange={(e)=>setSelectedWeek(Number(e.target.value))}>{grouped.map((w)=><option key={w.week} value={w.week}>{w.week===0?'Week 0 · Introduction':`Week ${w.week}`} · ${w.questions.length} questions</option>)}</select><ChevronDown size={17}/></div><div className="week-preview"><span className="preview-dots"><i/><i/><i/><i/><i/></span><span>{weekData.find(w=>w.week===selectedWeek)?.questions.length} questions · No time pressure</span></div><button className="btn btn-primary full-width" onClick={()=>startTest('week',selectedWeek)}>Start week {selectedWeek} <ArrowRight size={17}/></button></article><article className="practice-card full-card"><div className="practice-card-top"><div className="practice-icon blue-icon"><Clock3 size={21}/></div><span className="tag tag-blue">EXAM SIMULATION</span></div><h3>Full-length mock</h3><p>Bring all 13 assignment sets together in one timed session. Build stamina and check your overall readiness.</p><div className="mock-specs"><div><span>Questions</span><b>130</b></div><div><span>Time limit</span><b>130 min</b></div><div><span>Scoring</span><b>Instant</b></div></div><div className="mock-note"><Clock3 size={16}/><span>Timer starts as soon as you begin. Answers are revealed after submission.</span></div><button className="btn btn-primary full-width" onClick={()=>startTest('full')}>Start full mock <ArrowRight size={17}/></button></article></div></section>
    <section className="content-section week-section"><div className="section-heading"><div><p className="eyebrow">QUESTION BANK</p><h2>All assignment weeks</h2><p className="section-sub">Jump straight into any assignment. Each week contains 10 questions from your uploaded PDF.</p></div><span className="week-total">13 weeks · 130 questions</span></div><div className="week-grid">{grouped.map((w)=>{const done=history.filter(h=>h.mode==='week'&&h.week===w.week).length;return <button className="week-tile" key={w.week} onClick={()=>startTest('week',w.week)}><div className={`week-tile-icon ${w.week%3===0?'tile-lilac':w.week%3===1?'tile-mint':'tile-peach'}`}><span>{String(w.week).padStart(2,'0')}</span></div><div className="week-tile-copy"><b>{w.week===0?'Introduction':`Week ${w.week}`}</b><span>10 questions</span></div><ArrowRight size={17} className="tile-arrow"/><div className="tile-bottom"><span>{done?`${done} attempt${done>1?'s':''}`:'Ready to start'}</span><i className={done?'tile-done':''}/></div></button>})}</div></section>
    {history.length>0&&<section className="content-section history-section"><div className="section-heading"><div><p className="eyebrow">YOUR ACTIVITY</p><h2>Recent attempts</h2></div><button className="btn btn-quiet" onClick={()=>{setHistory([]);localStorage.removeItem('nptel-mock-history')}}>Clear history</button></div><div className="history-list">{history.slice(0,5).map((h,i)=><div className="history-row" key={i}><div className="history-icon"><BookOpen size={17}/></div><div className="history-copy"><b>{h.mode==='full'?'Full-length mock':`Week ${h.week} practice`}</b><span>{h.date}</span></div><div className="history-score"><b>{h.score}/{h.total}</b><span>{h.percent}%</span></div></div>)}</div></section>}
    <footer className="footer"><Brand onHome={()=>setView('home')}/><span>Independent practice tool · Built from your uploaded assignment PDF</span><span>Made for focused learning <Sparkles size={14}/></span></footer>
  </main>;
}

function Brand({onHome}) { return <button className="brand brand-button" onClick={onHome}><span className="brand-icon"><GraduationCap size={21}/></span><span><b>Mock<span className="brand-accent">Lab</span></b><small>NPTEL practice workspace</small></span></button>; }
function Stat({value,label}) { return <div className="stat-item"><b>{value}</b><span>{label}</span></div>; }
