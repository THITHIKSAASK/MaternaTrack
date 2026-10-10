import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Mic, MicOff, Send, Volume2, VolumeX, X, MessageSquare, Sparkles, AlertTriangle, ExternalLink, ShieldCheck } from 'lucide-react';
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
  const [speechSupported, setSpeechSupported] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isTa = i18n.language === 'ta';

  useEffect(() => {
    // Check speech recognition support
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = isTa ? 'ta-IN' : 'en-IN';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputQuery(transcript);
        setIsListening(false);
        handleSend(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    // Set initial greeting
    setMessages([
      {
        id: 'initial',
        sender: 'assistant',
        text: isTa
          ? 'வணக்கம்! நான் மதர்னா வாய்ஸ். கர்ப்பகால பராமரிப்பு, தடுப்பூசி அட்டவணை மற்றும் ஆரம்ப சுகாதார சேவைகள் பற்றிய வழிகாட்டுதல்களை உங்களுக்கு வழங்குகிறேன். என்ன உதவி வேண்டும்?'
          : 'Hello! I am Materna Voice. I can help guide you through antenatal milestones, immunization schedules, and public health care follow-up. How can I help you today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);

    setSuggestedQuestions(
      isTa
        ? [
            'குழந்தையின் தடுப்பூசி அட்டவணை என்ன?',
            'கர்ப்பகாலத்தில் எத்தனை பரிசோதனைகள் தேவை?',
            'தடுப்பூசி நாள் தவறினால் என்ன செய்வது?',
          ]
        : [
            'What is the child immunization schedule?',
            'How many ANC checkups are recommended during pregnancy?',
            'What should I do if a vaccination appointment was missed?',
          ]
    );
  }, [i18n.language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const toggleListening = () => {
    if (!speechSupported || !recognitionRef.current) {
      alert(
        isTa
          ? 'உங்கள் உலாவியில் குரல் உள்ளீடு ஆதரிக்கப்படவில்லை. கீழே தட்டச்சு செய்து கேட்கலாம்.'
          : 'Speech recognition is not supported in this browser. You can type your question below.'
      );
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      stopSpeaking();
      recognitionRef.current.lang = isTa ? 'ta-IN' : 'en-IN';
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = isTa ? 'ta-IN' : 'en-IN';
      utterance.rate = 0.95;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleSend = async (queryText?: string) => {
    const query = (queryText || inputQuery).trim();
    if (!query) return;

    setInputQuery('');
    stopSpeaking();

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

        // Auto speak response
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
    setMessages([]);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 bg-pink-700 hover:bg-pink-800 text-white rounded-full p-4 shadow-xl flex items-center gap-2 group transition transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-pink-300"
        aria-label="Open Materna Voice Assistant"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-300 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
        <Sparkles className="w-5 h-5 text-pink-200" />
        <span className="font-semibold text-sm hidden sm:inline">{t('assistant.title')}</span>
      </button>

      {/* Assistant Panel */}
      {isOpen && (
        <div
          className="fixed bottom-20 right-4 sm:right-6 z-50 w-[95vw] sm:w-[420px] h-[580px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200"
          role="dialog"
          aria-label="Materna Voice Dialog"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-700 to-pink-800 text-white p-4 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-pink-200" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm leading-none">{t('assistant.title')}</h3>
                  <span className="bg-pink-900/60 text-pink-200 text-[10px] px-1.5 py-0.5 rounded border border-pink-500/40 font-mono">
                    {t('assistant.verifiedMode')}
                  </span>
                </div>
                <p className="text-[11px] text-pink-200 mt-0.5">{t('assistant.tagline')}</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {isSpeaking && (
                <button
                  onClick={stopSpeaking}
                  className="p-1 rounded text-pink-200 hover:text-white hover:bg-white/10"
                  title={t('assistant.stopSpeaking')}
                >
                  <VolumeX className="w-4 h-4 text-amber-300 animate-pulse" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded text-pink-200 hover:text-white hover:bg-white/10"
                aria-label="Close Assistant"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Emergency Safety Notice */}
          <div className="bg-amber-50 border-b border-amber-200/80 px-3 py-1.5 text-[11px] text-amber-900 flex items-start gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
            <p className="leading-tight">
              {isTa ? 'அவசர அறிகுறிகளுக்கு 108 அழைக்கவும். இது தகவல்களுக்கான தளம் மட்டுமே.' : 'For medical emergencies call 108. MaternaTrack provides informational guidance only.'}
            </p>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-pink-700 text-white rounded-br-none'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>

                  {/* Reference Source Citation */}
                  {msg.source && (
                    <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-500">
                      <div className="flex items-center gap-1 font-semibold text-slate-700">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>Source: {msg.source.title}</span>
                      </div>
                      <a
                        href={msg.source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-pink-700 hover:underline flex items-center gap-1 mt-0.5"
                      >
                        <span className="truncate max-w-[200px]">{msg.source.url}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-slate-500 text-xs py-2 bg-white px-3 rounded-xl border border-slate-200 w-fit">
                <span className="w-2 h-2 rounded-full bg-pink-700 animate-pulse"></span>
                <span>{t('assistant.processing')}</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions */}
          {suggestedQuestions.length > 0 && (
            <div className="px-3 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto text-[11px]">
              <span className="font-semibold text-slate-400 uppercase tracking-wider shrink-0 text-[9px]">
                FAQ:
              </span>
              {suggestedQuestions.slice(0, 3).map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  className="bg-pink-50 hover:bg-pink-100 text-pink-800 px-2.5 py-1 rounded-full whitespace-nowrap border border-pink-200 transition shrink-0"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
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
                className={`p-2 rounded-xl transition ${
                  isListening
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
                title={isListening ? 'Stop listening' : 'Start voice input'}
              >
                {isListening ? <Mic className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder={isListening ? t('assistant.listening') : t('assistant.typePlaceholder')}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:bg-white"
              />

              <button
                type="submit"
                disabled={!inputQuery.trim() || isLoading}
                className="p-2 rounded-xl bg-pink-700 hover:bg-pink-800 disabled:opacity-50 text-white transition shadow-xs"
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
