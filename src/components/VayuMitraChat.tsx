import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowRight
} from 'lucide-react';
import { AirQualityDataset } from '../types/aqi';
import { askVayuMitra } from '../services/aiAssistant';
import { playVoiceBriefing, stopVoiceBriefing, isSpeechRecognitionSupported } from '../services/audioService';

interface VayuMitraChatProps {
  isOpen: boolean;
  onClose: () => void;
  dataset: AirQualityDataset;
  userGeminiKey?: string;
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  chips?: string[];
}

function FormattedMessage({ text }: { text: string }) {
  const lines = text.split('\n');

  return (
    <div className="space-y-1.5 text-sm leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1.5" />;
        }

        const isBullet = trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ');
        const content = isBullet ? trimmed.replace(/^[*\-•]\s+/, '') : line;

        // Parse **bold** parts
        const parts = content.split(/(\*\*.*?\*\*)/g);
        const rendered = parts.map((part, pIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={pIdx} className="font-bold text-slate-900">
                {part.slice(2, -2)}
              </strong>
            );
          }
          return part;
        });

        if (isBullet) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
              <div className="flex-1 text-slate-800">{rendered}</div>
            </div>
          );
        }

        return (
          <p key={idx} className="text-slate-800">
            {rendered}
          </p>
        );
      })}
    </div>
  );
}

export const VayuMitraChat: React.FC<VayuMitraChatProps> = ({
  isOpen,
  onClose,
  dataset,
  userGeminiKey,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      sender: 'ai',
      text: `Namaste! 🪔 I am VayuMitra, your clean air intelligence advisor.\n\nCurrently in ${dataset.location.name}, the ambient AQI is ${dataset.current.usAqi} (${dataset.current.category}), driven by ${dataset.current.dominantPollutant} (${dataset.current.pm2_5} µg/m³).\n\nWhat would you like to check today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      chips: [
        '🏃 Can I jog outside today?',
        '🪔 Diwali Smog & Firecracker Precaution',
        '😷 Which mask blocks PM2.5?',
        '🏠 Should windows be opened or closed?',
        '🩺 Precautions for Children & Asthmatics',
      ],
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Speech-to-Text Recognition setup
  useEffect(() => {
    if (isSpeechRecognitionSupported()) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onresult = (e: any) => {
        const transcript = e.results[0][0].transcript;
        if (transcript) {
          setInput(transcript);
          handleSend(transcript);
        }
        setIsListening(false);
      };

      rec.onerror = () => setIsListening(false);
      rec.onend = () => setIsListening(false);
      recognitionRef.current = rec;
    }
  }, []);

  const toggleMic = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please type your query below.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  };

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const reply = await askVayuMitra(text, dataset, userGeminiKey);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        chips: [
          '🪔 Diwali Precaution Checklist',
          '😷 Mask Recommendations',
          '📈 Hourly Inversion Forecast',
        ],
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: 'Apologies, I encountered a brief network delay. In general: when AQI is above 150, keep windows closed and wear a sealed N95 respirator outdoors.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeak = (msg: Message) => {
    if (speakingId === msg.id) {
      stopVoiceBriefing();
      setSpeakingId(null);
    } else {
      setSpeakingId(msg.id);
      playVoiceBriefing(msg.text, () => setSpeakingId(null));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-sm">
      {/* Clean White & Cyber-Green Copilot Card */}
      <div className="w-full max-w-2xl bg-white border-0 sm:border border-slate-200 rounded-none sm:rounded-3xl shadow-2xl flex flex-col h-full sm:h-[670px] max-h-screen sm:max-h-[92vh] overflow-hidden font-sans">
        {/* Top Header Bar */}
        <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-[#00ff87] border border-slate-200 text-slate-900 shadow-sm">
              <Bot className="w-5 h-5 text-slate-900" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-sm tracking-wide font-orbitron uppercase">
                  VayuMitra AI Copilot
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#00ff87]/80 text-slate-900 border border-emerald-300">
                  ONLINE & GROUNDED
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                Active telemetry: <span className="text-slate-800 font-bold">{dataset.location.name}</span> ({dataset.current.usAqi} AQI • PM2.5: {dataset.current.pm2_5} µg/m³)
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopVoiceBriefing();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-slate-200 shadow-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 font-sans text-sm bg-slate-50/70">
          {messages.map((m) => {
            const isAi = m.sender === 'ai';
            return (
              <div
                key={m.id}
                className={`flex gap-3 ${isAi ? 'items-start' : 'items-end flex-row-reverse'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                    isAi
                      ? 'bg-[#00ff87] text-slate-900 border border-slate-200 shadow-sm'
                      : 'bg-emerald-600 text-white border border-emerald-500 shadow-sm'
                  }`}
                >
                  {isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div className="max-w-[85%] space-y-2.5">
                  <div
                    className={`rounded-2xl p-4 space-y-2 border ${
                      isAi
                        ? 'bg-white text-slate-800 border-slate-200 shadow-sm'
                        : 'bg-[#00ff87] text-slate-950 font-medium border-emerald-300 shadow-sm'
                    }`}
                  >
                    {isAi ? (
                      <FormattedMessage text={m.text} />
                    ) : (
                      <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
                    )}

                    {/* Footer Info & Audio Readout Button */}
                    <div className={`flex items-center justify-between text-[10px] font-mono pt-1.5 border-t ${
                      isAi ? 'border-slate-100 text-slate-400' : 'border-emerald-300/60 text-emerald-900 font-bold'
                    }`}>
                      <span>{m.timestamp}</span>
                      {isAi && (
                        <button
                          onClick={() => handleSpeak(m)}
                          className="hover:text-emerald-700 transition-colors flex items-center gap-1 font-bold text-slate-600"
                          title="Read out loud"
                        >
                          {speakingId === m.id ? (
                            <VolumeX className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5" />
                          )}
                          <span>{speakingId === m.id ? 'Stop Audio' : 'Audio Briefing'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Suggestion Chips */}
                  {isAi && m.chips && m.chips.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {m.chips.map((chip, cIdx) => (
                        <button
                          key={cIdx}
                          onClick={() => handleSend(chip)}
                          className="px-3 py-1 rounded-xl bg-white hover:bg-[#00ff87] text-xs text-slate-700 hover:text-slate-950 border border-slate-200 hover:border-emerald-400 shadow-sm transition-all flex items-center gap-1 font-mono text-[11px] font-bold"
                        >
                          <span>{chip}</span>
                          <ArrowRight className="w-3 h-3 text-slate-500" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-700 pl-11 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
              <span>VayuMitra analyzing atmospheric chemistry & guidelines...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Input Bar */}
        <div className="p-3.5 bg-white border-t border-slate-200 flex items-center gap-2">
          {/* Voice Microphone Button */}
          <button
            onClick={toggleMic}
            className={`p-2.5 rounded-2xl transition-all border ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse border-rose-400 shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200 shadow-sm'
            }`}
            title="Speak query via microphone"
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about smog, morning runs, N95 masks, firecrackers..."
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-emerald-500 transition-all font-sans"
          />

          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="p-2.5 rounded-2xl bg-[#00ff87] hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-extrabold transition-all border border-emerald-400 shadow-sm"
          >
            <Send className="w-4 h-4 text-slate-950" />
          </button>
        </div>
      </div>
    </div>
  );
};
