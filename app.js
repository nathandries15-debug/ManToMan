const dialog = document.querySelector('#chat-dialog');
const help = document.querySelector('#help-dialog');
const messages = document.querySelector('#chat-messages');
const input = document.querySelector('#message');
const suggestions = document.querySelector('#suggestions');
const paths = {
  support: { title: 'Talk it through.', greeting: 'You can start with whatever is taking up space today. This is a scripted demo, so I can offer reflection prompts, but I can’t understand your situation like a person or a live AI. What would you like to talk about?', prompts: ['I’ve been feeling overwhelmed', 'I’m finding it hard to open up', 'I need a moment to reset'] },
  routine: { title: 'Find your rhythm.', greeting: 'Let’s look at one small part of your day. What does a typical day look like, and what would you like to make easier? Keep names and sensitive details out of this demo.', prompts: ['My mornings feel rushed', 'I struggle to stay consistent', 'Help me plan a small first step'] },
  health: { title: 'Feel more like you.', greeting: 'What would you like to give more attention to: sleep, movement, or making time for yourself? I can share general wellness ideas, but can’t diagnose symptoms or give personalized medical advice.', prompts: ['I want to sleep better', 'I want to move more', 'I need time to recharge'] }
};
let activePath = 'support';
let turns = 0;
function addMessage(text, user = false) {
  const bubble = document.createElement('div');
  bubble.className = user ? 'message user' : 'message';
  bubble.textContent = text;
  messages.append(bubble);
  messages.scrollTop = messages.scrollHeight;
}
function openPath(path) {
  activePath = path; turns = 0;
  document.querySelector('#chat-title').textContent = paths[path].title;
  messages.replaceChildren(); suggestions.replaceChildren(); input.value = '';
  addMessage(paths[path].greeting);
  for (const prompt of paths[path].prompts) {
    const button = document.createElement('button');
    button.type = 'button'; button.textContent = prompt;
    button.addEventListener('click', () => { input.value = prompt; document.querySelector('#chat-form').requestSubmit(); });
    suggestions.append(button);
  }
  dialog.showModal();
}
function reply(text) {
  if (/suicid|self[- ]?harm|kill myself|end my life|hurt myself|hurt someone|kill someone|don't want to live|do not want to live/i.test(text)) {
    return 'What you’ve shared may need immediate human support. If you might act on these thoughts or are in immediate danger, call local emergency services now. In the U.S. or Canada, call or text 988. Elsewhere, find a local service at findahelpline.com. If possible, ask someone you trust to stay with you. This demo cannot assess your safety, monitor you, or contact help.';
  }
  if (/chest pain|can't breathe|cannot breathe|overdose/i.test(text)) return 'These symptoms can be urgent. Please contact local emergency services or seek immediate medical care. This demo cannot evaluate symptoms or provide emergency care.';
  if (activePath === 'routine') {
    if (/morning|wake|rushed/i.test(text)) return 'A starting experiment: choose one thing to prepare the night before, like your clothes or breakfast. Keep the change small for three mornings, then notice whether it makes things easier. What usually makes the morning feel rushed?';
    return turns === 1 ? 'Try choosing one habit you want to work on and linking a two-minute version to something you already do. For example, after lunch, take a short walk if that is comfortable for you. What habit would you pick, and what tends to get in the way?' : 'For a simple plan, write down: “After [existing habit], I’ll do [small action].” Add an easier version for difficult days, and review how it felt after a week. This demo does not collect or analyze your habits. What would make your first step realistic?';
  }
  if (activePath === 'health') {
    if (/sleep|tired|bed/i.test(text)) return 'One general place to start is a consistent wake-up time and a short wind-down routine. Notice whether late caffeine or scrolling affects your rest. Persistent tiredness, sleep problems, or breathing changes during sleep are worth discussing with a healthcare professional. What does the hour before bed usually look like?';
    return turns === 1 ? 'A small amount of comfortable movement can be a useful starting point, such as a brief walk or a gentle stretch. Work within your abilities, and seek medical guidance if symptoms or a health condition affect activity. What kind of movement or rest do you actually enjoy?' : 'Choose one manageable action and check how you feel afterward, without treating a missed day as failure. For persistent symptoms or personalized health recommendations, a qualified clinician is the right next step. What support would help you follow through?';
  }
  if (/open up|lonely|alone/i.test(text)) return 'Opening up can feel exposing. You could start with someone you trust and a simple line: “I’ve had a lot on my mind. Do you have a few minutes to listen?” You get to choose how much to share. What makes reaching out feel difficult?';
  return turns === 1 ? 'Thanks for putting that into words. Before trying to solve it, you might separate what happened, what you’re feeling, and what you need right now. Would listening, a practical next step, or support from someone you trust feel most useful?' : turns === 2 ? 'A reflection prompt: what part is within your control today, and what part are you carrying that you can’t change right now? Pick one small thing that might make the next hour easier. If this has been weighing on you for a while, consider talking with a qualified mental health professional.' : 'This demo has limited scripted prompts and cannot follow the full detail of your experience. You could write down what you want someone to understand and use it to start a conversation with a trusted person or mental health professional. What would you want them to hear?';
}
document.querySelectorAll('[data-path]').forEach(button => button.addEventListener('click', () => openPath(button.dataset.path)));
document.querySelector('#close-chat').addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => { messages.replaceChildren(); input.value = ''; suggestions.replaceChildren(); });
document.querySelector('#chat-form').addEventListener('submit', event => {
  event.preventDefault(); const text = input.value.trim(); if (!text) return;
  addMessage(text, true); input.value = ''; turns++; suggestions.replaceChildren(); addMessage(reply(text)); input.focus();
});
for (const id of ['help-button', 'chat-help']) document.getElementById(id).addEventListener('click', () => help.showModal());
document.querySelector('#close-help').addEventListener('click', () => help.close());
document.querySelector('#year').textContent = new Date().getFullYear();
