import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  Copy,
  Check,
  RefreshCw,
  Maximize2,
  ChevronDown
} from 'lucide-react';
import { aiAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const AICopilotDrawer = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [prompts, setPrompts] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const messagesEndRef = useRef(null);

  // Initialize greeting and fetch role-specific prompts
  useEffect(() => {
    if (!user) return;

    aiAPI.getAgentPrompts().then((res) => {
      setPrompts(res.data.prompts || []);
    }).catch(() => {});

    // Initial greeting
    const greeting =
      user.role === 'CANDIDATE'
        ? `Hi ${user.first_name || user.username}! 👋 I'm your **SmartHire AI Career Copilot**. I can run **mock technical interviews**, generate **tailored cover pitches**, evaluate your resume keywords, or give you a custom 90-day skill roadmap. How can I help you today?`
        : user.role === 'RECRUITER'
        ? `Hello ${user.first_name || user.username}! 👋 I'm your **SmartHire AI Talent Copilot**. I can generate structured **interview question scorecards**, draft personalized **candidate outreach & rejection notes**, and summarize applicant profiles. What would you like to prepare?`
        : `Greetings Admin ${user.username}! 👑 I am your **Platform Governance Agent**. How can I assist you with platform metrics or recruiter verifications today?`;

    setMessages([
      {
        role: 'assistant',
        content: greeting,
      },
    ]);
  }, [user]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (customMessage) => {
    const textToSend = customMessage || input;
    if (!textToSend.trim() || loading) return;

    const userMessage = { role: 'user', content: textToSend };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      // Build clean history without system turns
      const historyPayload = newMessages
        .slice(-6)
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await aiAPI.agentChat({
        message: textToSend,
        history: historyPayload,
      });

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: res.data.reply,
          context_used: res.data.context_used,
        },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '⚠️ I encountered an error processing your request. Please try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleReset = () => {
    const greeting =
      user?.role === 'CANDIDATE'
        ? `Hi ${user.first_name || user.username}! 👋 Conversation refreshed. What role or interview prep would you like to explore next?`
        : `Hello ${user?.first_name || user?.username}! 👋 Copilot session restarted. Ready for your next recruiting task.`;

    setMessages([{ role: 'assistant', content: greeting }]);
  };

  // Simple Markdown renderer for headings, code blocks, lists, bold
  const renderFormattedContent = (content) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      // Headers
      if (line.startsWith('### ')) {
        return <h4 key={idx} className="font-bold text-sm text-slate-900 mt-2 mb-1">{line.replace('### ', '')}</h4>;
      }
      if (line.startsWith('#### ')) {
        return <h5 key={idx} className="font-bold text-xs text-slate-800 mt-2 mb-1">{line.replace('#### ', '')}</h5>;
      }
      // Bullet items
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const itemText = line.trim().substring(2);
        return (
          <li key={idx} className="ml-4 list-disc text-xs leading-relaxed">
            <span dangerouslySetInnerHTML={{ __html: itemText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
          </li>
        );
      }
      // Numbered items
      if (/^\d+\.\s/.test(line.trim())) {
        return (
          <div key={idx} className="text-xs font-semibold text-slate-900 mt-2 mb-0.5">
            <span dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
          </div>
        );
      }
      // Code snippet fence
      if (line.startsWith('```')) {
        return null;
      }
      // Regular paragraph with bold support
      return (
        <p
          key={idx}
          className="text-xs leading-relaxed my-1"
          dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
        />
      );
    });
  };

  if (!user) return null;

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-xs shadow-2xl shadow-blue-500/40 hover:scale-105 active:scale-95 transition-all group"
          title="Open SmartHire AI Copilot"
        >
          <div className="relative">
            <Sparkles className="w-4 h-4 animate-spin-slow" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <span className="tracking-wide">AI Copilot</span>
        </button>
      )}

      {/* Copilot Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full sm:w-[420px] h-[580px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200/80 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="px-5 py-3.5 bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold tracking-tight">SmartHire AI Copilot</h3>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    Live
                  </span>
                </div>
                <p className="text-[10px] text-slate-300">
                  {user.role === 'CANDIDATE' ? 'Career & Interview Mentor' : 'Hiring Intelligence Assistant'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-slate-300">
              <button
                onClick={handleReset}
                className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Restart conversation"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Minimize Copilot"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 shadow-sm relative group ${
                    m.role === 'user'
                      ? 'bg-blue-600 text-white text-xs font-medium rounded-tr-none'
                      : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                  }`}
                >
                  <div className="prose prose-xs max-w-none">
                    {renderFormattedContent(m.content)}
                  </div>

                  {m.role === 'assistant' && (
                    <button
                      onClick={() => handleCopy(m.content, idx)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-500 text-[10px] transition-all flex items-center gap-1"
                      title="Copy response"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600">Copied</span>
                        </>
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5 items-center text-slate-400 text-xs py-1">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-1 bg-white p-3 rounded-2xl border border-slate-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[11px] text-slate-500 ml-1">Copilot is thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Prompt Chips */}
          {prompts.length > 0 && messages.length <= 4 && (
            <div className="px-3 py-2 bg-white border-t border-slate-100 flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {prompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(p.prompt)}
                  disabled={loading}
                  className="px-2.5 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-semibold transition-colors flex items-center gap-1 border border-blue-100 text-left"
                >
                  <Sparkles className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate max-w-[200px]">{p.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Chat Input Field */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-slate-100 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                user.role === 'CANDIDATE'
                  ? 'Ask for mock questions, cover notes, or roadmap...'
                  : 'Ask to generate interview kits, screen resumes...'
              }
              disabled={loading}
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 disabled:opacity-40 transition-all flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default AICopilotDrawer;
