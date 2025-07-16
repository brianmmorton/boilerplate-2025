import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RealTimeIndicatorProps {
  isConnected: boolean;
  hasRecentUpdate?: boolean;
  className?: string;
  showLabel?: boolean;
}

export const RealTimeIndicator: React.FC<RealTimeIndicatorProps> = ({
  isConnected,
  hasRecentUpdate = false,
  className,
  showLabel = false,
}) => {
  const [showUpdatePulse, setShowUpdatePulse] = useState(false);

  useEffect(() => {
    if (hasRecentUpdate) {
      setShowUpdatePulse(true);
      const timer = setTimeout(() => setShowUpdatePulse(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [hasRecentUpdate]);

  const getIcon = () => {
    if (showUpdatePulse) {
      return <CheckCircle className="h-3 w-3 text-green-500" />;
    }
    if (isConnected) {
      return <Wifi className="h-3 w-3 text-green-500" />;
    }
    return <WifiOff className="h-3 w-3 text-gray-400" />;
  };

  const getStatus = () => {
    if (showUpdatePulse) return 'Updated';
    if (isConnected) return 'Live';
    return 'Offline';
  };

  const getStatusColor = () => {
    if (showUpdatePulse) return 'text-green-600';
    if (isConnected) return 'text-green-600';
    return 'text-gray-500';
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className={cn(
        'relative',
        showUpdatePulse && 'animate-pulse',
        isConnected && !showUpdatePulse && 'animate-pulse'
      )}>
        {getIcon()}
        {isConnected && (
          <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full animate-ping opacity-75" />
        )}
      </div>
      {showLabel && (
        <span className={cn('text-xs font-medium', getStatusColor())}>
          {getStatus()}
        </span>
      )}
    </div>
  );
};

interface UpdateIndicatorProps {
  className?: string;
  label?: string;
}

export const UpdateIndicator: React.FC<UpdateIndicatorProps> = ({ 
  className, 
  label = 'Updated' 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className={cn(
      'inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full animate-pulse',
      className
    )}>
      <CheckCircle className="h-3 w-3" />
      {label}
    </div>
  );
}; 