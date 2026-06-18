import React from 'react';
import { Shield, Database } from 'lucide-react';
import { PageHeader } from '../../components/shared/UIComponents';

const AdminSettings = () => {
  return (
    <div>
      <PageHeader title="System Settings" subtitle="Admin configuration and system preferences" />
      <div className="max-w-2xl space-y-4">
        <div className="card">
          <h3 className="section-title mb-4 flex items-center gap-2"><Shield size={18} className="text-primary-500" /> Platform Security</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">Enforce strong passwords</p>
                <p className="text-xs text-text-muted">Requires minimum 8 characters, numbers, and symbols</p>
              </div>
              <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary-500">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white shadow translate-x-6" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">Auto-suspend inactive doctors</p>
                <p className="text-xs text-text-muted">Suspend accounts inactive for 90 days</p>
              </div>
              <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white shadow translate-x-1" />
              </div>
            </div>
          </div>
        </div>
        <div className="card">
          <h3 className="section-title mb-4 flex items-center gap-2"><Database size={18} className="text-secondary-500" /> Data Management</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Storage is managed via Firebase Storage. Analytics are stored in Firestore.</p>
          <button className="btn-outline text-sm">Export Audit Logs (CSV)</button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
