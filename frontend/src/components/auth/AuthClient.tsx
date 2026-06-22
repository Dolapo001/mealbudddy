"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { registerSchema, loginSchema, type RegisterValues, type LoginValues } from "@/schemas/auth";
import { useAuthStore } from "@/stores/auth";
import { cx } from "@/lib/utils";

const DEPARTMENTS = [
  "Computer Science",
  "Accounting",
  "International Relations and Diplomatics",
  "Food Science & Technology",
  "Human Nutrition & Dietetics",
  "Biochemistry",
  "Medicine & Surgery",
  "Pharmacy",
  "Engineering",
  "Business Administration",
  "Law",
  "Other",
];

const STRENGTH = [
  { w: "20%", color: "#e05c3a", text: "Too weak" },
  { w: "40%", color: "#f2a024", text: "Weak" },
  { w: "60%", color: "#f2a024", text: "Fair" },
  { w: "80%", color: "#3db870", text: "Good" },
  { w: "100%", color: "#1a4a2e", text: "Strong" },
];

function scorePassword(v: string) {
  let score = 0;
  if (v.length >= 8) score++;
  if (v.length >= 12) score++;
  if (/[A-Z]/.test(v)) score++;
  if (/[0-9]/.test(v)) score++;
  if (/[^A-Za-z0-9]/.test(v)) score++;
  return STRENGTH[Math.min(Math.max(score - 1, 0), 4)];
}

