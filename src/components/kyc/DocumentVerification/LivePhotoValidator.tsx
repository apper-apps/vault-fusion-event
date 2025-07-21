import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";

interface LivePhotoValidatorProps {
  onValidationComplete: (result: any) => void;
  onError: (error: string) => void;
  requirements?: {
    minClarity: number;
    maxFileSize: number;
    requiredChecks: string[];
  };
}

interface ValidationResult {
  status: 'idle' | 'capturing' | 'validating' | 'valid' | 'invalid' | 'error';
  photo?: string;
  clarity: {
    score: number;
    meets_requirements: boolean;
    details: {
      sharpness: number;
      lighting: number;
      contrast: number;
      resolution: number;
    };
  };
  checks: {
    face_detected: boolean;
    eyes_visible: boolean;
    proper_lighting: boolean;
    no_blur: boolean;
    neutral_expression: boolean;
    single_face: boolean;
  };
  metadata: {
    timestamp: string;
    device_info: string;
    file_size: number;
    dimensions: { width: number; height: number };
  };
}

const LivePhotoValidator: React.FC<LivePhotoValidatorProps> = ({
  onValidationComplete,
  onError,
  requirements = {
    minClarity: 85,
    maxFileSize: 5 * 1024 * 1024, // 5MB
    requiredChecks: ['face_detected', 'eyes_visible', 'proper_lighting', 'no_blur']
  }
}) => {
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    status: 'idle',
    clarity: {
      score: 0,
      meets_requirements: false,
      details: { sharpness: 0, lighting: 0, contrast: 0, resolution: 0 }
    },
    checks: {
      face_detected: false,
      eyes_visible: false,
      proper_lighting: false,
      no_blur: false,
      neutral_expression: false,
      single_face: false
    },
    metadata: {
      timestamp: new Date().toISOString(),
      device_info: navigator.userAgent,
      file_size: 0,
      dimensions: { width: 0, height: 0 }
    }
  });

  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [captureCount, setCaptureCount] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          facingMode: 'user',
          frameRate: { ideal: 30 }
        } 
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setShowCamera(true);
      
      // Reset validation state
      setValidationResult(prev => ({
        ...prev,
        status: 'capturing'
      }));

    } catch (error: any) {
      toast.error('Unable to access camera. Please check permissions.');
      onError('Camera access denied or not available');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
    setValidationResult(prev => ({
      ...prev,
      status: 'idle'
    }));
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) {
      toast.error('Camera not ready for photo capture');
      return;
    }

    try {
      setValidationResult(prev => ({
        ...prev,
        status: 'capturing'
      }));
      
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      // Set high quality capture settings
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      if (context) {
        // Capture with high quality
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/jpeg', 0.95); // High quality JPEG
        
        // Get file size estimation
        const fileSize = Math.round((imageData.length * 3) / 4);
        
        const metadata = {
          timestamp: new Date().toISOString(),
          device_info: navigator.userAgent,
          file_size: fileSize,
          dimensions: { width: canvas.width, height: canvas.height }
        };

        // Stop camera after capture
        stopCamera();
        setCaptureCount(prev => prev + 1);
        
        // Start validation process
        await validatePhoto(imageData, metadata);
      }

    } catch (error: any) {
      toast.error('Failed to capture photo');
      onError('Photo capture failed');
      setValidationResult(prev => ({
        ...prev,
        status: 'error'
      }));
    }
  };

  const validatePhoto = async (photoData: string, metadata: any) => {
    try {
      setValidationResult(prev => ({
        ...prev,
        status: 'validating',
        photo: photoData,
        metadata
      }));

      // Simulate real-time photo analysis
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Perform clarity analysis
      const clarityAnalysis = await analyzeClarityScore(photoData);
      
      // Perform facial feature checks
      const faceChecks = await performFaceChecks(photoData);
      
      // Validate against requirements
      const meetsRequirements = validateAgainstRequirements(clarityAnalysis, faceChecks, metadata);
      
      const finalResult: ValidationResult = {
        status: meetsRequirements ? 'valid' : 'invalid',
        photo: photoData,
        clarity: clarityAnalysis,
        checks: faceChecks,
        metadata
      };

      setValidationResult(finalResult);
      
      if (meetsRequirements) {
        onValidationComplete(finalResult);
        toast.success('Live photograph validation successful!');
      } else {
        toast.error('Photo does not meet quality requirements. Please retake.');
      }

    } catch (error: any) {
      setValidationResult(prev => ({
        ...prev,
        status: 'error'
      }));
      onError(error.message || 'Photo validation failed');
      toast.error('Photo validation failed');
    }
  };

  const analyzeClarityScore = async (photoData: string) => {
    // Simulate advanced clarity analysis
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const sharpness = Math.floor(Math.random() * 25 + 75); // 75-100
    const lighting = Math.floor(Math.random() * 25 + 75); // 75-100
    const contrast = Math.floor(Math.random() * 25 + 75); // 75-100
    const resolution = Math.floor(Math.random() * 15 + 85); // 85-100
    
    const overallScore = Math.floor((sharpness + lighting + contrast + resolution) / 4);
    
    return {
      score: overallScore,
      meets_requirements: overallScore >= requirements.minClarity,
      details: {
        sharpness,
        lighting,
        contrast,
        resolution
      }
    };
  };

  const performFaceChecks = async (photoData: string) => {
    // Simulate facial recognition and analysis
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      face_detected: Math.random() > 0.05, // 95% detection rate
      eyes_visible: Math.random() > 0.1, // 90% success rate
      proper_lighting: Math.random() > 0.15, // 85% success rate
      no_blur: Math.random() > 0.2, // 80% success rate
      neutral_expression: Math.random() > 0.25, // 75% success rate
      single_face: Math.random() > 0.1 // 90% success rate
    };
  };

  const validateAgainstRequirements = (clarity: any, checks: any, metadata: any) => {
    // Check clarity requirement
    if (clarity.score < requirements.minClarity) return false;
    
    // Check file size requirement
    if (metadata.file_size > requirements.maxFileSize) return false;
    
    // Check required facial checks
    const failedRequiredChecks = requirements.requiredChecks.filter(
      check => !checks[check as keyof typeof checks]
    );
    
    return failedRequiredChecks.length === 0;
  };

  const getStatusBadge = (status: ValidationResult['status']) => {
    switch (status) {
      case 'idle':
        return <Badge variant="secondary" size="sm" icon="Camera">Ready to Capture</Badge>;
      case 'capturing':
        return <Badge variant="info" size="sm" icon="Camera">Capturing</Badge>;
      case 'validating':
        return <Badge variant="warning" size="sm" icon="Loader">Validating</Badge>;
      case 'valid':
        return <Badge variant="success" size="sm" icon="CheckCircle">Valid Photo</Badge>;
      case 'invalid':
        return <Badge variant="danger" size="sm" icon="XCircle">Invalid Photo</Badge>;
      case 'error':
        return <Badge variant="danger" size="sm" icon="AlertCircle">Validation Error</Badge>;
      default:
        return <Badge variant="secondary" size="sm">Unknown</Badge>;
    }
  };

  const renderClarityAnalysis = () => {
    if (validationResult.status === 'idle' || validationResult.status === 'capturing') return null;

    const { clarity } = validationResult;
    const metrics = [
      { key: 'sharpness', label: 'Sharpness', icon: 'Focus' },
      { key: 'lighting', label: 'Lighting', icon: 'Sun' },
      { key: 'contrast', label: 'Contrast', icon: 'Circle' },
      { key: 'resolution', label: 'Resolution', icon: 'Grid' }
    ];

    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">
          Clarity Analysis (Score: {clarity.score}%)
        </h4>
        <div className="space-y-2">
          {metrics.map(metric => (
            <div key={metric.key} className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <ApperIcon name={metric.icon} className="h-4 w-4 text-gray-500" />
                <span className="text-gray-700">{metric.label}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      clarity.details[metric.key as keyof typeof clarity.details] >= 80 
                        ? 'bg-green-500' 
                        : clarity.details[metric.key as keyof typeof clarity.details] >= 60 
                          ? 'bg-yellow-500' 
                          : 'bg-red-500'
                    }`}
                    style={{ 
                      width: `${clarity.details[metric.key as keyof typeof clarity.details]}%` 
                    }}
                  />
                </div>
                <span className="text-gray-900 font-medium w-10 text-right">
                  {clarity.details[metric.key as keyof typeof clarity.details]}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderFaceChecks = () => {
    if (validationResult.status === 'idle' || validationResult.status === 'capturing') return null;

    const { checks } = validationResult;
    const checksList = [
      { key: 'face_detected', label: 'Face Detection', icon: 'Eye' },
      { key: 'eyes_visible', label: 'Eyes Visible', icon: 'Eye' },
      { key: 'proper_lighting', label: 'Proper Lighting', icon: 'Sun' },
      { key: 'no_blur', label: 'No Blur', icon: 'Focus' },
      { key: 'neutral_expression', label: 'Neutral Expression', icon: 'Smile' },
      { key: 'single_face', label: 'Single Face', icon: 'User' }
    ];

    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Face Validation Checks</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {checksList.map(check => (
            <div key={check.key} className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <ApperIcon name={check.icon} className="h-4 w-4 text-gray-500" />
                <span className="text-gray-700">{check.label}</span>
              </div>
              {checks[check.key as keyof typeof checks] ? (
                <ApperIcon name="Check" className="h-4 w-4 text-green-500" />
              ) : (
                <ApperIcon name="X" className="h-4 w-4 text-red-500" />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <div className="space-y-6">
        <div className="text-center">
          <ApperIcon name="Camera" className="h-12 w-12 text-primary-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Live Photo Validator</h2>
          <p className="text-gray-600">
            Real-time photograph verification with clarity analysis
          </p>
        </div>

        {/* Status and Requirements */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Validation Status</h3>
              <p className="text-xs text-gray-500">Attempts: {captureCount}</p>
            </div>
            {getStatusBadge(validationResult.status)}
          </div>
          
          <div className="text-xs text-gray-600">
            <p>Min. Clarity: {requirements.minClarity}% | Max Size: {Math.round(requirements.maxFileSize / 1024 / 1024)}MB</p>
          </div>
        </div>

        {/* Photo Requirements */}
        {validationResult.status === 'idle' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <ApperIcon name="Info" className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-900">Photo Requirements</h4>
                <ul className="mt-1 text-sm text-blue-800 space-y-1">
                  <li>• Look directly at the camera</li>
                  <li>• Ensure good lighting on your face</li>
                  <li>• Keep a neutral expression</li>
                  <li>• Remove glasses and face coverings</li>
                  <li>• Ensure single person in frame</li>
                  <li>• Avoid shadows and reflections</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Camera Interface */}
        {!showCamera && (validationResult.status === 'idle' || validationResult.status === 'invalid') && (
          <div className="text-center">
            <Button 
              onClick={startCamera} 
              icon="Camera" 
              size="lg"
              className="w-full sm:w-auto"
            >
              {captureCount > 0 ? 'Retake Photo' : 'Start Photo Capture'}
            </Button>
          </div>
        )}

        {/* Camera View */}
        {showCamera && (
          <div className="space-y-4">
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video 
                ref={videoRef}
                autoPlay 
                playsInline 
                muted
                className="w-full h-72 object-cover"
              />
              {/* Face detection overlay */}
              <div className="absolute inset-0 border-4 border-primary-500 rounded-lg pointer-events-none">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-48 h-56 border-2 border-white rounded-lg opacity-50">
                    <div className="absolute top-4 left-4 w-6 h-6 border-l-2 border-t-2 border-white"></div>
                    <div className="absolute top-4 right-4 w-6 h-6 border-r-2 border-t-2 border-white"></div>
                    <div className="absolute bottom-4 left-4 w-6 h-6 border-l-2 border-b-2 border-white"></div>
                    <div className="absolute bottom-4 right-4 w-6 h-6 border-r-2 border-b-2 border-white"></div>
                  </div>
                </div>
              </div>
            </div>
            
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            
            <div className="flex justify-center space-x-3">
              <Button 
                onClick={capturePhoto} 
                icon="Camera" 
                size="lg"
              >
                Capture Photo
              </Button>
              <Button 
                onClick={stopCamera}
                variant="secondary" 
                size="lg"
                icon="X"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Validation Progress */}
        {validationResult.status === 'validating' && (
          <div className="text-center space-y-4">
            <Loading type="cards" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Analyzing Photo</h3>
              <p className="text-gray-600">
                Performing clarity verification and face recognition checks...
              </p>
            </div>
          </div>
        )}

        {/* Captured Photo Preview */}
        {validationResult.photo && (
          <div className="space-y-4">
            <div className="text-center">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Captured Photo</h4>
              <div className="relative inline-block">
                <img 
                  src={validationResult.photo} 
                  alt="Captured photo"
                  className="w-64 h-80 object-cover rounded-lg border shadow-lg"
                />
                <Badge 
                  variant={validationResult.status === 'valid' ? 'success' : 'danger'}
                  size="sm" 
                  className="absolute top-2 right-2"
                  icon={validationResult.status === 'valid' ? 'Check' : 'X'}
                >
                  {validationResult.status === 'valid' ? 'Valid' : 'Invalid'}
                </Badge>
              </div>
            </div>

            {/* Analysis Results */}
            {renderClarityAnalysis()}
            {renderFaceChecks()}

            {/* Photo Metadata */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Photo Metadata</h4>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div>Size: {Math.round(validationResult.metadata.file_size / 1024)}KB</div>
                <div>Resolution: {validationResult.metadata.dimensions.width}×{validationResult.metadata.dimensions.height}</div>
                <div className="col-span-2">
                  Captured: {new Date(validationResult.metadata.timestamp).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-3">
              {validationResult.status === 'valid' && (
                <Badge variant="success" size="lg" icon="CheckCircle">
                  Photo Validated Successfully
                </Badge>
              )}
              
              {validationResult.status === 'invalid' && (
                <Button 
                  onClick={() => {
                    setValidationResult(prev => ({
                      ...prev,
                      status: 'idle',
                      photo: undefined
                    }));
                    setCaptureCount(0);
                  }}
                  icon="RefreshCw"
                  size="sm"
                >
                  Try Again
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default LivePhotoValidator;