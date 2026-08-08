export function resolveIntent(input) {
  const text = input.toLowerCase().trim();

  if (/\b(emergency|fell|fall|hurt|help me|chest pain|can't breathe|cannot breathe)\b/.test(text)) {
    return { type: "emergency" };
  }
  if (/\b(took|taken|had)\b.*\b(medicine|medication|pills?|tablet)\b|\b(medicine|medication|pills?|tablet)\b.*\b(took|taken|had)\b/.test(text)) {
    return { type: "medication-complete" };
  }
  if (/\b(what|when|next)\b.*\b(appointment|doctor|schedule|plan)\b/.test(text)) {
    return { type: "schedule" };
  }
  if (/\b(call|phone|contact|talk to)\b/.test(text)) {
    return { type: "call" };
  }
  if (/\b(lonely|alone|sad|down|miss)\b/.test(text)) {
    return { type: "connection" };
  }
  if (/\b(good|fine|okay|ok|well|great)\b/.test(text)) {
    return { type: "checkin-positive" };
  }
  return { type: "unknown" };
}
