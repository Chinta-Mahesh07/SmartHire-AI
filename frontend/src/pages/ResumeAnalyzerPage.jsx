import React, { useState } from 'react';
import {
  Sparkles,
  Upload,
  FileText,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Award,
  ArrowRight,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { aiAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const ResumeAnalyzerPage = () => {
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const { user } = useAuth();
  const { showToast } = useToast();

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (!selected.name.toLowerCase().endsWith('.pdf')) {
        showToast('Please upload a PDF file.', 'error');
        return;
      }
      setFile(selected);
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!file) {
      showToast('Please select a PDF resume to analyze.', 'warning');
      return;
    }

    setAnalyzing(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name);

    try {
      const res = await aiAPI.analyzeResume(formData, true);
      setResult(res.data.analysis);
      showToast('Resume evaluated successfully!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Error analyzing resume. Please ensure file contains readable text.', 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 85) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 70) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 50) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-semibold">
          <Sparkles className="w-4 h-4" />
          <span>AI-Powered ATS Resume Evaluator</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Benchmark Your Resume with AI
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Upload your resume in PDF format to receive instant scoring, skill extraction, seniority analysis, and targeted suggestions to pass ATS filters.
        </p>
      </div>

      {/* Upload Box */}
      <form onSubmit={handleAnalyze} className="max-w-2xl mx-auto p-8 rounded-3xl bg-white border border-slate-100 shadow-xl shadow-slate-200/50 space-y-6">
        <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer relative bg-slate-50/50">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">
                {file ? file.name : 'Click to select or drag & drop PDF resume'}
              </p>
              <p className="text-xs text-slate-400 mt-1">PDF format only (Max 10MB)</p>
            </div>
            {file && (
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                File loaded: {(file.size / 1024).toFixed(1)} KB
              </span>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={!file || analyzing}
          className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {analyzing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Analyzing Resume with AI Engine...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Analyze Resume Now</span>
            </>
          )}
        </button>
      </form>

      {/* Results View */}
      {result && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold text-slate-900">Analysis Results</h2>
            <p className="text-xs text-slate-500">Comprehensive breakdown generated from resume content</p>
          </div>

          {/* Top Score & Overview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Score Card */}
            <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm text-center space-y-3 flex flex-col justify-center items-center">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">ATS Resume Score</p>
              <div className={`w-28 h-28 rounded-full border-4 flex items-center justify-center ${getScoreColor(result.resume_score)}`}>
                <span className="text-3xl font-extrabold">{result.resume_score}</span>
                <span className="text-xs font-semibold opacity-60">/100</span>
              </div>
              <p className="text-xs text-slate-500">
                {result.resume_score >= 80 ? 'Excellent candidate ATS readiness' : 'Good baseline, needs keyword optimization'}
              </p>
            </div>

            {/* Seniority & Experience */}
            <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                Seniority & Experience
              </p>
              <h3 className="text-lg font-bold text-slate-900">
                {result.experience_analysis?.level || 'Professional'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {result.experience_analysis?.summary || `Candidate demonstrates estimated ${result.experience_analysis?.estimated_years || 2} years of relevant experience.`}
              </p>
              <div className="pt-2 text-xs font-semibold text-blue-600">
                Estimated Experience: {result.experience_analysis?.estimated_years || 2} Years
              </div>
            </div>

            {/* Education Summary */}
            <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-indigo-600" />
                Education Credentials
              </p>
              <h3 className="text-lg font-bold text-slate-900">
                {result.education_analysis?.degree || "Bachelor's Degree"}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Field of Study: {result.education_analysis?.field || 'Computer Science / Engineering'}
              </p>
            </div>
          </div>

          {/* Skills Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Identified Skills */}
            <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  Identified Skills ({result.identified_skills?.length || 0})
                </h3>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {result.identified_skills?.map((skill) => (
                  <span key={skill} className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing In-Demand Skills */}
            <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Recommended Missing Skills ({result.missing_skills?.length || 0})
                </h3>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {result.missing_skills?.length > 0 ? (
                  result.missing_skills.map((skill) => (
                    <span key={skill} className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
                      + {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-slate-500">No major technology gaps detected.</p>
                )}
              </div>
            </div>
          </div>

          {/* AI Improvement Suggestions */}
          <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              Actionable Improvement Suggestions
            </h3>
            <div className="space-y-3">
              {result.improvement_suggestions?.map((suggestion, index) => (
                <div key={index} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed">{suggestion}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeAnalyzerPage;
