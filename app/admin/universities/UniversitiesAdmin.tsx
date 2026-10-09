// app/admin/universities/UniversitiesAdmin.tsx
'use client';

// Where you set up each university that has paid. Nothing here is self-serve:
// a university exists only once it has been added on this page.
//
// What each field does for the students:
//   • Email domains — anyone who signs in with a VERIFIED address on one of
//     these gets the university's attempts, free, from that moment on.
//   • Licence dates — access runs from the first day to the end of the last.
//     Moving the start date forward (a renewal) gives every student a fresh
//     allowance of attempts.
//   • Active — untick to stop access immediately without touching the dates.
//   • Staff emails — these people (once signed up and verified) can open the
//     /university dashboard and see totals for their students. Never answers.

import { useCallback, useEffect, useState } from 'react';
import AdminHeader from '@/components/AdminHeader';

type Institution = {
  id: string;
  name: string;
  country: string | null;
  licenceStart: string;
  licenceEnd: string;
  status: 'active' | 'paused' | 'not_started' | 'expired';
  attemptsPerStudent: number;
  followupIncluded: boolean;
  maxStudents: number | null;
  isActive: boolean;
  notes: string | null;
  domains: string[];
  staffEmails: string[];
  studentsJoined: number;
  universityAttemptsUsed: number;
};

type FormState = {
  name: string;
  country: string;
  licenceStart: string;
  licenceEnd: string;
  attemptsPerStudent: string;
  followupIncluded: boolean;
  maxStudents: string;
  isActive: boolean;
  domains: string;
  staffEmails: string;
  notes: string;
};

function today(offsetDays = 0): string {
  const d = new Date(Date.now() + offsetDays * 86_400_000);
  return d.toISOString().slice(0, 10);
}

const EMPTY_FORM: FormState = {
  name: '',
  country: 'ES',
  licenceStart: today(),
  licenceEnd: today(364),
  attemptsPerStudent: '2',
  followupIncluded: true,
  maxStudents: '',
  isActive: true,
  domains: '',
  staffEmails: '',
  notes: '',
};

function fromInstitution(i: Institution): FormState {
  return {
    name: i.name,
    country: i.country ?? '',
    licenceStart: i.licenceStart,
    licenceEnd: i.licenceEnd,
    attemptsPerStudent: String(i.attemptsPerStudent),
    followupIncluded: i.followupIncluded,
    maxStudents: i.maxStudents == null ? '' : String(i.maxStudents),
    isActive: i.isActive,
    domains: i.domains.join('\n'),
    staffEmails: i.staffEmails.join('\n'),
    notes: i.notes ?? '',
  };
}

async function fetchInstitutions(): Promise<{ institutions: Institution[] } | { error: string }> {
  try {
    const res = await fetch('/api/admin/institutions', { credentials: 'include', cache: 'no-store' });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { error: data.error || `Request failed (${res.status})` };
    return { institutions: data.institutions ?? [] };
  } catch {
    return { error: 'Could not load universities.' };
  }
}

/** Splits a textarea on newlines, commas, semicolons and spaces. */
function splitList(text: string): string[] {
  return text.split(/[\s,;]+/).map((s) => s.trim()).filter(Boolean);
}

const STATUS_STYLE: Record<Institution['status'], { label: string; className: string }> = {
  active: { label: 'Active', className: 'bg-green-500/15 text-green-300 border-green-500/40' },
  not_started: { label: 'Starts later', className: 'bg-sky-500/15 text-sky-300 border-sky-500/40' },
  expired: { label: 'Expired', className: 'bg-amber-500/15 text-amber-300 border-amber-500/40' },
  paused: { label: 'Paused', className: 'bg-gray-500/15 text-gray-300 border-gray-500/40' },
};

const inputClass =
  'w-full rounded border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500';
const labelClass = 'block text-xs font-medium uppercase tracking-wider text-gray-400 mb-1';

