import test from 'node:test';
import assert from 'node:assert/strict';
import { conversationReply } from '../conversation-model.js';
test('listen and reflect do not immediately turn a difficult day into a plan', () => {
  const common = {path: 'routine', text: 'My mornings feel overwhelming', turn: 1};
  const listen = conversationReply({...common, mode:'listen'});
  const reflect = conversationReply({...common, mode:'reflect'});
  const plan = conversationReply({...common, mode:'plan'});
  assert.match(listen,/say more/); assert.doesNotMatch(listen,/prepare|calendar/);
  assert.match(reflect,/You wrote:/); assert.match(reflect,/What feeling/);
  assert.match(plan,/prepare one thing/);
});
test('urgent support takes precedence over every conversation mode', () => {
  for(const mode of ['listen','reflect','plan']) {
    const response = conversationReply({path:'support',mode,text:'I don’t want to live',turn:1});
    assert.match(response,/988/); assert.match(response,/emergency services/);
    assert.doesNotMatch(response,/You wrote:/);
  }
});
test('only planning mode uses explicitly selected health context', () => {
  const context = {focus:'stress',goal:'More time to rest'};
  assert.match(conversationReply({path:'health',mode:'plan',text:'Help with my day',context}),/More time to rest/);
  assert.doesNotMatch(conversationReply({path:'health',mode:'listen',text:'Help with my day',context}),/More time to rest/);
});
