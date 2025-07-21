import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Layout from '@/components/organisms/Layout';
import CustomerDashboard from '@/components/pages/CustomerDashboard';
import KYCWizard from '@/components/pages/KYCWizard';
import SelfKYCWizard from '@/components/kyc/SelfKYC/SelfKYCWizard';
import AdminDashboard from '@/components/pages/AdminDashboard';
import ReviewDetails from '@/components/pages/ReviewDetails';
import DocumentManager from '@/components/pages/DocumentManager';
import Reports from '@/components/pages/Reports';
import Settings from '@/components/pages/Settings';

function App() {
  // Mock user role - in real app this would come from auth context
  const userRole = 'customer'; // 'customer' or 'admin'

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Layout userRole={userRole} />}>
            {userRole === 'customer' ? (
              <>
<Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<CustomerDashboard />} />
                <Route path="kyc-submit" element={<KYCWizard />} />
                <Route path="self-kyc" element={<SelfKYCWizard />} />
                <Route path="documents" element={<DocumentManager />} />
              </>
            ) : (
              <>
                <Route index element={<Navigate to="/admin" replace />} />
                <Route path="admin" element={<AdminDashboard />} />
                <Route path="admin/review/:id" element={<ReviewDetails />} />
                <Route path="admin/documents" element={<DocumentManager />} />
                <Route path="admin/reports" element={<Reports />} />
                <Route path="admin/settings" element={<Settings />} />
              </>
            )}
            <Route path="*" element={<Navigate to={userRole === 'customer' ? '/dashboard' : '/admin'} replace />} />
          </Route>
        </Routes>
        
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          style={{ zIndex: 9999 }}
        />
      </div>
    </Router>
  );
}

export default App;