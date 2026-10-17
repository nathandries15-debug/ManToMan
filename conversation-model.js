import { urgentLanguage } from './checkin-model.js';
export function conversationReply({ path, mode, text, turn = 1, context = {} }) {
  if (urgentLanguage(text)) return 'Some of what you shared may need immediate human support. If you’re in immediate danger or may hurt yourself or someone else, contact local emergency services now. In the U.S. or Canada, call or text 988. Elsewhere, find a local service at findahelpline.com. If you can, ask someone you trust to stay with you. This demo cannot assess your safety, monitor you, or provide emergency care.';
  if (mode === 'listen') {
    const prompts = ['You don’t have to turn this into a plan. What part would you like to say more about?', 'We can take this a little at a time. What feels most important to put into words?', 'What would you want someone listening to understand?'];
    return prompts[(turn - 1) % prompts.length];
  }
  if (mode === 'reflect') {
    if (turn === 1) return `You wrote: “${text.slice(0, 220)}${text.length > 220 ? '…' : ''}”\n\nWhat feeling comes closest to that?`;
    return turn % 2 === 0 ? 'As you look at that feeling, what seems to be bringing it up?' : 'What would a fairer, more compassionate way of describing this to yourself sound like?';
  }
  if (path === 'routine') {
    if (/morning|wake|rushed/i.test(text)) return 'One small experiment: prepare one thing the night before, such as clothes or breakfast. Try it for a few mornings and see whether it helps. What usually makes your morning feel rushed?';
    return turn === 1 ? 'Pick one habit and link a two-minute version to something you already do. Keep a smaller version for difficult days. What is one change that would feel realistic?' : 'You could put one small action on your calendar or next-step list. You can review and edit the draft before saving. What would make that action easier to start?';
  }
  if (path === 'health') {
    if (/sleep|tired|bed/i.test(text)) return 'A consistent wake-up time and a short wind-down routine are general starting points to explore. Persistent tiredness or sleep problems are worth discussing with a healthcare professional. What tends to get in the way of rest?';
    if (context.focus || context.goal || context.summary) return `Your saved focus is ${context.focus || 'everyday health'}${context.goal ? ': “' + context.goal + '”' : '.'} ${context.summary || ''}\n\nThis scripted preview cannot assess your needs. What is one manageable thing you could adjust in your day? For symptoms or individual health advice, talk with a qualified clinician.`;
    return 'Choose a manageable starting point: an easy meal, some comfortable movement, or time to rest. Work within your abilities and seek professional advice for persistent symptoms. Which area would you like to start with?';
  }
  return 'You could choose one small step, such as writing down what you want to say or asking someone you trust for time to talk. There is no obligation to act on it today. What would feel manageable?';
}
