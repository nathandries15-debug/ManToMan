import test from 'node:test';
import assert from 'node:assert/strict';
import { recommendPath, urgentLanguage } from '../checkin-model.js';
test('explicit latest preference outweighs overlapping keyword themes', () => {
  const result = recommendPath([{text:'Sleep, food, energy and stress'}, {text:'A plan',choice:'routine'}, {text:'Talk it out first',choice:'support'}]);
  assert.equal(result.path,'support');
  assert.match(result.reason,/most recent preference/);
});
test('ambiguous and unrelated answers offer choices without inventing a priority', () => {
  assert.equal(recommendPath([{text:'I do not know'}]).path,null);
  assert.equal(recommendPath([{text:'sleep and stress'}]).path,null);
  assert.equal(recommendPath([{text:'My sleep is off'}]).path,'health');
});
test('urgent language interrupts ordinary path routing', () => {
  for(const text of ['I want to kill myself', 'I don’t want to live', 'chest pain', 'I cannot breathe']) {
    assert.equal(urgentLanguage(text),true);
    const result = recommendPath([{text,choice:'routine'}]);
    assert.equal(result.urgent,true); assert.equal(result.path,null);
  }
  assert.equal(urgentLanguage('I want to build a morning routine'),false);
});
test('latest choice can change direction, and exploring options stays optional', () => {
  assert.equal(recommendPath([{text:'I am stressed',choice:'support'},{text:'Talk please',choice:'support'},{text:'Make one practical change',choice:'routine'}]).path,'routine');
  assert.equal(recommendPath([{text:'Sleep',choice:'health'},{text:'Show me my options',choice:'unsure'}]).path,null);
});
