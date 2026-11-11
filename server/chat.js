export const instructions = `You are CARLY, an AI assistant designed to make AI useful and approachable for older adults. Treat every user as a capable adult. Be warm, direct, patient, and never patronizing. Use plain language, short paragraphs, and at most three initial steps for technical tasks. Ask one clarifying question when needed. Explain unfamiliar terms. Respond in the user's language. Use plain text, not Markdown tables or formatting. Never invent personal details, appointments, reminders, contacts, or actions. You cannot place calls, send messages, set reminders, browse the web, or access accounts. Clearly distinguish drafts from sent messages. Say when you are uncertain or information needs current verification. Do not request passwords, banking credentials, or verification codes. For medical, legal, or financial decisions give general educational information and suggest an appropriate qualified professional; do not diagnose or prescribe. For immediate danger, direct the user to local emergency services or nearby human help, and state that you cannot contact anyone. Support real human relationships and be transparent that you are AI.`;

export function validateMessages(body) {
  if (!body || !Array.isArray(body.messages) || !body.messages.length || body.messages.length > 20) return null;
  if (body.messages.some(m => !m || !['user', 'assistant'].includes(m.role) || typeof m.content !== 'string' || !m.content.trim() || m.content.length > 6000)) return null;
  if (body.messages.at(-1).role !== 'user') return null;
  return body.messages.map(({ role, content }) => ({ role, content }));
}

export async function answer(body, { env = process.env, fetcher = fetch } = {}) {
  const messages = validateMessages(body);
  if (!messages) return { status: 400, body: { error: 'Please write a shorter question and try again.' } };
  if (!env.OPENAI_API_KEY || !env.OPENAI_MODEL) return { status: 503, body: { error: 'Live AI is not connected yet. You can still try the practice examples.' } };
  try {
    const response = await fetcher('https://api.openai.com/v1/responses', {
      method: 'POST', headers: { 'Authorization': `Bearer ${env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: env.OPENAI_MODEL, instructions, input: messages, store: false, max_output_tokens: 1200 }),
      signal: AbortSignal.timeout(45000),
    });
    if (!response.ok) return { status: response.status === 429 ? 429 : 502, body: { error: response.status === 429 ? 'CARLY is busy right now. Please wait a minute and try again.' : 'CARLY couldn’t get an answer. Please try again in a moment.' } };
    const data = await response.json();
    const reply = (data.output ?? []).flatMap(item => item.type === 'message' ? item.content ?? [] : []).filter(item => item.type === 'output_text' || item.type === 'refusal').map(item => item.text ?? item.refusal).join('\n').trim();
    if (!reply || data.status === 'incomplete') throw new Error('No complete answer');
    return { status: 200, body: { reply } };
  } catch {
    return { status: 502, body: { error: 'The connection was interrupted. Your question is still here. Please try again.' } };
  }
}
