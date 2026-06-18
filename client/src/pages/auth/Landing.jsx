import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Heart, Shield, Lock, Share2, Clock, Users, ChevronRight,
  CheckCircle2, FileText, Stethoscope, Activity
} from 'lucide-react';

const features = [
  { icon: Shield, title: 'Military-Grade Security', desc: 'AES-256 encryption for all your sensitive health data' },
  { icon: Share2, title: 'Instant Record Sharing', desc: 'Share records securely with any doctor in seconds' },
  { icon: Clock, title: '24/7 Access', desc: 'Access your health records anytime, from any device' },
  { icon: Users, title: 'Multi-Role System', desc: 'Tailored dashboards for patients, doctors, and admins' },
  { icon: Activity, title: 'Smart Analytics', desc: 'Visualize your health trends over time with charts' },
  { icon: Lock, title: 'Privacy First', desc: 'You control who sees your data — always' },
];

const steps = [
  { num: '01', title: 'Create Account', desc: 'Sign up as a patient or doctor in under 2 minutes' },
  { num: '02', title: 'Upload Records', desc: 'Add your medical records, prescriptions, and lab reports' },
  { num: '03', title: 'Share & Collaborate', desc: 'Share records with your care team securely' },
];

const testimonials = [
  { name: 'Sarah Ahmed', role: 'Patient', text: 'MediVault changed how I manage my health. All my records in one place!', avatar: 'SA' },
  { name: 'Dr. Khalid Mir', role: 'Cardiologist', text: 'Finally a platform that makes patient record management effortless.', avatar: 'KM' },
  { name: 'Nadia Iqbal', role: 'Patient', text: 'The emergency card feature saved my husband\'s life when he was unconscious.', avatar: 'NI' },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-border dark:border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
              <Heart size={16} className="text-white" />
            </div>
            <span className="font-bold text-slate-800 dark:text-white text-xl">MediVault</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-slate-600 dark:text-slate-300 hover:text-primary-600 font-medium transition-colors text-sm">
              Login
            </Link>
            <Link to="/register" className="btn-primary text-sm">
              Get Started <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-sm font-semibold mb-6 border border-primary-100 dark:border-primary-800">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
              HIPAA-Ready Cloud Platform
            </span>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 dark:text-white mb-6 leading-tight">
              Your Health,{' '}
              <span className="text-gradient">Secured in the Cloud</span>
            </h1>
            <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">
              MediVault is the all-in-one platform for patients, doctors, and clinics to store, manage, and share medical records securely.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn-primary text-base px-6 py-3">
                Start for Free <ChevronRight size={18} />
              </Link>
              <Link to="/login" className="btn-outline text-base px-6 py-3">
                Sign In
              </Link>
            </div>
          </motion.div>

          {/* Hero Visual */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-16 relative"
          >
            <div className="bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-slate-800 dark:to-slate-800/50 rounded-3xl p-8 border border-primary-100 dark:border-slate-700 max-w-4xl mx-auto">
              <div className="grid grid-cols-3 gap-4 mb-4">
                {[
                  { label: 'Total Patients', value: '12,481', icon: Users, color: 'blue' },
                  { label: 'Records Stored', value: '94,232', icon: FileText, color: 'green' },
                  { label: 'Active Doctors', value: '1,842', icon: Stethoscope, color: 'purple' },
                ].map((item) => (
                  <div key={item.label} className="bg-white dark:bg-slate-700 rounded-2xl p-4 shadow-sm text-left">
                    <item.icon size={20} className={`mb-2 ${item.color === 'blue' ? 'text-primary-500' : item.color === 'green' ? 'text-secondary-500' : 'text-purple-500'}`} />
                    <p className="text-2xl font-bold text-slate-800 dark:text-white">{item.value}</p>
                    <p className="text-xs text-text-muted">{item.label}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white dark:bg-slate-700 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-sm">JD</div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">John Doe • Blood Group: O+</p>
                  <p className="text-xs text-text-muted">Allergies: Penicillin • Last Visit: 3 days ago</p>
                </div>
                <span className="badge-green">Active</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-3">Everything you need</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              A complete healthcare management ecosystem designed for the modern world.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                viewport={{ once: true }}
                className="card hover:shadow-md transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/10 to-secondary-500/10 flex items-center justify-center mb-4">
                  <f.icon size={20} className="text-primary-600" />
                </div>
                <h3 className="font-bold text-slate-800 dark:text-white mb-2">{f.title}</h3>
                <p className="text-sm text-text-muted">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-3">How it works</h2>
            <p className="text-slate-500 dark:text-slate-400">Get started in minutes</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div key={s.num} className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center mx-auto mb-4 shadow-md">
                  <span className="text-white font-mono font-bold">{s.num}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{s.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-slate-800 dark:to-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-3">Loved by patients & doctors</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-sm">{t.avatar}</div>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-white text-sm">{t.name}</p>
                    <p className="text-xs text-text-muted">{t.role}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">"{t.text}"</p>
                <div className="flex gap-1 mt-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className="text-amber-400 text-sm">★</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
            Ready to take control of your health?
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8">
            Join thousands of patients and healthcare professionals who trust MediVault.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-primary text-base px-8 py-3">
              Create Free Account
            </Link>
            <Link to="/login" className="btn-outline text-base px-8 py-3">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border dark:border-slate-700 text-center">
        <p className="text-sm text-text-muted">
          © 2024 MediVault. Securing healthcare data with trust and technology.
        </p>
      </footer>
    </div>
  );
};

export default Landing;
