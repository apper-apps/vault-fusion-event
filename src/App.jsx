import React, { Suspense, useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { ErrorBoundary } from "react-error-boundary";
import "@/index.css";
import Layout from "@/components/organisms/Layout";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Settings from "@/components/pages/Settings";
import OTPConversion from "@/components/pages/OTPConversion";
import Reports from "@/components/pages/Reports";
import SelfKYC from "@/components/pages/SelfKYC";
import KYCWizard from "@/components/pages/KYCWizard";
import CAFForm from "@/components/pages/CAFForm";
import eKYC from "@/components/pages/eKYC";
import ReviewDetails from "@/components/pages/ReviewDetails";
import AdminDashboard from "@/components/pages/AdminDashboard.jsx";

// Error boundary fallback component
const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div className="min-h-screen flex items-center justify-center bg-surface p-4">
    <Error 
      message={error?.message || "Something went wrong"} 
      onRetry={resetErrorBoundary}
      title="Application Error"
    />
  </div>
);

// Loading fallback for suspense
const SuspenseFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-surface">
    <Loading />
  </div>
);

function App() {
  // Enhanced user role management with persistence
  const [userRole, setUserRole] = useState(() => {
    try {
      return localStorage.getItem('userRole') || 'customer';
    } catch {
      return 'customer';
    }
  });
  
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize application
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Simulate app initialization
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Store user role in localStorage
        localStorage.setItem('userRole', userRole);
        
        setIsInitialized(true);
      } catch (error) {
        console.error('App initialization failed:', error);
        toast.error('Failed to initialize application');
        setIsInitialized(true); // Still show the app
      }
    };

    initializeApp();
  }, [userRole]);

  if (!isInitialized) {
    return <SuspenseFallback />;
  }
return (
<ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error('Application error:', error, errorInfo);
        toast.error('Something went wrong. Please refresh the page or try again later.', {
          duration: 6000,
          icon: '⚠️'
        });
      }}
      onReset={() => {
        // Reset app state if needed
        window.location.reload();
      }}
    >
      <BrowserRouter>
        <div className="min-h-screen bg-surface">
          <Suspense fallback={<SuspenseFallback />}>
            <Routes>
              <Route path="/" element={<Layout userRole={userRole} />}>
                {userRole === 'customer' ? (
<>
                    <Route index element={<Navigate to="/kyc-submit" replace />} />
                    <Route 
                      path="kyc-submit" 
                      element={
                        <Suspense fallback={<Loading />}>
                          <KYCWizard />
                        </Suspense>
                      } 
                    />
                    <Route 
                      path="self-kyc" 
                      element={
                        <Suspense fallback={<Loading />}>
                          <SelfKYC />
                        </Suspense>
                      } 
                    />
                    <Route 
                      path="e-kyc" 
                      element={
                        <Suspense fallback={<Loading />}>
                          <eKYC />
                        </Suspense>
                      } 
                    />
                    <Route 
                      path="otp-conversion" 
                      element={
                        <Suspense fallback={<Loading />}>
                          <OTPConversion />
                        </Suspense>
                      } 
                    />
                    <Route 
                      path="caf-form" 
                      element={
                        <Suspense fallback={<Loading />}>
                          <CAFForm />
                        </Suspense>
                      } 
                    />
                  </>
                ) : (
                  <>
                    <Route index element={<Navigate to="/admin" replace />} />
                    <Route 
                      path="admin" 
                      element={
                        <Suspense fallback={<Loading />}>
                          <AdminDashboard />
                        </Suspense>
                      } 
                    />
                    <Route 
                      path="admin/review/:id" 
                      element={
                        <Suspense fallback={<Loading />}>
                          <ReviewDetails />
                        </Suspense>
                      } 
                    />
                    <Route 
                      path="admin/reports" 
                      element={
                        <Suspense fallback={<Loading />}>
                          <Reports />
                        </Suspense>
                      } 
                    />
                    <Route 
                      path="admin/settings" 
                      element={
                        <Suspense fallback={<Loading />}>
                          <Settings />
                        </Suspense>
                      } 
                    />
</>
                )}
                <Route path="*" element={<Navigate to={userRole === 'customer' ? '/kyc-submit' : '/admin/reports'} replace />} />
              </Route>
            </Routes>
          </Suspense>
<ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={true}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss={false}
            draggable
            pauseOnHover
            theme="light"
            style={{ zIndex: 9999 }}
            toastClassName="!rounded-lg !shadow-elevation-2 !border-0"
            bodyClassName="!text-sm !font-medium !leading-relaxed"
            progressClassName="!bg-white/30"
            transition="slide"
            stacked
            limit={3}
          />
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;