import { initVoice } from './voice.js';
import { conversationReply } from './conversation-model.js';
import { initCheckin } from './checkin.js';
import { initWorkspace } from './workspace.js';
const pathSection = document.querySelector('#workspace');
const help = document.querySelector('#help-dialog');
const messages = document.querySelector('#chat-messages');
const input = document.querySelector('#message');
const suggestions = document.querySelector('#suggestions');
const paths = {
  support: { title: 'Get it off your chest.', greeting: 'What’s been on your mind? Start anywhere—there’s no right way to say it.', prompts: ['I’ve been feeling overwhelmed', 'I’m finding it hard to open up', 'I need a moment to reset'] },
  routine: { title: 'Build your next move.', greeting: 'What’s one thing you’d like to make easier in your day?', prompts: ['My mornings feel rushed', 'I struggle to stay consistent', 'Help me plan a small first step'] },
  health: { title: 'Connect the dots.', greeting: 'What needs attention today: sleep, energy, food, or stress?', prompts: ['I want to sleep better', 'I want to move more', 'I need time to recharge'] }
};
let activePath = 'support';
let turns = 0;
let conversationMode = 'listen';
const sessionDialog = document.getElementById('session-dialog');
const voice = initVoice({ input, getLastReply: () => [...messages.querySelectorAll('.message:not(.user)')].at(-1)?.textContent || '' });
function resetSession() {
  voice.reset();
  if (sessionDialog.open) sessionDialog.close();
  document.getElementById('session-takeaway').value = '';
  document.getElementById('session-step').value = '';
  document.getElementById('session-status').textContent = '';
}

function addMessage(text, user = false) {
  const bubble = document.createElement('div');
  bubble.className = user ? 'message user' : 'message';
  bubble.textContent = text;
  messages.append(bubble);
  messages.scrollTop = messages.scrollHeight;
}
function updateNavigation(section) {
  for (const link of document.querySelectorAll('.nav-center a')) {
    if (link.hash === '#' + section) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
}
function openPath(path, updateHistory = true) {
  if (!workspace.open(path)) return false;
  resetSession();
  updateNavigation('paths');
  document.querySelector('#checkin').hidden = true; document.body.classList.remove('checkin-open');
  checkin.reset();
  pathSection.hidden = false; document.body.classList.add('path-open');
  if (updateHistory) history.pushState(null, '', '#' + path);
  activePath = path; turns = 0;
  document.querySelector('.chat-save-actions').hidden = true;
  document.querySelector('#chat-title').textContent = 'Conversation';
  messages.replaceChildren(); suggestions.replaceChildren(); input.value = '';
  addMessage(paths[path].greeting);
  for (const prompt of paths[path].prompts) {
    const button = document.createElement('button');
    button.type = 'button'; button.textContent = prompt;
    button.addEventListener('click', () => { input.value = prompt; document.querySelector('#chat-form').requestSubmit(); });
    suggestions.append(button);
  }
  document.querySelector('#chat-title').focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: 'instant' });
  return true;
}
function reply(text) {
  return conversationReply({ path: activePath, mode: conversationMode, text, turn: turns, context: workspace.healthContext() });
}
document.querySelectorAll('[data-path]').forEach(button => button.addEventListener('click', () => openPath(button.dataset.path)));
function leavePath() {
  resetSession();
  pathSection.hidden = true; document.body.classList.remove('path-open');
  messages.replaceChildren(); input.value = ''; suggestions.replaceChildren();
  document.querySelector('.chat-save-actions').hidden = true;
}
document.querySelector('#back-to-paths').addEventListener('click', () => { leavePath(); location.hash = 'paths'; document.getElementById('paths').scrollIntoView(); document.querySelector('.path-card').focus({ preventScroll: true }); });
document.querySelector('#chat-form').addEventListener('submit', event => {
  event.preventDefault(); const text = input.value.trim(); if (!text) return;
  addMessage(text, true); document.querySelector('.chat-save-actions').hidden = false; input.value = ''; turns++; suggestions.replaceChildren(); const response = reply(text); addMessage(response); voice.reply(response); input.focus();
});
for (const id of ['help-button', 'chat-help']) document.getElementById(id).addEventListener('click', () => help.showModal());
document.querySelector('#close-help').addEventListener('click', () => help.close());
document.querySelector('#year').textContent = new Date().getFullYear();

