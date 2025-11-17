import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AlertCircle, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';

export function RegisterForm({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  const [specialization, setSpecialization] = useState('');
  const [age, setAge] = useState<number | undefined>(undefined);
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [address, setAddress] = useState('');
  // Doctor-specific fields
  const [licenseNumber, setLicenseNumber] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState<number | undefined>(undefined);
  const [education, setEducation] = useState('');
  const [bio, setBio] = useState('');
  const [consultationFee, setConsultationFee] = useState<number | undefined>(undefined);
  const [error, setError] = useState('');
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signUp(
        email,
        password,
        fullName,
        role,
        // Patient fields
        role === 'patient' ? age : undefined,
        role === 'patient' ? phone : undefined,
        role === 'patient' ? gender : undefined,
        role === 'patient' ? address : undefined,
        // Doctor fields
        role === 'doctor' ? specialization : undefined,
        role === 'doctor' ? licenseNumber : undefined,
        role === 'doctor' ? yearsOfExperience : undefined,
        role === 'doctor' ? education : undefined,
        role === 'doctor' ? bio : undefined,
        role === 'doctor' ? consultationFee : undefined,
        role === 'doctor' ? phone : undefined
      );
      setShowVerifyModal(true);
    } catch (err: any) {
      setError(err.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Verify Email Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-sm w-full text-center relative">
            <CheckCircle className="mx-auto mb-4 text-green-600 w-10 h-10" />
            <h2 className="text-xl font-bold mb-2">Verify your email</h2>
            <p className="mb-4 text-gray-700">We've sent a verification link to your email address. Please check your inbox and verify your account to continue.</p>
            <button
              className="bg-[#81171b] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#03071e] transition"
              onClick={() => setShowVerifyModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
      {/* Back Button */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-gray-700 hover:text-[#81171b] transition mb-4"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Landing Page
      </button>

      {/* Basic Information - 2 Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#81171b] focus:border-transparent outline-none transition"
            placeholder="John Doe"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#81171b] focus:border-transparent outline-none transition"
            placeholder="you@example.com"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#81171b] focus:border-transparent outline-none transition"
            placeholder="••••••••"
          />
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">I am a</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as 'patient' | 'doctor')}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#81171b] focus:border-transparent outline-none transition cursor-pointer"
          >
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
          </select>
        </div>
      </div>

      {/* Patient-specific fields */}
      {role === 'patient' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Age */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Age</label>
            <input
              type="number"
              value={age ?? ''}
              onChange={(e) => setAge(parseInt(e.target.value) || undefined)}
              required
              min={1}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#81171b] focus:border-transparent outline-none transition"
              placeholder="e.g., 30"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#81171b] focus:border-transparent outline-none transition"
              placeholder="e.g., +1 (123) 456-7890"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#81171b] focus:border-transparent outline-none transition cursor-pointer"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Address - Full Width */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#81171b] focus:border-transparent outline-none transition"
              placeholder="e.g., 123 Main St, City, State, ZIP"
            />
          </div>
        </div>
      )}

      {/* Doctor-specific fields */}
      {role === 'doctor' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Specialization - Full Width */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Medical Specialization</label>
            <select
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#81171b] focus:border-transparent outline-none transition cursor-pointer"
            >
              <option value="">Select Specialization</option>
              
              {/* Primary Care */}
              <optgroup label="Primary Care">
                <option value="General Practice">General Practice</option>
                <option value="Family Medicine">Family Medicine</option>
                <option value="Internal Medicine">Internal Medicine</option>
                <option value="Pediatrics">Pediatrics</option>
              </optgroup>

              {/* Surgical Specialties */}
              <optgroup label="Surgical Specialties">
                <option value="General Surgery">General Surgery</option>
                <option value="Cardiothoracic Surgery">Cardiothoracic Surgery</option>
                <option value="Neurosurgery">Neurosurgery</option>
                <option value="Orthopedic Surgery">Orthopedic Surgery</option>
                <option value="Plastic Surgery">Plastic Surgery</option>
                <option value="Vascular Surgery">Vascular Surgery</option>
                <option value="Trauma Surgery">Trauma Surgery</option>
                <option value="Pediatric Surgery">Pediatric Surgery</option>
              </optgroup>

              {/* Medical Specialties */}
              <optgroup label="Medical Specialties">
                <option value="Cardiology">Cardiology</option>
                <option value="Dermatology">Dermatology</option>
                <option value="Endocrinology">Endocrinology</option>
                <option value="Gastroenterology">Gastroenterology</option>
                <option value="Hematology">Hematology</option>
                <option value="Infectious Disease">Infectious Disease</option>
                <option value="Nephrology">Nephrology</option>
                <option value="Neurology">Neurology</option>
                <option value="Oncology">Oncology</option>
                <option value="Pulmonology">Pulmonology</option>
                <option value="Rheumatology">Rheumatology</option>
              </optgroup>

              {/* Women's Health */}
              <optgroup label="Women's Health">
                <option value="Obstetrics and Gynecology">Obstetrics and Gynecology (OB/GYN)</option>
                <option value="Maternal-Fetal Medicine">Maternal-Fetal Medicine</option>
                <option value="Reproductive Endocrinology">Reproductive Endocrinology</option>
              </optgroup>

              {/* Mental Health */}
              <optgroup label="Mental Health">
                <option value="Psychiatry">Psychiatry</option>
                <option value="Child Psychiatry">Child and Adolescent Psychiatry</option>
                <option value="Addiction Medicine">Addiction Medicine</option>
              </optgroup>

              {/* Diagnostic Specialties */}
              <optgroup label="Diagnostic Specialties">
                <option value="Radiology">Radiology</option>
                <option value="Pathology">Pathology</option>
                <option value="Nuclear Medicine">Nuclear Medicine</option>
              </optgroup>

              {/* Emergency & Critical Care */}
              <optgroup label="Emergency & Critical Care">
                <option value="Emergency Medicine">Emergency Medicine</option>
                <option value="Critical Care Medicine">Critical Care Medicine</option>
                <option value="Anesthesiology">Anesthesiology</option>
              </optgroup>

              {/* Specialized Care */}
              <optgroup label="Specialized Care">
                <option value="Allergy and Immunology">Allergy and Immunology</option>
                <option value="Geriatrics">Geriatrics</option>
                <option value="Palliative Care">Palliative Care</option>
                <option value="Pain Management">Pain Management</option>
                <option value="Sports Medicine">Sports Medicine</option>
                <option value="Sleep Medicine">Sleep Medicine</option>
              </optgroup>

              {/* Eye, Ear, Nose, Throat */}
              <optgroup label="ENT & Ophthalmology">
                <option value="Ophthalmology">Ophthalmology</option>
                <option value="Otolaryngology">Otolaryngology (ENT)</option>
              </optgroup>

              {/* Urology & Reproductive */}
              <optgroup label="Urology & Reproductive Health">
                <option value="Urology">Urology</option>
                <option value="Andrology">Andrology</option>
              </optgroup>

              {/* Other Specialties */}
              <optgroup label="Other Specialties">
                <option value="Physical Medicine and Rehabilitation">Physical Medicine and Rehabilitation</option>
                <option value="Occupational Medicine">Occupational Medicine</option>
                <option value="Preventive Medicine">Preventive Medicine</option>
                <option value="Public Health">Public Health</option>
              </optgroup>
            </select>
          </div>

          {/* License Number */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">License Number</label>
            <input
              type="text"
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#81171b] focus:border-transparent outline-none transition"
              placeholder="e.g., MD-12345"
            />
          </div>

          {/* Years of Experience */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Years of Experience</label>
            <input
              type="number"
              value={yearsOfExperience ?? ''}
              onChange={(e) => setYearsOfExperience(parseInt(e.target.value) || undefined)}
              required
              min={0}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#81171b] focus:border-transparent outline-none transition"
              placeholder="e.g., 5"
            />
          </div>

          {/* Education */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Education</label>
            <input
              type="text"
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#81171b] focus:border-transparent outline-none transition"
              placeholder="e.g., MD from Harvard Medical School"
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#81171b] focus:border-transparent outline-none transition"
              placeholder="e.g., +1 (123) 456-7890"
            />
          </div>

          {/* Consultation Fee */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Consultation Fee ($)</label>
            <input
              type="number"
              value={consultationFee ?? ''}
              onChange={(e) => setConsultationFee(parseFloat(e.target.value) || undefined)}
              required
              min={0}
              step="0.01"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#81171b] focus:border-transparent outline-none transition"
              placeholder="e.g., 100.00"
            />
          </div>

          {/* Bio - Full Width */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Professional Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              required
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#81171b] focus:border-transparent outline-none transition resize-none"
              placeholder="Tell patients about yourself, your experience, and areas of expertise..."
            />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Success (hidden, handled by modal) */}
      {/* {success && (
        <div className="flex gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )} */}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#03071e] text-white py-3.5 rounded-xl hover:bg-[#81171b] transition flex items-center justify-center gap-2 font-semibold text-lg disabled:opacity-60"
      >
        {loading ? 'Creating account...' : <>Create Account <ArrowRight className="w-5 h-5" /></>}
      </button>
      </form>
    </>
  );
}