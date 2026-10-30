import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  change?: number;
  variant?: 'primary' | 'success' | 'warning' | 'danger';
}

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  title,
  value,
  change,
  variant = 'primary',
}) => {
  const variantClasses = {
    primary: 'bg-blue-50 text-blue-600',
    success: 'bg-green-50 text-green-600',
    warning: 'bg-yellow-50 text-yellow-600',
    danger: 'bg-red-50 text-red-600',
  };

  const changeColor = change && change >= 0 ? 'text-green-600' : 'text-red-600';

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-3 rounded-lg ${variantClasses[variant]}`}>
              {icon}
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {change !== undefined && (
            <div className={`flex items-center gap-1 mt-2 ${changeColor}`}>
              {change >= 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">
                {Math.abs(change)}% {change >= 0 ? 'زيادة' : 'نقصان'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  total?: number;
  percentage?: number;
  variant?: 'primary' | 'success' | 'warning' | 'danger';
  showProgress?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  icon,
  title,
  value,
  total,
  percentage,
  variant = 'primary',
  showProgress = true,
}) => {
  const variantClasses = {
    primary: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      progress: 'bg-blue-600',
    },
    success: {
      bg: 'bg-green-50',
      text: 'text-green-600',
      progress: 'bg-green-600',
    },
    warning: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-600',
      progress: 'bg-yellow-600',
    },
    danger: {
      bg: 'bg-red-50',
      text: 'text-red-600',
      progress: 'bg-red-600',
    },
  };

  const calculatedPercentage = percentage !== undefined 
    ? percentage 
    : total && typeof value === 'number' 
    ? (value / total) * 100 
    : 0;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-lg ${variantClasses[variant].bg} ${variantClasses[variant].text}`}>
            {icon}
          </div>
          <div>
            <p className="text-sm text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">
              {value}
              {total && <span className="text-lg text-gray-500"> / {total}</span>}
            </p>
          </div>
        </div>
        {percentage !== undefined && (
          <div className={`text-2xl font-bold ${variantClasses[variant].text}`}>
            {Math.round(calculatedPercentage)}%
          </div>
        )}
      </div>
      {showProgress && (
        <div className="w-full">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full ${variantClasses[variant].progress} transition-all duration-300`}
              style={{ width: `${Math.min(calculatedPercentage, 100)}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

interface AlertCardProps {
  type: 'warning' | 'info' | 'success' | 'danger';
  title: string;
  message: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
}

export const AlertCard: React.FC<AlertCardProps> = ({
  type,
  title,
  message,
  icon,
  action,
  onDismiss,
}) => {
  const typeClasses = {
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      iconBg: 'bg-yellow-100',
      iconText: 'text-yellow-600',
      button: 'bg-yellow-600 hover:bg-yellow-700',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      iconBg: 'bg-blue-100',
      iconText: 'text-blue-600',
      button: 'bg-blue-600 hover:bg-blue-700',
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      iconBg: 'bg-green-100',
      iconText: 'text-green-600',
      button: 'bg-green-600 hover:bg-green-700',
    },
    danger: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      iconBg: 'bg-red-100',
      iconText: 'text-red-600',
      button: 'bg-red-600 hover:bg-red-700',
    },
  };

  const classes = typeClasses[type];

  return (
    <div className={`rounded-lg border ${classes.bg} ${classes.border} p-4`}>
      <div className="flex items-start gap-3">
        {icon && (
          <div className={`p-2 rounded-lg ${classes.iconBg} ${classes.iconText} flex-shrink-0`}>
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className={`text-sm font-semibold ${classes.text} mb-1`}>{title}</h3>
          <p className={`text-sm ${classes.text} opacity-90`}>{message}</p>
          {action && (
            <button
              onClick={action.onClick}
              className={`mt-3 px-4 py-2 text-sm font-medium text-white rounded-md ${classes.button} transition-colors`}
            >
              {action.label}
            </button>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className={`flex-shrink-0 ${classes.text} hover:opacity-70 transition-opacity`}
            aria-label="إغلاق"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

interface StatsGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
}

export const StatsGrid: React.FC<StatsGridProps> = ({ children, columns = 4 }) => {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`grid ${gridClasses[columns]} gap-6`}>
      {children}
    </div>
  );
};