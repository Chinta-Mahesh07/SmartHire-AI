import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  MapPin,
  Briefcase,
  DollarSign,
  Filter,
  Sparkles,
  Bookmark,
  ChevronRight,
  X,
  SlidersHorizontal
} from 'lucide-react';
import { jobsAPI, candidatesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const JobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const { user, isCandidate } = useAuth();
  const { showToast } = useToast();

  // Filters state
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [jobType, setJobType] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [isRemote, setIsRemote] = useState(false);
  const [minSalary, setMinSalary] = useState('');

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (location) params.location = location;
      if (category) params.category = category;
      if (jobType) params.job_type = jobType;
      if (experienceLevel) params.experience_level = experienceLevel;
      if (isRemote) params.is_remote = 'true';
      if (minSalary) params.min_salary = minSalary;

      const res = await jobsAPI.getJobs(params);
      setJobs(res.data.results || res.data || []);
    } catch (err) {
      console.error(err);
      showToast('Failed to load jobs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    jobsAPI.getCategories().then((res) => {
      setCategories(res.data.results || res.data || []);
    });

    if (isCandidate) {
      candidatesAPI.getSavedJobs().then((res) => {
        const saved = res.data.results || res.data || [];
        setSavedJobIds(new Set(saved.map((s) => s.job)));
      }).catch(() => {});
    }
  }, [isCandidate]);

  useEffect(() => {
    fetchJobs();
  }, [category, jobType, experienceLevel, isRemote]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleToggleSave = async (jobId, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      showToast('Please sign in to save jobs.', 'info');
      return;
    }
    try {
      const res = await candidatesAPI.toggleSaveJob(jobId);
      const newSet = new Set(savedJobIds);
      if (res.data.saved) {
        newSet.add(jobId);
        showToast('Job saved to your bookmarks!', 'success');
      } else {
        newSet.delete(jobId);
        showToast('Job removed from bookmarks.', 'info');
      }
      setSavedJobIds(newSet);
    } catch (err) {
      showToast('Failed to update bookmark.', 'error');
    }
  };

  const clearFilters = () => {
    setSearch('');
    setLocation('');
    setCategory('');
    setJobType('');
    setExperienceLevel('');
    setIsRemote(false);
    setMinSalary('');
    jobsAPI.getJobs().then((res) => setJobs(res.data.results || res.data || []));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Explore Job Opportunities</h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Discover verified engineering, AI, product, and cloud positions with instant AI match scoring.
        </p>
      </div>

      {/* Search Bar & Multi-filter Bar */}
      <form onSubmit={handleSearchSubmit} className="p-4 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Keyword Search */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by job title, company, or skills (e.g. Python, React)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          {/* Location Search */}
          <div className="md:col-span-4 relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, state, or 'Remote'..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          {/* Search Button */}
          <div className="md:col-span-3 flex gap-2">
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search Jobs</span>
            </button>

            {(search || location || category || jobType || experienceLevel || isRemote) && (
              <button
                type="button"
                onClick={clearFilters}
                className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                title="Reset filters"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
          {/* Category Dropdown */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 focus:ring-2 focus:ring-blue-600 focus:outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Job Type */}
          <select
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 focus:ring-2 focus:ring-blue-600 focus:outline-none"
          >
            <option value="">All Job Types</option>
            <option value="FULL_TIME">Full Time</option>
            <option value="PART_TIME">Part Time</option>
            <option value="CONTRACT">Contract</option>
            <option value="INTERNSHIP">Internship</option>
          </select>

          {/* Experience */}
          <select
            value={experienceLevel}
            onChange={(e) => setExperienceLevel(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 focus:ring-2 focus:ring-blue-600 focus:outline-none"
          >
            <option value="">All Experience Levels</option>
            <option value="ENTRY">Entry Level</option>
            <option value="MID">Mid Level</option>
            <option value="SENIOR">Senior Level</option>
            <option value="LEAD">Lead / Staff</option>
          </select>

          {/* Remote Checkbox */}
          <label className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white cursor-pointer text-xs text-slate-700 hover:bg-slate-50 transition-colors">
            <input
              type="checkbox"
              checked={isRemote}
              onChange={(e) => setIsRemote(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span>Remote Only</span>
          </label>
        </div>
      </form>

      {/* Jobs Results List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Found <strong className="text-slate-800">{jobs.length}</strong> active position{jobs.length !== 1 ? 's' : ''}</span>
          <span>Sorted by most recent</span>
        </div>

        {loading ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-400">Loading open positions...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 space-y-3">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No jobs match your criteria</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your keywords, expanding your preferred location, or clearing search filters.
            </p>
            <button
              onClick={clearFilters}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-blue-600 hover:bg-blue-50"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {jobs.map((job) => {
              const isSaved = savedJobIds.has(job.id);
              return (
                <div
                  key={job.id}
                  className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-6"
                >
                  <div className="space-y-3 flex-1 min-w-0">
                    <div className="flex items-start justify-between sm:justify-start gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-blue-600 hover:underline">{job.company_name}</span>
                          {job.is_remote && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Remote
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                            {job.job_type.replace('_', ' ')}
                          </span>
                        </div>
                        <h2 className="text-lg font-bold text-slate-900 mt-1">
                          <Link to={`/jobs/${job.id}`} className="hover:text-blue-600 transition-colors">
                            {job.title}
                          </Link>
                        </h2>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {job.location}
                      </span>
                      {job.min_salary && (
                        <span className="flex items-center gap-1 font-semibold text-slate-800">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                          ${(job.min_salary / 1000).toFixed(0)}k - ${(job.max_salary / 1000).toFixed(0)}k / year
                        </span>
                      )}
                      <span>Min {job.min_experience_years} yrs exp</span>
                    </div>

                    {/* Skill Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {job.required_skills_list?.map((skill) => (
                        <span key={skill} className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200/60 text-slate-600 text-[11px] font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-100">
                    <button
                      onClick={(e) => handleToggleSave(job.id, e)}
                      className={`p-2.5 rounded-xl border transition-all ${
                        isSaved
                          ? 'bg-blue-50 border-blue-200 text-blue-600'
                          : 'border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                      }`}
                      title={isSaved ? 'Saved to bookmarks' : 'Save job'}
                    >
                      <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                    </button>

                    <Link
                      to={`/jobs/${job.id}`}
                      className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
                    >
                      <span>View & Apply</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobsPage;
