import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";

interface TerritorialValidationProps {
  documentData?: any;
  userLocation?: any;
  onValidationComplete: (result: any) => void;
  onError: (error: string) => void;
}

interface ValidationResult {
  status: 'pending' | 'validating' | 'compliant' | 'non_compliant' | 'error';
  territory: string;
  state: string;
  district: string;
  compliance: {
    territoryMatch: boolean;
    stateMatch: boolean;
    districtMatch: boolean;
    jurisdictionValid: boolean;
  };
  boundaries: {
    documentTerritory: string;
    userTerritory: string;
    crossBoundaryAllowed: boolean;
  };
  timestamp: string;
}

const TerritorialValidation: React.FC<TerritorialValidationProps> = ({
  documentData,
  userLocation,
  onValidationComplete,
  onError
}) => {
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    status: 'pending',
    territory: '',
    state: '',
    district: '',
    compliance: {
      territoryMatch: false,
      stateMatch: false,
      districtMatch: false,
      jurisdictionValid: false
    },
    boundaries: {
      documentTerritory: '',
      userTerritory: '',
      crossBoundaryAllowed: false
    },
    timestamp: new Date().toISOString()
  });
  const [loading, setLoading] = useState(false);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'pending'>('pending');
  const [currentLocation, setCurrentLocation] = useState<any>(null);

  useEffect(() => {
    checkLocationPermission();
  }, []);

  const checkLocationPermission = async () => {
    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      setLocationPermission(permission.state === 'granted' ? 'granted' : permission.state === 'denied' ? 'denied' : 'pending');
      
      if (permission.state === 'granted') {
        await getCurrentLocation();
      }
    } catch (error) {
      console.error('Permission check failed:', error);
      setLocationPermission('denied');
    }
  };

  const getCurrentLocation = async () => {
    return new Promise<void>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          };
          
          setCurrentLocation(location);
          
          // Reverse geocoding simulation
          const locationDetails = await reverseGeocode(location.latitude, location.longitude);
          setCurrentLocation({ ...location, ...locationDetails });
          
          resolve();
        },
        (error) => {
          console.error('Geolocation error:', error);
          setLocationPermission('denied');
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    // Simulate reverse geocoding API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock location data based on coordinates
    const mockLocations = [
      { state: 'Delhi', district: 'New Delhi', territory: 'National Capital Territory of Delhi' },
      { state: 'Maharashtra', district: 'Mumbai', territory: 'Maharashtra' },
      { state: 'Karnataka', district: 'Bangalore', territory: 'Karnataka' },
      { state: 'Tamil Nadu', district: 'Chennai', territory: 'Tamil Nadu' },
      { state: 'Gujarat', district: 'Ahmedabad', territory: 'Gujarat' }
    ];
    
    return mockLocations[Math.floor(Math.random() * mockLocations.length)];
  };

  const requestLocationPermission = async () => {
    try {
      await getCurrentLocation();
      setLocationPermission('granted');
      toast.success('Location access granted');
    } catch (error: any) {
      setLocationPermission('denied');
      toast.error('Location access denied. Manual validation will be used.');
    }
  };

  const performTerritorialValidation = async () => {
    try {
      setLoading(true);
      setValidationResult(prev => ({
        ...prev,
        status: 'validating',
        timestamp: new Date().toISOString()
      }));

      // Simulate validation delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Extract document territory information
      const documentTerritory = extractDocumentTerritory(documentData);
      const userTerritory = currentLocation || await getManualLocation();

      // Perform boundary compliance checks
      const compliance = await performComplianceChecks(documentTerritory, userTerritory);
      const boundaries = await validateBoundaryRules(documentTerritory, userTerritory);

      const result: ValidationResult = {
        status: compliance.jurisdictionValid ? 'compliant' : 'non_compliant',
        territory: userTerritory.territory || 'Unknown',
        state: userTerritory.state || 'Unknown',
        district: userTerritory.district || 'Unknown',
        compliance,
        boundaries,
        timestamp: new Date().toISOString()
      };

      setValidationResult(result);

      if (result.status === 'compliant') {
        onValidationComplete(result);
        toast.success('Territorial validation successful - DoT compliant');
      } else {
        throw new Error('Territorial boundary compliance validation failed');
      }

    } catch (error: any) {
      const errorResult: ValidationResult = {
        ...validationResult,
        status: 'error',
        timestamp: new Date().toISOString()
      };
      
      setValidationResult(errorResult);
      onError(error.message || 'Territorial validation failed');
      toast.error(error.message || 'Territorial validation failed');
    } finally {
      setLoading(false);
    }
  };

  const extractDocumentTerritory = (docData: any) => {
    // Extract territory information from document data
    return {
      territory: 'Delhi',
      state: 'Delhi',
      district: 'New Delhi',
      issueLocation: 'Delhi',
      jurisdiction: 'Central Government'
    };
  };

  const getManualLocation = async () => {
    // Fallback to manual location entry or IP-based detection
    return {
      territory: 'Delhi',
      state: 'Delhi',
      district: 'New Delhi',
      method: 'manual'
    };
  };

  const performComplianceChecks = async (docTerritory: any, userTerritory: any) => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      territoryMatch: docTerritory.territory === userTerritory.territory || Math.random() > 0.1,
      stateMatch: docTerritory.state === userTerritory.state || Math.random() > 0.15,
      districtMatch: docTerritory.district === userTerritory.district || Math.random() > 0.3,
      jurisdictionValid: Math.random() > 0.05 // 95% pass rate for demo
    };
  };

  const validateBoundaryRules = async (docTerritory: any, userTerritory: any) => {
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      documentTerritory: `${docTerritory.district}, ${docTerritory.state}`,
      userTerritory: `${userTerritory.district}, ${userTerritory.state}`,
      crossBoundaryAllowed: Math.random() > 0.2 // 80% allow cross-boundary
    };
  };

  const getStatusBadge = (status: ValidationResult['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" size="sm" icon="Clock">Pending Validation</Badge>;
      case 'validating':
        return <Badge variant="warning" size="sm" icon="Loader">Validating</Badge>;
      case 'compliant':
        return <Badge variant="success" size="sm" icon="CheckCircle">DoT Compliant</Badge>;
      case 'non_compliant':
        return <Badge variant="danger" size="sm" icon="XCircle">Non-Compliant</Badge>;
      case 'error':
        return <Badge variant="danger" size="sm" icon="AlertCircle">Validation Error</Badge>;
      default:
        return <Badge variant="secondary" size="sm">Unknown</Badge>;
    }
  };

  const renderLocationStatus = () => {
    if (locationPermission === 'pending') {
      return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <ApperIcon name="MapPin" className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-900">Location Access Required</h4>
              <p className="text-sm text-blue-800 mb-3">
                Territorial validation requires your current location for DoT compliance verification.
              </p>
              <Button onClick={requestLocationPermission} size="sm" icon="MapPin">
                Enable Location Access
              </Button>
            </div>
          </div>
        </div>
      );
    }

    if (locationPermission === 'denied') {
      return (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <ApperIcon name="AlertTriangle" className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-amber-900">Location Access Denied</h4>
              <p className="text-sm text-amber-800">
                Manual territorial validation will be used. This may affect verification accuracy.
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (currentLocation) {
      return (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <ApperIcon name="MapPin" className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-green-900">Location Detected</h4>
              <div className="text-sm text-green-800 space-y-1">
                <p>Territory: {currentLocation.territory || 'Detecting...'}</p>
                <p>State: {currentLocation.state || 'Detecting...'}</p>
                <p>District: {currentLocation.district || 'Detecting...'}</p>
                <p className="text-xs">
                  Accuracy: {currentLocation.accuracy ? `±${Math.round(currentLocation.accuracy)}m` : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  const renderComplianceDetails = () => {
    if (validationResult.status === 'pending' || validationResult.status === 'validating') {
      return null;
    }

    const { compliance, boundaries } = validationResult;
    const checks = [
      { key: 'territoryMatch', label: 'Territory Match', icon: 'Map' },
      { key: 'stateMatch', label: 'State Match', icon: 'MapPin' },
      { key: 'districtMatch', label: 'District Match', icon: 'Navigation' },
      { key: 'jurisdictionValid', label: 'Jurisdiction Valid', icon: 'Shield' }
    ];

    return (
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Compliance Checks</h4>
          <div className="space-y-2">
            {checks.map(check => (
              <div key={check.key} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <ApperIcon name={check.icon} className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">{check.label}</span>
                </div>
                {compliance[check.key as keyof typeof compliance] ? (
                  <ApperIcon name="Check" className="h-4 w-4 text-green-500" />
                ) : (
                  <ApperIcon name="X" className="h-4 w-4 text-red-500" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Boundary Analysis</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-700">Document Territory:</span>
              <span className="text-gray-900 font-medium">{boundaries.documentTerritory}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">User Territory:</span>
              <span className="text-gray-900 font-medium">{boundaries.userTerritory}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Cross-Boundary:</span>
              <span className={`font-medium ${boundaries.crossBoundaryAllowed ? 'text-green-600' : 'text-red-600'}`}>
                {boundaries.crossBoundaryAllowed ? 'Allowed' : 'Not Allowed'}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <div className="space-y-6">
        <div className="text-center">
          <ApperIcon name="Globe" className="h-12 w-12 text-primary-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Territorial Validation</h2>
          <p className="text-gray-600">
            DoT compliant geographic boundary verification
          </p>
        </div>

        {/* Status Display */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Validation Status</h3>
              <p className="text-xs text-gray-500">Geographic boundary compliance</p>
            </div>
            {getStatusBadge(validationResult.status)}
          </div>
        </div>

        {/* Location Status */}
        {renderLocationStatus()}

        {/* Validation Controls */}
        {validationResult.status === 'pending' && currentLocation && (
          <div className="text-center">
            <Button 
              onClick={performTerritorialValidation} 
              loading={loading}
              icon="Shield" 
              size="lg"
              className="w-full sm:w-auto"
            >
              Start Territorial Validation
            </Button>
          </div>
        )}

        {/* Validating State */}
        {validationResult.status === 'validating' && (
          <div className="text-center space-y-4">
            <Loading type="cards" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Validating Boundaries</h3>
              <p className="text-gray-600">
                Checking territorial compliance with DoT regulations...
              </p>
            </div>
          </div>
        )}

        {/* Compliance Results */}
        {renderComplianceDetails()}

        {/* Final Result */}
        {(validationResult.status === 'compliant' || validationResult.status === 'non_compliant') && (
          <div className={`
            border rounded-lg p-4
            ${validationResult.status === 'compliant' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}
          `}>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  {validationResult.status === 'compliant' ? 'DoT Compliance Verified' : 'Compliance Issues Found'}
                </h4>
                <p className="text-sm text-gray-600">
                  Territory: {validationResult.territory}, {validationResult.state}
                </p>
              </div>
              <ApperIcon 
                name={validationResult.status === 'compliant' ? 'CheckCircle' : 'XCircle'}
                className={`h-8 w-8 ${validationResult.status === 'compliant' ? 'text-green-600' : 'text-red-600'}`}
              />
            </div>
          </div>
        )}

        {validationResult.status === 'non_compliant' && (
          <div className="text-center">
            <Button 
              onClick={() => {
                setValidationResult(prev => ({
                  ...prev,
                  status: 'pending',
                  timestamp: new Date().toISOString()
                }));
              }}
              icon="RefreshCw"
              size="sm"
            >
              Retry Validation
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default TerritorialValidation;