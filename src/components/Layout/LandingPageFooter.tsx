import logo from "../../assets/logo.png";

export function LandingPageFooter() {
  return (
    <footer className="bg-[#81171b]/10 text-gray-800 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <img
              src={logo}
              alt="Medical HomeDoc Logo"
              className="w-12 h-12 object-contain"
            />
            <div>
              <div className="font-bold text-[#81171b]">MEDICAL HOMEDOC</div>
              <div className="text-sm text-gray-600">
                Accessible Healthcare for All
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-8 text-sm">
            <div>
              <h4 className="font-semibold text-[#81171b] mb-2">About</h4>
              <ul className="space-y-1">
                <li>
                  <a
                    href="#mission"
                    className="text-gray-600 hover:text-[#81171b] transition-colors duration-300"
                  >
                    Our Mission
                  </a>
                </li>
                <li>
                  <a
                    href="#how-it-works"
                    className="text-gray-600 hover:text-[#81171b] transition-colors duration-300"
                  >
                    How It Works
                  </a>
                </li>
                <li>
                  <a
                    href="#testimonials"
                    className="text-gray-600 hover:text-[#81171b] transition-colors duration-300"
                  >
                    Testimonials
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-[#81171b] mb-2">Legal</h4>
              <ul className="space-y-1">
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-[#81171b] transition-colors duration-300"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-[#81171b] transition-colors duration-300"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-[#81171b] transition-colors duration-300"
                  >
                    Medical Disclaimer
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-[#81171b] mb-2">Contact</h4>
              <ul className="space-y-1">
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-[#81171b] transition-colors duration-300"
                  >
                    Contact Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-[#81171b] transition-colors duration-300"
                  >
                    Support
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-[#81171b] transition-colors duration-300"
                  >
                    Feedback
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-[#81171b]/20 pt-6">
          <div className="text-center text-sm text-gray-600 mb-4">
            <p>
              <strong>Medical Disclaimer:</strong> HealthGuard AI provides
              health information for educational purposes only. This service
              does not provide medical advice, diagnosis, or treatment. Always
              consult a qualified healthcare professional for medical advice,
              diagnosis, and treatment. Never disregard professional medical
              advice or delay seeking it because of information provided by
              this service.
            </p>
          </div>
          <div className="text-center text-sm text-gray-600">
            <p>© 2025 Medical HomeDoc. A charitable health initiative.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
