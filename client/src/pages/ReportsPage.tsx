import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { apiFetch } from '../api/client.js';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Download, Printer, FileText, CheckCircle2, Clock, AlertTriangle, Users, Heart } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      setLoading(true);
      const res = await apiFetch('/reports/analytics');
      if (res.success && res.data) {
        setData(res.data);
      }
      setLoading(false);
    }
    loadReports();
  }, []);

  const handleExportCsv = () => {
    window.location.href = 'http://localhost:5000/api/reports/export-csv';
  };

  const handlePrint = () => {
    window.print();
  };

  const COLORS = ['#BE185D', '#EA580C', '#B45309', '#0369A1', '#15803D'];

  if (loading || !data) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-pink-700 font-semibold">
          <span className="w-5 h-5 border-2 border-pink-700 border-t-transparent rounded-full animate-spin"></span>
          <span>{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Care Continuity Analytics & Reports
            </h1>
            <p className="text-xs text-slate-500">
              Deterministic metrics calculated live from database records for Sathyamangalam block.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>{t('common.print')}</span>
            </button>
            <button
              onClick={handleExportCsv}
              className="px-4 py-2 rounded-xl bg-pink-700 hover:bg-pink-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV Dataset</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              On-Time Completion Rate
            </span>
            <p className="text-3xl font-extrabold text-emerald-700">
              {data.rates?.onTimeCompletionRate}%
            </p>
            <p className="text-[11px] text-slate-400">
              Denominator: {data.rates?.completionDenominator} eligible services
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Follow-up Resolution Rate
            </span>
            <p className="text-3xl font-extrabold text-pink-700">
              {data.rates?.followUpResolutionRate}%
            </p>
            <p className="text-[11px] text-slate-400">
              Denominator: {data.rates?.resolutionDenominator} overdue tasks
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Active Pregnancies
            </span>
            <p className="text-3xl font-extrabold text-slate-900">
              {data.summary?.activePregnancies}
            </p>
            <p className="text-[11px] text-rose-700 font-semibold">
              {data.summary?.highRiskPregnancies} High-risk cases
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Total Household Beneficiaries
            </span>
            <p className="text-3xl font-extrabold text-slate-900">
              {data.summary?.totalBeneficiaries}
            </p>
            <p className="text-[11px] text-slate-400">
              {data.summary?.totalMothers} Mothers • {data.summary?.totalChildren} Children
            </p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Missed Visit Reasons Chart */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">
              Common Recorded Missed-Visit Reasons
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.missedReasonsBreakdown || []} layout="vertical">
                  <XAxis type="number" />
                  <YAxis dataKey="reason" type="category" width={160} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#BE185D" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Follow-up Tasks Priority Distribution */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">
              Follow-up Queue by Priority Level
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.tasksByPriority || []}
                    dataKey="count"
                    nameKey="priority"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {data.tasksByPriority?.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
