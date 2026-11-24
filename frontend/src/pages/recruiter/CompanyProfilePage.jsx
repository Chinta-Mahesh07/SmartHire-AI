import React, { useState, useEffect } from 'react';
import { Building, Globe, MapPin, Users, CheckCircle, Save } from 'lucide-react';
import { recruitersAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const CompanyProfilePage = () => {
  const [company, setCompany] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    company_size: '11-50',
    headquarters: '',
    website: '',
    description: '',
    founded_year: 2020,
  });
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchCompany = async () => {
    try {
      const res = await recruitersAPI.getMyCompany();
      setCompany(res.data);
      setFormData({
        name: res.data.name || '',
        industry: res.data.industry || '',
        company_size: res.data.company_size || '11-50',
        headquarters: res.data.headquarters || '',
        website: res.data.website || '',
        description: res.data.description || '',
        founded_year: res.data.founded_year || 2020,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompany();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (company?.id) {
        await recruitersAPI.updateCompany(company.id, formData);
        showToast('Company profile updated successfully!', 'success');
      } else {
        const res = await recruitersAPI.createCompany(formData);
        setCompany(res.data);
        showToast('Company profile created!', 'success');
      }
      fetchCompany();
    } catch (err) {
      showToast('Failed to save company profile.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-400">Loading company profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Company Profile</h1>
        <p className="text-xs text-slate-500">
          Manage your organization's brand identity, mission, and company details visible to applicants.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-5">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">Company Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Industry / Domain</label>
            <input
              type="text"
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              placeholder="e.g. Software & AI Solutions"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Company Size</label>
            <select
              value={formData.company_size}
              onChange={(e) => setFormData({ ...formData, company_size: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none"
            >
              <option value="1-10">1-10 Employees</option>
              <option value="11-50">11-50 Employees</option>
              <option value="51-200">51-200 Employees</option>
              <option value="201-500">201-500 Employees</option>
              <option value="500+">500+ Employees</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Headquarters</label>
            <input
              type="text"
              value={formData.headquarters}
              onChange={(e) => setFormData({ ...formData, headquarters: e.target.value })}
              placeholder="San Francisco, CA"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Founded Year</label>
            <input
              type="number"
              value={formData.founded_year}
              onChange={(e) => setFormData({ ...formData, founded_year: parseInt(e.target.value) || 2020 })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">Official Website URL</label>
          <input
            type="url"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            placeholder="https://company.com"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">About the Company / Mission</label>
          <textarea
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe your company culture, technology focus, and employee value proposition..."
            className="w-full p-3.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
          />
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Company Profile</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompanyProfilePage;
