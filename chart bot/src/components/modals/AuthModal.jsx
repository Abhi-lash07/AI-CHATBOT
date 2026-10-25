import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import {
  Sparkles,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  X,
  ArrowRight,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';

export function AuthModal() {
  const {
    authModalOpen,
    setAuthModalOpen,
    authMode,
    setAuthMode,
    authLoading,
    loginUser,
    registerUser,
    forgotPassword,
    resetPassword,
    showToast,
  } = useChat();

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: enter email, 2: enter code & new pass

  if (!authModalOpen) return null;

  const handleClose = () => {
    setAuthModalOpen(false);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      showToast('Please enter your email and password.', 'error');
      return;
    }
    await loginUser(email.trim(), password);
  };

  const handleDemoSignIn = async () => {
    setEmail('explorer@chatbot.ai');
    setPassword('password123');
    await loginUser('explorer@chatbot.ai', 'password123');
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }
    if (password.length < 6) {
      showToast('Password must be at least 6 characters long.', 'error');
      return;
    }
    if (password !== confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }
    await registerUser(name.trim(), email.trim(), password);
  };

  const handleRequestResetCode = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      showToast('Please enter your account email.', 'error');
      return;
    }
    const res = await forgotPassword(email.trim());
    if (res.success) {
      setForgotStep(2);
      if (res.resetCode) {
        setResetCode(res.resetCode);
      }
    }
  };

  const handleConfirmResetPassword = async (e) => {
    e.preventDefault();
    if (!resetCode.trim() || !newPassword) {
      showToast('Please enter the reset code and new password.', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters long.', 'error');
      return;
    }
    const res = await resetPassword(email.trim(), resetCode.trim(), newPassword);
    if (res.success) {
      setForgotStep(1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in font-sans">
      <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#293247] rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-slide-up relative">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-[#64748B] hover:text-[#111827] dark:text-[#9CA3AF] dark:hover:text-[#F3F4F6] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Banner & Logo */}
        <div className="p-6 pb-4 border-b border-[#E2E8F0] dark:border-[#293247] bg-[#F8FAFC]/50 dark:bg-[#0B1020]/40">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#818CF8] via-[#A78BFA] to-[#C084FC] p-[1.5px] shadow-sm">
              <div className="w-full h-full bg-white dark:bg-[#0B1020] rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#818CF8]" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#111827] dark:text-[#F3F4F6]">
                {authMode === 'login'
                  ? 'Sign in to ChatBot AI'
                  : authMode === 'register'
                  ? 'Create Your Account'
                  : 'Reset Password'}
              </h2>
              <p className="text-xs text-[#64748B] dark:text-[#9CA3AF]">
                {authMode === 'login'
                  ? 'Welcome back to your personalized AI workspace'
                  : authMode === 'register'
                  ? 'Unlock persistent workspaces, projects & history'
                  : 'Recover your account access with a secure code'}
              </p>
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6">
          {/* ========================================================= */}
          {/* LOGIN FORM */}
          {/* ========================================================= */}
          {authMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <a
                href="/api/auth/google/start?returnTo=%2F"
                className="w-full py-2.5 px-3 rounded-xl text-sm font-semibold bg-white dark:bg-[#151C2C] text-[#202124] dark:text-[#F3F4F6] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] border border-[#D1D5DB] dark:border-[#475569] flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <svg aria-hidden="true" viewBox="0 0 48 48" className="h-4 w-4">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.77 7.18l7.73 6C44.41 38.07 46.98 31.93 46.98 24.55Z" />
                  <path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.75-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.54 2.56 10.78l7.97-6.19Z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.9-5.8l-7.73-6c-2.14 1.44-4.88 2.3-8.17 2.3-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z" />
                </svg>
                <span>Continue with Google</span>
              </a>

              {/* Quick Demo Fill Button */}
              <button
                type="button"
                onClick={handleDemoSignIn}
                disabled={authLoading}
                className="w-full py-2.5 px-3 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-[#6366F1] dark:text-[#818CF8] hover:bg-indigo-100 dark:hover:bg-indigo-950/70 border border-indigo-200/80 dark:border-indigo-800/60 flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <Sparkles className="w-4 h-4" />
                <span>Instant Demo Login (explorer@chatbot.ai)</span>
              </button>

              <div className="flex items-center my-3">
                <div className="flex-1 border-t border-[#E2E8F0] dark:border-[#293247]" />
                <span className="px-3 text-[11px] font-medium text-[#64748B] dark:text-[#9CA3AF] uppercase">
                  or sign in with email
                </span>
                <div className="flex-1 border-t border-[#E2E8F0] dark:border-[#293247]" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111827] dark:text-[#F3F4F6] mb-1.5">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 absolute left-3.5 text-[#64748B] dark:text-[#9CA3AF]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-[#F8FAFC] dark:bg-[#151C2C] border border-[#E2E8F0] dark:border-[#293247] text-[#111827] dark:text-[#F3F4F6] focus:outline-none focus:border-[#818CF8]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-[#111827] dark:text-[#F3F4F6]">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setAuthMode('forgot')}
                    className="text-xs font-medium text-[#6366F1] dark:text-[#818CF8] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 absolute left-3.5 text-[#64748B] dark:text-[#9CA3AF]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl text-xs sm:text-sm bg-[#F8FAFC] dark:bg-[#151C2C] border border-[#E2E8F0] dark:border-[#293247] text-[#111827] dark:text-[#F3F4F6] focus:outline-none focus:border-[#818CF8]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-[#64748B] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F3F4F6]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full mt-2 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-[#818CF8] hover:bg-[#6366F1] text-white shadow-md shadow-indigo-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {authLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-center text-xs text-[#64748B] dark:text-[#9CA3AF] pt-2">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className="font-bold text-[#6366F1] dark:text-[#818CF8] hover:underline"
                >
                  Create one now
                </button>
              </p>
            </form>
          )}

          {/* ========================================================= */}
          {/* REGISTER FORM */}
          {/* ========================================================= */}
          {authMode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#111827] dark:text-[#F3F4F6] mb-1">
                  Full Name
                </label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 absolute left-3.5 text-[#64748B] dark:text-[#9CA3AF]" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-[#F8FAFC] dark:bg-[#151C2C] border border-[#E2E8F0] dark:border-[#293247] text-[#111827] dark:text-[#F3F4F6] focus:outline-none focus:border-[#818CF8]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111827] dark:text-[#F3F4F6] mb-1">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 absolute left-3.5 text-[#64748B] dark:text-[#9CA3AF]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@domain.com"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-[#F8FAFC] dark:bg-[#151C2C] border border-[#E2E8F0] dark:border-[#293247] text-[#111827] dark:text-[#F3F4F6] focus:outline-none focus:border-[#818CF8]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111827] dark:text-[#F3F4F6] mb-1">
                  Password (min 6 characters)
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 absolute left-3.5 text-[#64748B] dark:text-[#9CA3AF]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl text-xs sm:text-sm bg-[#F8FAFC] dark:bg-[#151C2C] border border-[#E2E8F0] dark:border-[#293247] text-[#111827] dark:text-[#F3F4F6] focus:outline-none focus:border-[#818CF8]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-[#64748B] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F3F4F6]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111827] dark:text-[#F3F4F6] mb-1">
                  Confirm Password
                </label>
                <div className="relative flex items-center">
                  <ShieldCheck className="w-4 h-4 absolute left-3.5 text-[#64748B] dark:text-[#9CA3AF]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-[#F8FAFC] dark:bg-[#151C2C] border border-[#E2E8F0] dark:border-[#293247] text-[#111827] dark:text-[#F3F4F6] focus:outline-none focus:border-[#818CF8]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full mt-2 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-[#818CF8] hover:bg-[#6366F1] text-white shadow-md shadow-indigo-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {authLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-center text-xs text-[#64748B] dark:text-[#9CA3AF] pt-2">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className="font-bold text-[#6366F1] dark:text-[#818CF8] hover:underline"
                >
                  Sign in
                </button>
              </p>
            </form>
          )}

          {/* ========================================================= */}
          {/* FORGOT PASSWORD FORM */}
          {/* ========================================================= */}
          {authMode === 'forgot' && (
            <div className="space-y-4">
              {forgotStep === 1 ? (
                <form onSubmit={handleRequestResetCode} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#111827] dark:text-[#F3F4F6] mb-1.5">
                      Enter Account Email
                    </label>
                    <div className="relative flex items-center">
                      <Mail className="w-4 h-4 absolute left-3.5 text-[#64748B] dark:text-[#9CA3AF]" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@domain.com"
                        required
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-[#F8FAFC] dark:bg-[#151C2C] border border-[#E2E8F0] dark:border-[#293247] text-[#111827] dark:text-[#F3F4F6] focus:outline-none focus:border-[#818CF8]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-[#818CF8] hover:bg-[#6366F1] text-white shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    {authLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4" />
                        <span>Send Recovery Code</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleConfirmResetPassword} className="space-y-4">
                  <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 text-xs text-[#6366F1] dark:text-[#818CF8] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>A recovery code has been generated. Enter it below to choose a new password.</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#111827] dark:text-[#F3F4F6] mb-1.5">
                      6-Digit Code
                    </label>
                    <input
                      type="text"
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      placeholder="e.g. 849201"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-mono tracking-widest bg-[#F8FAFC] dark:bg-[#151C2C] border border-[#E2E8F0] dark:border-[#293247] text-[#111827] dark:text-[#F3F4F6] focus:outline-none focus:border-[#818CF8]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#111827] dark:text-[#F3F4F6] mb-1.5">
                      New Password (min 6 characters)
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-[#F8FAFC] dark:bg-[#151C2C] border border-[#E2E8F0] dark:border-[#293247] text-[#111827] dark:text-[#F3F4F6] focus:outline-none focus:border-[#818CF8]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-[#818CF8] hover:bg-[#6366F1] text-white shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    {authLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span>Update Password</span>
                    )}
                  </button>
                </form>
              )}

              <p className="text-center text-xs text-[#64748B] dark:text-[#9CA3AF] pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setForgotStep(1);
                  }}
                  className="font-bold text-[#6366F1] dark:text-[#818CF8] hover:underline"
                >
                  Return to Sign In
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
