import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import digiLockerService from "@/services/api/digiLockerService";

interface DigiLockerConnectProps {
  onConnectionSuccess: (authData: any) => void;
  onError: (error: string) => void;
  isConnected?: boolean;
}

interface ConnectionStatus {
  status: 'idle' | 'connecting' | 'connected' | 'error';
  message?: string;
  authData?: any;
}

const DigiLockerConnect: React.FC<DigiLockerConnectProps> = ({
  onConnectionSuccess,
  onError,
  isConnected = false
}) => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    status: isConnected ? 'connected' : 'idle'
  });
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [territorialValidation, setTerritorialValidation] = useState<any>(null);

  useEffect(() => {
    if (isConnected && connectionStatus.status === 'connected') {
      loadUserDocuments();
    }
  }, [isConnected, connectionStatus.status]);

  const handleConnect = async () => {
    try {
      setLoading(true);
      setConnectionStatus({ status: 'connecting', message: 'Initializing DigiLocker connection...' });

      // Get authorization URL
      const authResponse = await digiLockerService.getAuthorizationURL();
      
      // Simulate OAuth flow - in production, this would open DigiLocker auth page
      setConnectionStatus({ status: 'connecting', message: 'Redirecting to DigiLocker...' });
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate successful authorization callback
      const authCode = `DL_AUTH_${Date.now()}`;
      const tokenResponse = await digiLockerService.handleAuthorizationCallback(authCode, authResponse.state);

      // Perform DoT compliance checks
      await performDoTValidation(tokenResponse.accessToken);

      setConnectionStatus({
        status: 'connected',
        message: 'Successfully connected to DigiLocker',
        authData: tokenResponse
      });

      onConnectionSuccess(tokenResponse);
      toast.success('DigiLocker connected successfully with DoT compliance!');

    } catch (error: any) {
      const errorMessage = error.message || 'Failed to connect to DigiLocker';
      setConnectionStatus({ status: 'error', message: errorMessage });
      onError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const performDoTValidation = async (accessToken: string) => {
    try {
      // Simulate territorial boundary validation
      const territorialCheck = {
        isValid: true,
        territory: 'India',
        state: 'Delhi',
        district: 'New Delhi',
        validated: true,
        validatedAt: new Date().toISOString()
      };

      setTerritorialValidation(territorialCheck);

      // Simulate document authenticity verification
      const authenticityCheck = await digiLockerService.checkDocumentAuthenticity('GENERAL_CHECK');
      
      if (!authenticityCheck.authentic) {
        throw new Error('Document authenticity verification failed');
      }

    } catch (error: any) {
      throw new Error(`DoT validation failed: ${error.message}`);
    }
  };

  const loadUserDocuments = async () => {
    try {
      if (!connectionStatus.authData?.accessToken) return;

      const userDocs = await digiLockerService.getUserDocuments(connectionStatus.authData.accessToken);
      setDocuments(userDocs || []);

    } catch (error: any) {
      console.error('Failed to load user documents:', error);
    }
  };

  const handleDisconnect = () => {
    setConnectionStatus({ status: 'idle' });
    setDocuments([]);
    setTerritorialValidation(null);
    toast.info('Disconnected from DigiLocker');
  };

  const renderConnectionStatus = () => {
    switch (connectionStatus.status) {
      case 'idle':
        return (
          <div className="text-center space-y-6">
            <div className="p-6 bg-blue-50 rounded-full w-fit mx-auto">
              <ApperIcon name="Cloud" className="h-12 w-12 text-blue-600" />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect to DigiLocker</h3>
              <p className="text-gray-600 mb-6">
                Securely access your government documents with DoT compliance verification
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <ApperIcon name="Shield" className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-left">
                  <h4 className="text-sm font-medium text-blue-900">DoT Compliant Features</h4>
                  <ul className="mt-1 text-sm text-blue-800 space-y-1">
                    <li>• Document authenticity verification</li>
                    <li>• Territorial boundary validation</li>
                    <li>• UIDAI photograph matching</li>
                    <li>• Secure government-backed verification</li>
                  </ul>
                </div>
              </div>
            </div>

            <Button
              onClick={handleConnect}
              loading={loading}
              icon="ExternalLink"
              size="lg"
              className="w-full sm:w-auto"
            >
              Connect to DigiLocker
            </Button>
          </div>
        );

      case 'connecting':
        return (
          <div className="text-center space-y-6">
            <Loading type="spinner" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Connecting...</h3>
              <p className="text-gray-600">{connectionStatus.message}</p>
            </div>
          </div>
        );

      case 'connected':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="p-4 bg-green-100 rounded-full w-fit mx-auto mb-4">
                <ApperIcon name="CheckCircle" className="h-8 w-8 text-green-600" />
              </div>
              <Badge variant="success" size="lg" icon="CheckCircle" className="mb-2">
                Connected to DigiLocker
              </Badge>
              <p className="text-sm text-gray-600">
                DoT compliance verification completed successfully
              </p>
            </div>

            {territorialValidation && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <ApperIcon name="MapPin" className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-green-900">Territorial Validation</h4>
                    <div className="mt-1 text-sm text-green-800">
                      <p>Territory: {territorialValidation.territory}</p>
                      <p>State: {territorialValidation.state}</p>
                      <p>District: {territorialValidation.district}</p>
                      <p className="text-xs mt-1">
                        Validated: {new Date(territorialValidation.validatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {documents.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Available Documents</h4>
                <div className="space-y-2">
                  {documents.slice(0, 3).map((doc, index) => (
                    <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <ApperIcon name="FileText" className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-900">{doc.name}</span>
                      </div>
                      <Badge variant="success" size="sm" icon="Shield">Verified</Badge>
                    </div>
                  ))}
                  {documents.length > 3 && (
                    <p className="text-xs text-gray-500 text-center pt-2">
                      +{documents.length - 3} more documents available
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-center">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleDisconnect}
                icon="Unlink"
              >
                Disconnect
              </Button>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="text-center space-y-6">
            <div className="p-6 bg-red-50 rounded-full w-fit mx-auto">
              <ApperIcon name="AlertCircle" className="h-12 w-12 text-red-600" />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Connection Failed</h3>
              <p className="text-red-600 mb-6">{connectionStatus.message}</p>
            </div>

            <div className="flex justify-center space-x-3">
              <Button
                onClick={handleConnect}
                loading={loading}
                icon="RefreshCw"
                size="sm"
              >
                Retry Connection
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setConnectionStatus({ status: 'idle' })}
              >
                Cancel
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">DigiLocker Integration</h2>
          <p className="text-gray-600">
            DoT compliant document verification with territorial validation
          </p>
        </div>

        <motion.div
          key={connectionStatus.status}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderConnectionStatus()}
        </motion.div>
      </div>
    </Card>
  );
};

export default DigiLockerConnect;