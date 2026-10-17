import { pathDetails, recommendPath, urgentLanguage } from './checkin-model.js';
const $ = id => document.getElementById(id);
const make = (tag, text, cls) => { const n = document.createElement(tag); n.textContent = text; if (cls) n.className = cls; return n; };
const questions = [
  { text: 'What’s taking up the most space in your life today? A sentence is enough, or choose a starting point.', choices: [['My head feels full', 'support'], ['My routine is all over the place', 'routine'], ['My sleep and energy are off', 'health'], ['I’m not sure yet', 'unsure']] },
  { text: 'What would help most right now? You can choose something different from where you started.', choices: [['Somewhere to talk honestly', 'support'], ['A plan I can actually follow', 'routine'], ['Time to understand my health needs', 'health'], ['I’m still figuring that out', 'unsure']] },
  { text: 'Let’s pick a starting point. What do you want your next step to feel like?', choices: [['Talk it out first', 'support'], ['Make one practical change', 'routine'], ['Look at sleep, food, or energy', 'health'], ['Show me my options', 'unsure']] }
];
export function initCheckin({ enter, exit, navigate }) {
  let answers = [], step = 0, result = null;
  function bubble(text, user = false) {
    const node = make('div', text, user ? 'message user' : 'message'); $('checkin-messages').append(node); $('checkin-messages').scrollTop = $('checkin-messages').scrollHeight;
  }
  function ask() {
    $('checkin-progress').textContent = `QUESTION ${step + 1} OF ${questions.length}`;
    $('checkin-progressbar').value = step;
    $('checkin-messages').replaceChildren();
    bubble(questions[step].text); $('checkin-options').replaceChildren();
    for (const [text, choice] of questions[step].choices) {
      const button = make('button', text); button.type = 'button'; button.addEventListener('click', () => submit(text, choice)); $('checkin-options').append(button);
    }
  }
  function finish() {
    result = recommendPath(answers); $('checkin-form').hidden = true; $('checkin-options').replaceChildren(); $('checkin-result').hidden = false;
    $('checkin-progress').textContent = result.urgent ? 'HUMAN SUPPORT MATTERS' : 'YOUR STARTING POINT'; $('checkin-progressbar').value = 3;
    $('checkin-messages').hidden = true;
    const panel = $('checkin-result'); panel.replaceChildren();
    if (result.urgent) {
      bubble('Some of what you shared may need immediate human support. This preview cannot assess your safety or provide emergency care.');
      panel.append(make('p', 'PLEASE REACH OUT', 'eyebrow'), make('h3', 'A person can help you right now.'));
      panel.append(make('p', 'If you’re in immediate danger or may hurt yourself or someone else, contact local emergency services. In the U.S. or Canada, call or text 988. Elsewhere, find a local service at findahelpline.com. If possible, ask someone you trust to stay with you.'));
      const help = make('button', 'Find human support', 'button'); help.type = 'button'; help.addEventListener('click', () => $('help-dialog').showModal()); panel.append(help);
    } else {
      bubble(result.path ? 'Here’s a place you could start. It’s a suggestion, and you’re always free to choose another path.' : 'It’s okay if this doesn’t fit into one box. Here are your options.');
      if (result.path) {
        const detail = pathDetails[result.path]; panel.append(make('p', 'SUGGESTED FIRST PATH · ' + detail.name.toUpperCase(), 'eyebrow'), make('h3', detail.title), make('p', detail.description));
      } else panel.append(make('h3', 'You get to choose your way in.'));
      panel.append(make('p', result.reason, 'recommendation-reason'));
      if (result.path) {
        const label = make('label', undefined, 'storage-choice'); const checkbox = make('input'); checkbox.type = 'checkbox'; checkbox.id = 'carry-checkin';
        label.append(checkbox, make('span', 'Copy my first answer into an editable chat draft')); panel.append(label);
        const button = make('button', pathDetails[result.path].action + ' →', 'button'); button.type = 'button'; button.addEventListener('click', () => go(result.path, checkbox.checked)); panel.append(button);
      }
      const alternatives = make('div', undefined, 'checkin-alternatives'); alternatives.append(make('p', result.path ? 'Or choose a different path:' : 'Start wherever feels useful:'));
      for (const [path, detail] of Object.entries(pathDetails)) if (path !== result.path) {
        const button = make('button', detail.name + ' →'); button.type = 'button'; button.addEventListener('click', () => go(path, false)); alternatives.append(button);
      }
      panel.append(alternatives);
    }
    panel.append(make('p', 'This is a rule-based preview, not a diagnosis, clinical assessment, or live AI. Answers aren’t stored or sent anywhere.', 'result-footnote'));
    panel.tabIndex = -1; panel.focus({ preventScroll: true }); panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  function go(path, carry) {
    const draft = carry ? answers[0]?.text || '' : '';
    if (navigate(path)) { if (draft) { $('message').value = draft; $('message').focus(); } reset(); }
  }
  function submit(text, choice = null) {
    text = text.trim().slice(0, 1500); if (!text || step >= questions.length || result) return;
    bubble(text, true); answers.push({ text, choice }); $('checkin-input').value = '';
    $('checkin-history').hidden = false;
    const entry = make('p', text); $('checkin-history-list').append(entry);
    if (urgentLanguage(text)) { finish(); return; }
    step++; if (step === questions.length) finish(); else ask();
  }
  function reset() {
    answers = []; step = 0; result = null; $('checkin-history-list').replaceChildren(); $('checkin-history').hidden = true; $('checkin-history').open = false; $('checkin-messages').hidden = false; $('checkin-messages').replaceChildren(); $('checkin-options').replaceChildren(); $('checkin-result').replaceChildren(); $('checkin-result').hidden = true; $('checkin-form').hidden = false; $('checkin-input').value = '';
  }
  function open(seed) {
    enter(); reset(); ask();
    if (seed && pathDetails[seed]) {
      const [text, choice] = questions[0].choices.find(x => x[1] === seed); submit(text, choice);
    }
    $('checkin-title').focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: 'instant' });
  }
  document.querySelectorAll('[data-checkin]').forEach(button => button.addEventListener('click', () => { history.pushState(null, '', '#checkin'); open(button.dataset.checkin || undefined); }));
  $('checkin-form').addEventListener('submit', event => { event.preventDefault(); submit($('checkin-input').value); $('checkin-input').focus(); });
  $('checkin-restart').addEventListener('click', () => open());
  $('checkin-back').addEventListener('click', () => { reset(); exit(); location.hash = 'paths'; });
  $('checkin-help').addEventListener('click', () => $('help-dialog').showModal());
  return { open, reset };
}
