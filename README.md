# CARLY

CARLY is a working browser prototype for a voice-first daily companion that helps older adults maintain routines and stay connected to a trusted care circle.

It demonstrates two coordinated experiences:

- **Companion:** an accessible, large-format interface with browser speech recognition, spoken responses, medication confirmation, appointments, family contact prompts, and an urgent-help pathway.
- **Care circle:** a consent-aware family dashboard showing shared routine completions, upcoming care-plan items, and simulated escalation activity.

## Important scope

CARLY is currently a research prototype. It does not diagnose conditions, provide or change medical instructions, detect falls, contact emergency services, or place real phone calls. Production use would require jurisdiction-specific privacy and health regulation review, security engineering, accessibility testing, clinical safety work, and validated human escalation infrastructure.

## Run locally

```bash
npm install
npm run dev
```

Open the URL printed by Vite. Chrome or Edge currently provides the broadest support for the Web Speech API used by the microphone demonstration. Every interaction can also be tested by selecting one of the visible action cards.

## Verify

```bash
npm test
npm run build
```

## Prototype architecture

- Vanilla JavaScript and semantic HTML
- Vite development and production build
- Browser Web Speech API for optional speech recognition and synthesis
- Deterministic, safety-oriented intent routing in `src/intent.js`
- In-memory demonstration state; no conversation data is transmitted or persisted by the application

## Product direction

The recommended first commercial wedge is daily routines, easy human connection, and consent-based check-ins for independently living older adults. Safety monitoring and medical workflows should only be introduced after reliability and clinical validation. Home robotics can later integrate as a physical execution layer.
