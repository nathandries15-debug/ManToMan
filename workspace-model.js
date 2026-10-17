export const PATHS = ['support', 'routine', 'health'];
export const emptyWorkspace = () => ({ journals: [], tasks: [], events: [], healthNeeds: null });
export function localDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  return localDate(new Date(value + 'T12:00:00')) === value;
}
export function parseWorkspace(raw) {
  const data = JSON.parse(raw);
  const valid = item => item && typeof item.id === 'string' && PATHS.includes(item.path);
  return {
    healthNeeds: data?.healthNeeds && ['sleep', 'energy', 'food', 'stress'].includes(data.healthNeeds.focus) && typeof data.healthNeeds.goal === 'string' && data.healthNeeds.goal.length <= 500 ? { focus: data.healthNeeds.focus, goal: data.healthNeeds.goal } : null,
    journals: (Array.isArray(data?.journals) ? data.journals : []).filter(x => valid(x) && typeof x.text === 'string' && x.text.length <= 6000 && typeof x.mood === 'string' && validDate(x.date)),
    tasks: (Array.isArray(data?.tasks) ? data.tasks : []).filter(x => valid(x) && typeof x.text === 'string' && x.text.length <= 200 && typeof x.done === 'boolean' && (x.date === '' || validDate(x.date))),
    events: (Array.isArray(data?.events) ? data.events : []).filter(x => valid(x) && typeof x.text === 'string' && x.text.length <= 200 && validDate(x.date) && (x.time === '' || /^([01]\d|2[0-3]):[0-5]\d$/.test(x.time)))
  };
}
export function calendarCells(year, month) {
  return [...Array(new Date(year, month, 1).getDay()).fill(null), ...Array.from({ length: new Date(year, month + 1, 0).getDate() }, (_, index) => index + 1)];
}
