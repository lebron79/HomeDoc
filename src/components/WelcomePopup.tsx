import { useState, useEffect } from "react";
import {
  X,
  Brain,
  MessageSquare,
  ShoppingBag,
  Stethoscope,
  Sparkles,
  ArrowRight,
  Heart,
  Shield,
  Clock,
} from "lucide-react";

interface WelcomePopupProps {
  onGetStarted: () => void;
}

export function WelcomePopup({ onGetStarted }: WelcomePopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    // Check if user has seen the popup in this session
    const hasSeenPopup = sessionStorage.getItem("hasSeenWelcomePopup");
    if (!hasSeenPopup) {
      // Show popup after a short delay for better UX
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem("hasSeenWelcomePopup", "true");
  };

  const handleGetStarted = () => {
    handleClose();
    onGetStarted();
  };

  const features = [
    {
      icon: Brain,
      title: "AI Disease Prediction",
      description: "Get instant health insights powered by advanced machine learning",
      color: "from-purple-500 to-indigo-600",
      bgColor: "bg-purple-100",
    },
    {
      icon: MessageSquare,
      title: "Chat with Doctors",
      description: "Connect directly with certified healthcare professionals",
      color: "from-blue-500 to-cyan-600",
      bgColor: "bg-blue-100",
    },
    {
      icon: ShoppingBag,
      title: "Medication Store",
      description: "Order prescribed medications delivered to your doorstep",
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-green-100",
    },
    {
      icon: Stethoscope,
      title: "Health Assessment",
      description: "Comprehensive health evaluations tailored to your needs",
      color: "from-red-500 to-rose-600",
      bgColor: "bg-red-100",
    },
  ];

  const stats = [
    { icon: Heart, value: "10K+", label: "Happy Patients" },
    { icon: Shield, value: "100%", label: "Secure & Private" },
    { icon: Clock, value: "24/7", label: "Available" },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn"
        onClick={handleClose}
      />

      {/* Popup Container */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-popupSlide">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white text-gray-600 hover:text-gray-900 transition-all shadow-lg hover:scale-110"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with gradient */}
        <div className="relative bg-gradient-to-br from-[#81171b] via-red-600 to-rose-500 px-8 pt-10 pb-16 text-white overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-pulse" />
            <div className="absolute top-20 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse delay-300" />
            <div className="absolute -bottom-10 left-1/2 w-48 h-48 bg-white/5 rounded-full blur-3xl animate-pulse delay-700" />
          </div>

          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-6 h-6 animate-pulse" />
              <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                Welcome to HomeDoc
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Your Health, Our Priority
            </h2>
            <p className="text-white/90 text-lg">
              Discover smart healthcare solutions at your fingertips
            </p>
          </div>
        </div>

        {/* Wave separator */}
        <div className="relative -mt-8">
          <svg
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            className="w-full h-8 fill-white"
          >
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C57.1,118.92,143.89,111.31,221.21,89.14c35.59-10.19,68.89-24.28,100.18-32.7Z"></path>
          </svg>
        </div>

        {/* Content */}
        <div className="px-8 pb-8 -mt-4">
          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-4 rounded-2xl border-2 border-gray-100 hover:border-transparent hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1"
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                <div
                  className={`w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon
                    className={`w-6 h-6 bg-gradient-to-r ${feature.color} bg-clip-text`}
                    style={{
                      color: feature.color.includes("purple")
                        ? "#8b5cf6"
                        : feature.color.includes("blue")
                        ? "#3b82f6"
                        : feature.color.includes("green")
                        ? "#10b981"
                        : "#ef4444",
                    }}
                  />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 text-sm md:text-base">
                  {feature.title}
                </h3>
                <p className="text-gray-500 text-xs md:text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-8 mb-6 py-4 bg-gradient-to-r from-gray-50 via-red-50 to-gray-50 rounded-2xl">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <stat.icon className="w-4 h-4 text-[#81171b]" />
                  <span className="text-xl md:text-2xl font-bold text-gray-900">
                    {stat.value}
                  </span>
                </div>
                <span className="text-xs text-gray-500">{stat.label}</span>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <button
            onClick={handleGetStarted}
            className="w-full bg-gradient-to-r from-[#81171b] to-red-600 text-white py-4 rounded-2xl font-semibold text-lg hover:from-[#81171b]/90 hover:to-red-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
          >
            Get Started Now
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <p className="text-center text-gray-400 text-sm mt-4">
            Free to start • No credit card required
          </p>
        </div>
      </div>

      {/* CSS for animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes popupSlide {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        
        .animate-popupSlide {
          animation: popupSlide 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
