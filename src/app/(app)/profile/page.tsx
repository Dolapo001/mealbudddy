"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth";

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);

  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [department, setDepartment] = useState(user?.department ?? "");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    await updateProfile({ firstName, lastName, department });
    setSaving(false);
    toast.success("Profile updated");
  }

  const initials = `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase() || "MB";

  return (
    <div className="mx-auto max-w-2xl">
      <header>
        <p className="text-xs font-medium uppercase tracking-[2px] text-ink-muted">Your account</p>
        <h1 className="mt-1 font-display text-3xl font-extrabold text-brand-deep">Profile</h1>
      </header>

      <div className="mt-7 flex items-center gap-4 rounded-3xl border border-brand-pale/20 bg-white p-6">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-bright text-xl font-bold text-white">
          {initials}
        </span>
        <div>
          <p className="font-display text-xl font-bold text-brand-deep">
            {firstName} {lastName}
          </p>
          <p className="text-sm text-ink-muted">{user?.email}</p>
          {user?.studentId && <p className="text-xs text-ink-muted">ID: {user.studentId}</p>}
        </div>
        <span
          className={`ml-auto rounded-full px-3 py-1 text-xs font-semibold ${
            user?.isEmailVerified ? "bg-accent-green/15 text-accent-green" : "bg-amber-light text-amber"
          }`}
        >
          {user?.isEmailVerified ? "Verified" : "Unverified"}
        </span>
      </div>

      <section className="mt-5 rounded-3xl border border-brand-pale/20 bg-white p-6">
        <h2 className="font-display text-lg font-semibold text-brand-deep">Edit details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-ink-mid">First name</span>
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="mb-input" />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-ink-mid">Last name</span>
            <input value={lastName} onChange={(e) => setLastName(e.target.value)} className="mb-input" />
          </label>
          <label className="flex flex-col gap-1.5 sm:col-span-2">
            <span className="text-xs font-medium text-ink-mid">Department</span>
            <input value={department} onChange={(e) => setDepartment(e.target.value)} className="mb-input" />
          </label>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="mt-5 rounded-full bg-brand-bright px-7 py-3 text-sm font-semibold text-white transition hover:bg-brand-mid disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </section>
    </div>
  );
}
