import React from 'react';
import Card from '@/components/atoms/Card';
import Badge from '@/components/atoms/Badge';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';

const StatusCard = ({ status, onAction, lastUpdated, nextSteps }) => {
  const statusConfig = {
    'not-submitted': {
      icon: 'FileX',
      title: 'KYC Not Submitted',
      description: 'Start your KYC verification process to get approved for CallerDesk services.',
      badge: 'not-submitted',
      actionText: 'Start KYC Now',
      actionIcon: 'Play',
      gradient: 'from-gray-50 to-gray-100'
    },
    pending: {
      icon: 'Clock',
      title: 'KYC Under Review',
      description: 'Your KYC submission is being reviewed by our compliance team.',
      badge: 'pending',
      actionText: 'View Status',
      actionIcon: 'Eye',
      gradient: 'from-amber-50 to-orange-100'
    },
    approved: {
      icon: 'CheckCircle',
      title: 'KYC Approved',
      description: 'Congratulations! Your KYC has been approved and your account is now active.',
      badge: 'approved',
      actionText: 'View Details',
      actionIcon: 'FileCheck',
      gradient: 'from-emerald-50 to-green-100'
    },
    rejected: {
      icon: 'XCircle',
      title: 'KYC Rejected',
      description: 'Your KYC submission needs attention. Please review and resubmit.',
      badge: 'rejected',
      actionText: 'Resubmit KYC',
      actionIcon: 'RefreshCw',
      gradient: 'from-red-50 to-rose-100'
    }
  };

  const config = statusConfig[status] || statusConfig['not-submitted'];

  return (
    <Card className="overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-30`} />
      <div className="relative">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl bg-white shadow-elevation-1`}>
              <ApperIcon name={config.icon} className="h-8 w-8 text-gray-700" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">{config.title}</h3>
              <Badge variant={config.badge} size="md" icon="Shield">
                {status.replace('-', ' ').toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>

        <p className="text-gray-600 mb-6 leading-relaxed">{config.description}</p>

        {lastUpdated && (
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <ApperIcon name="Clock" className="h-4 w-4" />
            <span>Last updated: {lastUpdated}</span>
          </div>
        )}

        {nextSteps && (
          <div className="bg-white/80 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <ApperIcon name="ListChecks" className="h-4 w-4" />
              Next Steps
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {nextSteps.map((step, index) => (
                <li key={index} className="flex items-start gap-2">
                  <ApperIcon name="ArrowRight" className="h-3 w-3 mt-0.5 text-primary-500" />
                  {step}
                </li>
              ))}
            </ul>
          </div>
        )}

        <Button 
          variant="primary" 
          size="lg" 
          icon={config.actionIcon}
          onClick={onAction}
          className="w-full sm:w-auto"
        >
          {config.actionText}
        </Button>
      </div>
    </Card>
  );
};

export default StatusCard;