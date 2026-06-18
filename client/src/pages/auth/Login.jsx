import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Heart, ArrowRight } from 'lucide-react';
import { loginUser, getUserProfile } from '../../services/authService';
import toast from 'react-hot-toast';
import { FormField, LoadingSpinner } from '../../components/shared/UIComponents';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async ({ email, password }) => {
    setLoading(true);
    try {
      const user = await loginUser(email, password);
      const profile = await getUserProfile(user.uid);
      toast.success(`Welcome back, ${profile?.name || 'User'}!`);
      if (profile?.role === 'admin') navigate('/admin');
      else if (profile?.role === 'doctor') navigate('/doctor');
      else navigate('/patient');
    } catch (err) {
      toast.error('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-md">
            <Heart size={20} className="text-white" />
          </div>
          <span className="font-bold text-slate-800 dark:text-white text-2xl">MediVault</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card shadow-xl"
        >
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">Welcome back</h2>
          <p className="text-text-muted text-sm mb-6">Sign in to your MediVault account</p>

          <form onSubmit={handleSubmit(onSubmit)}>
            <FormField label="Email Address" error={errors.email?.message} required>
              <input {...register('email')} type="email" className="input-field" placeholder="john@example.com" autoComplete="email" />
            </FormField>
            <FormField label="Password" error={errors.password?.message} required>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  className="input-field pr-10"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </FormField>

            <div className="flex justify-end mb-4">
              <Link to="/forgot-password" className="text-sm text-primary-600 hover:underline font-medium">
                Forgot password?
              </Link>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
              {loading ? <LoadingSpinner size="sm" /> : <>Sign In <ArrowRight size={16} /></>}
            </button>
          </form>

          <div className="divider" />
          <p className="text-center text-sm text-text-muted">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 font-semibold hover:underline">Create one</Link>
          </p>
        </motion.div>


      </div>
    </div>
  );
};

export default Login;
