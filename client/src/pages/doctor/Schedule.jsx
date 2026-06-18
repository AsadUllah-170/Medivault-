import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Save, Plus, X } from 'lucide-react';
import { PageHeader, FormField, LoadingSpinner } from '../../components/shared/UIComponents';
import { getDoctorById, updateDoctorSchedule, updateDoctorBlockedDates } from '../../services/adminService';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DURATIONS = [15, 30, 45, 60];

const Schedule = () => {
  const { user } = useAuthStore();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [availability, setAvailability] = useState({ days: [], slotDuration: 30, timeSlots: [] });
  const [blockedDates, setBlockedDates] = useState([]);
  const [newBlockedDate, setNewBlockedDate] = useState('');

  useEffect(() => {
    if (!user?.uid) return;
    getDoctorById(user.uid).then(d => {
      if (d) {
        setDoctor(d);
        setAvailability(d.availability || { days: [], slotDuration: 30, timeSlots: [] });
        setBlockedDates(d.blockedDates || []);
      }
      setLoading(false);
    });
  }, [user?.uid]);

  const toggleDay = (day) => {
    setAvailability(a => ({
      ...a,
      days: a.days.includes(day) ? a.days.filter(d => d !== day) : [...a.days, day],
    }));
  };

  const generateSlots = (duration) => {
    const slots = [];
    for (let h = 8; h < 18; h++) {
      for (let m = 0; m < 60; m += duration) {
        slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
      }
    }
    return slots;
  };

  const toggleSlot = (slot) => {
    setAvailability(a => ({
      ...a,
      timeSlots: a.timeSlots.includes(slot) ? a.timeSlots.filter(s => s !== slot) : [...a.timeSlots, slot],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        updateDoctorSchedule(user.uid, availability),
        updateDoctorBlockedDates(user.uid, blockedDates),
      ]);
      toast.success('Schedule updated!');
    } catch {
      toast.error('Failed to save schedule.');
    } finally {
      setSaving(false);
    }
  };

  const addBlockedDate = () => {
    if (!newBlockedDate || blockedDates.includes(newBlockedDate)) return;
    setBlockedDates(d => [...d, newBlockedDate]);
    setNewBlockedDate('');
  };

  const removeBlockedDate = (date) => setBlockedDates(d => d.filter(x => x !== date));

  const slots = generateSlots(availability.slotDuration || 30);

  if (loading) return <div className="card animate-pulse h-64" />;

  return (
    <div>
      <PageHeader
        title="Schedule Management"
        subtitle="Set your available days, time slots, and blocked dates"
        actions={
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? <LoadingSpinner size="sm" /> : <><Save size={16} /> Save Schedule</>}
          </button>
        }
      />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Available Days */}
        <div className="card">
          <h3 className="section-title mb-4">Available Days</h3>
          <div className="grid grid-cols-2 gap-2">
            {DAYS.map(day => (
              <button
                key={day}
                onClick={() => toggleDay(day)}
                className={`py-3 px-4 rounded-xl font-semibold text-sm border-2 transition-all ${
                  availability.days.includes(day)
                    ? 'bg-primary-500 text-white border-primary-500'
                    : 'border-border text-slate-500 hover:border-primary-300 dark:border-slate-600 dark:text-slate-400'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* Slot Duration */}
        <div className="card">
          <h3 className="section-title mb-4">Appointment Duration</h3>
          <div className="grid grid-cols-4 gap-2 mb-6">
            {DURATIONS.map(d => (
              <button
                key={d}
                onClick={() => setAvailability(a => ({ ...a, slotDuration: d, timeSlots: [] }))}
                className={`py-3 rounded-xl font-bold text-sm border-2 transition-all ${
                  availability.slotDuration === d
                    ? 'bg-secondary-500 text-white border-secondary-500'
                    : 'border-border text-slate-500 hover:border-secondary-300 dark:border-slate-600 dark:text-slate-400'
                }`}
              >
                {d}m
              </button>
            ))}
          </div>

          {/* Blocked Dates */}
          <h3 className="section-title mb-3">Blocked / Unavailable Dates</h3>
          <div className="flex gap-2 mb-3">
            <input type="date" value={newBlockedDate} onChange={e => setNewBlockedDate(e.target.value)} className="input-field flex-1" />
            <button onClick={addBlockedDate} className="btn-outline shrink-0"><Plus size={16} /></button>
          </div>
          <div className="flex flex-wrap gap-2">
            {blockedDates.map(date => (
              <span key={date} className="flex items-center gap-1 px-3 py-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-full text-xs font-medium">
                {date}
                <button onClick={() => removeBlockedDate(date)}><X size={12} /></button>
              </span>
            ))}
          </div>
        </div>

        {/* Time Slots */}
        <div className="card lg:col-span-2">
          <h3 className="section-title mb-4">Available Time Slots</h3>
          <p className="text-xs text-text-muted mb-4">Click to toggle availability for each slot</p>
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
            {slots.map(slot => (
              <button
                key={slot}
                onClick={() => toggleSlot(slot)}
                className={`py-2 rounded-lg text-xs font-mono font-semibold border transition-all ${
                  availability.timeSlots.includes(slot)
                    ? 'bg-primary-500 text-white border-primary-500'
                    : 'border-border text-slate-500 hover:border-primary-300 dark:border-slate-600 dark:text-slate-400'
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule;
