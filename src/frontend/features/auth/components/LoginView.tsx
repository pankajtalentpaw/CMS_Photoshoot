"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  Check,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/frontend/context/AuthContext";

// Custom SVG Brand Icons
const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

const YoutubeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.11 1 12 1 12s0 3.89.46 5.58a2.78 2.78 0 0 0 1.94 2c1.72.42 8.6.42 8.6.42s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.89 23 12 23 12s0-3.89-.46-5.58z"/><polyline points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>
  </svg>
);

export const LoginView = () => {
  const router = useRouter();
  const { login, isAuthenticated, loading } = useAuth();

  const [step, setStep] = useState(0); // 0: Email, 1: Password, 2: Reset Password
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  // Bonus: Redirect already-logged-in users away from /login
  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, loading, router]);

  const validationSchema = Yup.object().shape({
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string().when([], {
      is: () => step === 1,
      then: (schema) => schema.required("Password is required").min(6, "Minimum 6 characters"),
      otherwise: (schema) => schema.notRequired(),
    }),
  });

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    validationSchema,
    onSubmit: async (values) => {
      setErrorMessage(null);

      // Step 0 → advance to password step
      if (step === 0) {
        setStep(1);
        return;
      }

      // Step 2 → reset password (currently disabled in this build)
      if (step === 2) {
        setErrorMessage("Password reset is temporarily unavailable.");
        return;
      }

      // Step 1 → actual login
      setIsSubmitting(true);
      const result = await login(values.email, values.password);
      setIsSubmitting(false);

      if (result.success) {
        router.push("/");
      } else {
        setErrorMessage(result.error ?? "Login failed.");
      }
    },
  });

  const handleBack = () => {
    setErrorMessage(null);
    setResetSent(false);
    if (step === 1) setStep(0);
    else if (step === 2) setStep(1);
    else router.push("/");
  };

  // Show spinner while session resolves
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-white/10" />
          <div className="absolute inset-0 rounded-full border-2 border-t-[#7C4DFF] animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] relative overflow-hidden selection:bg-[#7C4DFF]/30 font-inter text-white flex flex-col items-center justify-center p-6">

      {/* Grid Background */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#ffffff05 1px, transparent 1px), linear-gradient(90deg, #ffffff05 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Ambient Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#A52FFF] blur-[250px] opacity-20 z-0" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#A52FFF] blur-[250px] opacity-20 z-0" />

      {/* Back Button */}
      <div className="w-full max-w-[440px] flex justify-start mb-6 md:absolute md:top-8 md:left-8 md:w-auto md:mb-0 z-20">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 transition-all group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          {step === 1 ? "Back to Email" : step === 2 ? "Back to Login" : "Back to Home"}
        </button>
      </div>

      {/* Main Content Card */}
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-[440px] bg-[#0A0A0A]/40 backdrop-blur-3xl border border-white/10 rounded-[30px] p-8 md:p-12 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center gap-1 mb-6"
          >
            <span className="text-[#A52FFF] font-bold text-[14px] uppercase tracking-[0.2em]">Member Access</span>
            <div className="w-8 h-px bg-white/10 mt-1" />
            <span className="text-white/40 text-[10px] uppercase tracking-[0.1em] mt-1">Secure Portal • Digital Atelier</span>
          </motion.div>

          <h1 className="text-4xl md:text-[42px] font-manrope font-extrabold text-white mb-4 tracking-tight leading-tight">
            {step === 2 ? "Reset Password" : step === 0 ? "Welcome back!" : "Enter Password"}
          </h1>
          <p className="text-white/40 text-sm md:text-[15px] font-medium leading-relaxed">
            {step === 2
              ? "Enter your registered email to reset your password"
              : step === 0
                ? "Enter your email to continue"
                : <><span>Continue as </span><span className="text-white">{formik.values.email}</span></>
            }
          </p>
        </div>

        {/* Form */}
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <AnimatePresence mode="wait">
            {step === 0 || step === 2 ? (
              <motion.div
                key={step === 2 ? "reset-step" : "email-step"}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-2"
              >
                <label className="text-[13px] font-semibold text-white/50 ml-1">
                  {step === 2 ? "Registered email address" : "Email"}
                </label>
                <div className={`bg-white/[0.05] border rounded-[12px] p-[12px_16px] transition-all duration-300 focus-within:shadow-[0_0_20px_rgba(165,47,255,0.2)] focus-within:bg-white/[0.08] ${
                  formik.touched.email && formik.errors.email
                    ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]'
                    : 'border-white/20 focus-within:border-[#A52FFF]'
                }`}>
                  <input
                    id="login-email"
                    type="email"
                    placeholder="your@email.com"
                    {...formik.getFieldProps('email')}
                    className="w-full bg-transparent border-none outline-none text-white text-[15px] placeholder:text-white/40"
                  />
                </div>
                {formik.touched.email && formik.errors.email && (
                  <p className="text-red-500 text-xs ml-1 mt-1">{formik.errors.email}</p>
                )}

                {/* Reset sent confirmation */}
                {resetSent && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[#34A853] text-sm ml-1 mt-2 font-medium"
                  >
                    ✓ Reset link sent! Check your inbox.
                  </motion.p>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="password-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-white/50 ml-1">Password</label>
                  <div className={`relative bg-white/[0.05] border rounded-[12px] p-[12px_16px] transition-all duration-300 focus-within:shadow-[0_0_20px_rgba(165,47,255,0.2)] focus-within:bg-white/[0.08] ${
                    formik.touched.password && formik.errors.password
                      ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]'
                      : 'border-white/20 focus-within:border-[#A52FFF]'
                  }`}>
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      {...formik.getFieldProps('password')}
                      className="w-full bg-transparent border-none outline-none text-white text-[15px] placeholder:text-white/40 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/60 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {formik.touched.password && formik.errors.password && (
                    <p className="text-red-500 text-xs ml-1 mt-1">{formik.errors.password}</p>
                  )}
                </div>

                <div className="flex items-center justify-between px-1">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className="relative w-5 h-5">
                      <input type="checkbox" {...formik.getFieldProps('rememberMe')} className="peer sr-only" />
                      <div className="w-5 h-5 border-2 border-white/20 rounded-[6px] transition-all peer-checked:bg-[#7C4DFF] peer-checked:border-[#7C4DFF] group-hover:border-white/40" />
                      <Check className="absolute inset-0 w-3 h-3 m-auto text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                    </div>
                    <span className="text-sm text-white/60 group-hover:text-white/80 transition-colors">Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => { setStep(2); setErrorMessage(null); }}
                    className="text-[#A52FFF] text-sm font-bold hover:text-[#CB87FF] transition-colors cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Message */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm font-medium"
              >
                {errorMessage}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            id="login-submit-btn"
            type="submit"
            disabled={isSubmitting || (step === 0 || step === 2 ? (!formik.values.email || !!formik.errors.email) : (!formik.isValid || !formik.dirty))}
            className={`w-full h-[56px] rounded-[12px] font-bold text-base transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
              (step === 0 || step === 2
                ? (formik.values.email && !formik.errors.email)
                : (formik.isValid && formik.dirty)) && !isSubmitting
                ? 'bg-[#7C4DFF] hover:bg-[#6B3EEB] text-white shadow-[0_10px_30px_rgba(124,77,255,0.3)] cursor-pointer'
                : 'bg-[#7C4DFF]/40 text-white/40 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
            ) : (
              step === 0 ? "Continue" : step === 1 ? "Login" : "Send Reset Link"
            )}
          </button>
        </form>

        {/* Divider + Register Link */}
        {step !== 2 && (
          <>
            <div className="flex items-center gap-4 my-10">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-white/20 text-xs font-medium uppercase tracking-[0.1em]">or</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>
            <div className="text-center mb-10">
              <p className="text-white/40 text-[14px]">
                New to Digital Atelier?{" "}
                <Link href="/signup" className="text-white font-bold hover:text-[#A52FFF] underline underline-offset-4 transition-colors cursor-pointer">
                  Do it here
                </Link>
              </p>
            </div>
          </>
        )}

        {/* Footer */}
        <div className="flex flex-col items-center gap-0 lg:gap-8 pt-6 border-t border-white/5">
          <div className="space-y-4 text-center mt-6">
            <span className="text-white/30 text-[12px] font-medium tracking-tight">Trusted by +1400 happy users</span>
            <div className="flex items-center justify-center gap-5">
              <Link href="#" className="p-2 bg-white/5 rounded-full text-white/40 hover:text-[#0077B5] hover:bg-white/10 transition-all cursor-pointer">
                <LinkedinIcon className="w-4 h-4" />
              </Link>
              <Link href="#" className="p-2 bg-white/5 rounded-full text-white/40 hover:text-[#1877F2] hover:bg-white/10 transition-all cursor-pointer">
                <FacebookIcon className="w-4 h-4" />
              </Link>
              <Link href="#" className="p-2 bg-white/5 rounded-full text-white/40 hover:text-[#FF0000] hover:bg-white/10 transition-all cursor-pointer">
                <YoutubeIcon className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2 mt-10">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[#CF4141] rounded-full flex items-center justify-center font-bold text-[10px] text-white">CS</div>
              <span className="text-[17px] font-manrope font-bold tracking-tight text-white/90">ClapStick Media</span>
            </div>
            <span className="text-white/20 text-[10px] font-medium tracking-widest uppercase">
              © 2026 ClapStick Media • Works in 90+ languages
            </span>
          </div>
        </div>
      </motion.div>
    </main>
  );
};

const CheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default LoginView;
