import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Badge from '@/components/atoms/Badge';
import ApperIcon from '@/components/ApperIcon';

const Settings = () => {
  const [settings, setSettings] = useState({
    general: {
      requireSelfie: true,
      autoApproval: false,
      maxFileSize: 10,
      allowedFileTypes: ['pdf', 'jpg', 'jpeg', 'png'],
      reviewTimeLimit: 3
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      adminNotifications: true,
      customerUpdates: true
    },
    compliance: {
      dataRetentionPeriod: 7,
      requireSignatory: true,
      mandatoryFields: ['pan', 'gst', 'aadhaar'],
      telecomUseCase: ['Inbound IVR', 'Outbound Calls', 'Missed Call Service', 'Bulk SMS', 'Voice Broadcasting', 'Call Center']
    },
    security: {
      encryptDocuments: true,
      twoFactorAuth: false,
      sessionTimeout: 30,
      auditLogging: true
    }
  });

  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);

  const tabs = [
    { id: 'general', label: 'General', icon: 'Settings' },
    { id: 'notifications', label: 'Notifications', icon: 'Bell' },
    { id: 'compliance', label: 'Compliance', icon: 'Shield' },
    { id: 'security', label: 'Security', icon: 'Lock' }
  ];

  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success('Settings saved successfully!');
    setSaving(false);
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={settings.general.requireSelfie}
              onChange={(e) => updateSetting('general', 'requireSelfie', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="text-sm font-medium text-gray-900">Require Selfie Verification</span>
          </label>
          <p className="text-xs text-gray-500 ml-7">Enable mandatory selfie upload for identity verification</p>
        </div>

        <div className="space-y-2">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={settings.general.autoApproval}
              onChange={(e) => updateSetting('general', 'autoApproval', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="text-sm font-medium text-gray-900">Enable Auto-Approval</span>
          </label>
          <p className="text-xs text-gray-500 ml-7">Automatically approve submissions that meet criteria</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Maximum File Size (MB)"
          type="number"
          value={settings.general.maxFileSize}
          onChange={(e) => updateSetting('general', 'maxFileSize', parseInt(e.target.value))}
          min="1"
          max="50"
        />
        
        <Input
          label="Review Time Limit (Days)"
          type="number"
          value={settings.general.reviewTimeLimit}
          onChange={(e) => updateSetting('general', 'reviewTimeLimit', parseInt(e.target.value))}
          min="1"
          max="30"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Allowed File Types</label>
        <div className="flex flex-wrap gap-2">
          {['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'].map(type => (
            <label key={type} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.general.allowedFileTypes.includes(type)}
                onChange={(e) => {
                  const currentTypes = settings.general.allowedFileTypes;
                  const newTypes = e.target.checked
                    ? [...currentTypes, type]
                    : currentTypes.filter(t => t !== type);
                  updateSetting('general', 'allowedFileTypes', newTypes);
                }}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <Badge variant="secondary" size="sm">{type.toUpperCase()}</Badge>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={settings.notifications.emailNotifications}
              onChange={(e) => updateSetting('notifications', 'emailNotifications', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="text-sm font-medium text-gray-900">Email Notifications</span>
          </label>
          <p className="text-xs text-gray-500 ml-7">Send email updates for status changes</p>
        </div>

        <div className="space-y-2">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={settings.notifications.smsNotifications}
              onChange={(e) => updateSetting('notifications', 'smsNotifications', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="text-sm font-medium text-gray-900">SMS Notifications</span>
          </label>
          <p className="text-xs text-gray-500 ml-7">Send SMS updates for critical changes</p>
        </div>

        <div className="space-y-2">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={settings.notifications.adminNotifications}
              onChange={(e) => updateSetting('notifications', 'adminNotifications', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="text-sm font-medium text-gray-900">Admin Notifications</span>
          </label>
          <p className="text-xs text-gray-500 ml-7">Notify admins of new submissions</p>
        </div>

        <div className="space-y-2">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={settings.notifications.customerUpdates}
              onChange={(e) => updateSetting('notifications', 'customerUpdates', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="text-sm font-medium text-gray-900">Customer Updates</span>
          </label>
          <p className="text-xs text-gray-500 ml-7">Send status updates to customers</p>
        </div>
      </div>
    </div>
  );

  const renderComplianceSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Data Retention Period (Years)"
          type="number"
          value={settings.compliance.dataRetentionPeriod}
          onChange={(e) => updateSetting('compliance', 'dataRetentionPeriod', parseInt(e.target.value))}
          min="1"
          max="10"
        />
        
        <div className="space-y-2">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={settings.compliance.requireSignatory}
              onChange={(e) => updateSetting('compliance', 'requireSignatory', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="text-sm font-medium text-gray-900">Require Authorized Signatory</span>
          </label>
          <p className="text-xs text-gray-500 ml-7">Mandate authorized signatory details</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Mandatory Fields</label>
        <div className="flex flex-wrap gap-2">
          {['pan', 'gst', 'aadhaar', 'cin', 'address', 'mobile', 'email'].map(field => (
            <label key={field} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.compliance.mandatoryFields.includes(field)}
                onChange={(e) => {
                  const currentFields = settings.compliance.mandatoryFields;
                  const newFields = e.target.checked
                    ? [...currentFields, field]
                    : currentFields.filter(f => f !== field);
                  updateSetting('compliance', 'mandatoryFields', newFields);
                }}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <Badge variant="primary" size="sm">{field.toUpperCase()}</Badge>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Telecom Use Cases</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {settings.compliance.telecomUseCase.map((useCase, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-900">{useCase}</span>
              <Button
                variant="ghost"
                size="sm"
                icon="X"
                onClick={() => {
                  const newUseCases = settings.compliance.telecomUseCase.filter((_, i) => i !== index);
                  updateSetting('compliance', 'telecomUseCase', newUseCases);
                }}
                className="text-error hover:text-error"
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={settings.security.encryptDocuments}
              onChange={(e) => updateSetting('security', 'encryptDocuments', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="text-sm font-medium text-gray-900">Encrypt Documents</span>
          </label>
          <p className="text-xs text-gray-500 ml-7">Enable document encryption at rest</p>
        </div>

        <div className="space-y-2">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={settings.security.twoFactorAuth}
              onChange={(e) => updateSetting('security', 'twoFactorAuth', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="text-sm font-medium text-gray-900">Two-Factor Authentication</span>
          </label>
          <p className="text-xs text-gray-500 ml-7">Require 2FA for admin access</p>
        </div>

        <div className="space-y-2">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={settings.security.auditLogging}
              onChange={(e) => updateSetting('security', 'auditLogging', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="text-sm font-medium text-gray-900">Audit Logging</span>
          </label>
          <p className="text-xs text-gray-500 ml-7">Log all administrative actions</p>
        </div>

        <Input
          label="Session Timeout (Minutes)"
          type="number"
          value={settings.security.sessionTimeout}
          onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
          min="5"
          max="120"
        />
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <ApperIcon name="AlertTriangle" className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-yellow-900">Security Notice</h4>
            <p className="text-sm text-yellow-800 mt-1">
              Changes to security settings may affect user access. Please review carefully before saving.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general': return renderGeneralSettings();
      case 'notifications': return renderNotificationSettings();
      case 'compliance': return renderComplianceSettings();
      case 'security': return renderSecuritySettings();
      default: return renderGeneralSettings();
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            System Settings
          </h1>
          <p className="text-gray-600 mt-2">
            Configure KYC platform settings and preferences
          </p>
        </div>
        
        <Button 
          variant="primary" 
          icon="Save" 
          size="lg" 
          loading={saving}
          onClick={handleSave}
        >
          Save Changes
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200
                ${activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <ApperIcon name={tab.icon} className="h-5 w-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <div className="flex items-center space-x-3 mb-6">
            <ApperIcon 
              name={tabs.find(t => t.id === activeTab)?.icon || 'Settings'} 
              className="h-6 w-6 text-primary-600" 
            />
            <h3 className="text-xl font-semibold text-gray-900">
              {tabs.find(t => t.id === activeTab)?.label} Settings
            </h3>
          </div>
          
          {renderTabContent()}
        </Card>
      </motion.div>
    </div>
  );
};

export default Settings;