# Carly

An approachable AI helper for older adults. Carly focuses on everyday questions, clear explanations, writing, technology help, and interests. It treats people as independent adults, with a calm interface and no assumed medical or caregiving needs.

## Run

Requires Node.js 22.12 or later.

```sh
npm install
npm run dev
```

Open http://localhost:5173. Without AI credentials, the app starts in clearly labeled **practice mode**, with four prepared examples. Arbitrary questions are never passed off as AI-generated answers.

For live AI, copy `.env.example` to `.env`, set `OPENAI_API_KEY` and `OPENAI_MODEL` to a Responses API model available in your project, and restart the server. Both values remain server-side. Never prefix secrets with `VITE_`.

```sh
npm test
npm run build
npm start
```

`npm start` serves the built app and its API. `npm run preview` previews only the static build in practice mode. A static-only host does not provide the live API; deploy the Node server for live conversations. Set `HOST=0.0.0.0` when your hosting environment requires it.

## Experience

- Four useful starting points: understand something, write a message, get technology help, explore an interest.
- Typed questions and optional browser speech recognition. Dictation goes into an editable field; users choose when to send it.
- Follow-up conversations with a server-side OpenAI connection, request timeout, readable errors, and question recovery.
- Read aloud with an explicit stop control. Nothing is spoken automatically.
- Larger text, visible keyboard focus, a skip link, semantic navigation, reduced-motion support, and responsive layouts.
- Explicitly saved answers stored on the current device, with removal controls. Text size is remembered too.
- A plain-language guide and privacy explanation.

## Architecture and privacy

Vanilla JavaScript and CSS, Vite, and a small Node HTTP server. `server/chat.js` validates the conversation and calls the [OpenAI Responses API](https://developers.openai.com/api/docs/guides/text). The server sends the most recent 19 messages, supplies its own instructions, and sets `store: false`. OpenAI's data policies still apply. Conversations are held in page memory, not application logs or a database. Only explicitly saved answers and text-size preferences use local storage. Browser voice features may use browser/vendor services.

The API has a 45-second upstream timeout, bounded input/output, and a basic 30-request/minute process-wide limit. This is a starting point for a private pilot, not a multi-user production security boundary. Before public live-AI deployment, add authentication, durable per-user rate limits, and provider spending limits. No API credentials are included in the repository.

Carly does not browse current information, contact people, send messages, set reminders, diagnose conditions, or provide emergency assistance. No fabricated family activity, appointments, or medical records are displayed.

## Verification

Node tests cover API validation, role injection, provider errors, refusal and incomplete responses, practice-mode honesty, and HTML escaping. Browser checks should cover keyboard use, mobile layout, 200% zoom, saving/reloading/removing answers, and live-request recovery. Real microphone and speech quality require testing on target devices. Usability sessions with older adults remain essential before calling the experience production-ready.
