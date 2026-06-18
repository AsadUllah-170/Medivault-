import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Heart, ArrowRight, ArrowLeft } from 'lucide-react';
import { registerUser } from '../../services/authService';
import toast from 'react-hot-toast';
import { FormField, LoadingSpinner } from '../../components/shared/UIComponents';

const patientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  dob: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['Male', 'Female', 'Other']),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  phone: z.string().min(10, 'Enter a valid phone number'),
  emergencyContact: z.string().min(2, 'Emergency contact name required'),
});

const doctorSchema = z.object({
  name: z.string().min(2, 'Name required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  specialization: z.string().min(2, 'Specialization required'),
  licenseNumber: z.string().min(4, 'License number required'),
  hospitalAffiliation: z.string().min(2, 'Hospital affiliation required'),
  phone: z.string().min(10, 'Enter a valid phone number'),
});

const Register = () => {
  const [role, setRole] = useState(null); // 'patient' | 'doctor'
  const [step, setStep] = useState(0); // 0=role, 1=form
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const schema = role === 'doctor' ? doctorSchema : patientSchema;
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const selectRole = (r) => {
    setRole(r);
    setStep(1);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await registerUser({ email: data.email, password: data.password, role, profileData: data });
      toast.success('Account created successfully! Welcome to MediVault.');
      navigate(role === 'doctor' ? '/doctor' : '/patient');
    } catch (err) {
      toast.error(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-md">
            <Heart size={20} className="text-white" />
          </div>
          <span className="font-bold text-slate-800 dark:text-white text-2xl">MediVault</span>
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="card shadow-xl"
        >
          {step === 0 ? (
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2 text-center">Create your account</h2>
              <p className="text-text-muted text-sm text-center mb-8">Choose how you'll use MediVault</p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { role: 'patient', label: 'I\'m a Patient', desc: 'Manage my health records', icon: '🏥' },
                  { role: 'doctor', label: 'I\'m a Doctor', desc: 'Manage patient records', icon: '👨‍⚕️' },
                ].map((opt) => (
                  <button
                    key={opt.role}
                    onClick={() => selectRole(opt.role)}
                    className="p-6 rounded-xl border-2 border-border hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all text-center group"
                  >
                    <div className="text-4xl mb-3">{opt.icon}</div>
                    <p className="font-bold text-slate-800 dark:text-white mb-1">{opt.label}</p>
                    <p className="text-xs text-text-muted">{opt.desc}</p>
                  </button>
                ))}
              </div>
              <p className="text-center text-sm text-text-muted mt-6">
                Already have an account?{' '}
                <Link to="/login" className="text-primary-600 font-semibold hover:underline">Sign in</Link>
              </p>
            </div>
          ) : (
            <div>
              <button onClick={() => setStep(0)} className="flex items-center gap-2 text-sm text-text-muted hover:text-slate-700 mb-6">
                <ArrowLeft size={16} /> Back to role selection
              </button>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-1">
                Register as {role === 'doctor' ? 'Doctor' : 'Patient'}
              </h2>
              <p className="text-sm text-text-muted mb-6">Fill in your details to get started</p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-0">
                <FormField label="Full Name" error={errors.name?.message} required>
                  <input {...register('name')} className="input-field" placeholder="John Doe" />
                </FormField>
                <FormField label="Email Address" error={errors.email?.message} required>
                  <input {...register('email')} type="email" className="input-field" placeholder="john@example.com" />
                </FormField>
                <FormField label="Password" error={errors.password?.message} required>
                  <div className="relative">
                    <input {...register('password')} type={showPassword ? 'text' : 'password'} className="input-field pr-10" placeholder="Min 8 characters" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </FormField>
                <FormField label="Phone Number" error={errors.phone?.message} required>
                  <input {...register('phone')} className="input-field" placeholder="+92 300 0000000" />
                </FormField>

                {role === 'patient' ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField label="Date of Birth" error={errors.dob?.message} required>
                        <input {...register('dob')} type="date" className="input-field" />
                      </FormField>
                      <FormField label="Gender" error={errors.gender?.message} required>
                        <select {...register('gender')} className="input-field">
                          <option value="">Select</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </FormField>
                    </div>
                    <FormField label="Blood Group" error={errors.bloodGroup?.message} required>
                      <select {...register('bloodGroup')} className="input-field">
                        <option value="">Select blood group</option>
                        {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </FormField>
                    <FormField label="Emergency Contact Name" error={errors.emergencyContact?.message} required>
                      <input {...register('emergencyContact')} className="input-field" placeholder="Parent / Spouse name" />
                    </FormField>
                  </>
                ) : (
                  <>
                    <FormField label="Specialization" error={errors.specialization?.message} required>
                      <input {...register('specialization')} className="input-field" placeholder="e.g. Cardiologist" />
                    </FormField>
                    <FormField label="Medical License Number" error={errors.licenseNumber?.message} required>
                      <input {...register('licenseNumber')} className="input-field" placeholder="PMC-XXXXX" />
                    </FormField>
                    <FormField label="Hospital Affiliation" error={errors.hospitalAffiliation?.message} required>
                      <input {...register('hospitalAffiliation')} className="input-field" placeholder="City General Hospital" />
                    </FormField>
                  </>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center mt-4"
                >
                  {loading ? <LoadingSpinner size="sm" /> : <>Create Account <ArrowRight size={16} /></>}
                </button>
              </form>

              <p className="text-center text-sm text-text-muted mt-4">
                Already have an account?{' '}
                <Link to="/login" className="text-primary-600 font-semibold hover:underline">Sign in</Link>
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
