import test from 'node:test';
import assert from 'node:assert/strict';
import { calendarCells, parseWorkspace, localDate, validDate } from '../workspace-model.js';
test('calendar handles leap years and first weekday alignment', () => {
  const february = calendarCells(2024, 1);
  assert.equal(february.filter(x => x !== null).length, 29);
  assert.equal(february.indexOf(1), 4);
  assert.equal(calendarCells(2025, 1).filter(x => x !== null).length, 28);
  assert.equal(calendarCells(2026, 10).indexOf(1), 0);
});
test('device restore retains independent paths and rejects malformed records', () => {
  const data = parseWorkspace(JSON.stringify({
    journals: [{ id: 'j1', path: 'support', text: '<script>alert(1)</script>', mood: 'Check-in', date: '2026-10-17' }, { id: 'bad', path: 'unknown', text: 'invalid', date: '2026-10-17' }],
    tasks: [{ id: 't1', path: 'routine', text: 'Walk', done: false, date: '' }, { id: 'bad2', path: 'routine', text: 'Invalid date', done: false, date: '2026-02-30' }],
    events: [{ id: 'e1', path: 'health', text: 'Rest', date: '2026-10-17', time: '09:30' }, { id: 'e2', path: 'health', text: 'Invalid time', date: '2026-10-17', time: '25:00' }]
  }));
  assert.equal(data.journals.length, 1); assert.equal(data.tasks.length, 1); assert.equal(data.events.length, 1);
  assert.equal(data.journals[0].text, '<script>alert(1)</script>');
  assert.equal(data.tasks[0].path, 'routine'); assert.equal(data.events[0].path, 'health');
  assert.throws(() => parseWorkspace('{broken'));
});
test('date keys use local calendar dates and validate real dates', () => {
  assert.equal(localDate(new Date(2026, 0, 2, 23, 59)), '2026-01-02');
  assert.equal(validDate('2024-02-29'), true);
  for (const value of ['2025-02-29', '2026-13-01', 'not-a-date']) assert.equal(validDate(value), false);
});
test('health needs survive restore without requiring cross-path access', () => {
  const restored = parseWorkspace(JSON.stringify({healthNeeds: {focus: 'stress', goal: 'Less stress after work'}}));
  assert.deepEqual(restored.healthNeeds, {focus: 'stress', goal: 'Less stress after work'});
  assert.deepEqual(restored.journals, []);
  assert.equal(parseWorkspace(JSON.stringify({healthNeeds: {focus: 'diagnose', goal: 'invalid'}})).healthNeeds, null);
  const legacy = parseWorkspace(JSON.stringify({journals: [], tasks: [], events: []}));
  assert.equal(legacy.healthNeeds, null);
});
