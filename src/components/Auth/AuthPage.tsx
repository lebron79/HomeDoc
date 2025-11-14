import { useState } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { Heart, ArrowRight } from 'lucide-react';

export function AuthPage({ onBack }: { onBack: () => void }) {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <>
      {/* ------------------------------------------------- */}
      {/* 1. CSS: Animated + Fixed Red Border */}
      {/* ------------------------------------------------- */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes redBorder {
              0%   { stroke-dashoffset: 400; }
              100% { stroke-dashoffset: 0; }
            }
            .red-border-svg {
              position: absolute;
              inset: -4px;
              width: calc(100% + 8px);
              height: calc(100% + 8px);
              z-index: -1;
              pointer-events: none;
            }
            .red-border-rect {
              fill: none;
              stroke: #81171b;
              stroke-width: 3;
              stroke-dasharray: 400;
              stroke-dashoffset: 400;
              animation: redBorder 6s linear infinite;
              filter: drop-shadow(0 0 8px #81171b);
            }
            /* Fixed red border on the form card */
            .form-card {
              border: 3px solid #81171b;
              box-shadow: 0 0 12px rgba(129, 23, 27, .4);
            }
          `,
        }}
      />

      {/* ------------------------------------------------- */}
      {/* 2. Layout */}
      {/* ------------------------------------------------- */}
      <div className="min-h-screen flex flex-col lg:flex-row bg-[#03071e] text-white overflow-hidden">
        {/* LEFT – Branding */}
        <div className="flex-1 flex flex-col justify-center px-8 lg:px-16 xl:px-24 py-12 lg:py-16">
          <div className="max-w-2xl space-y-10">
            <div className="flex items-center gap-3">
              <Heart className="w-10 h-10 lg:w-12 lg:h-12 text-[#81171b]" />
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight">
                HomeDoc
              </h1>
            </div>
            <p className="text-base lg:text-lg text-gray-300 leading-relaxed pl-1">
              AI-powered medical diagnosis for everyone
            </p>

            <div className="flex items-center gap-4 mt-16">
              <div className="w-16 h-16 lg:w-20 lg:h-20 bg-[#81171b] rounded-2xl flex items-center justify-center shadow-xl flex-shrink-0">
                <ArrowRight className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
              </div>
              <div>
                <h2 className="text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                  Welcome Back
                </h2>
                <p className="text-lg lg:text-xl text-gray-400 mt-2 max-w-md">
                  Sign in to access your dashboard and continue
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT – Form */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12">
          <div className={`w-full space-y-6 transition-all duration-300 ${isLogin ? 'max-w-md' : 'max-w-3xl'}`}>
            {/* Tabs */}
            <div className="flex justify-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-full p-1 flex gap-1">
                <button
                  onClick={() => setIsLogin(true)}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                    isLogin
                      ? 'bg-white text-[#03071e] shadow-md'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setIsLogin(false)}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                    !isLogin
                      ? 'bg-white text-[#03071e] shadow-md'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Sign Up
                </button>
              </div>
            </div>

            {/* Form Card (Animated + Fixed Border) */}
            <div className="relative p-4">
              {/* Animated SVG border */}
              <svg className="red-border-svg" viewBox="0 0 100 100">
                <rect
                  x="2"
                  y="2"
                  width="96"
                  height="96"
                  rx="24"
                  ry="24"
                  className="red-border-rect"
                />
              </svg>

              {/* White card with fixed red border */}
              <div className="relative bg-white rounded-3xl shadow-2xl p-8 lg:p-10 text-[#03071e] z-10 form-card max-h-[85vh] overflow-y-auto">
                {isLogin ? <LoginForm onBack={onBack} /> : <RegisterForm onBack={onBack} />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}