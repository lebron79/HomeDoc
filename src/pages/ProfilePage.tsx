import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { User, Mail, Shield, Edit2, Save, X, Phone, MapPin, Calendar, Loader2, Stethoscope, Award, GraduationCap, DollarSign, FileText } from 'lucide-react';
import { ParticlesBackground } from '../components/Layout/ParticlesBackground';

// Person Avatar options (using avatar URLs from UI Avatars or similar services)
const AVATAR_OPTIONS = [
  { id: 'avatar-1', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix', name: 'Avatar 1' },
  { id: 'avatar-2', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka', name: 'Avatar 2' },
  { id: 'avatar-3', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Max', name: 'Avatar 3' },
  { id: 'avatar-4', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie', name: 'Avatar 4' },
  { id: 'avatar-5', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver', name: 'Avatar 5' },
  { id: 'avatar-6', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma', name: 'Avatar 6' },
  { id: 'avatar-7', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack', name: 'Avatar 7' },
  { id: 'avatar-8', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna', name: 'Avatar 8' },
  { id: 'avatar-9', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Leo', name: 'Avatar 9' },
  { id: 'avatar-10', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mia', name: 'Avatar 10' },
  { id: 'avatar-11', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Noah', name: 'Avatar 11' },
  { id: 'avatar-12', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zoe', name: 'Avatar 12' },
  { id: 'avatar-13', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Liam', name: 'Avatar 13' },
  { id: 'avatar-14', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Olivia', name: 'Avatar 14' },
  { id: 'avatar-15', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ethan', name: 'Avatar 15' },
  { id: 'avatar-16', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ava', name: 'Avatar 16' },
  { id: 'avatar-17', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mason', name: 'Avatar 17' },
  { id: 'avatar-18', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Isabella', name: 'Avatar 18' },
  { id: 'avatar-19', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James', name: 'Avatar 19' },
  { id: 'avatar-20', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlotte', name: 'Avatar 20' },
  { id: 'avatar-21', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Benjamin', name: 'Avatar 21' },
  { id: 'avatar-22', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amelia', name: 'Avatar 22' },
  { id: 'avatar-23', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas', name: 'Avatar 23' },
  { id: 'avatar-24', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Harper', name: 'Avatar 24' },
  { id: 'avatar-25', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Henry', name: 'Avatar 25' },
  { id: 'avatar-26', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Evelyn', name: 'Avatar 26' },
  { id: 'avatar-27', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alexander', name: 'Avatar 27' },
  { id: 'avatar-28', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Abigail', name: 'Avatar 28' },
  { id: 'avatar-29', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael', name: 'Avatar 29' },
  { id: 'avatar-30', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily', name: 'Avatar 30' },
  { id: 'avatar-31', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Daniel', name: 'Avatar 31' },
  { id: 'avatar-32', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elizabeth', name: 'Avatar 32' },
  { id: 'avatar-33', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jackson', name: 'Avatar 33' },
  { id: 'avatar-34', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia', name: 'Avatar 34' },
  { id: 'avatar-35', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sebastian', name: 'Avatar 35' },
  { id: 'avatar-36', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Avery', name: 'Avatar 36' },
  { id: 'avatar-37', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David', name: 'Avatar 37' },
  { id: 'avatar-38', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ella', name: 'Avatar 38' },
  { id: 'avatar-39', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Joseph', name: 'Avatar 39' },
  { id: 'avatar-40', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Scarlett', name: 'Avatar 40' },
  { id: 'avatar-41', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carter', name: 'Avatar 41' },
  { id: 'avatar-42', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Grace', name: 'Avatar 42' },
  { id: 'avatar-43', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Owen', name: 'Avatar 43' },
  { id: 'avatar-44', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chloe', name: 'Avatar 44' },
  { id: 'avatar-45', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Wyatt', name: 'Avatar 45' },
  { id: 'avatar-46', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Victoria', name: 'Avatar 46' },
  { id: 'avatar-47', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Matthew', name: 'Avatar 47' },
  { id: 'avatar-48', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lily', name: 'Avatar 48' },
];

export default function ProfilePage() {
  const { profile, refreshProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    age: profile?.age || '',
    address: profile?.address || '',
    gender: profile?.gender || '',
    avatar: profile?.avatar || 'avatar-1',
    // Doctor fields
    specialization: profile?.specialization || '',
    license_number: profile?.license_number || '',
    years_of_experience: profile?.years_of_experience || '',
    education: profile?.education || '',
    bio: profile?.bio || '',
    consultation_fee: profile?.consultation_fee || '',
  });

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  const handleEdit = () => {
    setFormData({
      full_name: profile.full_name || '',
      phone: profile.phone || '',
      age: profile.age || '',
      address: profile.address || '',
      gender: profile.gender || '',
      avatar: profile.avatar || 'default',
      // Doctor fields
      specialization: profile.specialization || '',
      license_number: profile.license_number || '',
      years_of_experience: profile.years_of_experience || '',
      education: profile.education || '',
      bio: profile.bio || '',
      consultation_fee: profile.consultation_fee || '',
    });
    setIsEditing(true);
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const updateData: any = {
        full_name: formData.full_name,
        phone: formData.phone,
        age: formData.age ? parseInt(String(formData.age)) : null,
        address: formData.address,
        gender: formData.gender,
        avatar: formData.avatar,
      };

      // Add doctor-specific fields if user is a doctor
      if (profile.role === 'doctor') {
        updateData.specialization = formData.specialization;
        updateData.license_number = formData.license_number;
        updateData.years_of_experience = formData.years_of_experience ? parseInt(String(formData.years_of_experience)) : null;
        updateData.education = formData.education;
        updateData.bio = formData.bio;
        updateData.consultation_fee = formData.consultation_fee ? parseFloat(String(formData.consultation_fee)) : null;
      }

      const { error: updateError } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('id', profile.id);

      if (updateError) throw updateError;

      // Refresh profile to get updated data
      await refreshProfile();
      
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Get current avatar configuration - use preview if hovering, otherwise use saved
  const displayAvatarId = previewAvatar || formData.avatar || profile?.avatar || 'avatar-1';
  const currentAvatar = AVATAR_OPTIONS.find(a => a.id === displayAvatarId) || AVATAR_OPTIONS[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 py-8 px-4 relative overflow-hidden">
      <ParticlesBackground />
      <div className="bg-white max-w-3xl mx-auto p-8 rounded-2xl shadow-lg border border-gray-200 relative z-10">
        <div className="flex flex-col items-center mb-8">
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-4 border-red-100 shadow-lg transition-all duration-200">
            <img 
              src={currentAvatar.url} 
              alt={currentAvatar.name} 
              className="w-full h-full object-cover"
            />
          </div>
          {isEditing && (
            <button
              type="button"
              onClick={() => {
                setShowAvatarPicker(!showAvatarPicker);
                if (!showAvatarPicker) setPreviewAvatar(null);
              }}
              className="absolute bottom-3 right-0 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-colors shadow-lg"
              title="Change Avatar"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
        </div>
        <h1 className="text-3xl font-bold text-gray-900">{profile.full_name}</h1>
        <span className="text-md text-gray-500 capitalize">{profile.role}</span>
        
        {!isEditing && (
          <button
            onClick={handleEdit}
            className="mt-4 flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            Edit Profile
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      {/* Avatar Picker Modal */}
      {showAvatarPicker && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border-2 border-red-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Choose Your Avatar</h3>
          <div className="grid grid-cols-6 gap-2">
            {AVATAR_OPTIONS.map((avatar) => {
              const isSelected = formData.avatar === avatar.id;
              return (
                <button
                  key={avatar.id}
                  type="button"
                  onMouseEnter={() => setPreviewAvatar(avatar.id)}
                  onMouseLeave={() => setPreviewAvatar(null)}
                  onClick={() => {
                    setFormData({ ...formData, avatar: avatar.id });
                    setShowAvatarPicker(false);
                    setPreviewAvatar(null);
                  }}
                  className={`relative rounded-lg transition-all overflow-hidden ${
                    isSelected 
                      ? 'ring-4 ring-red-500 scale-110' 
                      : 'hover:scale-110 opacity-80 hover:opacity-100 ring-2 ring-gray-200'
                  }`}
                  title={avatar.name}
                >
                  <img 
                    src={avatar.url} 
                    alt={avatar.name} 
                    className="w-full h-full object-cover"
                  />
                  {isSelected && (
                    <div className="absolute inset-0 bg-red-500 bg-opacity-20 flex items-center justify-center">
                      <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-gray-500 mt-3 text-center">Hover to preview • Click to select</p>
        </div>
      )}

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Age
              </label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1"
                max="150"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>

          {/* Doctor-specific fields */}
          {profile.role === 'doctor' && (
            <>
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specialization
                </label>
                <input
                  type="text"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    License Number
                  </label>
                  <input
                    type="text"
                    value={formData.license_number}
                    onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    value={formData.years_of_experience}
                    onChange={(e) => setFormData({ ...formData, years_of_experience: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Education
                </label>
                <textarea
                  value={formData.education}
                  onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                  placeholder="e.g., MD from Harvard Medical School"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Consultation Fee ($)
                </label>
                <input
                  type="number"
                  value={formData.consultation_fee}
                  onChange={(e) => setFormData({ ...formData, consultation_fee: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Tell patients about yourself..."
                />
              </div>
            </>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <Mail className="w-6 h-6 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium text-gray-900">{profile.email}</p>
            </div>
          </div>

          {profile.phone && (
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <Phone className="w-6 h-6 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium text-gray-900">{profile.phone}</p>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            {profile.age && (
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <Calendar className="w-6 h-6 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Age</p>
                  <p className="font-medium text-gray-900">{profile.age} years</p>
                </div>
              </div>
            )}

            {profile.gender && (
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <User className="w-6 h-6 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="font-medium text-gray-900 capitalize">{profile.gender}</p>
                </div>
              </div>
            )}
          </div>

          {profile.address && (
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <MapPin className="w-6 h-6 text-gray-500 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium text-gray-900">{profile.address}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <Shield className="w-6 h-6 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Role</p>
              <p className="font-medium text-gray-900 capitalize">{profile.role}</p>
            </div>
          </div>

          {/* Doctor-specific information */}
          {profile.role === 'doctor' && (
            <>
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h3>
              </div>

              {profile.specialization && (
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <Stethoscope className="w-6 h-6 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Specialization</p>
                    <p className="font-medium text-gray-900">{profile.specialization}</p>
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                {profile.license_number && (
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <Award className="w-6 h-6 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">License Number</p>
                      <p className="font-medium text-gray-900">{profile.license_number}</p>
                    </div>
                  </div>
                )}

                {profile.years_of_experience && (
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <Calendar className="w-6 h-6 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Experience</p>
                      <p className="font-medium text-gray-900">{profile.years_of_experience} years</p>
                    </div>
                  </div>
                )}
              </div>

              {profile.education && (
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <GraduationCap className="w-6 h-6 text-gray-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Education</p>
                    <p className="font-medium text-gray-900">{profile.education}</p>
                  </div>
                </div>
              )}

              {profile.consultation_fee && (
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <DollarSign className="w-6 h-6 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Consultation Fee</p>
                    <p className="font-medium text-gray-900">${profile.consultation_fee}</p>
                  </div>
                </div>
              )}

              {profile.bio && (
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <FileText className="w-6 h-6 text-gray-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Bio</p>
                    <p className="font-medium text-gray-900">{profile.bio}</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
      </div>
    </div>
  );
}
