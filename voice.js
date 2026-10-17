// Browser-managed speech only; no paid API, recordings, or audio uploads by this app.
export function initVoice({ input, getLastReply, onDictationStart }) {
  const $ = id => document.getElementById(id);
  const synth = window.speechSynthesis;
  const canSpeak = Boolean(synth && window.SpeechSynthesisUtterance);
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition = null, listening = false, starting = false, current = null, dictationAllowed = false;
  function status(text) { $('voice-status').textContent = text; }
  function stopSpeaking() {
    current = null;
    if (canSpeak) synth.cancel();
    $('voice-stop').disabled = true;
  }
  function speak(text) {
    if (!canSpeak || !text || document.hidden) return;
    stopSpeaking(); stopDictation();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = synth.getVoices();
    const voice = voices.find(v => v.localService && /^en\b/i.test(v.lang)) || voices.find(v => /^en\b/i.test(v.lang));
    if (voice) utterance.voice = voice;
    utterance.lang = voice?.lang || 'en-US'; utterance.rate = 0.95;
    current = utterance;
    utterance.onstart = () => { if (current === utterance) { $('voice-stop').disabled = false; status('Reading reply aloud.'); } };
    utterance.onend = () => { if (current === utterance) { current = null; $('voice-stop').disabled = true; status('Finished reading.'); } };
    utterance.onerror = event => { if (current === utterance) { current = null; $('voice-stop').disabled = true; status(event.error === 'not-allowed' ? 'Your browser blocked playback. Try Read last reply after tapping the page.' : 'Voice playback is unavailable right now. You can still read the reply.'); } };
    try { synth.speak(utterance); $('voice-stop').disabled = false; }
    catch { current = null; $('voice-stop').disabled = true; status('Voice playback is unavailable. Text chat still works.'); }
  }
  function stopDictation() {
    if (recognition && (listening || starting)) { try { recognition.abort(); } catch {} }
    listening = false; starting = false;
    $('voice-dictate').textContent = 'Dictate a message'; $('voice-dictate').setAttribute('aria-pressed', 'false');
  }
  function reset() {
    stopSpeaking(); stopDictation();
    $('voice-auto').checked = false; $('voice-consent').checked = false; dictationAllowed = false;
    $('voice-dictate').disabled = true;
    status(!canSpeak ? 'Read-aloud is not supported in this browser. Text chat still works.' : 'Voice is off.');
  }
  $('voice-auto').disabled = !canSpeak; $('voice-read').disabled = !canSpeak; $('voice-stop').disabled = true;
  $('voice-consent').disabled = !Recognition;
  $('voice-dictate').disabled = true;
  if (!Recognition) $('dictation-availability').textContent = 'Dictation is not supported in this browser. You can still type.';
  $('voice-auto').addEventListener('change', () => {
    if (!$('voice-auto').checked) { stopSpeaking(); status('Automatic read-aloud is off.'); }
    else status('New replies will be read aloud. Keep your surroundings in mind.');
  });
  $('voice-read').addEventListener('click', () => { const text = getLastReply(); if (text) speak(text); else status('No reply to read yet.'); });
  $('voice-stop').addEventListener('click', () => { stopSpeaking(); status('Playback stopped.'); });
  $('voice-consent').addEventListener('change', () => {
    dictationAllowed = $('voice-consent').checked;
    $('voice-dictate').disabled = !dictationAllowed || !Recognition;
    if (!dictationAllowed) { stopDictation(); status('Microphone dictation is off.'); }
  });
  if (Recognition) {
    recognition = new Recognition(); recognition.lang = 'en-US'; recognition.continuous = false; recognition.interimResults = false;
    recognition.onstart = () => {
      if (!dictationAllowed) { stopDictation(); return; }
      starting = false; listening = true; $('voice-dictate').textContent = 'Stop dictation'; $('voice-dictate').setAttribute('aria-pressed', 'true'); status('Listening. Your words will be placed in the draft, not sent.');
    };
    recognition.onresult = event => {
      if (!dictationAllowed || (!listening && !starting)) return;
      const transcript = Array.from(event.results).filter(result => result.isFinal).map(result => result[0].transcript).join(' ').trim();
      if (!transcript) return;
      input.value = [input.value.trim(), transcript].filter(Boolean).join(' ').slice(0, input.maxLength || 3000);
      status('Dictation added to your draft. Review it before sending.'); input.focus();
    };
    recognition.onerror = event => { status(event.error === 'not-allowed' || event.error === 'service-not-allowed' ? 'Microphone permission was denied or dictation is unavailable. You can type instead.' : event.error === 'aborted' ? 'Dictation stopped.' : 'Could not capture speech. Try again or type your message.'); };
    recognition.onend = () => { listening = false; starting = false; $('voice-dictate').textContent = 'Dictate a message'; $('voice-dictate').setAttribute('aria-pressed', 'false'); };
    $('voice-dictate').addEventListener('click', () => {
      if (!dictationAllowed) return;
      if (listening || starting) { stopDictation(); status('Dictation stopped.'); return; }
      stopSpeaking(); onDictationStart?.();
      try { starting = true; recognition.start(); status('Requesting microphone access…'); }
      catch { starting = false; status('Dictation could not start. Try again or type instead.'); }
    });
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden) { stopSpeaking(); stopDictation(); } });
  window.addEventListener('pagehide', () => { stopSpeaking(); stopDictation(); });
  reset();
  return { reply(text) { if ($('voice-auto').checked) speak(text); }, stop() { stopSpeaking(); stopDictation(); }, reset };
}
