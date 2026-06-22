import Link from "next/link";
import "./auth.css";
import { AuthClient } from "@/components/auth/AuthClient";

// Faithful port of the prototype auth screen (input.html). The static left panel
// and all class names are preserved; behaviour is rewired to React Hook Form +
// Zod + the Zustand auth store, with corrected routing.
export default function AuthPage() {
  return (
    <div className="mb-auth">
      {/* LEFT PANEL (static, ported verbatim) */}
      <div className="left-panel">
        <Link href="/" className="panel-logo">
          Meal<span>Buddy</span>
        </Link>

        <div className="panel-body">
          <h2 className="panel-headline">
            Your body,
            <br />
            your <em>perfect</em>
            <br />
            meal plan
          </h2>
          <p className="panel-sub">
            Sign up in seconds. Tell us your metrics, set your health goal, and let our ML engine do
            the rest — using real Nigerian foods.
          </p>

          <div className="preview-card">
            <div className="preview-row">
              <div className="preview-icon">🎓</div>
              <div className="preview-text">
                <div className="preview-label">Student ID</div>
                <div className="preview-value">BU/22/CSC/0000</div>
              </div>
              <div className="preview-badge">Verified</div>
            </div>
            <div className="preview-row">
              <div className="preview-icon">🎯</div>
              <div className="preview-text">
                <div className="preview-label">Health goal</div>
                <div className="preview-value">Weight loss</div>
              </div>
            </div>
            <div className="preview-row">
              <div className="preview-icon">🍲</div>
              <div className="preview-text">
                <div className="preview-label">Today&apos;s top pick</div>
                <div className="preview-value">Egusi soup + Eba</div>
              </div>
              <div className="preview-badge">94 score</div>
            </div>
            <div className="preview-row">
              <div className="preview-icon">⚡</div>
              <div className="preview-text">
                <div className="preview-label">Daily calories</div>
                <div className="preview-value">1,800 kcal target</div>
              </div>
            </div>
          </div>
        </div>

        <div className="panel-footer">© 2025 MealBuddy · University Food Recommendation System</div>
      </div>

      {/* RIGHT PANEL (interactive) */}
      <AuthClient />
    </div>
  );
}
