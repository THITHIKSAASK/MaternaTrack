import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  X,
  MessageSquare,
  Sparkles,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  RotateCcw,
  Bot,
  User,
  Radio,
} from 'lucide-react';
import { apiFetch } from '../api/client.js';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  source?: {
    title: string;
    url: string;
    reviewDate?: string;
  };
  timestamp: string;
}

export const MaternaVoice: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoVoiceReadout, setAutoVoiceReadout] = useState(true);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [speechPermissionState, setSpeechPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isTa = i18n.language === 'ta';

  // Initialize Speech Recognition & Synthesis
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setSpeechSupported(true);
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;
        recognition.lang = isTa ? 'ta-IN' : 'en-IN';

        recognition.onstart = () => {
          setIsListening(true);
          setSpeechPermissionState('granted');
        };

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setInputQuery(currentTranscript);

          // If final speech result
          if (event.results[0].isFinal) {
            setIsListening(false);
            if (currentTranscript.trim()) {
              handleSend(currentTranscript.trim());
            }
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition warning/error:', event.error);
          setIsListening(false);
          if (event.error === 'not-allowed') {
            setSpeechPermissionState('denied');
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } catch (err) {
        console.error('Speech recognition setup failed:', err);
      }
    } else {
      setSpeechSupported(false);
    }

    // Set initial greeting
    setMessages([
      {
        id: 'initial',
        sender: 'assistant',
        text: isTa
          ? 'வணக்கம்! நான் உங்கள் மதர்னாட்ராக் ஏஐ உதவியாளர் (MaternaTrack General AI). தாய்-சேய் நலம், கர்ப்பகால பராமரிப்பு, தடுப்பூசி அட்டவணை மற்றும் எந்த பொதுவான அறிவியல், கல்வி அல்லது அன்றாட கேள்விகளையும் என்னிடம் கேட்கலாம். என்ன உதவி வேண்டும்?'
          : 'Hello! I am MaternaTrack General AI Voice Assistant. I can answer any question you ask — from antenatal milestones and immunization schedules to science, math, health, and general knowledge. Tap the microphone or type below to begin!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);

    setSuggestedQuestions(
      isTa
        ? [
            'குழந்தையின் தடுப்பூசி அட்டவணை என்ன?',
            'கர்ப்பகாலத்தில் எத்தனை பரிசோதனைகள் தேவை?',
            'ஒளிச்சேர்க்கை என்றால் என்ன?',
            'தடுப்பூசி நாள் தவறினால் என்ன செய்வது?',
          ]
        : [
            'What is the child immunization schedule?',
            'How many ANC checkups are recommended during pregnancy?',
            'What is photosynthesis?',
            'What to do if a vaccine is missed?',
          ]
    );
  }, [i18n.language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, isListening]);

  // Voice Recognition Control
  const toggleListening = () => {
    if (!speechSupported) {
      alert(
        isTa
          ? 'உங்கள் உலாவியில் குரல் உள்ளீடு வசதி கிடைக்கவில்லை. கீழே தட்டச்சு செய்து கேட்கலாம்.'
          : 'Speech recognition is not supported in this browser. Please type your query in the text box below.'
      );
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch (e) {
        // Ignore
      }
      setIsListening(false);
    } else {
      stopSpeaking();
      setInputQuery('');
      if (recognitionRef.current) {
        recognitionRef.current.lang = isTa ? 'ta-IN' : 'en-IN';
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch (err) {
          console.warn('Speech recognition start retry:', err);
          try {
            recognitionRef.current.stop();
            setTimeout(() => {
              recognitionRef.current.start();
              setIsListening(true);
            }, 100);
          } catch (e2) {
            console.error('Could not start speech recognition:', e2);
          }
        }
      }
    }
  };

  // Text-To-Speech
  const speakText = (text: string) => {
    if (!autoVoiceReadout) return;
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        window.speechSynthesis.resume();

        // Strip markdown asterisks and hashtags for natural speech
        const cleanSpeech = text
          .replace(/[*#_`>]/g, '')
          .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
          .slice(0, 350); // speak the first concise summary block

        const utterance = new SpeechSynthesisUtterance(cleanSpeech);
        utterance.lang = isTa ? 'ta-IN' : 'en-IN';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        // Try to select appropriate voice
        const voices = window.speechSynthesis.getVoices();
        if (voices && voices.length > 0) {
          const matchedVoice = voices.find((v) =>
            isTa ? v.lang.startsWith('ta') : v.lang.startsWith('en')
          );
          if (matchedVoice) utterance.voice = matchedVoice;
        }

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('Speech synthesis error:', err);
        setIsSpeaking(false);
      }
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
      setIsSpeaking(false);
    }
  };

  const handleSend = async (queryText?: string) => {
    const query = (queryText || inputQuery).trim();
    if (!query) return;

    setInputQuery('');
    stopSpeaking();
    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch (e) {}
      setIsListening(false);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const res = await apiFetch<{
        response: string;
        title?: string;
        source: { title: string; url: string; reviewDate: string };
        suggestedQuestions?: string[];
      }>('/assistant/query', {
        method: 'POST',
        body: JSON.stringify({ query, language: isTa ? 'ta' : 'en' }),
      });

      if (res.success && res.data) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: res.data.response,
          source: res.data.source,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, assistantMessage]);
        if (res.data.suggestedQuestions) {
          setSuggestedQuestions(res.data.suggestedQuestions);
        }

        // Voice Readout
        speakText(res.data.response);
      }
    } catch (err) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: isTa
          ? 'மன்னிக்கவும், தகவலைப் பெறுவதில் சிக்கல் ஏற்பட்டுள்ளது. மீண்டும் முயற்சிக்கவும்.'
          : 'Unable to reach the assistant service right now. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    stopSpeaking();
    setMessages([
      {
        id: 'new-chat',
        sender: 'assistant',
        text: isTa
          ? 'புதிய உரையாடல் தொடங்கப்பட்டது. என்ன கேள்வி கேட்க விரும்புகிறீர்கள்?'
          : 'Chat cleared. Ask me anything about healthcare, science, math, or general knowledge!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-40 bg-pink-700 hover:bg-pink-800 text-white rounded-full p-3.5 sm:p-4 shadow-xl flex items-center gap-2 group transition transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-pink-300"
        aria-label="Open Materna Voice Assistant"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-300 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
        <Sparkles className="w-5 h-5 text-pink-200" />
        <span className="font-semibold text-xs sm:text-sm">Materna Voice AI</span>
      </button>

      {/* Assistant Panel */}
      {isOpen && (
        <div
          className="fixed bottom-16 sm:bottom-24 right-2 sm:right-6 z-50 w-[calc(100vw-1rem)] sm:w-[430px] h-[580px] max-h-[84vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200"
          role="dialog"
          aria-label="Materna Voice Dialog"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-700 via-pink-800 to-rose-700 text-white p-3.5 sm:p-4 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                <Sparkles className="w-4 h-4 text-pink-100" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="font-bold text-sm leading-none">Materna Voice</h3>
                  <span className="bg-emerald-500/30 text-emerald-100 text-[9px] px-1.5 py-0.2 rounded border border-emerald-400/40 font-mono font-bold uppercase tracking-wider">
                    General AI
                  </span>
                </div>
                <p className="text-[11px] text-pink-100/90 mt-0.5">
                  {isTa ? 'அனைத்து கேள்விகளுக்கும் பதிலளிக்கும் குரல் ஏஐ' : 'Voice-enabled AI for any question'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Voice Readout Toggle */}
              <button
                onClick={() => {
                  if (isSpeaking) stopSpeaking();
                  setAutoVoiceReadout(!autoVoiceReadout);
                }}
                className={`p-1.5 rounded-lg text-xs transition ${
                  autoVoiceReadout
                    ? 'text-pink-100 hover:text-white bg-white/10'
                    : 'text-pink-300 hover:text-white bg-black/20 opacity-70'
                }`}
                title={autoVoiceReadout ? 'Mute AI voice output' : 'Enable AI voice output'}
              >
                {autoVoiceReadout ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              {/* Reset/Clear Chat */}
              <button
                onClick={clearChat}
                className="p-1.5 rounded-lg text-pink-200 hover:text-white hover:bg-white/10 transition"
                title="Clear conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Close Button */}
              <button
                onClick={() => {
                  stopSpeaking();
                  if (isListening) recognitionRef.current?.stop();
                  setIsOpen(false);
                }}
                className="p-1.5 rounded-lg text-pink-200 hover:text-white hover:bg-white/10 transition"
                aria-label="Close Assistant"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Emergency Notice */}
          <div className="bg-amber-50 border-b border-amber-200/80 px-3 py-1.5 text-[11px] text-amber-900 flex items-start gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
            <p className="leading-tight">
              {isTa
                ? 'அவசர மருத்துவ அறிகுறிகளுக்கு 108 அழைக்கவும். இது தகவல்களுக்கான தளம் மட்டுமே.'
                : 'For medical emergencies call 108. MaternaTrack provides informational guidance only.'}
            </p>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3 bg-slate-50/60 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] sm:max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-pink-700 text-white rounded-br-none'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-line text-xs sm:text-[13px]">{msg.text}</p>

                  {/* Assistant Message Actions & Citations */}
                  {msg.sender === 'assistant' && (
                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                      <div className="flex items-center gap-1.5 truncate max-w-[200px]">
                        <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span className="truncate">{msg.source?.title || 'MaternaTrack Knowledge'}</span>
                      </div>
                      <button
                        onClick={() => speakText(msg.text)}
                        className="text-pink-700 hover:text-pink-800 font-semibold flex items-center gap-1 hover:underline ml-2 shrink-0"
                        title="Listen to this message"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>Listen</span>
                      </button>
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
              </div>
            ))}

            {/* AI Processing Bubble */}
            {isLoading && (
              <div className="flex items-center gap-2 text-slate-600 text-xs py-2 bg-white px-3.5 rounded-2xl border border-slate-200 w-fit shadow-xs animate-pulse">
                <span className="w-2 h-2 rounded-full bg-pink-700 animate-ping"></span>
                <span>{isTa ? 'சிந்திக்கிறது...' : 'Generating answer...'}</span>
              </div>
            )}

            {/* Live Listening Waveform */}
            {isListening && (
              <div className="p-3 bg-pink-50 border border-pink-200 rounded-2xl flex items-center justify-between gap-3 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="inline-block w-1 bg-pink-600 rounded animate-[bounce_1s_infinite_100ms] h-3"></span>
                    <span className="inline-block w-1 bg-pink-600 rounded animate-[bounce_1s_infinite_300ms] h-5"></span>
                    <span className="inline-block w-1 bg-pink-600 rounded animate-[bounce_1s_infinite_200ms] h-4"></span>
                    <span className="inline-block w-1 bg-pink-600 rounded animate-[bounce_1s_infinite_400ms] h-2"></span>
                  </div>
                  <span className="text-xs font-semibold text-pink-900">
                    {isTa ? 'உங்கள் குரலை கேட்கிறது...' : 'Listening to your voice... Speak now!'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={toggleListening}
                  className="px-2.5 py-1 rounded-lg bg-pink-700 text-white text-[11px] font-semibold hover:bg-pink-800"
                >
                  Done
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick FAQ & Suggestions */}
          {suggestedQuestions.length > 0 && (
            <div className="px-3 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
              <span className="font-bold text-slate-400 uppercase tracking-wider shrink-0 text-[9px]">
                Ask:
              </span>
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  className="bg-pink-50 hover:bg-pink-100 text-pink-800 px-2.5 py-1 rounded-full whitespace-nowrap border border-pink-200/80 transition shrink-0 hover:scale-102"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input & Voice Controls */}
          <div className="p-3 bg-white border-t border-slate-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              {/* Mic Button */}
              <button
                type="button"
                onClick={toggleListening}
                className={`p-2.5 rounded-xl transition flex items-center justify-center shrink-0 shadow-xs ${
                  isListening
                    ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-200'
                    : 'bg-slate-100 hover:bg-pink-50 hover:text-pink-700 text-slate-700'
                }`}
                title={isListening ? 'Stop listening' : 'Start voice input (Speak)'}
                aria-label="Microphone"
              >
                {isListening ? <Mic className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Text Input */}
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder={
                  isListening
                    ? isTa
                      ? 'பேசுங்கள், பதிவு செய்யப்படுகிறது...'
                      : 'Listening... speak your question...'
                    : isTa
                    ? 'எந்த கேள்வியையும் கேட்கலாம் (English அல்லது தமிழ்)...'
                    : 'Ask anything (General AI or Health)...'
                }
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-[13px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:bg-white transition"
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={!inputQuery.trim() || isLoading}
                className="p-2.5 rounded-xl bg-pink-700 hover:bg-pink-800 disabled:opacity-40 text-white transition shadow-sm shrink-0"
                title="Send"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
