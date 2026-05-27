'use client';

import Navbar from '@/components/common/Navbar';
import { useAuth } from '@/context/AuthContext';
import { AlertCircle, ArrowLeft, Calendar, FileText, User } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export async function generateStaticParams() {
  return [];
}

export default function PatientHistoryRecords() {
  const { id } = useParams();
  const { token, API_BASE_URL } = useAuth();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id || !token) return;

    const fetchPatient = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/patients/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Failed to load patient records.');

        const data = await res.json();
        setPatient(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [id, token]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 sm:p-8 space-y-6">

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-teal-600 font-bold hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        {loading && (
          <div className="text-center py-20 text-slate-400 text-sm animate-pulse">
            Loading patient records...
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center gap-3 text-sm">
            <AlertCircle className="h-5 w-5 shrink-0" />
            {error}
          </div>
        )}

        {patient && (
          <>
            {/* Patient Header */}
            <div className="glass p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-teal-500/10 text-teal-600 rounded-xl">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">
                    {patient.name}
                  </h1>
                  <p className="text-sm text-slate-400 font-semibold mt-0.5">
                    {patient.age} yrs · {patient.gender} · {patient.phoneNumber}
                    {patient.email && ` · ${patient.email}`}
                  </p>
                </div>
              </div>
            </div>

            {/* Medical History */}
            <div className="glass p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md space-y-3">
              <h2 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <FileText className="h-5 w-5 text-teal-600" />
                Medical History
              </h2>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-6">
                {patient.medicalHistory ?? 'No medical history on record for this patient.'}
              </p>
            </div>

            {/* Appointment History */}
            <div className="glass p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
              <h2 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-teal-600" />
                Appointment Records
              </h2>

              {patient.appointments?.length === 0 ? (
                <p className="text-sm text-slate-400 py-4 text-center">
                  No appointment records found.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm text-left divide-y divide-slate-200 dark:divide-slate-800">
                    <thead>
                      <tr className="text-slate-400 uppercase text-xs font-bold tracking-wider">
                        <th className="pb-3">Date & Time</th>
                        <th className="pb-3">Reason</th>
                        <th className="pb-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {patient.appointments?.map((apt) => (
                        <tr key={apt.id} className="hover:bg-slate-500/5 transition-colors">
                          <td className="py-3 font-mono text-slate-700 dark:text-slate-300">
                            {new Date(apt.appointmentDate).toLocaleString()}
                          </td>
                          <td className="py-3 text-slate-500 dark:text-slate-400">
                            {apt.reason || 'No reason provided'}
                          </td>
                          <td className="py-3">
                            <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide
                              ${apt.status === 'COMPLETED' ? 'bg-teal-500/10 text-teal-600' :
                                apt.status === 'CANCELLED' ? 'bg-rose-500/10 text-rose-500' :
                                'bg-amber-500/10 text-amber-500'}`}>
                              {apt.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}