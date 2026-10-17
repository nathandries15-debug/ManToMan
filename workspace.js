import { emptyWorkspace, localDate, validDate, parseWorkspace, calendarCells } from './workspace-model.js';
const KEY = 'mantoman.workspace.v1';
const content = {
  support: {
    notes: [['You’re allowed to take up space.', 'You don’t have to turn every difficult feeling into a lesson today. Noticing it can be enough.', 'What do you wish someone would ask you today?'], ['Let today be a little gentler.', 'Being honest about a hard day is a way of looking after yourself. You can choose how much to share.', 'What is one thing you could ask for help with?'], ['You don’t have to earn a pause.', 'There can be room for rest even when your list isn’t finished.', 'What helped you feel a little steadier recently?']],
    resources: [['Finding the right support', 'NIMH · Learn about psychotherapy and finding a professional.', 'https://www.nimh.nih.gov/health/topics/psychotherapies'], ['Small ways to look after yourself', 'NIMH · General self-care and when to seek help.', 'https://www.nimh.nih.gov/health/topics/caring-for-your-mental-health'], ['Human support when it matters', 'Find A Helpline · Find support services by country.', 'https://findahelpline.com/']]
  },
  routine: {
    notes: [['Start smaller than you think.', 'A routine should fit your real life. A two-minute version can be a perfectly good place to begin.', 'What small action could follow something you already do?'], ['A missed day is information.', 'Notice what got in the way, adjust the plan, and give yourself another starting point.', 'What would the easiest version of your next step look like?'], ['Make room for what matters.', 'One deliberate choice can be more useful than a packed schedule.', 'What could you take off your list to make room for something meaningful?']],
    resources: [['Build movement into your week', 'CDC · Physical activity basics and recommendations.', 'https://www.cdc.gov/physical-activity-basics/'], ['Make room for rest', 'NHLBI · Healthy sleep habits to explore.', 'https://www.nhlbi.nih.gov/health/sleep/healthy-sleep'], ['A practical food foundation', 'MyPlate · Explore balanced food choices.', 'https://www.myplate.gov/']]
  },
  health: {
    notes: [['Look after the basics.', 'Food, rest, and comfortable movement are useful places to begin. You don’t need to optimize everything at once.', 'Which basic need could use a little more attention today?'], ['Good enough can nourish you.', 'A simple meal that works for your life is a worthwhile choice. Health doesn’t require a perfect menu.', 'What is one easy meal you enjoy and could make this week?'], ['Listen before you push.', 'Your energy and abilities can vary. Choose movement and rest that feel appropriate for you today.', 'Would a little movement or a little recovery feel more helpful?']],
    resources: [['Find a recipe for your week', 'USDA MyPlate Kitchen · Search recipes and filter for your needs.', 'https://www.myplate.gov/recipes'], ['Before you try a supplement', 'NIH Office of Dietary Supplements · Evidence, risks, and fact sheets. Check interactions with a clinician or pharmacist.', 'https://ods.od.nih.gov/factsheets/list-all/'], ['Explore supplement research', 'PubMed · A starting search for systematic reviews of supplements. A search result is not an endorsement or medical advice.', 'https://pubmed.ncbi.nlm.nih.gov/?term=dietary+supplements+systematic+review']]
  }
};
const $ = id => document.getElementById(id);
const el = (tag, text, className) => { const node = document.createElement(tag); if (text !== undefined) node.textContent = text; if (className) node.className = className; return node; };
export function initWorkspace() {
  let data = emptyWorkspace(), path = 'support', tab = 'journal', month = new Date();
  month.setDate(1);
  function status(text) { $('workspace-status').textContent = text; }
  try {
    const saved = localStorage.getItem(KEY);
    if (saved) { data = parseWorkspace(saved); $('remember-workspace').checked = true; }
  } catch { status('Device storage could not be read. Entries will stay in this tab.'); }
  function persist() {
    if ($('remember-workspace').checked) {
      try { localStorage.setItem(KEY, JSON.stringify(data)); status('Saved on this device.'); }
      catch { status('Device storage is unavailable or full. Your changes are only in this tab. Export them to keep a copy.'); }
    } else status('Kept in this tab only. Closing or refreshing the page will remove unsaved entries.');
  }
  function selectTab(next, focus = false) {
    tab = next;
    for (const button of document.querySelectorAll('[data-tab]')) {
      const active = button.dataset.tab === tab;
      button.setAttribute('aria-selected', String(active)); button.tabIndex = active ? 0 : -1;
      $('panel-' + button.dataset.tab).hidden = !active;
      if (active && focus) button.focus();
    }
  }
  document.querySelectorAll('[data-tab]').forEach(button => {
    button.addEventListener('click', () => selectTab(button.dataset.tab));
    button.addEventListener('keydown', event => {
      const tabs = ['journal', 'tasks', 'calendar', 'resources']; let index = tabs.indexOf(tab);
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      index = event.key === 'Home' ? 0 : event.key === 'End' ? 3 : (index + (event.key === 'ArrowRight' ? 1 : -1) + 4) % 4;
      selectTab(tabs[index], true);
    });
  });
  function removeButton(kind, item) {
    const button = el('button', 'Delete', 'entry-delete'); button.type = 'button';
    button.setAttribute('aria-label', 'Delete ' + (item.text || 'entry').slice(0, 60));
    button.addEventListener('click', () => { if (!confirm('Delete this entry?')) return; data[kind] = data[kind].filter(x => x.id !== item.id); persist(); renderLists(); });
    return button;
  }
  function empty(container, text) { container.append(el('p', text, 'empty-state')); }
  function renderLists() {
    const journals = data.journals.filter(x => x.path === path);
    $('journal-count').textContent = `${journals.length} reflection${journals.length === 1 ? '' : 's'}`;
    const journalList = $('journal-list'); journalList.replaceChildren();
    for (const item of [...journals].reverse()) {
      const article = el('article', undefined, 'saved-entry'); const head = el('div', undefined, 'entry-head');
      head.append(el('span', `${item.date} · ${item.mood}`), removeButton('journals', item));
      article.append(head, el('p', item.text)); journalList.append(article);
    }
    if (!journals.length) empty(journalList, 'A blank page, without the pressure. Your reflections will appear here.');
    const tasks = data.tasks.filter(x => x.path === path);
    $('task-count').textContent = `${tasks.filter(x => x.done).length} of ${tasks.length} done`;
    const taskList = $('task-list'); taskList.replaceChildren();
    for (const item of tasks) {
      const row = el('div', undefined, 'task-entry'); const label = el('label'); const check = el('input'); check.type = 'checkbox'; check.checked = item.done;
      check.addEventListener('change', () => { item.done = check.checked; persist(); renderLists(); });
      const text = el('span', item.text); if (item.done) text.classList.add('completed');
      label.append(check, text); row.append(label); if (item.date) row.append(el('small', item.date)); row.append(removeButton('tasks', item)); taskList.append(row);
    }
    if (!tasks.length) empty(taskList, 'Your list can start with just one small thing.');
    renderCalendar();
    const events = data.events.filter(x => x.path === path && x.date.startsWith(localDate(month).slice(0, 7))).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    $('event-list').replaceChildren();
    for (const item of events) {
      const row = el('article', undefined, 'saved-entry'); const head = el('div', undefined, 'entry-head');
      head.append(el('span', `${item.date}${item.time ? ' · ' + item.time : ' · All day'}`), removeButton('events', item)); row.append(head, el('p', item.text)); $('event-list').append(row);
    }
    if (!events.length) empty($('event-list'), 'Nothing planned for this month. Make room for something that helps.');
  }
  function renderCalendar() {
    $('calendar-title').textContent = month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    const grid = $('calendar-grid'); grid.replaceChildren();
    for (const day of ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']) grid.append(el('span', day, 'weekday'));
    for (const day of calendarCells(month.getFullYear(), month.getMonth())) {
      if (day === null) { grid.append(el('span')); continue; }
      const date = localDate(new Date(month.getFullYear(), month.getMonth(), day));
      const button = el('button', String(day)); button.type = 'button';
      const count = data.events.filter(x => x.path === path && x.date === date).length;
      button.setAttribute('aria-label', `${date}${count ? `, ${count} planned moments` : ''}`);
      button.setAttribute('aria-pressed', String($('event-date').value === date));
      if (date === localDate()) { button.classList.add('today'); button.setAttribute('aria-current', 'date'); }
      if (count) button.classList.add('has-events');
      button.addEventListener('click', () => { $('event-date').value = date; renderCalendar(); $('event-title').focus(); });
      grid.append(button);
    }
  }
  function renderPath() {
    for (const button of document.querySelectorAll('[data-workspace-path]')) button.setAttribute('aria-pressed', String(button.dataset.workspacePath === path));
    const day = Math.floor(Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()) / 86400000);
    const [title, note, prompt] = content[path].notes[day % content[path].notes.length];
    $('daily-date').textContent = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' }).toUpperCase();
    $('daily-title').textContent = title; $('daily-note').textContent = note; $('daily-prompt').textContent = prompt;
    $('resources-title').textContent = path === 'health' ? 'Good questions. Trusted sources.' : 'A little perspective.';
    $('resource-list').replaceChildren();
    for (const [title, description, url] of content[path].resources) {
      const link = el('a', undefined, 'resource-card'); link.href = url; link.target = '_blank'; link.rel = 'noopener noreferrer';
      link.append(el('h4', title + ' ↗'), el('p', description), el('small', 'EXTERNAL RESOURCE · OPENS A NEW TAB')); $('resource-list').append(link);
    }
    renderLists();
  }
  document.querySelectorAll('[data-workspace-path]').forEach(button => button.addEventListener('click', () => {
    if (path === button.dataset.workspacePath) return;
    if ([$('journal-text'), $('task-text'), $('event-title')].some(x => x.value.trim()) && !confirm('Switch paths and discard unfinished drafts? Saved entries will stay.')) return;
    for (const id of ['journal-text', 'task-text', 'event-title']) $(id).value = '';
    path = button.dataset.workspacePath; renderPath();
  }));
  $('journal-form').addEventListener('submit', event => {
    event.preventDefault(); const text = $('journal-text').value.trim(); if (!text) return;
    data.journals.push({ id: crypto.randomUUID(), path, text, date: localDate(), mood: $('journal-mood').value });
    $('journal-text').value = ''; persist(); renderLists();
  });
  $('task-form').addEventListener('submit', event => {
    event.preventDefault(); const text = $('task-text').value.trim(), date = $('task-date').value;
    if (!text || (date && !validDate(date))) return;
    data.tasks.push({ id: crypto.randomUUID(), path, text, date, done: false });
    $('task-text').value = ''; $('task-date').value = ''; persist(); renderLists();
  });
  $('event-date').value = localDate();
  $('event-date').addEventListener('change', () => { if (validDate($('event-date').value)) { month = new Date($('event-date').value + 'T12:00:00'); month.setDate(1); renderLists(); } });
  $('event-form').addEventListener('submit', event => {
    event.preventDefault(); const text = $('event-title').value.trim(), date = $('event-date').value;
    if (!text || !validDate(date)) return;
    data.events.push({ id: crypto.randomUUID(), path, text, date, time: $('event-time').value });
    month = new Date(date + 'T12:00:00'); month.setDate(1); $('event-title').value = ''; $('event-time').value = ''; persist(); renderLists();
  });
  for (const [id, step] of [['previous-month', -1], ['next-month', 1]]) $(id).addEventListener('click', () => { month.setMonth(month.getMonth() + step); renderLists(); });
  $('daily-reflect').addEventListener('click', () => {
    if ($('journal-text').value.trim() && !confirm('Replace your unfinished reflection with this prompt?')) return;
    selectTab('journal'); $('journal-text').value = $('daily-prompt').textContent + '\n\n'; $('journal-text').focus();
  });
  $('remember-workspace').addEventListener('change', () => {
    if ($('remember-workspace').checked) persist();
    else { try { localStorage.removeItem(KEY); status('Device copy removed. Current entries remain in this tab only.'); } catch { status('Could not remove device storage. Clear this site’s data in your browser settings.'); } }
  });
  $('export-workspace').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), ...data }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const link = el('a'); link.href = url; link.download = 'man-to-man-workspace.json'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    status('Export downloaded. It may contain personal information; store it somewhere safe.');
  });
  $('clear-workspace').addEventListener('click', () => {
    if (!confirm('Delete every journal entry, task, event, and unfinished draft from all three paths? This cannot be undone.')) return;
    data = emptyWorkspace();
    for (const id of ['journal-form', 'task-form', 'event-form']) $(id).reset();
    $('event-date').value = localDate();
    try { localStorage.removeItem(KEY); $('remember-workspace').checked = false; status('All workspace entries and drafts cleared.'); }
    catch { status('Entries cleared from this tab, but device storage could not be removed. Clear this site’s data in browser settings.'); }
    renderLists();
  });
  renderPath();
  return { draft(nextPath, nextTab, text) {
    const target = nextTab === 'journal' ? $('journal-text') : $('task-text');
    const fields = [$('journal-text'), $('task-text'), $('event-title')];
    const switching = nextPath !== path;
    if ((target.value.trim() || (switching && fields.some(field => field.value.trim()))) && !confirm('Replace unfinished drafts? Saved entries will stay.')) return;
    if (switching) for (const field of fields) field.value = '';
    path = nextPath; renderPath(); selectTab(nextTab);
    target.value = text.slice(0, nextTab === 'journal' ? 6000 : 200);
    status('Draft only. Review and save it when you’re ready.');
  } };
}
