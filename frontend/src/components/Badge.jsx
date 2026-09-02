import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon, Info } from 'lucide-react';

export const RiskBadge = ({ level, score }) => {
  const normalizedLevel = (level || 'LOW').toUpperCase();

  const getIcon = () => {
    switch (normalizedLevel) {
      case 'CRITICAL':
        return <AlertOctagon size={12} />;
      case 'HIGH':
        return <AlertTriangle size={12} />;
      case 'MEDIUM':
        return <AlertTriangle size={12} />;
      default:
        return <ShieldCheck size={12} />;
    }
  };

  const getBadgeClass = () => {
    switch (normalizedLevel) {
      case 'CRITICAL':
        return 'badge-critical';
      case 'HIGH':
        return 'badge-high';
      case 'MEDIUM':
        return 'badge-medium';
      default:
        return 'badge-low';
    }
  };

  return (
    <span className={`badge ${getBadgeClass()}`}>
      {getIcon()}
      {normalizedLevel} {score !== undefined && `(${Math.round(score * 100)}%)`}
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  const norm = (status || 'ACTIVE').toUpperCase();
  let colorClass = 'badge-low';
  if (norm === 'ACTIVE' || norm === 'VERIFICATION_REQUIRED' || norm === 'HELD') {
    colorClass = 'badge-high';
  } else if (norm === 'ACKNOWLEDGED') {
    colorClass = 'badge-medium';
  } else if (norm === 'COMPLETED' || norm === 'MITIGATED') {
    colorClass = 'badge-low';
  }

  return <span className={`badge ${colorClass}`}>{norm}</span>;
};