export default function UniversitiesAdmin() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // null = form closed, 'new' = creating, otherwise the id being edited.
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const applyLoad = useCallback((result: Awaited<ReturnType<typeof fetchInstitutions>>) => {
    if ('error' in result) {
      setLoadError(result.error);
    } else {
      setInstitutions(result.institutions);
      setLoadError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchInstitutions().then((result) => {
      if (!cancelled) applyLoad(result);
    });
    return () => {
      cancelled = true;
    };
  }, [applyLoad]);

  const load = async () => applyLoad(await fetchInstitutions());

  const openNew = () => {
    setForm(EMPTY_FORM);
    setFormError(null);
    setNotice(null);
    setEditing('new');
  };

  const openEdit = (i: Institution) => {
    setForm(fromInstitution(i));
    setFormError(null);
    setNotice(null);
    setEditing(i.id);
  };

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const save = async () => {
    setSaving(true);
    setFormError(null);
    try {
      const attempts = Number(form.attemptsPerStudent);
      const maxStudents = form.maxStudents.trim() ? Number(form.maxStudents) : null;
      if (!Number.isInteger(attempts) || attempts < 1 || attempts > 20) {
        throw new Error('Attempts per student must be a whole number from 1 to 20.');
      }
      if (maxStudents !== null && (!Number.isInteger(maxStudents) || maxStudents < 1)) {
        throw new Error('Maximum students must be a whole number, or empty for no limit.');
      }

      const body = {
        name: form.name,
        country: form.country.trim() ? form.country.trim() : null,
        licenceStart: form.licenceStart,
        licenceEnd: form.licenceEnd,
        attemptsPerStudent: attempts,
        followupIncluded: form.followupIncluded,
        maxStudents,
        isActive: form.isActive,
        domains: splitList(form.domains),
        staffEmails: splitList(form.staffEmails),
        notes: form.notes.trim() ? form.notes : null,
      };

      const isNew = editing === 'new';
      const res = await fetch(isNew ? '/api/admin/institutions' : `/api/admin/institutions/${editing}`, {
        method: isNew ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Save failed (${res.status})`);

      setNotice(isNew ? `${form.name} added. Its students can sign in now.` : `${form.name} saved.`);
      setEditing(null);
      await load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not save.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <AdminHeader />
      <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Universities</h1>
            <p className="mt-1 text-sm text-gray-400">
              Students get free access by signing in with a verified email on one of a
              university&apos;s domains. Staff listed here can see totals for their students.
            </p>
          </div>
          {editing === null && (
            <button onClick={openNew} className="shrink-0 rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
              + Add university
            </button>
          )}
        </div>

        {notice && (
          <p className="mb-4 rounded-lg border border-green-500/40 bg-green-500/10 p-3 text-sm text-green-200">{notice}</p>
        )}

        {editing !== null && (
          <div className="mb-8 rounded-xl border border-gray-800 bg-gray-900 p-5">
            <h2 className="mb-4 text-lg font-semibold text-white">
              {editing === 'new' ? 'Add a university' : `Edit ${form.name || 'university'}`}
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelClass} htmlFor="u-name">Name</label>
                <input id="u-name" className={inputClass} value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="ESIC University" />
              </div>

              <div>
                <label className={labelClass} htmlFor="u-start">Licence starts</label>
                <input id="u-start" type="date" className={inputClass} value={form.licenceStart} onChange={(e) => set('licenceStart', e.target.value)} />
              </div>
              <div>
                <label className={labelClass} htmlFor="u-end">Licence ends (last day included)</label>
                <input id="u-end" type="date" className={inputClass} value={form.licenceEnd} onChange={(e) => set('licenceEnd', e.target.value)} />
              </div>

              <div>
                <label className={labelClass} htmlFor="u-attempts">Attempts per student, per licence</label>
                <input id="u-attempts" type="number" min={1} max={20} className={inputClass} value={form.attemptsPerStudent} onChange={(e) => set('attemptsPerStudent', e.target.value)} />
              </div>
              <div>
                <label className={labelClass} htmlFor="u-max">Maximum students (empty = no limit)</label>
                <input id="u-max" type="number" min={1} className={inputClass} value={form.maxStudents} onChange={(e) => set('maxStudents', e.target.value)} placeholder="No limit" />
              </div>

              <div>
                <label className={labelClass} htmlFor="u-country">Country code</label>
                <input id="u-country" maxLength={2} className={inputClass + ' uppercase'} value={form.country} onChange={(e) => set('country', e.target.value.toUpperCase())} placeholder="ES" />
                <p className="mt-1 text-xs text-gray-500">Two letters. Chooses the crisis helplines its students are shown.</p>
              </div>
              <div className="flex flex-col justify-center gap-3 pt-4">
                <label className="flex items-center gap-2 text-sm text-gray-200">
                  <input type="checkbox" checked={form.followupIncluded} onChange={(e) => set('followupIncluded', e.target.checked)} />
                  Follow-up roadmap included
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-200">
                  <input type="checkbox" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)} />
                  Active (untick to pause access straight away)
                </label>
              </div>

              <div>
                <label className={labelClass} htmlFor="u-domains">Student email domains</label>
                <textarea id="u-domains" rows={4} className={inputClass} value={form.domains} onChange={(e) => set('domains', e.target.value)} placeholder={'alumnos.esic.edu\nesic.university'} />
                <p className="mt-1 text-xs text-gray-500">One per line. Exact match: list subdomains separately.</p>
              </div>
              <div>
                <label className={labelClass} htmlFor="u-staff">Staff who can see the dashboard</label>
                <textarea id="u-staff" rows={4} className={inputClass} value={form.staffEmails} onChange={(e) => set('staffEmails', e.target.value)} placeholder={'careers.director@esic.edu'} />
                <p className="mt-1 text-xs text-gray-500">One email per line. They sign up normally with that address.</p>
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass} htmlFor="u-notes">Notes (only you see these)</label>
                <textarea id="u-notes" rows={2} className={inputClass} value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Contract, contact person, price…" />
              </div>
            </div>

            {formError && (
              <p className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">{formError}</p>
            )}

            <div className="mt-5 flex gap-3">
              <button onClick={save} disabled={saving} className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
                {saving ? 'Saving…' : editing === 'new' ? 'Add university' : 'Save changes'}
              </button>
              <button onClick={() => setEditing(null)} disabled={saving} className="rounded border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:text-white">
                Cancel
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <p className="text-gray-400">Loading…</p>
        ) : loadError ? (
          <p className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">{loadError}</p>
        ) : institutions.length === 0 ? (
          <p className="rounded-xl border border-gray-800 bg-gray-900 p-6 text-center text-gray-400">
            No universities yet. Add the first one once its contract is signed.
          </p>
        ) : (
          <div className="space-y-4">
            {institutions.map((i) => {
              const status = STATUS_STYLE[i.status];
              return (
                <div key={i.id} className="rounded-xl border border-gray-800 bg-gray-900 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-white">{i.name}</h3>
                        <span className={`rounded-full border px-2 py-0.5 text-xs ${status.className}`}>{status.label}</span>
                        {i.country && <span className="text-xs text-gray-500">{i.country}</span>}
                      </div>
                      <p className="mt-1 text-sm text-gray-400">
                        {i.licenceStart} → {i.licenceEnd} · {i.attemptsPerStudent} attempt{i.attemptsPerStudent === 1 ? '' : 's'} per student
                        {i.followupIncluded ? ' · follow-up included' : ' · no follow-up'}
                      </p>
                    </div>
                    <button onClick={() => openEdit(i)} className="rounded border border-gray-700 px-3 py-1.5 text-sm text-gray-300 hover:text-white">
                      Edit
                    </button>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-lg bg-gray-950 p-3">
                      <p className="text-xs uppercase tracking-wider text-gray-500">Students joined</p>
                      <p className="mt-1 text-xl font-semibold tabular-nums text-white">
                        {i.studentsJoined}
                        {i.maxStudents != null && <span className="text-sm text-gray-500"> / {i.maxStudents}</span>}
                      </p>
                    </div>
                    <div className="rounded-lg bg-gray-950 p-3">
                      <p className="text-xs uppercase tracking-wider text-gray-500">Reports on the licence</p>
                      <p className="mt-1 text-xl font-semibold tabular-nums text-white">{i.universityAttemptsUsed}</p>
                    </div>
                    <div className="rounded-lg bg-gray-950 p-3">
                      <p className="text-xs uppercase tracking-wider text-gray-500">Staff with dashboard access</p>
                      <p className="mt-1 text-xl font-semibold tabular-nums text-white">{i.staffEmails.length}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-500">Domains</p>
                      <p className="mt-1 text-gray-300 break-words">{i.domains.join(', ') || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-500">Staff</p>
                      <p className="mt-1 text-gray-300 break-words">{i.staffEmails.join(', ') || '—'}</p>
                    </div>
                  </div>
                  {i.notes && <p className="mt-3 text-sm text-gray-500 whitespace-pre-wrap">{i.notes}</p>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
