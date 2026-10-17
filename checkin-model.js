export const pathDetails = {
  support: { name: 'Emotional support', title: 'Start with some headspace.', description: 'A conversation to unpack what’s weighing on you, with a journal for the thoughts you want to keep.', action: 'Open emotional support', words: 'a place to talk and reflect' },
  routine: { name: 'Self-improvement', title: 'Give your next step a place.', description: 'Talk through what you want to change, then build a realistic plan with your calendar and next-step list.', action: 'Open self-improvement', words: 'a practical plan and a manageable next step' },
  health: { name: 'Everyday health', title: 'Check in with your foundation.', description: 'Explore sleep, energy, food, and stress, and how they connect with your headspace and habits.', action: 'Open everyday health', words: 'space to explore your everyday health needs' }
};
export function urgentLanguage(text) {
  const normalized = String(text).toLowerCase().replaceAll('’', "'");
  return /suicid|self[- ]?harm|kill myself|end my life|hurt myself|hurt someone|kill someone|don't want to live|do not want to live|overdose|chest pain|can'?t breathe|cannot breathe/.test(normalized);
}
export function recommendPath(answers) {
  const scores = { support: 0, routine: 0, health: 0 };
  const mentions = [];
  const patterns = { support: /\b(stress(?:ed)?|overwhelmed|lonely|anxious|sad|grief|breakup|relationship|feelings|talk|emotions?)\b/i, routine: /\b(habits?|routine|goals?|procrastinat\w*|schedule|discipline|plan|consistent|consistency)\b/i, health: /\b(sleep|tired|fatigue|energy|food|nutrition|diet|movement|exercise|recovery)\b/i };
  const text = answers.map(x => x.text).join(' ');
  if (answers.some(x => urgentLanguage(x.text))) return { urgent: true, path: null };
  if (answers.at(-1)?.choice === 'unsure') return { urgent: false, path: null, reason: 'You chose to explore your options. There’s no need to force a priority; start wherever feels useful.' };
  for (const [path, pattern] of Object.entries(patterns)) if (pattern.test(text)) { scores[path]++; mentions.push(path); }
  const choices = answers.filter(x => pathDetails[x.choice]);
  choices.forEach((answer, index) => { scores[answer.choice] += index === choices.length - 1 ? 8 : 2; });
  const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  if (ranked[0][1] === 0 || ranked[0][1] === ranked[1][1]) return { urgent: false, path: null, reason: 'There isn’t one clear starting point from these answers. Pick whichever feels most useful; you can switch anytime.' };
  const path = ranked[0][0];
  return { urgent: false, path, reason: choices.length ? `Your most recent preference was for ${pathDetails[choices.at(-1).choice].words}. That choice carries the most weight in this preview.` : `Your words included themes connected with ${pathDetails[path].name.toLowerCase()}. This is simple keyword matching, so it can miss context.`, secondary: mentions.filter(x => x !== path) };
}
