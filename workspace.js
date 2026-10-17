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
  const tools = { support: ['journal', 'resources'], routine: ['calendar', 'tasks', 'resources'], health: ['needs', 'resources'] };
  const headings = { support: ['01 / YOUR HEADSPACE', 'Get it off your chest.', 'Talk it through. Your journal is right here when something is worth keeping.'], routine: ['02 / YOUR DIRECTION', 'Build your next move.', 'Chat through your goals, then put them on your calendar or next-step list.'], health: ['03 / YOUR FOUNDATION', 'Connect the dots.', 'Understand what your body needs, alongside your headspace and your habits.'] };

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
    tab = tools[path].includes(next) ? next : tools[path][0];
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
      const tabs = tools[path]; let index = tabs.indexOf(tab);
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      index = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
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
    const [label, pathTitle, description] = headings[path];
    $('path-label').textContent = label; $('path-title').textContent = pathTitle; $('path-description').textContent = description;
    for (const button of document.querySelectorAll('[data-tab]')) button.hidden = !tools[path].includes(button.dataset.tab);
    selectTab(tools[path].includes(tab) ? tab : tools[path][0]);
    $('path-tools-shortcut').textContent = path === 'support' ? 'Open my journal →' : path === 'routine' ? 'Open calendar & next steps →' : 'Review my needs →';
    $('chat-to-journal').hidden = path !== 'support';
    $('chat-to-task').hidden = path !== 'routine';
    $('chat-to-calendar').hidden = path !== 'routine';
    $('daily-reflect').textContent = path === 'support' ? 'Write about this +' : path === 'routine' ? 'Make a small plan +' : 'Talk about this +';
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
    renderNeeds();
  }
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
    if (path === 'health') {
      $('message').value = $('daily-prompt').textContent;
      $('message').focus(); return;
    }
    const target = path === 'support' ? $('journal-text') : $('task-text');
    if (target.value.trim() && !confirm('Replace your unfinished draft with this prompt?')) return;
    selectTab(path === 'support' ? 'journal' : 'tasks'); target.value = $('daily-prompt').textContent + '\n\n'; target.focus();
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
    $('needs-form').reset(); $('share-path-context').checked = false; renderNeeds();
    try { localStorage.removeItem(KEY); $('remember-workspace').checked = false; status('All workspace entries and drafts cleared.'); }
    catch { status('Entries cleared from this tab, but device storage could not be removed. Clear this site’s data in browser settings.'); }
    renderLists();
  });
  const needsSuggestions = {
    sleep: ['Make recovery easier to protect.', 'Think about what gets in the way of rest: a busy schedule, stress, or your evening routine. Try one manageable wind-down cue. Ongoing sleep problems deserve a conversation with a qualified clinician.'],
    energy: ['Start with capacity, not pressure.', 'Notice when you have energy and when you need a break. Consider a short, comfortable movement break. Persistent or unexplained fatigue is worth discussing with a healthcare professional.'],
    food: ['Make nourishment practical.', 'What is an easy meal that fits your budget, preferences, and schedule? Pick a repeatable option. Use the recipe shelf for ideas; a qualified professional can help with individual dietary needs.'],
    stress: ['Give your headspace some room.', 'Consider what is adding pressure, what can wait, and who you can talk to. Use emotional support to reflect, then self-improvement to make a little space in your week.']
  };
  function renderNeeds() {
    const focus = data.healthNeeds?.focus || 'sleep';
    const [title, description] = needsSuggestions[focus];
    $('needs-plan').replaceChildren(el('h4', title), el('p', description), el('small', 'GENERAL EDITORIAL SUGGESTION · NOT A HEALTH ASSESSMENT'));
    const overview = $('health-context-summary'); overview.replaceChildren();
    if ($('share-path-context').checked) {
      const journals = data.journals.filter(x => x.path === 'support');
      const latest = journals.at(-1);
      const tasks = data.tasks.filter(x => x.path === 'routine' && !x.done);
      overview.append(el('p', `${journals.length} emotional-support reflection${journals.length === 1 ? '' : 's'}. ${latest ? 'Latest check-in: ' + latest.mood + '.' : 'No saved check-in yet.'} ${tasks.length} unfinished self-improvement step${tasks.length === 1 ? '' : 's'}.`));
      overview.append(el('small', 'A local overview only. These counts cannot assess your mental or physical health.'));
    }
  }
  $('path-tools-shortcut').addEventListener('click', () => { selectTab(tools[path][0], true); document.querySelector('.workspace-panel').scrollIntoView({ behavior: 'smooth', block: 'start' }); });
  $('needs-focus').value = data.healthNeeds?.focus || 'sleep';
  $('needs-goal').value = data.healthNeeds?.goal || '';
  $('needs-form').addEventListener('submit', event => {
    event.preventDefault(); data.healthNeeds = { focus: $('needs-focus').value, goal: $('needs-goal').value.trim() };
    persist(); renderNeeds();
  });
  $('share-path-context').addEventListener('change', renderNeeds);
  renderPath();
  return {
    open(nextPath) {
      if (!headings[nextPath]) return false;
      if (path !== nextPath) {
        const fields = [$('journal-text'), $('task-text'), $('event-title')];
        if (fields.some(field => field.value.trim()) && !confirm('Switch paths and discard unfinished journal or plan drafts? Saved entries will stay.')) return false;
        for (const field of fields) field.value = '';
        path = nextPath; tab = tools[path][0];
      }
      renderPath(); return true;
    },
    healthContext() {
      const goal = data.healthNeeds?.goal;
      const focus = data.healthNeeds?.focus;
      const summary = $('share-path-context').checked ? $('health-context-summary').textContent : '';
      return { goal, focus, summary };
    },
    draft(nextTab, text) {
      if (!tools[path].includes(nextTab)) return false;
      const target = $(nextTab === 'journal' ? 'journal-text' : nextTab === 'calendar' ? 'event-title' : 'task-text');
      if (target.value.trim() && !confirm('Replace the unfinished draft?')) return false;
      selectTab(nextTab); target.value = text.slice(0, nextTab === 'journal' ? 6000 : 200);
      status('Draft only. Review and save it when you’re ready.'); target.focus(); return true;
    }
  };
}
