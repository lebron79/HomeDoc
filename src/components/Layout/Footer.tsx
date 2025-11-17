import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Shield, Clock, Award } from 'lucide-react';
import logo from '../../assets/logo.png';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 border-t-4 border-red-200">
      {/* Main Footer Content - 4 Columns */}
      <div className="w-full py-12 px-6 md:px-12 lg:px-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img src={logo} alt="HomeDoc Logo" className="w-20 h-20 object-contain" />
              <span className="text-2xl font-bold text-gray-900">HomeDoc</span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Your trusted healthcare companion. Providing quality medical information 24/7.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-3 pt-2">
              <a
                href="#"
                className="p-2 bg-gray-100 hover:bg-red-500 hover:text-white text-gray-600 rounded-lg transition-all transform hover:scale-110"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2 bg-gray-100 hover:bg-red-500 hover:text-white text-gray-600 rounded-lg transition-all transform hover:scale-110"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2 bg-gray-100 hover:bg-red-500 hover:text-white text-gray-600 rounded-lg transition-all transform hover:scale-110"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2 bg-gray-100 hover:bg-red-500 hover:text-white text-gray-600 rounded-lg transition-all transform hover:scale-110"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-gray-900 font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-gray-600 hover:text-red-500 transition-colors text-sm">
                  Home
                </a>
              </li>
              <li>
                <a href="/about" className="text-gray-600 hover:text-red-500 transition-colors text-sm">
                  About Us
                </a>
              </li>
              <li>
                <a href="/services" className="text-gray-600 hover:text-red-500 transition-colors text-sm">
                  Services
                </a>
              </li>
              <li>
                <a href="/medications" className="text-gray-600 hover:text-red-500 transition-colors text-sm">
                  Medications
                </a>
              </li>
              <li>
                <a href="/contact" className="text-gray-600 hover:text-red-500 transition-colors text-sm">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-gray-900 font-bold text-lg mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-600 hover:text-red-500 transition-colors text-sm">
                  Health Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-red-500 transition-colors text-sm">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-red-500 transition-colors text-sm">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-red-500 transition-colors text-sm">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-red-500 transition-colors text-sm">
                  Careers
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-gray-900 font-bold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm">
                <MapPin className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-600">
                  123 Healthcare Ave<br />
                  New York, NY 10001
                </span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-red-500 flex-shrink-0" />
                <a href="tel:+1234567890" className="text-gray-600 hover:text-red-500 transition-colors">
                  +1 (234) 567-890
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-red-500 flex-shrink-0" />
                <a href="mailto:support@homedoc.com" className="text-gray-600 hover:text-red-500 transition-colors">
                  support@homedoc.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-600 text-sm">
              © {currentYear} HomeDoc. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Shield className="w-4 h-4 text-red-500" />
                HIPAA Compliant
              </span>
              <span className="flex items-center gap-1">
                <Award className="w-4 h-4 text-red-500" />
                Certified Doctors
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-red-500" />
                24/7 Support
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Accent */}
      <div className="h-1 bg-gradient-to-r from-red-500 via-rose-500 to-pink-500"></div>
    </footer>
  );
}
