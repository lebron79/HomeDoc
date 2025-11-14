import { useState } from 'react';
import { Search, Pill, AlertCircle, Loader2, Filter, ChevronDown, ChevronUp, Package, Activity, Shield, Info, List, Heart, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

interface Medication {
  id: number;
  brandName: string;
  genericName: string;
  manufacturer: string;
  dosageForm: string;
  route: string;
  indications: string;
  warnings: string;
  dosage: string;
  activeIngredient: string;
  productType: string;
  category: string;
}

interface FDAResult {
  openfda?: {
    brand_name?: string[];
    generic_name?: string[];
    manufacturer_name?: string[];
    dosage_form?: string[];
    route?: string[];
    product_type?: string[];
    pharm_class_epc?: string[];
  };
  indications_and_usage?: string[];
  warnings?: string[];
  dosage_and_administration?: string[];
  active_ingredient?: string[];
}

interface FDAResponse {
  results?: FDAResult[];
}

// Footer Component
function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-300">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">HomeDoc</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your trusted healthcare companion. Providing quality medical information and connecting patients with healthcare professionals.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="p-2 bg-gray-800 hover:bg-red-600 rounded-lg transition-all transform hover:scale-110"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2 bg-gray-800 hover:bg-red-600 rounded-lg transition-all transform hover:scale-110"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2 bg-gray-800 hover:bg-red-600 rounded-lg transition-all transform hover:scale-110"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2 bg-gray-800 hover:bg-red-600 rounded-lg transition-all transform hover:scale-110"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <a href="/" className="text-gray-400 hover:text-red-500 transition-colors text-sm flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Home
                </a>
              </li>
              <li>
                <a href="/about" className="text-gray-400 hover:text-red-500 transition-colors text-sm flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  About Us
                </a>
              </li>
              <li>
                <a href="/services" className="text-gray-400 hover:text-red-500 transition-colors text-sm flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Services
                </a>
              </li>
              <li>
                <a href="/medications" className="text-gray-400 hover:text-red-500 transition-colors text-sm flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Medications
                </a>
              </li>
              <li>
                <a href="/contact" className="text-gray-400 hover:text-red-500 transition-colors text-sm flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Our Services</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-400 hover:text-red-500 transition-colors text-sm flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Symptom Checker
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-red-500 transition-colors text-sm flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Doctor Consultation
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-red-500 transition-colors text-sm flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Health Records
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-red-500 transition-colors text-sm flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Prescription Management
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-red-500 transition-colors text-sm flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Emergency Support
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm">
                <MapPin className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400">
                  123 Healthcare Ave<br />
                  Medical District<br />
                  New York, NY 10001
                </span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Phone className="w-5 h-5 text-red-500 flex-shrink-0" />
                <a href="tel:+1234567890" className="text-gray-400 hover:text-red-500 transition-colors">
                  +1 (234) 567-890
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Mail className="w-5 h-5 text-red-500 flex-shrink-0" />
                <a href="mailto:info@homedoc.com" className="text-gray-400 hover:text-red-500 transition-colors">
                  info@homedoc.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 my-8"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm text-center md:text-left">
            © {currentYear} HomeDoc. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <a href="#" className="text-gray-400 hover:text-red-500 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-400 hover:text-red-500 transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-gray-400 hover:text-red-500 transition-colors">
              Cookie Policy
            </a>
            <a href="#" className="text-gray-400 hover:text-red-500 transition-colors">
              Sitemap
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Accent */}
      <div className="h-1 bg-gradient-to-r from-red-500 via-rose-500 to-pink-500"></div>
    </footer>
  );
}