export function AuthClient() {
  const router = useRouter();
  const registerUser = useAuthStore((s) => s.register);
  const loginUser = useAuthStore((s) => s.login);

  const [tab, setTab] = useState<"register" | "login">("register");
  const [step, setStep] = useState<1 | 2>(1);
  const [showPw, setShowPw] = useState<Record<string, boolean>>({});
  const [registered, setRegistered] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  const regForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    mode: "onSubmit",
    defaultValues: {
      firstName: "",
      lastName: "",
      studentId: "",
      email: "",
      department: "",
      password: "",
      confirm: "",
      terms: false as unknown as true,
    },
  });

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", password: "" },
  });

  const pwValue = regForm.watch("password");
  const strength = useMemo(() => (pwValue ? scorePassword(pwValue) : null), [pwValue]);
  const terms = regForm.watch("terms");

  const goToStep2 = async () => {
    const ok = await regForm.trigger(["firstName", "lastName", "studentId", "email", "department"]);
    if (ok) setStep(2);
  };

  const onRegister = regForm.handleSubmit(async (values) => {
    try {
      await registerUser(values);
      setRegistered(true);
      toast.success("Account created. Redirecting to your metrics…");
      setTimeout(() => router.push("/onboarding/metrics"), 1400);
    } catch {
      toast.error("Could not create your account. Please try again.");
    }
  });

  const onLogin = loginForm.handleSubmit(async (values) => {
    try {
      await loginUser(values);
      setLoggedIn(true);
      toast.success("Signed in. Taking you to your dashboard…");
      setTimeout(() => router.push("/dashboard"), 1200);
    } catch {
      toast.error("Sign-in failed. Check your details and try again.");
    }
  });

  const toggle = (k: string) => setShowPw((s) => ({ ...s, [k]: !s[k] }));
  const regErr = regForm.formState.errors;
  const loginErr = loginForm.formState.errors;
  const regBusy = regForm.formState.isSubmitting;
  const loginBusy = loginForm.formState.isSubmitting;

  return (
    <div className="right-panel">
      <div className="form-container">
        {/* Tab switcher */}
        <div className="tab-switcher">
          <button
            type="button"
            className={cx("tab-btn", tab === "register" && "active")}
            onClick={() => setTab("register")}
          >
            Create account
          </button>
          <button
            type="button"
            className={cx("tab-btn", tab === "login" && "active")}
            onClick={() => setTab("login")}
          >
            Sign in
          </button>
        </div>

        {/* REGISTER */}
        <form
          className={cx("form-panel", tab === "register" && "active")}
          onSubmit={onRegister}
          noValidate
        >
          <div className="step-dots">
            <div className={cx("step-dot", "step-dot-1", step >= 2 ? "done" : "active")} />
            <div className={cx("step-dot", "step-dot-2", step === 2 && "active")} />
            <div className="step-dot step-dot-3" />
          </div>

          <div className="form-header">
            <h1 className="form-title">
              {step === 1 ? "Create your account" : "Set your password"}
            </h1>
            <p className="form-subtitle">
              {step === 1 ? "Start with your basic information" : "Choose a secure password for your account"}
            </p>
          </div>

          <div className={cx("success-msg", registered && "visible")}>
            <span>🎉</span>
            <span>Account created successfully! Redirecting you to your metrics form…</span>
          </div>

          {/* Step 1 */}
          <div style={{ display: step === 1 ? "block" : "none" }}>
            <div className="field-row">
              <div className={cx("field-group", regErr.firstName && "has-error")}>
                <label className="field-label">
                  First name <span className="req">*</span>
                </label>
                <input
                  className={cx("field-input", regErr.firstName && "error")}
                  type="text"
                  placeholder="David"
                  autoComplete="given-name"
                  {...regForm.register("firstName")}
                />
                <span className="field-error">{regErr.firstName?.message ?? "Please enter your first name"}</span>
              </div>
              <div className={cx("field-group", regErr.lastName && "has-error")}>
                <label className="field-label">
                  Last name <span className="req">*</span>
                </label>
                <input
                  className={cx("field-input", regErr.lastName && "error")}
                  type="text"
                  placeholder="Adebiyi"
                  autoComplete="family-name"
                  {...regForm.register("lastName")}
                />
                <span className="field-error">{regErr.lastName?.message ?? "Please enter your last name"}</span>
              </div>
            </div>

            <div className={cx("field-group", regErr.studentId && "has-error")}>
              <label className="field-label">
                Student ID <span className="req">*</span>
              </label>
              <div className="input-wrapper">
                <span className="input-icon">🎓</span>
                <input
                  className={cx("field-input", regErr.studentId && "error")}
                  type="text"
                  placeholder="e.g. BU/22/CSC/0000"
                  {...regForm.register("studentId")}
                />
              </div>
              <span className="field-error">{regErr.studentId?.message ?? "Please enter a valid student ID"}</span>
            </div>

            <div className={cx("field-group", regErr.email && "has-error")}>
              <label className="field-label">
                University email <span className="req">*</span>
              </label>
              <div className="input-wrapper">
                <span className="input-icon">✉️</span>
                <input
                  className={cx("field-input", regErr.email && "error")}
                  type="email"
                  placeholder="yourname@university.edu.ng"
                  autoComplete="email"
                  {...regForm.register("email")}
                />
              </div>
              <span className="field-error">{regErr.email?.message ?? "Please enter a valid email address"}</span>
            </div>

            <div className={cx("field-group", regErr.department && "has-error")}>
              <label className="field-label">
                Department <span className="req">*</span>
              </label>
              <select
                className="field-select"
                defaultValue=""
                {...regForm.register("department")}
              >
                <option value="" disabled>
                  Select your department
                </option>
                {DEPARTMENTS.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
              <span className="field-error">{regErr.department?.message ?? "Please select your department"}</span>
            </div>

            <button type="button" className="btn-submit" onClick={goToStep2}>
              <span className="btn-text">Continue →</span>
              <div className="spinner" />
            </button>
          </div>

          {/* Step 2 */}
          <div style={{ display: step === 2 ? "block" : "none" }}>
            <div className={cx("field-group", regErr.password && "has-error")}>
              <label className="field-label">
                Password <span className="req">*</span>
              </label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  className={cx("field-input", regErr.password && "error")}
                  type={showPw.password ? "text" : "password"}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  {...regForm.register("password")}
                />
                <button className="toggle-pw" type="button" onClick={() => toggle("password")}>
                  {showPw.password ? "Hide" : "Show"}
                </button>
              </div>
              <div className={cx("pw-strength", strength && "visible")}>
                <div className="pw-strength-bar">
                  <div
                    className="pw-strength-fill"
                    style={{ width: strength?.w ?? "0%", background: strength?.color }}
                  />
                </div>
                <div className="pw-strength-label" style={{ color: strength?.color }}>
                  {strength?.text ?? "—"}
                </div>
              </div>
              <span className="field-error">{regErr.password?.message ?? "Password must be at least 8 characters"}</span>
            </div>

            <div className={cx("field-group", regErr.confirm && "has-error")}>
              <label className="field-label">
                Confirm password <span className="req">*</span>
              </label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  className={cx("field-input", regErr.confirm && "error")}
                  type={showPw.confirm ? "text" : "password"}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  {...regForm.register("confirm")}
                />
                <button className="toggle-pw" type="button" onClick={() => toggle("confirm")}>
                  {showPw.confirm ? "Hide" : "Show"}
                </button>
              </div>
              <span className="field-error">{regErr.confirm?.message ?? "Passwords do not match"}</span>
            </div>

            <div className="terms-row">
              <div
                className={cx("custom-checkbox", terms && "checked")}
                role="checkbox"
                aria-checked={!!terms}
                tabIndex={0}
                onClick={() => regForm.setValue("terms", (!terms) as true, { shouldValidate: true })}
                onKeyDown={(e) => {
                  if (e.key === " " || e.key === "Enter") {
                    e.preventDefault();
                    regForm.setValue("terms", (!terms) as true, { shouldValidate: true });
                  }
                }}
              />
              <span className="terms-text">
                I agree to MealBuddy&apos;s <Link href="/settings">Terms of Service</Link> and{" "}
                <Link href="/settings">Privacy Policy</Link>. My data will be used only to generate
                personalised food recommendations.
              </span>
            </div>
            {regErr.terms && (
              <span className="field-error" style={{ display: "block", marginBottom: 12 }}>
                {regErr.terms.message}
              </span>
            )}

            <button type="submit" className={cx("btn-submit", regBusy && "loading")} disabled={regBusy}>
              <span className="btn-text">Create my account</span>
              <div className="spinner" />
            </button>

            <div style={{ marginTop: 14 }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                  fontSize: "0.83rem",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                ← Back
              </button>
            </div>
          </div>

          <div className="divider">or</div>
          <div className="alt-action">
            Already have an account?{" "}
            <a href="#" onClick={(e) => { e.preventDefault(); setTab("login"); }}>
              Sign in
            </a>
          </div>
        </form>

        {/* LOGIN */}
        <form className={cx("form-panel", tab === "login" && "active")} onSubmit={onLogin} noValidate>
          <div className="form-header">
            <h1 className="form-title">Welcome back</h1>
            <p className="form-subtitle">Sign in to view your meal recommendations</p>
          </div>

          <div className={cx("success-msg", loggedIn && "visible")}>
            <span>✅</span>
            <span>Signed in! Redirecting to your dashboard…</span>
          </div>

          <div className={cx("field-group", loginErr.identifier && "has-error")}>
            <label className="field-label">
              Student ID or email <span className="req">*</span>
            </label>
            <div className="input-wrapper">
              <span className="input-icon">🎓</span>
              <input
                className={cx("field-input", loginErr.identifier && "error")}
                type="text"
                placeholder="BU/22/CSC/0000 or email"
                autoComplete="username"
                {...loginForm.register("identifier")}
              />
            </div>
            <span className="field-error">{loginErr.identifier?.message ?? "Please enter your student ID or email"}</span>
          </div>

          <div className={cx("field-group", loginErr.password && "has-error")}>
            <label className="field-label">
              Password <span className="req">*</span>
            </label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                className={cx("field-input", loginErr.password && "error")}
                type={showPw.login ? "text" : "password"}
                placeholder="Your password"
                autoComplete="current-password"
                {...loginForm.register("password")}
              />
              <button className="toggle-pw" type="button" onClick={() => toggle("login")}>
                {showPw.login ? "Hide" : "Show"}
              </button>
            </div>
            <span className="field-error">{loginErr.password?.message ?? "Please enter your password"}</span>
          </div>

          <div className="forgot-row">
            <Link href="/auth" className="forgot-link">
              Forgot password?
            </Link>
          </div>

          <button type="submit" className={cx("btn-submit", loginBusy && "loading")} disabled={loginBusy}>
            <span className="btn-text">Sign in →</span>
            <div className="spinner" />
          </button>

          <div className="divider">or</div>
          <div className="alt-action">
            New to MealBuddy?{" "}
            <a href="#" onClick={(e) => { e.preventDefault(); setTab("register"); }}>
              Create an account
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
