import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Bot,
  Send,
  Target,
  FileText,
  TrendingUp,
  Award,
  Briefcase,
  Copy,
  Check,
  RefreshCw
} from 'lucide-react';
import { aiAPI, jobsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const CandidateCopilotPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [targetJobs, setTargetJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [copiedIndex, setCopiedIndex] = useState(null);

  useEffect(() => {
    jobsAPI.getJobs({ limit: 10 }).then((res) => {
      setTargetJobs(res.data.results || res.data || []);
    });

    const greeting = `Welcome to your **Autonomous Career Copilot**, ${user?.first_name || user?.username}! 🎯\n\nI can conduct **interactive mock interviews**, draft **tailored application pitches**, analyze your **resume skill gaps**, and construct a **90-day learning roadmap** to help you land senior engineering offers.`;
    setMessages([{ role: 'assistant', content: greeting }]);
  }, [user]);

  const handleSend = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMsg = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const historyPayload = newMessages.slice(-6).map((m) => ({ role: m.role, content: m.content }));
      const res = await aiAPI.agentChat({
        message: text,
        history: historyPayload,
        target_job_id: selectedJobId || undefined,
      });

      setMessages((prev) => [...prev, { role: 'assistant', content: res.data.reply }]);
    } catch (err) {
      showToast('Error communicating with Copilot agent.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Career Agent & Interview Simulator</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">AI Career Copilot Workspace</h1>
          <p className="text-xs text-slate-500">Autonomous career coaching, real-time interview prep, and tailored pitch generation.</p>
        </div>

        {/* Target Job Context Selector */}
        <div className="w-full sm:w-72">
          <label className="text-[11px] font-bold text-slate-600 block mb-1">Contextual Target Job</label>
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none"
          >
            <option value="">General Software Engineering</option>
            {targetJobs.map((j) => (
              <option key={j.id} value={j.id}>{j.title} ({j.company_name})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Copilot Card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col h-[650px] overflow-hidden">
        {/* Quick Agent Actions Bar */}
        <div className="p-3 bg-slate-50 border-b border-slate-100 flex flex-wrap gap-2">
          <button
            onClick={() => handleSend("Can you conduct a comprehensive mock technical interview for this position?")}
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-300 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Target className="w-3.5 h-3.5 text-blue-600" />
            <span>Run Mock Interview</span>
          </button>

          <button
            onClick={() => handleSend("Draft a tailored application cover note for this job matching my skills.")}
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-300 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
            <span>Generate Cover Pitch</span>
          </button>

          <button
            onClick={() => handleSend("What 90-day learning roadmap should I follow to qualify for senior roles?")}
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-300 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>Skill Growth Roadmap</span>
          </button>

          <button
            onClick={() => handleSend("How can I improve my resume's ATS match score for this role?")}
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-300 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Resume ATS Audit</span>
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 relative group ${
                  m.role === 'user'
                    ? 'bg-blue-600 text-white text-xs font-medium'
                    : 'bg-slate-50 text-slate-800 border border-slate-100 text-xs leading-relaxed'
                }`}
              >
                <div className="whitespace-pre-line">{m.content}</div>

                {m.role === 'assistant' && (
                  <button
                    onClick={() => handleCopy(m.content, idx)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 rounded bg-white border border-slate-200 text-slate-500 hover:text-slate-800 text-[10px] transition-all flex items-center gap-1 shadow-sm"
                  >
                    {copiedIndex === idx ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedIndex === idx ? 'Copied' : 'Copy'}</span>
                  </button>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]" />
                <span className="text-[11px] text-slate-500 ml-1">Copilot is generating response...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-4 bg-white border-t border-slate-100 flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything, answer mock interview questions, or request advice..."
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 disabled:opacity-40 transition-all flex items-center gap-2"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default CandidateCopilotPage;