export default function MedicationsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedMed, setExpandedMed] = useState<number | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchMode, setSearchMode] = useState<'search' | 'browse'>('search');

  const categories = [
    { value: 'all', label: 'All Medications', icon: Package },
    { value: 'analgesic', label: 'Pain Relief', icon: Activity },
    { value: 'antibiotic', label: 'Antibiotics', icon: Shield },
    { value: 'cardiovascular', label: 'Cardiovascular', icon: Activity },
    { value: 'diabetes', label: 'Diabetes', icon: Activity },
    { value: 'respiratory', label: 'Respiratory', icon: Activity },
    { value: 'gastrointestinal', label: 'Digestive', icon: Package },
    { value: 'antihistamine', label: 'Allergy', icon: Shield },
  ];

  const determineCategory = (med: FDAResult): string => {
    const indications = med.indications_and_usage?.[0]?.toLowerCase() || '';
    const pharmClass = med.openfda?.pharm_class_epc?.join(' ').toLowerCase() || '';
    const genericName = med.openfda?.generic_name?.[0]?.toLowerCase() || '';
    const combined = `${indications} ${pharmClass} ${genericName}`;

    if (combined.match(/analgesic|pain|nsaid|acetaminophen|ibuprofen|aspirin|naproxen/i)) {
      return 'analgesic';
    }
    if (combined.match(/antibiotic|antimicrobial|bacterial|infection|penicillin|cephalosporin|amoxicillin/i)) {
      return 'antibiotic';
    }
    if (combined.match(/cardiovascular|heart|blood pressure|hypertension|cholesterol|statin|cardiac|angina/i)) {
      return 'cardiovascular';
    }
    if (combined.match(/diabetes|diabetic|glucose|insulin|metformin|glycemic/i)) {
      return 'diabetes';
    }
    if (combined.match(/respiratory|asthma|copd|bronch|inhaler|breathing|cough|pulmonary/i)) {
      return 'respiratory';
    }
    if (combined.match(/gastrointestinal|stomach|digest|acid|reflux|ulcer|nausea|diarrhea|constipation/i)) {
      return 'gastrointestinal';
    }
    if (combined.match(/antihistamine|allergy|allergic|histamine|cetirizine|loratadine/i)) {
      return 'antihistamine';
    }

    return 'other';
  };

  const searchMedications = async () => {
    if (!searchTerm.trim()) {
      setError('Please enter a medication name');
      return;
    }

    setLoading(true);
    setError('');
    setHasSearched(true);
    setSearchMode('search');

    try {
      // Try multiple search strategies
      let response = await fetch(
        `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${searchTerm}"&limit=20`
      );

      // If exact brand name fails, try partial match
      if (!response.ok) {
        response = await fetch(
          `https://api.fda.gov/drug/label.json?search=openfda.brand_name:${searchTerm}*&limit=20`
        );
      }

      // If still fails, try generic name
      if (!response.ok) {
        response = await fetch(
          `https://api.fda.gov/drug/label.json?search=openfda.generic_name:${searchTerm}*&limit=20`
        );
      }

      if (!response.ok) {
        throw new Error('Failed to fetch medications');
      }

      const data: FDAResponse = await response.json();

      if (data.results && data.results.length > 0) {
        const formattedMeds: Medication[] = data.results.map((med: FDAResult, index: number) => ({
          id: index,
          brandName: med.openfda?.brand_name?.[0] || 'N/A',
          genericName: med.openfda?.generic_name?.[0] || 'N/A',
          manufacturer: med.openfda?.manufacturer_name?.[0] || 'N/A',
          dosageForm: med.openfda?.dosage_form?.[0] || 'N/A',
          route: med.openfda?.route?.[0] || 'N/A',
          indications: med.indications_and_usage?.[0] || 'No information available',
          warnings: med.warnings?.[0] || 'No warnings available',
          dosage: med.dosage_and_administration?.[0] || 'No dosage information available',
          activeIngredient: med.active_ingredient?.[0] || 'N/A',
          productType: med.openfda?.product_type?.[0] || 'N/A',
          category: determineCategory(med),
        }));
        setMedications(formattedMeds);
      } else {
        setMedications([]);
        setError('No medications found. Try a different search term.');
      }
    } catch (err) {
      setError('Error fetching medications. Please try again with a different term.');
      console.error('Error:', err);
      setMedications([]);
    } finally {
      setLoading(false);
    }
  };

  const browseMedications = async () => {
    setLoading(true);
    setError('');
    setHasSearched(true);
    setSearchMode('browse');

    try {
      const response = await fetch(
        'https://api.fda.gov/drug/label.json?limit=50'
      );

      if (!response.ok) {
        throw new Error('Failed to fetch medications');
      }

      const data: FDAResponse = await response.json();

      if (data.results && data.results.length > 0) {
        const formattedMeds: Medication[] = data.results.map((med: FDAResult, index: number) => ({
          id: index,
          brandName: med.openfda?.brand_name?.[0] || 'N/A',
          genericName: med.openfda?.generic_name?.[0] || 'N/A',
          manufacturer: med.openfda?.manufacturer_name?.[0] || 'N/A',
          dosageForm: med.openfda?.dosage_form?.[0] || 'N/A',
          route: med.openfda?.route?.[0] || 'N/A',
          indications: med.indications_and_usage?.[0] || 'No information available',
          warnings: med.warnings?.[0] || 'No warnings available',
          dosage: med.dosage_and_administration?.[0] || 'No dosage information available',
          activeIngredient: med.active_ingredient?.[0] || 'N/A',
          productType: med.openfda?.product_type?.[0] || 'N/A',
          category: determineCategory(med),
        }));
        setMedications(formattedMeds);
      }
    } catch (err) {
      setError('Error fetching medications. Please try again.');
      console.error('Error:', err);
      setMedications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      searchMedications();
    }
  };

  const filteredMedications = medications.filter((med: Medication) => {
    if (selectedCategory === 'all') return true;
    return med.category === selectedCategory;
  });

  const toggleExpanded = (id: number) => {
    setExpandedMed(expandedMed === id ? null : id);
  };

  const truncateText = (text: string, maxLength: number = 200) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getCategoryBadgeColor = (category: string) => {
    const colors: Record<string, string> = {
      analgesic: 'bg-rose-100 text-rose-700 border-rose-200',
      antibiotic: 'bg-red-100 text-red-700 border-red-200',
      cardiovascular: 'bg-pink-100 text-pink-700 border-pink-200',
      diabetes: 'bg-orange-100 text-orange-700 border-orange-200',
      respiratory: 'bg-amber-100 text-amber-700 border-amber-200',
      gastrointestinal: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      antihistamine: 'bg-red-100 text-red-700 border-red-200',
      other: 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return colors[category] || colors.other;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-red-50 via-rose-50 to-pink-50">
      <div className="flex-grow">
        {/* Header */}
        <div className="bg-white shadow-lg border-b border-red-100">
          <div className="max-w-7xl mx-auto px-6 py-10">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl shadow-lg">
                <Pill className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                  Medications Database
                </h1>
                <p className="text-gray-600 mt-1">Search FDA-approved medications and view detailed information</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Search Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-red-100">
            <div className="flex gap-3 mb-6">
              <button
                onClick={() => setSearchMode('search')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                  searchMode === 'search'
                    ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Search className="w-4 h-4" />
                Search
              </button>
              <button
                onClick={() => setSearchMode('browse')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                  searchMode === 'browse'
                    ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <List className="w-4 h-4" />
                Browse
              </button>
            </div>

            {searchMode === 'search' ? (
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Search Medication
                  </label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Try: Aspirin, Tylenol, Lipitor, Advil..."
                      className="w-full pl-12 pr-4 py-4 border-2 border-red-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-gray-900 placeholder-gray-400"
                    />
                  </div>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={searchMedications}
                    disabled={loading}
                    className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl hover:from-red-600 hover:to-rose-700 transition-all disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-3 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="w-5 h-5" />
                        Search
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-gray-600 mb-4">Browse through a curated list of FDA-approved medications</p>
                <button
                  onClick={browseMedications}
                  disabled={loading}
                  className="px-8 py-4 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl hover:from-red-600 hover:to-rose-700 transition-all disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed inline-flex items-center justify-center gap-3 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <List className="w-5 h-5" />
                      Browse Medications
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Category Filter */}
            {medications.length > 0 && (
              <div className="mt-8 pt-8 border-t border-red-100">
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="w-5 h-5 text-red-600" />
                  <span className="text-sm font-semibold text-gray-800">Filter by Category</span>
                  <span className="ml-auto text-sm text-gray-500">
                    {filteredMedications.length} of {medications.length} medications
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                  {categories.map(category => {
                    const Icon = category.icon;
                    const count = medications.filter(m => category.value === 'all' || m.category === category.value).length;
                    return (
                      <button
                        key={category.value}
                        onClick={() => setSelectedCategory(category.value)}
                        className={`relative px-4 py-3 rounded-xl text-sm font-medium transition-all border-2 ${
                          selectedCategory === category.value
                            ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white border-red-500 shadow-lg transform scale-105'
                            : 'bg-white text-gray-700 border-red-200 hover:border-red-300 hover:shadow-md'
                        }`}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <Icon className="w-4 h-4" />
                          <span className="text-xs">{category.label}</span>
                          {count > 0 && (
                            <span className={`text-xs font-bold ${
                              selectedCategory === category.value ? 'text-red-100' : 'text-gray-500'
                            }`}>
                              ({count})
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-5 mb-6 flex items-start gap-3 shadow-md">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          )}

          {/* Empty States */}
          {hasSearched && !loading && medications.length === 0 && !error && (
            <div className="bg-white border-2 border-red-200 rounded-2xl p-12 text-center shadow-lg">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Pill className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Results Found</h3>
              <p className="text-gray-600">Try searching with a different medication name or browse medications</p>
            </div>
          )}

          {!hasSearched && !loading && (
            <div className="bg-gradient-to-br from-red-100 via-rose-100 to-pink-100 rounded-2xl p-12 text-center shadow-lg border-2 border-red-200">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
                <Pill className="w-12 h-12 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Start Your Search or Browse</h3>
              <p className="text-gray-700 text-lg max-w-md mx-auto">
                Search for specific medications or browse through the comprehensive FDA database
              </p>
            </div>
          )}

          {/* Medication Cards */}
          <div className="grid gap-6">
            {filteredMedications.map((med: Medication) => (
              <div
                key={med.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden border-2 border-red-100 hover:border-red-200 transform hover:-translate-y-1"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 p-6 text-white">
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <h3 className="text-3xl font-bold truncate">{med.brandName}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border-2 ${getCategoryBadgeColor(med.category)}`}>
                          {categories.find(c => c.value === med.category)?.label || 'Other'}
                        </span>
                      </div>
                      <p className="text-red-100 font-medium">
                        <span className="text-red-200 text-sm">Generic:</span> {med.genericName}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-sm font-semibold border border-white/30">
                        {med.productType}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Basic Info Grid */}
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-5 border border-red-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="w-4 h-4 text-red-600" />
                        <p className="text-xs font-bold text-red-900 uppercase tracking-wide">Manufacturer</p>
                      </div>
                      <p className="text-gray-900 font-semibold text-sm">{med.manufacturer}</p>
                    </div>
                    <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-5 border border-rose-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Pill className="w-4 h-4 text-rose-600" />
                        <p className="text-xs font-bold text-rose-900 uppercase tracking-wide">Dosage Form</p>
                      </div>
                      <p className="text-gray-900 font-semibold text-sm">{med.dosageForm}</p>
                    </div>
                    <div className="bg-gradient-to-br from-pink-50 to-red-50 rounded-xl p-5 border border-pink-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="w-4 h-4 text-pink-600" />
                        <p className="text-xs font-bold text-pink-900 uppercase tracking-wide">Route</p>
                      </div>
                      <p className="text-gray-900 font-semibold text-sm">{med.route}</p>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-5 border border-orange-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Info className="w-4 h-4 text-orange-600" />
                        <p className="text-xs font-bold text-orange-900 uppercase tracking-wide">Active Ingredient</p>
                      </div>
                      <p className="text-gray-900 font-semibold text-sm">{med.activeIngredient}</p>
                    </div>
                  </div>

                  {/* Detailed Information */}
                  <div className="space-y-5">
                    <div className="border-t-2 border-red-100 pt-5">
                      <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-lg">
                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                          <Info className="w-4 h-4 text-red-600" />
                        </div>
                        Indications and Usage
                      </h4>
                      <p className="text-gray-700 leading-relaxed text-sm bg-gray-50 p-4 rounded-lg">
                        {expandedMed === med.id 
                          ? med.indications 
                          : truncateText(med.indications)
                        }
                      </p>
                    </div>

                    {expandedMed === med.id && (
                      <>
                        <div className="border-t-2 border-red-100 pt-5">
                          <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-lg">
                            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                              <AlertCircle className="w-4 h-4 text-orange-600" />
                            </div>
                            Warnings & Precautions
                          </h4>
                          <p className="text-gray-700 leading-relaxed text-sm bg-orange-50 p-4 rounded-lg border border-orange-200">
                            {med.warnings}
                          </p>
                        </div>

                        <div className="border-t-2 border-red-100 pt-5">
                          <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-lg">
                            <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center">
                              <Activity className="w-4 h-4 text-rose-600" />
                            </div>
                            Dosage and Administration
                          </h4>
                          <p className="text-gray-700 leading-relaxed text-sm bg-rose-50 p-4 rounded-lg border border-rose-200">
                            {med.dosage}
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Expand/Collapse Button */}
                  <button
                    onClick={() => toggleExpanded(med.id)}
                    className="mt-6 w-full py-3 px-4 bg-gradient-to-r from-gray-50 to-red-50 hover:from-red-50 hover:to-rose-50 border-2 border-red-200 hover:border-red-300 rounded-xl transition-all flex items-center justify-center gap-2 text-gray-700 hover:text-red-700 font-semibold"
                  >
                    {expandedMed === med.id ? (
                      <>
                        <ChevronUp className="w-5 h-5" />
                        Show Less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-5 h-5" />
                        Show Complete Details
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredMedications.length > 0 && (
            <div className="mt-8 mb-8 text-center">
              <div className="inline-block bg-white px-6 py-3 rounded-full shadow-md border-2 border-red-200">
                <p className="text-sm font-semibold text-gray-700">
                  Showing <span className="text-red-600">{filteredMedications.length}</span> medication{filteredMedications.length !== 1 ? 's' : ''}
                  {selectedCategory !== 'all' && (
                    <span className="text-gray-500"> in {categories.find(c => c.value === selectedCategory)?.label}</span>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}