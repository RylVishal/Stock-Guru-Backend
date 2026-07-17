import React, { useState, useEffect } from 'react';
import { apiClient as api } from '../../services/auth';

export default function AdminVerify() {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  // Fetch pending verifications
  const fetchVerifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/admin/kyc/pending');
      const data = res?.data?.data || res?.data || [];
      
      const transformed = data.map((item) => ({
        id: item.id ?? item._id,
        userId: item?.user?.id ?? item?.userId ?? 'N/A',
        fullName: item?.fullName || item?.user?.name || 'Unknown',
        email: item?.user?.email || 'N/A',
        documentType: 'KYC',
        documentNumber: item?.panNumber || item?.aadhaarNumber || 'N/A',
        status: item.status,
        createdAt: item.createdAt,
        rejectionReason: item.rejectionReason
      }));

      setVerifications(transformed);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch verifications');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Approve verification
  const handleApprove = async (id) => {
    try {
      setActionLoading(prev => ({ ...prev, [id]: 'approving' }));
      await api.patch(`/admin/kyc/${id}/approve`);
      setVerifications(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve');
      console.error('Error approving:', err);
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: null }));
    }
  };

  // Reject verification
  const handleReject = async (id) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason || !reason.trim()) return;

    try {
      setActionLoading(prev => ({ ...prev, [id]: 'rejecting' }));
      await api.patch(`/admin/kyc/${id}/reject`, { reason: reason.trim() });
      setVerifications(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject');
      console.error('Error rejecting:', err);
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: null }));
    }
  };

  useEffect(() => {
    fetchVerifications();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Verification Queue</h1>
        <p className="text-sm text-gray-500 mt-1">Review and manage pending KYC submissions</p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12 text-gray-600 text-sm">
          Loading verifications...
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-12">
          <p className="text-red-500 text-sm mb-3">{error}</p>
          <button 
            onClick={fetchVerifications}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            Retry
          </button>
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {verifications.length === 0 ? (
            <div className="text-center py-12 text-gray-600 text-sm">
              No pending verifications found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-slate-700 text-xs uppercase tracking-wider">User</th>
                    <th className="px-4 py-3 font-semibold text-slate-700 text-xs uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3 font-semibold text-slate-700 text-xs uppercase tracking-wider">Document</th>
                    <th className="px-4 py-3 font-semibold text-slate-700 text-xs uppercase tracking-wider">Doc Number</th>
                    <th className="px-4 py-3 font-semibold text-slate-700 text-xs uppercase tracking-wider">Submitted</th>
                    <th className="px-4 py-3 font-semibold text-slate-700 text-xs uppercase tracking-wider text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {verifications.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-slate-900">{item.fullName}</p>
                          <p className="text-xs text-gray-600">ID: {item.userId}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{item.email}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                          {item.documentType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 font-mono text-xs">{item.documentNumber}</td>
                      <td className="px-4 py-3 text-slate-600 text-xs">
                        {new Date(item.createdAt).toLocaleDateString('en-IN', { 
                          day: '2-digit', 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleApprove(item.id)}
                            disabled={actionLoading[item.id]}
                            className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium transition"
                          >
                            {actionLoading[item.id] === 'approving' ? 'Approving...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => handleReject(item.id)}
                            disabled={actionLoading[item.id]}
                            className="px-3 py-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium transition"
                          >
                            {actionLoading[item.id] === 'rejecting' ? 'Rejecting...' : 'Reject'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}