import './style.css';
import { examples, practiceReply, escapeHtml as esc } from './examples.js';

const paths = {
  spark: '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z"/>',
  chat: '<path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H4l-2 2V11.5a9.5 9.5 0 0 1 19 0Z"/><path d="M7 10h10M7 14h6"/>',
  bookmark: '<path d="M6 4h12v17l-6-4-6 4Z"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9 9a3 3 0 0 1 6 0c0 2-3 2-3 4m0 3h.01"/>',
  mic: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0M12 17v5M8 22h8"/>',
  arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
  pen: '<path d="m16 3 5 5-12 12-6 1 1-6ZM13 6l5 5"/>',
  phone: '<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M10 18h4"/>',
  leaf: '<path d="M20 3C8 2 2 9 6 16s16 3 14-13ZM4 21 16 9"/>',
  volume: '<path d="m11 4-6 5H2v6h3l6 5ZM15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
};
const icon = name => `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.spark}</svg>`;
const app = document.querySelector('#app');
function read(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } }
const stored = read('carly-saved', []);
const state = { view: 'home', messages: [], draft: '', busy: false, mode: 'practice', listening: false, speaking: null, large: read('carly-large', false) === true, saved: Array.isArray(stored) ? stored.filter(x => typeof x?.content === 'string' && typeof x?.question === 'string' && typeof x?.id === 'string').slice(0,50) : [] };
let recognition;
let controller;
let lastFocus;
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
function persist(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { announce('This browser could not save that. Your settings will last until you close this page.'); return false; } }
function announce(text) { document.querySelector('#status').textContent = text; }
function stopSpeaking() { window.speechSynthesis?.cancel(); state.speaking = null; document.querySelectorAll('[data-read]').forEach(b => { b.innerHTML = `${icon('volume')} Read aloud`; }); }
function readAloud(text, id) {
  if (state.speaking === id) { stopSpeaking(); return; }
  stopSpeaking();
  if (!window.speechSynthesis) return announce('Reading aloud is not available in this browser. You can read the answer on screen.');
  state.speaking = id;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = .88;
  utterance.onend = () => { if (state.speaking === id) stopSpeaking(); };
  utterance.onerror = () => { if (state.speaking === id) { stopSpeaking(); announce('Reading aloud stopped. Please try again.'); } };
  document.querySelectorAll('[data-read]').forEach(b => { if (b.dataset.read === id) b.innerHTML = `${icon('volume')} Stop reading`; });
  window.speechSynthesis.speak(utterance);
}

app.innerHTML = `<a class="skip-link" href="#main">Skip to main content</a>
<header class="topbar"><button class="brand" data-view="home" aria-label="CARLY home"><span class="brand-mark">${icon('spark')}</span>carly<span class="brand-dot">.</span></button>
<nav aria-label="Main navigation"><button data-view="home">${icon('chat')}<span>Let's talk</span></button><button data-view="saved">${icon('bookmark')}<span>Saved answers</span><span id="saved-count"></span></button><button data-view="guide">${icon('help')}<span>How to use Carly</span></button></nav>
<button class="text-size" id="text-size" aria-pressed="false"><span aria-hidden="true">Aa</span> Larger text</button></header>
<main id="main" tabindex="-1"></main>
<footer><span>${icon('spark')} A little help. A world of possibilities.</span><button id="privacy">${icon('lock')} Your privacy</button></footer>
<div id="status" class="sr-only" role="status" aria-live="polite"></div>
<dialog id="dialog" aria-labelledby="dialog-title"><div id="dialog-content"></div><button class="button primary" id="close-dialog">Got it</button></dialog>`;

