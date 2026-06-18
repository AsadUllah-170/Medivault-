import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Plus, ChevronLeft, ChevronRight, Clock, X } from 'lucide-react';
import { PageHeader, FormField, LoadingSpinner, Modal, StatusBadge, EmptyState } from '../../components/shared/UIComponents';
import { SkeletonList } from '../../components/shared/SkeletonLoaders';
import { getPatientAppointments, bookAppointment, updateAppointmentStatus } from '../../services/appointmentService';
import { getAllDoctors } from '../../services/adminService';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, addMonths, subMonths } from 'date-fns';

const Appointments = () => {
  const { user } = useAuthStore();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBook, setShowBook] = useState(false);
  const [booking, setBooking] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [form, setForm] = useState({ doctorId: '', date: '', timeSlot: '', reason: '' });

  const TIME_SLOTS = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];

  useEffect(() => {
    if (!user?.uid) return;
    Promise.all([getPatientAppointments(user.uid), getAllDoctors()])
      .then(([appts, docs]) => { setAppointments(appts); setDoctors(docs); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?.uid]);

  const today = new Date().toISOString().split('T')[0];
  const upcoming = appointments.filter(a => a.date >= today && a.status !== 'cancelled');
  const past = appointments.filter(a => a.date < today || a.status === 'completed');

  // Calendar
  const days = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });
  const apptDates = appointments.map(a => a.date);

  const handleBook = async () => {
    if (!form.doctorId || !form.date || !form.timeSlot) { toast.error('Please fill all required fields'); return; }
    setBooking(true);
    try {
      await bookAppointment({ patientId: user.uid, ...form });
      toast.success('Appointment requested!');
      setShowBook(false);
      setForm({ doctorId: '', date: '', timeSlot: '', reason: '' });
      const updated = await getPatientAppointments(user.uid);
      setAppointments(updated);
    } catch {
      toast.error('Failed to book appointment.');
    } finally {
      setBooking(false);
    }
  };

  const handleCancel = async (id) => {
    try {
      await updateAppointmentStatus(id, 'cancelled');
      toast.success('Appointment cancelled.');
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'cancelled' } : a));
    } catch {
      toast.error('Failed to cancel.');
    }
  };

  return (
    <div>
      <PageHeader
        title="Appointments"
        subtitle="Schedule and manage your appointments"
        actions={
          <button onClick={() => setShowBook(true)} className="btn-primary">
            <Plus size={16} /> Book Appointment
          </button>
        }
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">{format(currentMonth, 'MMMM yyyy')}</h3>
            <div className="flex gap-1">
              <button onClick={() => setCurrentMonth(m => subMonths(m, 1))} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                <ChevronLeft size={16} />
              </button>
              <button onClick={() => setCurrentMonth(m => addMonths(m, 1))} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
              <div key={d} className="text-xs font-semibold text-text-muted py-1">{d}</div>
            ))}
            {/* Empty cells for first day offset */}
            {Array.from({ length: days[0].getDay() }).map((_, i) => <div key={`empty-${i}`} />)}
            {days.map(day => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const hasAppt = apptDates.includes(dateStr);
              const isToday = dateStr === today;
              return (
                <div
                  key={dateStr}
                  className={`aspect-square flex flex-col items-center justify-center rounded-lg text-xs font-medium cursor-default transition-all
                    ${isToday ? 'bg-primary-500 text-white' : ''}
                    ${hasAppt && !isToday ? 'bg-secondary-100 text-secondary-700 dark:bg-secondary-900/30 dark:text-secondary-400 font-bold' : ''}
                    ${!isToday && !hasAppt ? 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700' : ''}
                  `}
                >
                  {format(day, 'd')}
                  {hasAppt && !isToday && <span className="w-1 h-1 rounded-full bg-secondary-500 mt-0.5" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming */}
        <div className="lg:col-span-2">
          <h3 className="section-title mb-4">Upcoming Appointments</h3>
          {loading ? (
            <SkeletonList count={3} />
          ) : upcoming.length === 0 ? (
            <EmptyState icon={Calendar} title="No upcoming appointments" action={<button onClick={() => setShowBook(true)} className="btn-primary">Book Now</button>} />
          ) : (
            <div className="space-y-3">
              {upcoming.map((appt) => {
                const doc = doctors.find(d => d.id === appt.doctorId);
                return (
                  <div key={appt.id} className="card flex items-center gap-4 p-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center shrink-0 text-lg">
                      👨‍⚕️
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-700 dark:text-slate-200 text-sm">{appt.reason || 'Consultation'}</p>
                      <p className="text-xs text-text-muted">{doc?.name ? `Dr. ${doc.name}` : 'Doctor'}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock size={12} className="text-slate-400" />
                        <span className="text-xs text-slate-500">{appt.date} at {appt.timeSlot}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <StatusBadge status={appt.status} />
                      {appt.status === 'pending' && (
                        <button onClick={() => handleCancel(appt.id)} className="text-xs text-red-500 hover:underline">Cancel</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Past */}
          {past.length > 0 && (
            <div className="mt-6">
              <h3 className="section-title mb-3 text-text-muted">Past Appointments</h3>
              <div className="space-y-2">
                {past.slice(0, 5).map(appt => (
                  <div key={appt.id} className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
                    <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-sm">📋</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{appt.reason || 'Consultation'}</p>
                      <p className="text-xs text-text-muted">{appt.date}</p>
                    </div>
                    <StatusBadge status={appt.status} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Book Modal */}
      <Modal isOpen={showBook} onClose={() => setShowBook(false)} title="Book Appointment">
        <div className="space-y-0">
          <FormField label="Select Doctor" required>
            {doctors.length === 0 ? (
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400 text-sm rounded-xl border border-amber-200 dark:border-amber-800">
                ⚠️ No doctors are currently available for booking. Please check back later.
              </div>
            ) : (
              <select value={form.doctorId} onChange={e => setForm(f => ({ ...f, doctorId: e.target.value }))} className="input-field">
                <option value="">Choose a doctor...</option>
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>Dr. {d.name} — {d.specialization}</option>
                ))}
              </select>
            )}
          </FormField>
          <FormField label="Preferred Date" required>
            <input type="date" min={today} value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="input-field" />
          </FormField>
          <FormField label="Time Slot" required>
            <div className="grid grid-cols-4 gap-2">
              {TIME_SLOTS.map(slot => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, timeSlot: slot }))}
                  className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                    form.timeSlot === slot ? 'bg-primary-500 text-white border-primary-500' : 'border-border text-slate-600 hover:border-primary-300 dark:text-slate-300 dark:border-slate-600'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </FormField>
          <FormField label="Reason for Visit">
            <textarea value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} className="input-field resize-none h-20" placeholder="Brief description of your concern..." />
          </FormField>
          <div className="flex gap-3 mt-4">
            <button onClick={() => setShowBook(false)} className="btn-outline flex-1 justify-center">Cancel</button>
            <button onClick={handleBook} disabled={booking} className="btn-primary flex-1 justify-center">
              {booking ? <LoadingSpinner size="sm" /> : 'Request Appointment'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Appointments;
