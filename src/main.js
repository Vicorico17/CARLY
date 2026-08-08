import "./style.css";
import { resolveIntent } from "./intent.js";

const app = document.querySelector("#app");
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const state = {
  view: "home",
  listening: false,
  transcript: "",
  medicationDone: false,
  checkinDone: false,
  alert: null,
  lastResponse: "Good morning, Margaret. How are you feeling today?",
  activity: [
    { time: "8:05 AM", label: "Morning check-in completed", tone: "good" },
    { time: "Yesterday", label: "Evening medication confirmed", tone: "good" },
    { time: "Yesterday", label: "Spoke with Anna for 12 minutes", tone: "neutral" }
  ]
};

const icons = {
  heart: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.7-7.5 1.1-1.1a5.5 5.5 0 0 0 0-7.8Z"/></svg>`,
  mic: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0M12 17v5M8 22h8"/></svg>`,
  phone: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2.1Z"/></svg>`,
  calendar: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></svg>`,
  pill: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.6 4.6 4.6 10.6a5 5 0 0 0 7.1 7.1l6-6a5 5 0 0 0-7.1-7.1Z"/><path d="m8 7 9 9"/></svg>`,
  shield: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></svg>`
};

function speak(text) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.88;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
}

function addActivity(label, tone = "neutral") {
  state.activity.unshift({ time: "Just now", label, tone });
}

function handleIntent(rawText) {
  const intent = resolveIntent(rawText);
  const responses = {
    schedule: "Your next appointment is with Dr. Chen on Thursday at 10:30 in the morning. Anna has arranged the ride.",
    call: "I can help you call Anna. In this demonstration, no real phone call will be placed.",
    connection: "I'm glad you told me. Would you like me to help you call Anna or James? Talking to someone you trust may help.",
    "checkin-positive": "I'm glad to hear that. I've marked your morning check-in complete.",
    unknown: "I didn't quite understand. You can ask about today's plan, say you took your medicine, or ask me to call someone."
  };

  if (intent.type === "emergency") {
    state.alert = "Urgent help requested";
    state.lastResponse = "You may need urgent help. Please call local emergency services now. I would also alert Anna according to your care plan.";
    addActivity("Urgent help requested — escalation started", "alert");
  } else if (intent.type === "medication-complete") {
    state.medicationDone = true;
    state.lastResponse = "Thank you. I've marked your morning medication as taken. I have not changed any medical instructions.";
    addActivity("Morning medication confirmed", "good");
  } else {
    if (intent.type === "checkin-positive") {
      state.checkinDone = true;
      addActivity("Morning check-in completed", "good");
    }
    state.lastResponse = responses[intent.type];
  }
  speak(state.lastResponse);
  render();
}

function startListening() {
  if (!SpeechRecognition) {
    state.lastResponse = "Voice recognition is not available in this browser. Try the demonstration phrases below instead.";
    render();
    return;
  }
  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = true;
  recognition.continuous = false;
  state.listening = true;
  state.transcript = "Listening…";
  render();

  recognition.onresult = (event) => {
    state.transcript = Array.from(event.results).map((result) => result[0].transcript).join("");
    render();
  };
  recognition.onerror = () => {
    state.listening = false;
    state.transcript = "I couldn't hear that. Please try again.";
    render();
  };
  recognition.onend = () => {
    state.listening = false;
    if (state.transcript && state.transcript !== "Listening…") handleIntent(state.transcript);
    else render();
  };
  recognition.start();
}

function header() {
  return `<header class="topbar">
    <button class="brand" data-view="home" aria-label="CARLY home">
      <span class="brand-mark">${icons.heart}</span><span>CARLY</span>
    </button>
    <nav aria-label="Primary navigation">
      <button class="nav-link ${state.view === "home" ? "active" : ""}" data-view="home">Companion</button>
      <button class="nav-link ${state.view === "care" ? "active" : ""}" data-view="care">Care circle</button>
      <button class="nav-link ${state.view === "about" ? "active" : ""}" data-view="about">How it works</button>
    </nav>
    <div class="privacy-chip">${icons.shield}<span>Private demo</span></div>
  </header>`;
}

function companionView() {
  const today = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" }).format(new Date());
  return `<main class="companion-shell">
    <section class="welcome">
      <div>
        <p class="eyebrow">${today}</p>
        <h1>Good morning,<br><em>Margaret.</em></h1>
        <p class="welcome-copy">I'm here to help with your day. You can speak naturally or choose an option below.</p>
      </div>
      <div class="status-card">
        <span class="status-dot"></span>
        <div><strong>Your care circle is connected</strong><span>Anna will be notified only when your plan says so.</span></div>
      </div>
    </section>

    <section class="voice-panel ${state.listening ? "is-listening" : ""}" aria-live="polite">
      <div class="voice-copy">
        <span class="mini-label">CARLY SAYS</span>
        <p>${state.lastResponse}</p>
        ${state.transcript ? `<blockquote>“${state.transcript}”</blockquote>` : ""}
      </div>
      <button class="talk-button" id="talk" aria-label="Talk to CARLY">
        ${icons.mic}<span>${state.listening ? "Listening" : "Talk to CARLY"}</span>
      </button>
    </section>

    <section class="quick-section">
      <div class="section-heading"><div><span class="mini-label">TODAY</span><h2>What can I help with?</h2></div><p>Tap any card to try it.</p></div>
      <div class="action-grid">
        <button class="action-card medicine ${state.medicationDone ? "done" : ""}" data-demo="I took my morning medicine">
          <span class="action-icon">${icons.pill}</span>
          <span><small>8:30 AM</small><strong>${state.medicationDone ? "Medicine recorded" : "Morning medicine"}</strong><em>${state.medicationDone ? "Thank you — all set" : "Tap when you've taken it"}</em></span>
          <b>${state.medicationDone ? "✓" : "→"}</b>
        </button>
        <button class="action-card" data-demo="What is my next appointment">
          <span class="action-icon">${icons.calendar}</span>
          <span><small>THURSDAY</small><strong>Doctor appointment</strong><em>10:30 AM · Ride arranged</em></span><b>→</b>
        </button>
        <button class="action-card" data-demo="Please call Anna">
          <span class="action-icon">${icons.phone}</span>
          <span><small>CARE CIRCLE</small><strong>Call Anna</strong><em>Daughter · Available now</em></span><b>→</b>
        </button>
      </div>
    </section>

    <section class="emergency-bar">
      <div><strong>Need urgent help?</strong><span>CARLY is not an emergency service.</span></div>
      <button data-demo="I fell and need help">Start emergency steps</button>
    </section>
  </main>`;
}

function careView() {
  return `<main class="dashboard-shell">
    <section class="dashboard-head">
      <div><p class="eyebrow">CARE CIRCLE</p><h1>Margaret is <em>doing well.</em></h1><p>Only the updates Margaret has agreed to share appear here.</p></div>
      <div class="updated"><span></span>Updated just now</div>
    </section>
    ${state.alert ? `<section class="alert-banner"><div><strong>${state.alert}</strong><span>This demo shows the escalation pathway; it does not contact emergency services.</span></div><button id="resolve-alert">Mark acknowledged</button></section>` : ""}
    <section class="metric-grid">
      <article class="metric-card primary"><span>Today</span><strong>${state.checkinDone ? "Check-in complete" : "Morning is on track"}</strong><p>${state.medicationDone ? "Medication has been confirmed." : "No concerns have been reported."}</p><div class="portrait">M</div></article>
      <article class="metric-card"><span>Routine</span><strong>${state.medicationDone ? "2 of 2" : "1 of 2"}</strong><p>Daily items completed</p><div class="progress"><i style="width:${state.medicationDone ? "100" : "50"}%"></i></div></article>
      <article class="metric-card"><span>Connection</span><strong>3 calls</strong><p>With family this week</p><div class="tiny-avatars"><i>A</i><i>J</i><i>+1</i></div></article>
    </section>
    <section class="dashboard-columns">
      <article class="panel">
        <div class="panel-head"><div><span class="mini-label">ACTIVITY</span><h2>Recent updates</h2></div><button>View history</button></div>
        <div class="timeline">${state.activity.map(item => `<div class="timeline-row"><i class="${item.tone}"></i><span><strong>${item.label}</strong><small>${item.time}</small></span></div>`).join("")}</div>
      </article>
      <article class="panel">
        <div class="panel-head"><div><span class="mini-label">UP NEXT</span><h2>Care plan</h2></div><button>Manage</button></div>
        <div class="plan-item"><div class="date-box"><strong>13</strong><span>AUG</span></div><div><strong>Dr. Chen · Primary care</strong><span>Thursday, 10:30 AM</span><small>Ride arranged by Anna</small></div></div>
        <div class="permissions"><span>${icons.shield}</span><p><strong>Margaret controls sharing</strong>Routine completions are shared. Conversations remain private.</p></div>
      </article>
    </section>
  </main>`;
}

function aboutView() {
  return `<main class="about-shell">
    <section class="about-hero"><p class="eyebrow">THE IDEA</p><h1>Care, clearly<br><em>connected.</em></h1><p>CARLY is a voice-first daily companion designed to help older adults stay independent and help trusted caregivers coordinate without turning the home into a surveillance system.</p></section>
    <section class="principles">
      <article><span>01</span><h2>Speak naturally</h2><p>Large controls and conversational voice reduce the need to navigate apps, menus, and tiny screens.</p></article>
      <article><span>02</span><h2>Support routines</h2><p>CARLY helps with agreed reminders, appointments, check-ins, and connection to trusted people.</p></article>
      <article><span>03</span><h2>Escalate carefully</h2><p>The older adult chooses who sees what and the exact situations in which someone should be notified.</p></article>
    </section>
    <section class="boundary-card"><div>${icons.shield}</div><div><p class="eyebrow">IMPORTANT BOUNDARY</p><h2>CARLY extends human care. It does not replace it.</h2><p>This prototype does not diagnose conditions, change medication instructions, monitor emergencies, or place real calls. Production safety features would require clinical, legal, accessibility, privacy, and reliability validation.</p></div></section>
    <section class="flow"><p class="eyebrow">ONE CONNECTED SYSTEM</p><div><span>Older adult</span><b>Voice conversation</b><i>→</i><span>CARLY</span><b>Consent-based coordination</b><i>→</i><span>Care circle</span></div></section>
  </main>`;
}

function footer() {
  return `<footer><div class="brand"><span class="brand-mark">${icons.heart}</span><span>CARLY</span></div><p>A research prototype for more independent days.</p><span>Not a medical device or emergency service.</span></footer>`;
}

function render() {
  app.innerHTML = `${header()}${state.view === "home" ? companionView() : state.view === "care" ? careView() : aboutView()}${footer()}`;
  document.querySelectorAll("[data-view]").forEach(button => button.addEventListener("click", () => { state.view = button.dataset.view; state.transcript = ""; render(); window.scrollTo({ top: 0, behavior: "smooth" }); }));
  document.querySelectorAll("[data-demo]").forEach(button => button.addEventListener("click", () => { state.transcript = button.dataset.demo; handleIntent(button.dataset.demo); }));
  document.querySelector("#talk")?.addEventListener("click", startListening);
  document.querySelector("#resolve-alert")?.addEventListener("click", () => { state.alert = null; addActivity("Urgent alert acknowledged by Anna", "neutral"); render(); });
}

render();