const workspace = initWorkspace();
for (const [id, tab] of [['chat-to-journal', 'journal'], ['chat-to-task', 'tasks'], ['chat-to-calendar', 'calendar']]) {
  document.getElementById(id).addEventListener('click', () => {
    const latest = [...messages.querySelectorAll('.user')].at(-1)?.textContent || '';
    workspace.draft(tab, latest);
  });
}
const checkin = initCheckin({
  enter() { updateNavigation('checkin'); leavePath(); document.querySelector('#checkin').hidden = false; document.body.classList.add('checkin-open'); },
  exit() { document.querySelector('#checkin').hidden = true; document.body.classList.remove('checkin-open'); },
  navigate: openPath
});
function followLocation() {
  const path = location.hash.slice(1);
  updateNavigation(path);
  if (path === 'checkin') checkin.open();
  else {
    document.querySelector('#checkin').hidden = true; document.body.classList.remove('checkin-open'); checkin.reset();
    if (paths[path]) openPath(path, false); else leavePath();
  }
}
window.addEventListener('hashchange', followLocation);
followLocation();

// Account and plan previews intentionally make no network requests or billing changes.
const signinDialog = document.getElementById('signin-dialog');
const upgradeDialog = document.getElementById('upgrade-dialog');
document.getElementById('sign-in-button').addEventListener('click', () => signinDialog.showModal());
document.getElementById('upgrade-button').addEventListener('click', () => upgradeDialog.showModal());
for (const id of ['close-signin', 'continue-guest']) document.getElementById(id).addEventListener('click', () => signinDialog.close());
for (const id of ['close-upgrade', 'close-plus-explore']) document.getElementById(id).addEventListener('click', () => upgradeDialog.close());
document.getElementById('signin-form').addEventListener('submit', event => {
  event.preventDefault();
  document.getElementById('signin-status').textContent = 'Preview complete. In the live version, a secure email link would let you sign in. No email was sent and no account was created.';
  document.getElementById('signin-email').value = '';
});
signinDialog.addEventListener('close', () => {
  document.getElementById('signin-form').reset();
  document.getElementById('signin-status').textContent = '';
});
upgradeDialog.addEventListener('close', () => { document.querySelector('.plus-sample').open = false; });

const modeDescriptions = { listen: 'Space to talk, without jumping to advice.', reflect: 'Explore a thought or feeling, one question at a time.', plan: 'Look for a small, realistic next step.' };
for (const radio of document.querySelectorAll('[name="conversation-mode"]')) radio.addEventListener('change', () => {
  conversationMode = radio.value; turns = 0;
  document.getElementById('mode-status').textContent = modeDescriptions[conversationMode];
});
document.getElementById('wrap-session').addEventListener('click', () => {
  voice.stop(); document.getElementById('session-draft').hidden = activePath === 'health';
  document.getElementById('session-draft').textContent = activePath === 'routine' ? 'Draft a next step' : 'Draft in my journal';
  sessionDialog.showModal();
});
for (const id of ['close-session', 'keep-chatting']) document.getElementById(id).addEventListener('click', () => sessionDialog.close());
function sessionText() {
  const reflection = document.getElementById('session-takeaway').value.trim();
  const step = document.getElementById('session-step').value.trim();
  return [reflection, step ? 'One small next step: ' + step : ''].filter(Boolean).join('\n\n');
}
document.getElementById('session-draft').addEventListener('click', () => {
  const text = activePath === 'routine' ? document.getElementById('session-step').value.trim() || document.getElementById('session-takeaway').value.trim() : sessionText();
  if (!text) { document.getElementById('session-status').textContent = 'Add a few words first, or finish without saving anything.'; return; }
  sessionDialog.close();
  if (!workspace.draft(activePath === 'routine' ? 'tasks' : 'journal', text)) sessionDialog.showModal();
});
document.getElementById('session-download').addEventListener('click', () => {
  const text = sessionText();
  if (!text) { document.getElementById('session-status').textContent = 'Add a few words to download, or finish without saving anything.'; return; }
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
  const link = document.createElement('a'); link.href = url; link.download = 'man-to-man-takeaway.txt'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  document.getElementById('session-status').textContent = 'Takeaway downloaded. Keep it somewhere private.';
});
document.getElementById('finish-session').addEventListener('click', () => { sessionDialog.close(); document.getElementById('back-to-paths').click(); });
// Pause audio when another dialog takes focus, without deleting drafts.
for (const dialog of document.querySelectorAll('dialog')) new MutationObserver(() => { if (dialog.open) voice.stop(); }).observe(dialog, { attributes: true, attributeFilter: ['open'] });
