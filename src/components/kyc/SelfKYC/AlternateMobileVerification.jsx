import React from 'react';
import { motion } from 'framer-motion';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';
import ApperIcon from '@/components/ApperIcon';

const AlternateMobileVerification = ({ 
  mobile, 
  contactName, 
  relationship, 
  onSendOTP, 
  onBack, 
  loading 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <ApperIcon name="PhoneCall" className="h-12 w-12 text-primary-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Mobile Number Verification</h2>
        <p className="text-gray-600">Verify the alternate mobile number for DoT compliance</p>
      </div>

      {/* Contact Information Card */}
      <Card className="bg-blue-50 border-blue-200">
        <div className="p-6">
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ApperIcon name="UserCheck" className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Contact Information</h3>
              <div className="space-y-2 text-blue-800">
                <div className="flex items-center space-x-2">
                  <ApperIcon name="User" className="h-4 w-4" />
                  <span><strong>Name:</strong> {contactName}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ApperIcon name="Phone" className="h-4 w-4" />
                  <span><strong>Mobile:</strong> {mobile}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ApperIcon name="Users" className="h-4 w-4" />
                  <span><strong>Relationship:</strong> {relationship.charAt(0).toUpperCase() + relationship.slice(1)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* DoT Guidelines Information */}
      <Card className="bg-amber-50 border-amber-200">
        <div className="p-6">
          <div className="flex items-start space-x-4">
            <ApperIcon name="Info" className="h-6 w-6 text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-900 mb-2">DoT Guidelines</h4>
              <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
                <li>Alternate mobile number must belong to family member or known person</li>
                <li>OTP verification is mandatory for compliance</li>
                <li>This number will be used for verification purposes only</li>
                <li>Ensure the contact person is available to receive OTP</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>

      {/* Verification Process */}
      <Card>
        <div className="p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Verification Process</h4>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-semibold">
                1
              </div>
              <span className="text-gray-700">OTP will be sent to the alternate mobile number</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-sm font-semibold">
                2
              </div>
              <span className="text-gray-700">Contact person should share the OTP with you</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-sm font-semibold">
                3
              </div>
              <span className="text-gray-700">Enter the OTP to complete verification</span>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex justify-between pt-6">
        <Button
          variant="outline"
          onClick={onBack}
          icon="ArrowLeft"
        >
          Back
        </Button>
        <Button
          onClick={onSendOTP}
          loading={loading}
          icon="Send"
        >
          Send OTP
        </Button>
      </div>
    </motion.div>
  );
};

export default AlternateMobileVerification;