function syncNav() {
  document.querySelectorAll('nav [data-view]').forEach(b => { if (b.dataset.view === state.view) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
  document.querySelector('#saved-count').textContent = state.saved.length ? state.saved.length : '';
  document.documentElement.classList.toggle('large-text', state.large);
  document.querySelector('#text-size').setAttribute('aria-pressed', String(state.large));
}
function home() {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  return `<section class="welcome"><div class="welcome-text"><p class="eyebrow">${icon('sun')} ${greeting}. Make yourself at home.</p><h1>A little curious?<br>You're in the <em>right place.</em></h1><p>I'm Carly, your AI helper for everyday life.<br>Ask a question, try an idea, or learn something new.<br class="desktop-break"> We'll take it one step at a time.</p></div><div class="welcome-art" aria-hidden="true"><div class="orbit orbit-one"></div><div class="orbit orbit-two"></div><span class="small-spark">✦</span><div class="carly-flower"><i></i><i></i><i></i><i></i><i></i><i></i><div class="flower-face"><b></b><b></b><span></span></div></div><span class="art-note">Here to help you bloom.</span></div></section>
  <section class="conversation" aria-labelledby="conversation-title"><div class="conversation-heading"><div class="helper-avatar">${icon('spark')}</div><div><h2 id="conversation-title">What would you like a hand with?</h2><p>No special words needed. Just ask in your own way.</p></div><span class="mode-label">${state.mode === 'live' ? 'AI connected' : 'Practice mode'}</span></div>
  <div id="messages" role="log" aria-label="Your conversation" aria-live="polite" aria-relevant="additions"></div>
  <div id="request-error" role="alert"></div>
  <form id="ask-form"><label class="sr-only" for="question">Your question</label><textarea id="question" rows="2" maxlength="4000" placeholder="Type your question here…" aria-describedby="input-note">${esc(state.draft)}</textarea><div class="composer-actions"><button type="button" class="button voice" id="talk">${icon('mic')} ${SpeechRecognition ? 'Speak your question' : 'Voice unavailable'}</button><button class="button primary" id="send" type="submit">Ask Carly ${icon('arrow')}</button></div></form>
  <div class="input-note" id="input-note">${state.mode === 'live' ? 'Your conversation is sent to OpenAI to answer. Avoid sharing sensitive details.' : 'Try the prepared examples below. Live AI is not connected yet.'}</div>
  <div class="conversation-tools" id="conversation-tools" hidden><button id="new-chat" class="text-button">Start a new conversation</button><span>AI can make mistakes. Check important information.</span></div></section>
  <section class="ideas" aria-labelledby="ideas-title"><div class="section-heading"><div><p class="eyebrow">A GOOD PLACE TO START</p><h2 id="ideas-title">Everyday things, made a little easier.</h2></div><span>Choose something to try ${icon('arrow')}</span></div><div class="idea-grid">${examples.map(item => `<button class="idea-card ${item.color}" data-example="${item.id}"><span class="idea-icon">${icon(item.icon)}</span><h3>${item.title}</h3><p>${item.description}</p><span class="example-link">Try a question ${icon('arrow')}</span></button>`).join('')}</div></section>
  <aside class="reassurance"><span class="reassurance-icon">${icon('leaf')}</span><div><h2>You don't have to be good with technology.</h2><p>You just have to be you. There's no rush, and every question is welcome.</p></div><button class="text-button" data-view="guide">Let’s get started ${icon('arrow')}</button></aside>`;
}
function savedView() {
  return `<section class="page-heading"><p class="eyebrow">KEEP THE USEFUL THINGS CLOSE</p><h1>Your saved <em>answers.</em></h1><p>Answers you chose to keep, stored in this browser on this device.</p></section><div class="saved-list">${state.saved.length ? state.saved.map(item => `<article class="saved-card"><p class="eyebrow">${item.practice ? 'PRACTICE EXAMPLE' : 'SAVED ANSWER'}</p><h2>${esc(item.question)}</h2><p class="answer-text">${esc(item.content)}</p><div class="answer-actions"><button class="button secondary" data-read="${esc(item.id)}">${icon('volume')} Read aloud</button><button class="text-button" data-remove="${esc(item.id)}">Remove saved answer</button></div></article>`).join('') : `<div class="empty-state">${icon('bookmark')}<h2>A place for your “that’s helpful” moments.</h2><p>Choose “Save answer” after a reply to keep it here.<br>Only answers you choose to save will be kept.</p><button class="button primary" data-view="home">Ask your first question ${icon('arrow')}</button></div>`}</div>`;
}
function guideView() {
  return `<section class="page-heading"><p class="eyebrow">AT YOUR OWN PACE</p><h1>A helping hand.<br><em>Without the handbook.</em></h1><p>Carly uses artificial intelligence — software that can explain ideas and help you write. You can talk to it using ordinary words.</p></section><section class="guide-grid">${[
    ['1', 'Start with a question', 'Type in the question box, or choose one of the examples. You might ask, “Can you explain this more simply?”'],
    ['2', 'Choose what works for you', 'Use “Larger text” at the top of the page. Choose “Read aloud” on an answer to hear it, and choose it again to stop.'],
    ['3', 'Keep the conversation going', 'With live AI connected, you can ask follow-up questions. Save a useful answer to find it again on this device.'],
  ].map(([n,title,copy]) => `<article><span class="step-number">${n}</span><h2>${title}</h2><p>${copy}</p></article>`).join('')}</section><section class="guide-details"><h2>A few things worth knowing</h2><details><summary>How do I use my voice?</summary><p>Choose “Speak your question” and allow microphone access if your browser asks. Speak normally, then choose “Finish speaking”. Your words appear in the question box so you can check or change them before choosing “Ask Carly”. Your browser may send audio to its speech service. Typing always works too.</p></details><details><summary>What can Carly do?</summary><p>Carly can help explain ideas, draft messages, suggest creative activities, and guide you through everyday technology. It cannot make calls, send messages, set reminders, or access your accounts. It can make mistakes and does not check live information.</p></details><details><summary>What does practice mode mean?</summary><p>Practice mode lets you explore with four prepared answers. It is not a live AI conversation. When the app owner connects live AI, Carly can answer your own questions and follow-ups.</p></details><details><summary>Are my conversations saved?</summary><p>Conversations stay in this open page and disappear when you reload or start a new conversation. Answers you explicitly save and your text size preference are stored in this browser. In live mode, recent conversation messages are sent to OpenAI to generate answers. Its data policies apply. Avoid sharing passwords or sensitive personal information.</p></details><details><summary>Can Carly help in an emergency?</summary><p>Carly cannot contact anyone or provide emergency assistance. If you need urgent help, contact your local emergency services or someone nearby directly.</p></details></section><button class="button primary" data-view="home">Let’s try a question ${icon('arrow')}</button>`;
}
function renderPage(focus = false) {
  syncNav();
  document.querySelector('#main').innerHTML = state.view === 'home' ? home() : state.view === 'saved' ? savedView() : guideView();
  if (state.view === 'home') {
    renderMessages();
    document.querySelector('#question').addEventListener('input', e => { state.draft = e.target.value; });
    document.querySelector('#ask-form').addEventListener('submit', e => { e.preventDefault(); submit(); });
    document.querySelector('#talk').disabled = !SpeechRecognition;
    updateBusy();
  }
  if (focus) document.querySelector('#main').focus();
}
function renderMessages() {
  const el = document.querySelector('#messages');
  if (!el) return;
  el.innerHTML = state.messages.map(m => `<article class="message ${m.role}" data-message="${m.id}"><span class="message-label">${m.role === 'user' ? 'You' : m.practice ? 'Carly · Practice answer' : 'Carly'}</span><p class="answer-text">${esc(m.content)}</p>${m.role === 'assistant' ? `<div class="answer-actions"><button class="text-button" data-read="${m.id}">${icon('volume')} Read aloud</button><button class="text-button" data-save="${m.id}" ${state.saved.some(s => s.id === m.id) ? 'disabled' : ''}>${icon('bookmark')} ${state.saved.some(s => s.id === m.id) ? 'Saved' : 'Save answer'}</button></div>` : ''}</article>`).join('');
  document.querySelector('#conversation-tools').hidden = !state.messages.length;
}
function updateBusy() {
  const send = document.querySelector('#send');
  if (!send) return;
  send.disabled = state.busy || state.listening;
  document.querySelector('#question').readOnly = state.busy;
  send.innerHTML = state.busy ? 'Getting your answer…' : `Ask Carly ${icon('arrow')}`;
  document.querySelector('#talk').disabled = !SpeechRecognition || state.busy;
  document.querySelectorAll('[data-example]').forEach(b => { b.disabled = state.busy || state.listening; });
}
async function submit() {
  const text = state.draft.trim();
  if (!text || state.busy || state.listening) { if (!text) { announce('Write a question first, or choose an example below.'); document.querySelector('#question').focus(); } return; }
  stopSpeaking();
  const message = { id: crypto.randomUUID(), role: 'user', content: text };
  state.messages.push(message);
  state.draft = '';
  document.querySelector('#question').value = '';
  state.busy = true;
  document.querySelector('#request-error').textContent = '';
  renderMessages(); updateBusy();
  announce('Getting your answer.');
  controller = new AbortController();
  const activeController = controller;
  const timeout = setTimeout(() => activeController.abort(), 50000);
  try {
    let reply;
    if (state.mode === 'practice') reply = practiceReply(text);
    else {
      const response = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: state.messages.slice(-19).map(({role,content}) => ({role,content})) }), signal: activeController.signal });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Carly could not answer right now. Please try again.');
      if (typeof data.reply !== 'string' || !data.reply.trim()) throw new Error('No answer arrived. Please try again.');
      reply = data.reply;
    }
    if (controller !== activeController) return;
    state.messages.push({ id: crypto.randomUUID(), role: 'assistant', content: reply, question: text, practice: state.mode === 'practice' });
    renderMessages();
    document.querySelector('#messages article:last-child')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  } catch (error) {
    if (controller !== activeController) return;
    state.messages = state.messages.filter(m => m.id !== message.id);
    state.draft = text;
    renderMessages();
    const input = document.querySelector('#question');
    if (input) input.value = text;
    const notice = error.name === 'AbortError' ? 'That took too long. Your question is still here. Please try again.' : error.message;
    const errorEl = document.querySelector('#request-error');
    if (errorEl) errorEl.textContent = notice;
    else announce(notice);
  } finally {
    clearTimeout(timeout);
    if (controller === activeController) { state.busy = false; controller = null; updateBusy(); }
  }
}
function stopListening() {
  if (recognition) { const old = recognition; recognition = null; old.abort(); }
  state.listening = false;
}
function listen() {
  if (state.listening) { recognition?.stop(); return; }
  if (!SpeechRecognition || state.busy) return;
  stopSpeaking();
  const session = new SpeechRecognition();
  recognition = session;
  session.lang = document.documentElement.lang || 'en-US'; session.interimResults = true; session.continuous = false;
  const initial = state.draft;
  session.onresult = event => {
    if (recognition !== session) return;
    const transcript = Array.from(event.results).map(r => r[0].transcript).join(' ');
    state.draft = (initial + ' ' + transcript).trim().slice(0,4000);
    const input = document.querySelector('#question'); if (input) input.value = state.draft;
  };
  session.onerror = event => {
    if (recognition !== session) return;
    announce(event.error === 'not-allowed' ? 'Microphone access was not allowed. You can type your question instead.' : 'I couldn’t hear you. You can try again or type your question.');
  };
  session.onend = () => {
    if (recognition !== session) return;
    recognition = null; state.listening = false;
    const button = document.querySelector('#talk'); if (button) { button.innerHTML = `${icon('mic')} Speak your question`; button.classList.remove('listening'); }
    updateBusy(); document.querySelector('#question')?.focus();
  };
  try { session.start(); state.listening = true; document.querySelector('#talk').innerHTML = `${icon('mic')} Finish speaking`; document.querySelector('#talk').classList.add('listening'); updateBusy(); announce('Listening. Your words will appear in the question box.'); }
  catch { stopListening(); announce('The microphone could not start. Please type your question.'); updateBusy(); }
}
function openDialog(title, text, action) {
  lastFocus = document.activeElement;
  document.querySelector('#dialog-content').innerHTML = `<h2 id="dialog-title">${esc(title)}</h2><p>${esc(text)}</p>${action ? '<button class="button secondary" id="confirm-action">Yes, clear conversation</button>' : ''}`;
  document.querySelector('#close-dialog').textContent = action ? 'Keep conversation' : 'Got it';
  if (action) document.querySelector('#confirm-action').onclick = () => { action(); document.querySelector('#dialog').close(); };
  document.querySelector('#dialog').showModal();
}
document.querySelector('#dialog').addEventListener('close', () => { if (lastFocus?.isConnected) lastFocus.focus(); else document.querySelector('#question')?.focus(); });
document.addEventListener('click', event => {
  const button = event.target.closest('button'); if (!button) return;
  if (button.dataset.view) { stopSpeaking(); stopListening(); state.view = button.dataset.view; renderPage(true); window.scrollTo({top:0, behavior:'instant'}); }
  if (button.id === 'text-size') { state.large = !state.large; persist('carly-large', state.large); syncNav(); }
  if (button.dataset.example && !state.busy) { state.draft = examples.find(e => e.id === button.dataset.example).prompt; document.querySelector('#question').value = state.draft; document.querySelector('#question').focus(); submit(); }
  if (button.id === 'talk') listen();
  if (button.dataset.read) { const m = [...state.messages, ...state.saved].find(m => m.id === button.dataset.read); if (m) readAloud(m.content, m.id); }
  if (button.dataset.save) {
    const m = state.messages.find(m => m.id === button.dataset.save);
    if (m && !state.saved.some(s => s.id === m.id)) {
      if (state.saved.length >= 50) return announce('You have 50 saved answers. Remove one to save another.');
      const next = [...state.saved, m];
      if (persist('carly-saved', next)) { state.saved = next; button.disabled = true; button.innerHTML = `${icon('check')} Saved`; syncNav(); announce('Answer saved on this device. Find it in Saved answers.'); }
    }
  }
  if (button.dataset.remove) { const next = state.saved.filter(s => s.id !== button.dataset.remove); if (persist('carly-saved', next)) { state.saved = next; stopSpeaking(); renderPage(true); announce('Saved answer removed.'); } }
  if (button.id === 'privacy') openDialog('You choose what to keep.', 'Conversations stay in this page until you reload or clear them. Saved answers and text size are kept in this browser on this device. In live mode, your recent conversation is sent to OpenAI to generate a reply; its data policies apply. Voice input may use your browser’s speech service. Do not share passwords or sensitive personal details.');
  if (button.id === 'close-dialog') document.querySelector('#dialog').close();
  if (button.id === 'new-chat') openDialog('Start fresh?', 'This clears the current conversation. Your saved answers will stay in Saved answers.', () => { controller?.abort(); controller = null; stopSpeaking(); stopListening(); state.messages = []; state.busy = false; state.draft = ''; renderPage(); announce('New conversation started.'); });
});
renderPage();
fetch('/api/status').then(r => r.ok ? r.json() : null).then(data => {
  if (data?.mode === 'live') { state.mode = 'live'; const label = document.querySelector('.mode-label'); if (label) label.textContent = 'AI connected'; const note = document.querySelector('#input-note'); if (note) note.textContent = 'Your conversation is sent to OpenAI to answer. Avoid sharing sensitive details.'; }
}).catch(() => {});
