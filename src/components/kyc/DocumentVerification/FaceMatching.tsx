import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import uidaiService from "@/services/api/uidaiService";

interface FaceMatchingProps {
  uidaiData?: any;
  onMatchingComplete: (result: any) => void;
  onError: (error: string) => void;
}

interface MatchingResult {
  confidence: number;
  status: 'pending' | 'processing' | 'matched' | 'not_matched' | 'error';
  livePhoto?: string;
  uidaiPhoto?: string;
  faceRecords?: {
    noError: boolean;
    clarity: number;
    faceDetected: boolean;
    eyesOpen: boolean;
    properLighting: boolean;
  };
  timestamp: string;
}

const FaceMatching: React.FC<FaceMatchingProps> = ({
  uidaiData,
  onMatchingComplete,
  onError
}) => {
  const [matchingResult, setMatchingResult] = useState<MatchingResult>({
    confidence: 0,
    status: 'pending',
    timestamp: new Date().toISOString()
  });
  const [isCapturing, setIsCapturing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
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
          width: 640, 
          height: 480,
          facingMode: 'user'
        } 
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setShowCamera(true);
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
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) {
      toast.error('Camera not ready for photo capture');
      return;
    }

    try {
      setIsCapturing(true);
      
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        
        // Stop camera after capture
        stopCamera();
        
        // Process face matching
        await processFaceMatching(imageData);
      }

    } catch (error: any) {
      toast.error('Failed to capture photo');
      onError('Photo capture failed');
    } finally {
      setIsCapturing(false);
    }
  };

  const processFaceMatching = async (livePhoto: string) => {
    try {
      setMatchingResult(prev => ({
        ...prev,
        status: 'processing',
        livePhoto,
        timestamp: new Date().toISOString()
      }));

      // Simulate face quality validation
      const faceRecords = await validateFacePhoto(livePhoto);
      
      if (!faceRecords.noError) {
        throw new Error('Live photograph does not meet quality requirements');
      }

      // Simulate UIDAI photograph matching
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const matchingConfidence = Math.floor(Math.random() * 25 + 75); // 75-100% for demo
      const isMatched = matchingConfidence >= 70;

      const result: MatchingResult = {
        confidence: matchingConfidence,
        status: isMatched ? 'matched' : 'not_matched',
        livePhoto,
        uidaiPhoto: generateMockUidaiPhoto(),
        faceRecords,
        timestamp: new Date().toISOString()
      };

      setMatchingResult(result);
      
      if (isMatched) {
        onMatchingComplete(result);
        toast.success(`Face matching successful! Confidence: ${matchingConfidence}%`);
      } else {
        throw new Error(`Face matching failed. Confidence: ${matchingConfidence}%`);
      }

    } catch (error: any) {
      const errorResult: MatchingResult = {
        confidence: 0,
        status: 'error',
        livePhoto,
        faceRecords: matchingResult.faceRecords,
        timestamp: new Date().toISOString()
      };
      
      setMatchingResult(errorResult);
      onError(error.message || 'Face matching process failed');
      toast.error(error.message || 'Face matching failed');
    }
  };

  const validateFacePhoto = async (photoData: string): Promise<MatchingResult['faceRecords']> => {
    // Simulate face validation checks
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      noError: Math.random() > 0.1, // 90% pass rate
      clarity: Math.floor(Math.random() * 20 + 80), // 80-100
      faceDetected: Math.random() > 0.05, // 95% pass rate
      eyesOpen: Math.random() > 0.1, // 90% pass rate
      properLighting: Math.random() > 0.15 // 85% pass rate
    };
  };

  const generateMockUidaiPhoto = () => {
    // In real implementation, this would come from UIDAI data
    return '/api/placeholder/uidai-photo.jpg';
  };

  const getStatusBadge = (status: MatchingResult['status'], confidence: number) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" size="sm" icon="Clock">Ready to Match</Badge>;
      case 'processing':
        return <Badge variant="warning" size="sm" icon="Loader">Processing</Badge>;
      case 'matched':
        return <Badge variant="success" size="sm" icon="CheckCircle">Matched ({confidence}%)</Badge>;
      case 'not_matched':
        return <Badge variant="danger" size="sm" icon="XCircle">Not Matched ({confidence}%)</Badge>;
      case 'error':
        return <Badge variant="danger" size="sm" icon="AlertCircle">Error</Badge>;
      default:
        return <Badge variant="secondary" size="sm">Unknown</Badge>;
    }
  };

  const renderFaceRecordsValidation = () => {
    if (!matchingResult.faceRecords) return null;

    const { faceRecords } = matchingResult;
    const checks = [
      { key: 'faceDetected', label: 'Face Detection', icon: 'Eye' },
      { key: 'eyesOpen', label: 'Eyes Open', icon: 'Eye' },
      { key: 'properLighting', label: 'Proper Lighting', icon: 'Sun' },
      { key: 'noError', label: 'No Errors in Records', icon: 'CheckCircle' }
    ];

    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Face Records Validation</h4>
        <div className="space-y-2">
          {checks.map(check => (
            <div key={check.key} className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <ApperIcon name={check.icon} className="h-4 w-4 text-gray-500" />
                <span className="text-gray-700">{check.label}</span>
              </div>
              {faceRecords[check.key as keyof typeof faceRecords] ? (
                <ApperIcon name="Check" className="h-4 w-4 text-green-500" />
              ) : (
                <ApperIcon name="X" className="h-4 w-4 text-red-500" />
              )}
            </div>
          ))}
          <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-200">
            <span className="text-gray-700 font-medium">Photo Clarity Score</span>
            <span className="text-primary-600 font-medium">{faceRecords.clarity}%</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <div className="space-y-6">
        <div className="text-center">
          <ApperIcon name="Camera" className="h-12 w-12 text-primary-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Face Matching Verification</h2>
          <p className="text-gray-600">
            UIDAI photograph matching with live capture comparison
          </p>
        </div>

        {/* Status Display */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Matching Status</h3>
              <p className="text-xs text-gray-500">Live photo vs UIDAI records</p>
            </div>
            {getStatusBadge(matchingResult.status, matchingResult.confidence)}
          </div>
        </div>

        {/* Camera Interface */}
        {!showCamera && matchingResult.status === 'pending' && (
          <div className="text-center space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <ApperIcon name="Info" className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-left">
                  <h4 className="text-sm font-medium text-blue-900">Photo Requirements</h4>
                  <ul className="mt-1 text-sm text-blue-800 space-y-1">
                    <li>• Look directly at the camera</li>
                    <li>• Ensure good lighting on your face</li>
                    <li>• Keep eyes open and remove glasses</li>
                    <li>• Maintain a neutral expression</li>
                  </ul>
                </div>
              </div>
            </div>

            <Button 
              onClick={startCamera} 
              icon="Camera" 
              size="lg"
              className="w-full sm:w-auto"
            >
              Start Live Photo Capture
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
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 border-4 border-primary-500 rounded-lg pointer-events-none">
                <div className="absolute top-4 left-4 w-8 h-8 border-l-4 border-t-4 border-primary-500"></div>
                <div className="absolute top-4 right-4 w-8 h-8 border-r-4 border-t-4 border-primary-500"></div>
                <div className="absolute bottom-4 left-4 w-8 h-8 border-l-4 border-b-4 border-primary-500"></div>
                <div className="absolute bottom-4 right-4 w-8 h-8 border-r-4 border-b-4 border-primary-500"></div>
              </div>
            </div>
            
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            
            <div className="flex justify-center space-x-3">
              <Button 
                onClick={capturePhoto} 
                loading={isCapturing}
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

        {/* Processing State */}
        {matchingResult.status === 'processing' && (
          <div className="text-center space-y-4">
            <Loading type="cards" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing Face Match</h3>
              <p className="text-gray-600">
                Comparing live photograph with UIDAI records...
              </p>
            </div>
          </div>
        )}

        {/* Results Display */}
        {(matchingResult.status === 'matched' || matchingResult.status === 'not_matched' || matchingResult.status === 'error') && (
          <div className="space-y-4">
            {/* Photo Comparison */}
            {matchingResult.livePhoto && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-900">Live Photograph</h4>
                  <div className="relative">
                    <img 
                      src={matchingResult.livePhoto} 
                      alt="Live capture"
                      className="w-full h-48 object-cover rounded-lg border"
                    />
                    <Badge 
                      variant="info" 
                      size="sm" 
                      className="absolute top-2 left-2"
                      icon="Camera"
                    >
                      Live
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-900">UIDAI Photograph</h4>
                  <div className="relative">
                    <div className="w-full h-48 bg-gray-200 rounded-lg border flex items-center justify-center">
                      <div className="text-center">
                        <ApperIcon name="User" className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">UIDAI Reference Photo</p>
                      </div>
                    </div>
                    <Badge 
                      variant="success" 
                      size="sm" 
                      className="absolute top-2 left-2"
                      icon="Shield"
                    >
                      UIDAI
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {/* Face Records Validation */}
            {renderFaceRecordsValidation()}

            {/* Matching Result */}
            <div className={`
              border rounded-lg p-4
              ${matchingResult.status === 'matched' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}
            `}>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">
                    {matchingResult.status === 'matched' ? 'Face Match Successful' : 'Face Match Failed'}
                  </h4>
                  <p className="text-sm text-gray-600">
                    Confidence Score: {matchingResult.confidence}%
                  </p>
                </div>
                <ApperIcon 
                  name={matchingResult.status === 'matched' ? 'CheckCircle' : 'XCircle'}
                  className={`h-8 w-8 ${matchingResult.status === 'matched' ? 'text-green-600' : 'text-red-600'}`}
                />
              </div>
            </div>

            {matchingResult.status !== 'matched' && (
              <div className="text-center">
                <Button 
                  onClick={() => {
                    setMatchingResult({
                      confidence: 0,
                      status: 'pending',
                      timestamp: new Date().toISOString()
                    });
                  }}
                  icon="RefreshCw"
                  size="sm"
                >
                  Retry Face Matching
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default FaceMatching;