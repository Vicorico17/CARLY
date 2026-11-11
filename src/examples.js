export const examples = [
  { id: 'understand', icon: 'spark', color: 'sage', title: 'Understand something', description: 'Clear answers to your everyday questions.', prompt: 'What is artificial intelligence, in simple words?', answer: 'Artificial intelligence, or AI, is software that learns patterns from examples. It uses those patterns to help answer questions, explain ideas, and write things.\n\nThink of it as a helpful starting point. It can make mistakes, so check important information with a reliable source. You don’t need any special words to use it — just ask a question.' },
  { id: 'write', icon: 'pen', color: 'peach', title: 'Find the right words', description: 'A birthday wish, a thank-you, or a little hello.', prompt: 'Help me write a warm birthday message for a friend.', answer: 'Here’s a message you can make your own:\n\n“Happy birthday, my dear friend! I hope your day is filled with good company, plenty of laughter, and a little something sweet. I’m so glad to have you in my life. Wishing you a wonderful year ahead.”\n\nYou could add their name and a happy memory you share. Nothing has been sent.' },
  { id: 'technology', icon: 'phone', color: 'lavender', title: 'Get help with technology', description: 'Patient explanations, one step at a time.', prompt: 'What is a video call, and how do I make one?', answer: 'A video call lets you see and hear someone through your phone, tablet, or computer. They can see and hear you too.\n\n1. Agree with the other person on an app you both have, such as FaceTime or WhatsApp.\n2. Open that app and find their name.\n3. Look for the camera symbol and tap it.\n\nThe exact steps depend on your device and app. For a first try, ask someone you know to call you.' },
  { id: 'discover', icon: 'leaf', color: 'butter', title: 'Explore an interest', description: 'Gardening, cooking, history. Follow your curiosity.', prompt: 'Give me a simple idea for growing herbs indoors.', answer: 'Try a small pot of mint on a bright windowsill. A young plant is an easy place to start.\n\n1. Choose a pot with drainage holes and put a saucer underneath.\n2. Place it somewhere with good daylight.\n3. Feel the soil regularly. Water when the top feels dry, then empty extra water from the saucer.\n\nOnce it has plenty of leaves, pick a few to add to water or a meal.' },
];

export function practiceReply(text) {
  const example = examples.find(item => item.prompt.toLowerCase() === text.trim().toLowerCase());
  return example?.answer ?? 'You’re in practice mode, which has a few prepared examples rather than live AI answers. Choose one of the example questions to try it. Your own questions will work once live AI is connected.';
}

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}
