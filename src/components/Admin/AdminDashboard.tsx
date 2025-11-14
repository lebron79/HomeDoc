import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Users, 
  Activity, 
  TrendingUp, 
  Stethoscope, 
  Loader2, 
  Shield,
  UserX,
  UserCheck,
  Search,
  Trash2,
  ChevronDown,
  ChevronUp,
  Calendar,
  Mail,
  Phone as PhoneIcon
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface Statistics {
  totalPatients: number;
  totalDoctors: number;
  suspendedUsers: number;
  newUsersThisWeek: number;
  specializationStats: { specialization: string; count: number }[];
}

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'patient' | 'doctor' | 'admin';
  specialization?: string;
  age?: number;
  phone?: string;
  gender?: string;
  address?: string;
  is_active: boolean;
  suspended_at?: string;
  suspension_reason?: string;
  created_at: string;
}

type ViewMode = 'dashboard' | 'manage-users';
type UserFilter = 'all' | 'patients' | 'doctors' | 'suspended';

export function AdminDashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [userFilter, setUserFilter] = useState<UserFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [suspensionReason, setSuspensionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (profile?.role === 'admin') {
      loadStatistics();
      if (viewMode === 'manage-users') {
        loadUsers();
      }
    }
  }, [profile, viewMode]);

  useEffect(() => {
    filterUsers();
  }, [users, userFilter, searchTerm]);

  const loadStatistics = async () => {
    try {
      const [patientsResult, doctorsResult, suspendedResult, newWeekResult] = await Promise.all([
        supabase.from('user_profiles').select('id', { count: 'exact' }).eq('role', 'patient').eq('is_active', true),
        supabase.from('user_profiles').select('id', { count: 'exact' }).eq('role', 'doctor').eq('is_active', true),
        supabase.from('user_profiles').select('id', { count: 'exact' }).eq('is_active', false),
        supabase.from('user_profiles').select('id', { count: 'exact' }).gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
      ]);

      const { data: doctorData } = await supabase
        .from('user_profiles')
        .select('specialization')
        .eq('role', 'doctor')
        .not('specialization', 'is', null);

      const specializationCounts = (doctorData || []).reduce((acc: any, curr) => {
        if (curr.specialization) {
          acc[curr.specialization] = (acc[curr.specialization] || 0) + 1;
        }
        return acc;
      }, {});

      const specializationStats = Object.entries(specializationCounts)
        .map(([specialization, count]) => ({ specialization, count: count as number }))
        .sort((a, b) => b.count - a.count);

      setStats({
        totalPatients: patientsResult.count || 0,
        totalDoctors: doctorsResult.count || 0,
        suspendedUsers: suspendedResult.count || 0,
        newUsersThisWeek: newWeekResult.count || 0,
        specializationStats,
      });
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      // Use the secure admin function instead of direct query
      const { data, error } = await supabase.rpc('admin_get_all_users');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
      alert('Failed to load users. Make sure you have admin privileges.');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Filter by role/status
    if (userFilter === 'patients') {
      filtered = filtered.filter(u => u.role === 'patient');
    } else if (userFilter === 'doctors') {
      filtered = filtered.filter(u => u.role === 'doctor');
    } else if (userFilter === 'suspended') {
      filtered = filtered.filter(u => !u.is_active);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(u => 
        u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.specialization && u.specialization.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredUsers(filtered);
  };

  const handleSuspendUser = async () => {
    if (!selectedUser || !suspensionReason.trim()) {
      alert('Please provide a reason for suspension');
      return;
    }

    setActionLoading(true);
    try {
      // Use the secure admin function
      const { error } = await supabase.rpc('admin_suspend_user', {
        p_user_id: selectedUser.id,
        p_reason: suspensionReason
      });

      if (error) throw error;

      alert('User suspended successfully');
      setShowSuspendDialog(false);
      setSuspensionReason('');
      setSelectedUser(null);
      loadUsers();
      loadStatistics();
    } catch (error) {
      console.error('Error suspending user:', error);
      alert('Failed to suspend user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleActivateUser = async (user: UserProfile) => {
    if (!confirm(`Are you sure you want to activate ${user.full_name}?`)) return;

    setActionLoading(true);
    try {
      // Use the secure admin function
      const { error } = await supabase.rpc('admin_activate_user', {
        p_user_id: user.id
      });

      if (error) throw error;

      alert('User activated successfully');
      loadUsers();
      loadStatistics();
    } catch (error) {
      console.error('Error activating user:', error);
      alert('Failed to activate user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (user: UserProfile) => {
    if (!confirm(`Are you sure you want to DELETE ${user.full_name}? This action cannot be undone!`)) return;

    setActionLoading(true);
    try {
      // Use the secure admin function
      const { error } = await supabase.rpc('admin_delete_user', {
        p_user_id: user.id
      });

      if (error) throw error;

      alert('User deleted successfully');
      loadUsers();
      loadStatistics();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    } finally {
      setActionLoading(false);
    }
  };

  // Check if user is admin
  if (profile?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <Shield className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">
            You need administrator privileges to access this page.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600">Failed to load statistics</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Navigation */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-600">
              {viewMode === 'dashboard' ? 'Platform statistics and insights' : 'Manage users and accounts'}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setViewMode('dashboard')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                viewMode === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Activity className="w-5 h-5 inline-block mr-2" />
              Dashboard
            </button>
            <button
              onClick={() => setViewMode('manage-users')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                viewMode === 'manage-users'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Users className="w-5 h-5 inline-block mr-2" />
              Manage Users
            </button>
          </div>
        </div>

        {viewMode === 'dashboard' ? (
          <>
            {/* Statistics Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPatients}</p>
                <p className="text-sm text-gray-600">Total Patients</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <Stethoscope className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDoctors}</p>
                <p className="text-sm text-gray-600">Total Doctors</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <UserX className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.suspendedUsers}</p>
                <p className="text-sm text-gray-600">Suspended Users</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <UserCheck className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.newUsersThisWeek}</p>
                <p className="text-sm text-gray-600">New This Week</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Doctor Specializations
            </h2>
            <div className="space-y-3">
              {stats.specializationStats.length === 0 ? (
                <p className="text-gray-500 text-sm">No data available</p>
              ) : (
                stats.specializationStats.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-green-600 font-semibold text-sm">
                        {index + 1}
                      </div>
                      <span className="text-gray-700">{item.specialization}</span>
                    </div>
                    <span className="font-semibold text-gray-900">{item.count}</span>
                  </div>
                ))
              )}
            </div>
          </div>

        <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Platform Insights</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-3xl font-bold text-blue-600">
                {stats.totalPatients + stats.totalDoctors}
              </p>
              <p className="text-sm text-gray-600 mt-1">Total Users</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-3xl font-bold text-purple-600">
                {stats.totalDoctors > 0
                  ? (stats.totalPatients / stats.totalDoctors).toFixed(1)
                  : 0}
              </p>
              <p className="text-sm text-gray-600 mt-1">Patient to Doctor Ratio</p>
            </div>
          </div>
        </div>
          </>
        ) : (
          /* User Management View */
          <div>
            {/* Filters and Search */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or specialization..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setUserFilter('all')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      userFilter === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All Users
                  </button>
                  <button
                    onClick={() => setUserFilter('patients')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      userFilter === 'patients'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Patients
                  </button>
                  <button
                    onClick={() => setUserFilter('doctors')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      userFilter === 'doctors'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Doctors
                  </button>
                  <button
                    onClick={() => setUserFilter('suspended')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      userFilter === 'suspended'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Suspended
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-3">
                Showing {filteredUsers.length} of {users.length} users
              </p>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <>
                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                              <div className="text-sm text-gray-500 flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {user.email}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                user.role === 'doctor'
                                  ? 'bg-green-100 text-green-800'
                                  : user.role === 'patient'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-purple-100 text-purple-800'
                              }`}
                            >
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </span>
                            {user.specialization && (
                              <div className="text-xs text-gray-500 mt-1">{user.specialization}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {user.is_active ? (
                              <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                Active
                              </span>
                            ) : (
                              <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                Suspended
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(user.created_at).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button
                              onClick={() => setExpandedUserId(expandedUserId === user.id ? null : user.id)}
                              className="text-blue-600 hover:text-blue-900 transition-colors"
                            >
                              {expandedUserId === user.id ? (
                                <ChevronUp className="w-5 h-5" />
                              ) : (
                                <ChevronDown className="w-5 h-5" />
                              )}
                            </button>
                            {user.is_active ? (
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowSuspendDialog(true);
                                }}
                                disabled={actionLoading}
                                className="text-orange-600 hover:text-orange-900 transition-colors disabled:opacity-50"
                              >
                                <UserX className="w-5 h-5" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleActivateUser(user)}
                                disabled={actionLoading}
                                className="text-green-600 hover:text-green-900 transition-colors disabled:opacity-50"
                              >
                                <UserCheck className="w-5 h-5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteUser(user)}
                              disabled={actionLoading}
                              className="text-red-600 hover:text-red-900 transition-colors disabled:opacity-50"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                        {expandedUserId === user.id && (
                          <tr className="bg-gray-50">
                            <td colSpan={5} className="px-6 py-4">
                              <div className="grid md:grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="font-semibold text-gray-700 mb-2">Contact Information</p>
                                  {user.phone && (
                                    <p className="text-gray-600 flex items-center gap-2">
                                      <PhoneIcon className="w-4 h-4" />
                                      {user.phone}
                                    </p>
                                  )}
                                  {user.address && (
                                    <p className="text-gray-600 mt-1">{user.address}</p>
                                  )}
                                  {user.gender && (
                                    <p className="text-gray-600 mt-1">Gender: {user.gender}</p>
                                  )}
                                  {user.age && (
                                    <p className="text-gray-600 mt-1">Age: {user.age}</p>
                                  )}
                                </div>
                                {!user.is_active && user.suspension_reason && (
                                  <div>
                                    <p className="font-semibold text-red-700 mb-2">Suspension Details</p>
                                    <p className="text-gray-600">Reason: {user.suspension_reason}</p>
                                    {user.suspended_at && (
                                      <p className="text-gray-600 mt-1">
                                        Date: {new Date(user.suspended_at).toLocaleString()}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Suspend User Dialog */}
        {showSuspendDialog && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Suspend User: {selectedUser.full_name}
              </h3>
              <p className="text-gray-600 mb-4">
                Please provide a reason for suspending this user. This action can be reversed later.
              </p>
              <textarea
                value={suspensionReason}
                onChange={(e) => setSuspensionReason(e.target.value)}
                placeholder="Enter suspension reason..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
              />
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSuspendUser}
                  disabled={actionLoading || !suspensionReason.trim()}
                  className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : (
                    'Suspend User'
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowSuspendDialog(false);
                    setSelectedUser(null);
                    setSuspensionReason('');
                  }}
                  disabled={actionLoading}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
