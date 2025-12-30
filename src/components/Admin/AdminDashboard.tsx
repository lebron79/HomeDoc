import React, { useState, useEffect } from 'react';
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
  Phone as PhoneIcon,
  Package,
  ShoppingCart,
  DollarSign,
  Brain
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { MedicationManagement } from './MedicationManagement';
import { OrderHistory } from './OrderHistory';
import { ModelFeedbackDashboard } from './ModelFeedbackDashboard';

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

type ViewMode = 'dashboard' | 'manage-users' | 'medications' | 'orders' | 'model-feedback';
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
      if (viewMode === 'dashboard') {
        loadStatistics();
      } else if (viewMode === 'manage-users') {
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6 relative overflow-hidden">
      {/* Animated Background Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header with Navigation */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-lg opacity-50 animate-pulse"></div>
              <div className="relative w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl">
                <Shield className="w-9 h-9 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 font-medium mt-1">
                {viewMode === 'dashboard' && '✨ Platform statistics and insights'}
                {viewMode === 'manage-users' && '👥 Manage users and accounts'}
                {viewMode === 'medications' && '💊 Manage medication inventory'}
                {viewMode === 'orders' && '📦 View and manage orders'}
                {viewMode === 'model-feedback' && '🤖 AI Model performance feedback'}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={() => setViewMode('dashboard')}
              className={`group relative px-6 py-3.5 rounded-xl font-semibold transition-all duration-300 overflow-hidden ${
                viewMode === 'dashboard'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xl shadow-purple-500/50 scale-105'
                  : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white hover:shadow-lg hover:scale-105 border border-purple-100'
              }`}
            >
              {viewMode === 'dashboard' && (
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-30 transition-opacity"></div>
              )}
              <Activity className="w-5 h-5 inline-block mr-2 relative z-10" />
              <span className="relative z-10">Dashboard</span>
            </button>
            <button
              onClick={() => setViewMode('manage-users')}
              className={`group relative px-6 py-3.5 rounded-xl font-semibold transition-all duration-300 overflow-hidden ${
                viewMode === 'manage-users'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-xl shadow-blue-500/50 scale-105'
                  : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white hover:shadow-lg hover:scale-105 border border-blue-100'
              }`}
            >
              {viewMode === 'manage-users' && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 opacity-0 group-hover:opacity-30 transition-opacity"></div>
              )}
              <Users className="w-5 h-5 inline-block mr-2 relative z-10" />
              <span className="relative z-10">Manage Users</span>
            </button>
            <button
              onClick={() => setViewMode('medications')}
              className={`group relative px-6 py-3.5 rounded-xl font-semibold transition-all duration-300 overflow-hidden ${
                viewMode === 'medications'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xl shadow-emerald-500/50 scale-105'
                  : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white hover:shadow-lg hover:scale-105 border border-emerald-100'
              }`}
            >
              {viewMode === 'medications' && (
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 opacity-0 group-hover:opacity-30 transition-opacity"></div>
              )}
              <Package className="w-5 h-5 inline-block mr-2 relative z-10" />
              <span className="relative z-10">Medications</span>
            </button>
            <button
              onClick={() => setViewMode('orders')}
              className={`group relative px-6 py-3.5 rounded-xl font-semibold transition-all duration-300 overflow-hidden ${
                viewMode === 'orders'
                  ? 'bg-gradient-to-r from-orange-600 to-rose-600 text-white shadow-xl shadow-orange-500/50 scale-105'
                  : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white hover:shadow-lg hover:scale-105 border border-orange-100'
              }`}
            >
              {viewMode === 'orders' && (
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-rose-400 opacity-0 group-hover:opacity-30 transition-opacity"></div>
              )}
              <ShoppingCart className="w-5 h-5 inline-block mr-2 relative z-10" />
              <span className="relative z-10">Orders & Revenue</span>
            </button>
            <button
              onClick={() => setViewMode('model-feedback')}
              className={`group relative px-6 py-3.5 rounded-xl font-semibold transition-all duration-300 overflow-hidden ${
                viewMode === 'model-feedback'
                  ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-xl shadow-violet-500/50 scale-105'
                  : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white hover:shadow-lg hover:scale-105 border border-violet-100'
              }`}
            >
              {viewMode === 'model-feedback' && (
                <div className="absolute inset-0 bg-gradient-to-r from-violet-400 to-purple-400 opacity-0 group-hover:opacity-30 transition-opacity"></div>
              )}
              <Brain className="w-5 h-5 inline-block mr-2 relative z-10" />
              <span className="relative z-10">Model Feedback</span>
            </button>
          </div>
        </div>

        {viewMode === 'medications' ? (
          <MedicationManagement />
        ) : viewMode === 'orders' ? (
          <OrderHistory />
        ) : viewMode === 'model-feedback' ? (
          <ModelFeedbackDashboard />
        ) : viewMode === 'dashboard' ? (
          <>
            {/* Statistics Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="group relative bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-blue-100 hover:border-blue-300 transition-all duration-300 hover:scale-105 hover:shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="flex items-center gap-3 mb-2 relative z-10">
              <div className="p-2.5 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-3xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{stats.totalPatients}</p>
                <p className="text-sm font-semibold text-gray-600">Total Patients</p>
              </div>
            </div>
          </div>

          <div className="group relative bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-emerald-100 hover:border-emerald-300 transition-all duration-300 hover:scale-105 hover:shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="flex items-center gap-3 mb-2 relative z-10">
              <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-3xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">{stats.totalDoctors}</p>
                <p className="text-sm font-semibold text-gray-600">Total Doctors</p>
              </div>
            </div>
          </div>

          <div className="group relative bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-rose-100 hover:border-rose-300 transition-all duration-300 hover:scale-105 hover:shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-rose-400/20 to-pink-400/20 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="flex items-center gap-3 mb-2 relative z-10">
              <div className="p-2.5 bg-gradient-to-br from-rose-500 to-pink-500 rounded-xl shadow-lg">
                <UserX className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-3xl font-black bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">{stats.suspendedUsers}</p>
                <p className="text-sm font-semibold text-gray-600">Suspended Users</p>
              </div>
            </div>
          </div>

          <div className="group relative bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-purple-100 hover:border-purple-300 transition-all duration-300 hover:scale-105 hover:shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-indigo-400/20 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="flex items-center gap-3 mb-2 relative z-10">
              <div className="p-2.5 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl shadow-lg">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-3xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">{stats.newUsersThisWeek}</p>
                <p className="text-sm font-semibold text-gray-600">New This Week</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-emerald-100 overflow-hidden">
            <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-emerald-400/10 to-teal-400/10 rounded-full -ml-32 -mt-32"></div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4 relative z-10">
              Doctor Specializations
            </h2>
            <div className="space-y-3 relative z-10">
              {stats.specializationStats.length === 0 ? (
                <p className="text-gray-500 text-sm">No data available</p>
              ) : (
                stats.specializationStats.map((item, index) => (
                  <div key={index} className="group flex items-center justify-between p-3 rounded-xl hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 transition-all duration-300 hover:scale-102">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg group-hover:scale-110 transition-transform">
                        {index + 1}
                      </div>
                      <span className="text-gray-800 font-semibold">{item.specialization}</span>
                    </div>
                    <span className="font-bold text-lg bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">{item.count}</span>
                  </div>
                ))
              )}
            </div>
          </div>

        <div className="mt-6 relative bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-purple-100 overflow-hidden">
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full -mr-32 -mb-32"></div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 relative z-10">Platform Insights</h2>
          <div className="grid md:grid-cols-2 gap-6 relative z-10">
            <div className="group text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-100 hover:border-blue-300 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <p className="text-4xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                {stats.totalPatients + stats.totalDoctors}
              </p>
              <p className="text-sm font-semibold text-gray-600 mt-1">Total Users</p>
            </div>
            <div className="group text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-100 hover:border-purple-300 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <p className="text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                {stats.totalDoctors > 0
                  ? (stats.totalPatients / stats.totalDoctors).toFixed(1)
                  : 0}
              </p>
              <p className="text-sm font-semibold text-gray-600 mt-1">Patient to Doctor Ratio</p>
            </div>
          </div>
        </div>
          </>
        ) : (
          /* User Management View */
          <div>
            {/* Filters and Search */}
            <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 mb-6 border border-blue-100 overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full -mr-24 -mt-24"></div>
              <div className="flex flex-col md:flex-row gap-4 items-center relative z-10">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-500 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or specialization..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all"
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setUserFilter('all')}
                    className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
                      userFilter === 'all'
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/50 scale-105'
                        : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white hover:shadow-md border border-gray-200'
                    }`}
                  >
                    All Users
                  </button>
                  <button
                    onClick={() => setUserFilter('patients')}
                    className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
                      userFilter === 'patients'
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/50 scale-105'
                        : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white hover:shadow-md border border-gray-200'
                    }`}
                  >
                    Patients
                  </button>
                  <button
                    onClick={() => setUserFilter('doctors')}
                    className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
                      userFilter === 'doctors'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/50 scale-105'
                        : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white hover:shadow-md border border-gray-200'
                    }`}
                  >
                    Doctors
                  </button>
                  <button
                    onClick={() => setUserFilter('suspended')}
                    className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
                      userFilter === 'suspended'
                        ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg shadow-rose-500/50 scale-105'
                        : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white hover:shadow-md border border-gray-200'
                    }`}
                  >
                    Suspended
                  </button>
                </div>
              </div>
              <p className="text-sm font-semibold text-gray-600 mt-3 relative z-10">
                Showing <span className="text-blue-600 font-bold">{filteredUsers.length}</span> of <span className="text-blue-600 font-bold">{users.length}</span> users
              </p>
            </div>

            {/* Users Table */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden border border-gray-200">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-blue-50 to-purple-50 border-b-2 border-blue-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white/50 backdrop-blur-sm divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <React.Fragment key={user.id}>
                        <tr className="hover:bg-blue-50/50 transition-all duration-200">
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
                              className={`px-3 py-1.5 inline-flex text-xs leading-5 font-bold rounded-full shadow-sm ${
                                user.role === 'doctor'
                                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                                  : user.role === 'patient'
                                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                                  : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
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
                              <span className="px-3 py-1.5 inline-flex text-xs leading-5 font-bold rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm">
                                Active
                              </span>
                            ) : (
                              <span className="px-3 py-1.5 inline-flex text-xs leading-5 font-bold rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-sm">
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                            <button
                              onClick={() => setExpandedUserId(expandedUserId === user.id ? null : user.id)}
                              className="text-blue-600 hover:text-blue-800 transition-colors p-1 hover:bg-blue-50 rounded-lg"
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
                                className="text-orange-600 hover:text-orange-800 transition-colors disabled:opacity-50 p-1 hover:bg-orange-50 rounded-lg"
                              >
                                <UserX className="w-5 h-5" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleActivateUser(user)}
                                disabled={actionLoading}
                                className="text-emerald-600 hover:text-emerald-800 transition-colors disabled:opacity-50 p-1 hover:bg-emerald-50 rounded-lg"
                              >
                                <UserCheck className="w-5 h-5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteUser(user)}
                              disabled={actionLoading}
                              className="text-rose-600 hover:text-rose-800 transition-colors disabled:opacity-50 p-1 hover:bg-rose-50 rounded-lg"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                        {expandedUserId === user.id && (
                          <tr className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 backdrop-blur-sm">
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
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Suspend User Dialog */}
        {showSuspendDialog && selectedUser && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 border-2 border-rose-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-rose-400/20 to-pink-400/20 rounded-full -mr-32 -mt-32"></div>
              <h3 className="text-2xl font-black bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-4 relative z-10">
                Suspend User: {selectedUser.full_name}
              </h3>
              <p className="text-gray-700 mb-4 relative z-10 font-medium">
                Please provide a reason for suspending this user. This action can be reversed later.
              </p>
              <textarea
                value={suspensionReason}
                onChange={(e) => setSuspensionReason(e.target.value)}
                placeholder="Enter suspension reason..."
                className="w-full px-4 py-3 border-2 border-rose-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 resize-none relative z-10 bg-white/80 backdrop-blur-sm"
                rows={4}
              />
              <div className="flex gap-3 mt-6 relative z-10">
                <button
                  onClick={handleSuspendUser}
                  disabled={actionLoading || !suspensionReason.trim()}
                  className="flex-1 bg-gradient-to-r from-rose-600 to-pink-600 text-white py-3.5 rounded-xl hover:from-rose-700 hover:to-pink-700 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
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
                  className="flex-1 bg-gray-200 text-gray-700 py-3.5 rounded-xl hover:bg-gray-300 transition-all font-bold disabled:opacity-50 hover:shadow-lg transform hover:scale-105"
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
