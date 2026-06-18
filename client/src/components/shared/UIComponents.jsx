import React from 'react';

export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-4">
      {Icon && <Icon size={28} className="text-slate-400" />}
    </div>
    <h3 className="text-base font-semibold text-slate-600 dark:text-slate-300 mb-1">{title}</h3>
    {description && <p className="text-sm text-text-muted max-w-xs">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export const StatCard = ({ icon: Icon, label, value, color = 'blue', trend }) => {
  const colors = {
    blue: 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400',
    green: 'bg-secondary-50 text-secondary-600 dark:bg-secondary-900/30 dark:text-secondary-400',
    red: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  };
  return (
    <div className="stat-card">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${colors[color]}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800 dark:text-white">{value}</p>
        <p className="text-sm text-text-muted">{label}</p>
        {trend && <p className="text-xs text-secondary-600 font-medium mt-0.5">{trend}</p>}
      </div>
    </div>
  );
};

export const Badge = ({ variant = 'blue', children }) => {
  const variants = {
    blue: 'badge-blue',
    green: 'badge-green',
    red: 'badge-red',
    amber: 'badge-amber',
    gray: 'badge-gray',
  };
  return <span className={variants[variant]}>{children}</span>;
};

export const StatusBadge = ({ status }) => {
  const map = {
    active: { variant: 'green', label: 'Active' },
    completed: { variant: 'blue', label: 'Completed' },
    discontinued: { variant: 'red', label: 'Discontinued' },
    confirmed: { variant: 'green', label: 'Confirmed' },
    pending: { variant: 'amber', label: 'Pending' },
    cancelled: { variant: 'red', label: 'Cancelled' },
    approved: { variant: 'green', label: 'Approved' },
    suspended: { variant: 'red', label: 'Suspended' },
    mild: { variant: 'green', label: 'Mild' },
    moderate: { variant: 'amber', label: 'Moderate' },
    severe: { variant: 'red', label: 'Severe' },
  };
  const item = map[status?.toLowerCase()] || { variant: 'gray', label: status || 'Unknown' };
  return <Badge variant={item.variant}>{item.label}</Badge>;
};

export const PageHeader = ({ title, subtitle, actions }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
    <div>
      <h1 className="page-header">{title}</h1>
      {subtitle && <p className="page-sub">{subtitle}</p>}
    </div>
    {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
  </div>
);

export const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-xl' }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className={`bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full ${maxWidth} max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-border dark:border-slate-700">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">{title}</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors text-xl font-light"
            >
              ×
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export const FormField = ({ label, error, children, required }) => (
  <div className="mb-4">
    {label && (
      <label className="label">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    {children}
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

export const LoadingSpinner = ({ size = 'md', center = false }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' };
  return (
    <div className={center ? 'flex items-center justify-center py-12' : 'inline-block'}>
      <div
        className={`${sizes[size]} border-2 border-primary-200 border-t-primary-500 rounded-full animate-spin`}
      />
    </div>
  );
};
