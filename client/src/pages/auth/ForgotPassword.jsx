import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Heart, ArrowLeft, Mail } from 'lucide-react';
import { resetPassword } from '../../services/authService';
import toast from 'react-hot-toast';
import { FormField, LoadingSpinner } from '../../components/shared/UIComponents';

const schema = z.object({ email: z.string().email('Invalid email address') });

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async ({ email }) => {
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
      toast.success('Password reset email sent!');
    } catch {
      toast.error('Could not send reset email. Check the address and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
            <Heart size={20} className="text-white" />
          </div>
          <span className="font-bold text-slate-800 dark:text-white text-2xl">MediVault</span>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card shadow-xl">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-2xl bg-secondary-100 flex items-center justify-center mx-auto mb-4">
                <Mail size={28} className="text-secondary-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Check your inbox</h2>
              <p className="text-sm text-text-muted mb-6">
                We've sent a password reset link to your email. Check your spam folder if you don't see it.
              </p>
              <Link to="/login" className="btn-primary w-full justify-center">Back to Login</Link>
            </div>
          ) : (
            <>
              <Link to="/login" className="flex items-center gap-2 text-sm text-text-muted hover:text-slate-700 mb-6">
                <ArrowLeft size={16} /> Back to login
              </Link>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">Forgot password?</h2>
              <p className="text-text-muted text-sm mb-6">Enter your email and we'll send a reset link.</p>
              <form onSubmit={handleSubmit(onSubmit)}>
                <FormField label="Email Address" error={errors.email?.message} required>
                  <input {...register('email')} type="email" className="input-field" placeholder="john@example.com" />
                </FormField>
                <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-2">
                  {loading ? <LoadingSpinner size="sm" /> : 'Send Reset Link'}
                </button>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword;
