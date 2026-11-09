/**
 * Voice Briefing & Speech Synthesis Service
 */
export function playVoiceBriefing(text: string, onEnd?: () => void): boolean {
  if (!('speechSynthesis' in window)) {
    return false;
  }

  // Cancel any existing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.0;
  utterance.pitch = 1.0;

  // Try to pick an English voice
  const voices = window.speechSynthesis.getVoices();
  const englishVoice = voices.find(v => v.lang.includes('en') || v.name.includes('Google') || v.name.includes('Natural'));
  if (englishVoice) {
    utterance.voice = englishVoice;
  }

  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }

  window.speechSynthesis.speak(utterance);
  return true;
}

export function stopVoiceBriefing(): void {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function isSpeechRecognitionSupported(): boolean {
  return typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
}
