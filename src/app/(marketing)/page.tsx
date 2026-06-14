import Link from "next/link";
import "./landing.css";
import { LandingInteractions } from "@/components/marketing/LandingInteractions";

// Faithful port of the prototype landing (layout.html). Markup and classes are
// preserved 1:1; only navigation targets are corrected (register.html -> /auth).
// Note: the prototype currently comments out the nav menu links and the hero CTA
// buttons, so they are intentionally not rendered here (matches current output).
export default function LandingPage() {
  return (
    <div className="mb-landing">
      {/* NAV */}
      <nav>
        <div className="nav-logo">
          Meal<span>Buddy</span>
        </div>
        <ul className="nav-links">
          <li>
            <Link href="/auth" className="nav-cta">
              Get started
            </Link>
          </li>
        </ul>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            AI-powered · Nigerian foods · Built for students
          </div>
          <h1 className="hero-title">
            Eat <em>smarter,</em>
            <br />
            perform <span className="underline-word">better</span>
          </h1>
          <p className="hero-sub">
            Meal Buddy analyses your body metrics and health goals to recommend personalised
            meals. It powered by machine learning and the Nigerian Food Composition Table and also
            food available within Bowen University.
          </p>
          <div className="hero-stats">
            <div className="stat">
              <div className="stat-num">800+</div>
              <div className="stat-label">Nigerian foods indexed</div>
            </div>
            <div className="stat">
              <div className="stat-num">KNN &amp; RF</div>
              <div className="stat-label">ML algorithms</div>
            </div>
            <div className="stat">
              <div className="stat-num">100%</div>
              <div className="stat-label">Personalised to you</div>
            </div>
          </div>
        </div>

        {/* Hero visual */}
        <div className="hero-visual">
          <div className="float-card float-card-1">
            <div className="float-icon">🎯</div>
            <div className="float-val">98%</div>
            <div className="float-lbl">Match accuracy</div>
          </div>
          <div className="food-card-main">
            <div className="food-card-header">
              <div className="food-card-title">Today&apos;s recommendations</div>
              <div className="food-card-tag">Weight loss goal</div>
            </div>
            <div className="meal-list">
              <div className="meal-item active">
                <span className="meal-emoji">🍲</span>
                <div className="meal-info">
                  <div className="meal-name">Egusi soup + Eba</div>
                  <div className="meal-cal">480 kcal · High protein</div>
                </div>
                <div className="meal-score">94</div>
              </div>
              <div className="meal-item">
                <span className="meal-emoji">🥘</span>
                <div className="meal-info">
                  <div className="meal-name">Moi moi + Jollof rice</div>
                  <div className="meal-cal">390 kcal · Balanced</div>
                </div>
                <div className="meal-score">88</div>
              </div>
              <div className="meal-item">
                <span className="meal-emoji">🥣</span>
                <div className="meal-info">
                  <div className="meal-name">Oatmeal + Akara</div>
                  <div className="meal-cal">320 kcal · High fibre</div>
                </div>
                <div className="meal-score">82</div>
              </div>
            </div>
            <div className="macro-bar">
              <div className="macro-bar-label">
                <span>Macro breakdown</span>
                <span>480 kcal</span>
              </div>
              <div className="macro-track">
                <div className="macro-seg seg-carb" />
                <div className="macro-seg seg-prot" />
                <div className="macro-seg seg-fat" />
              </div>
              <div className="macro-legend">
                <span>
                  <span className="legend-dot" style={{ background: "var(--green-bright)" }} />
                  Carbs 55%
                </span>
                <span>
                  <span className="legend-dot" style={{ background: "var(--amber)" }} />
                  Protein 25%
                </span>
                <span>
                  <span className="legend-dot" style={{ background: "var(--red-warm)" }} />
                  Fat 20%
                </span>
              </div>
            </div>
          </div>
          <div className="float-card float-card-2">
            <div className="float-icon">⚡</div>
            <div className="float-val">+12%</div>
            <div className="float-lbl">Energy this week</div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section" id="how-it-works">
        <div className="section-label">The process</div>
        <h2 className="section-title">
          Four steps to your
          <br />
          perfect meal plan
        </h2>
        <p className="section-sub">
          From signing up to eating right — MealBuddy makes personalised nutrition effortless.
        </p>
        <div className="steps-grid">
          <div className="step-card reveal">
            <div className="step-num">01</div>
            <div className="step-icon">📋</div>
            <div className="step-title">Create your profile</div>
            <p className="step-desc">
              Register with your body metrics and health goals to get started on your nutrition
              journey.
            </p>
          </div>
          <div className="step-card reveal reveal-delay-1">
            <div className="step-num">02</div>
            <div className="step-icon">📏</div>
            <div className="step-title">Enter your metrics</div>
            <p className="step-desc">
              Input your weight, height, age, activity level, and health goal — weight loss, muscle
              gain, or maintenance.
            </p>
          </div>
          <div className="step-card reveal reveal-delay-2">
            <div className="step-num">03</div>
            <div className="step-icon">🤖</div>
            <div className="step-title">ML analyses your data</div>
            <p className="step-desc">
              KNN finds students with similar profiles and classifies you into your weight category;
              Random Forest scores and ranks Nigerian foods which are available within Bowen
              University matched to your needs.
            </p>
          </div>
          <div className="step-card reveal reveal-delay-3">
            <div className="step-num">04</div>
            <div className="step-icon">🍽️</div>
            <div className="step-title">Get your meal plan</div>
            <p className="step-desc">
              Receive daily meal recommendations with calorie counts and macro breakdowns drawn from
              Nigerian cuisine.
            </p>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features-section" id="features">
        <div className="section-label">What we offer</div>
        <h2 className="section-title">
          Built for Nigerian students,
          <br />
          powered by science
        </h2>
        <p className="section-sub">
          Every feature is designed to make healthy eating practical on a student&apos;s schedule and
          budget.
        </p>
        <div className="features-grid">
          <div className="feat-card reveal">
            <div className="feat-icon">🇳🇬</div>
            <div className="feat-title">Nigerian Food Database</div>
            <p className="feat-desc">
              All recommendations come from the official Nigerian Food Composition Table — real local
              foods you actually eat.
            </p>
          </div>
          <div className="feat-card reveal reveal-delay-1">
            <div className="feat-icon">🧬</div>
            <div className="feat-title">Body-aware recommendations</div>
            <p className="feat-desc">
              BMI, TDEE, and activity level are computed automatically so your calorie targets are
              always accurate.
            </p>
          </div>
          <div className="feat-card reveal reveal-delay-2">
            <div className="feat-icon">🎯</div>
            <div className="feat-title">Goal-focused planning</div>
            <p className="feat-desc">
              Choose weight loss, muscle gain, or maintenance — the ML model optimises your food
              scores accordingly.
            </p>
          </div>
          <div className="feat-card reveal reveal-delay-1">
            <div className="feat-icon">📊</div>
            <div className="feat-title">Macro tracking</div>
            <p className="feat-desc">
              See carb, protein, and fat breakdowns for every meal. Understand exactly what you are
              eating and why.
            </p>
          </div>
          <div className="feat-card reveal reveal-delay-2">
            <div className="feat-icon">🤝</div>
            <div className="feat-title">Collaborative learning</div>
            <p className="feat-desc">
              KNN learns from students like you. The more students use NutriGuide, the smarter the
              recommendations become.
            </p>
          </div>
          <div className="feat-card reveal reveal-delay-3">
            <div className="feat-icon">📱</div>
            <div className="feat-title">Simple interface</div>
            <p className="feat-desc">
              No complicated menus. Enter your metrics, get your plan, eat well. Designed to work on
              any device.
            </p>
          </div>
        </div>
      </section>

      {/* FOOD SHOWCASE */}
      <section className="showcase-section" id="foods">
        <div className="section-label">Sample Nigerian foods</div>
        <h2 className="section-title">
          Familiar foods,
          <br />
          optimised for you
        </h2>
        <p className="section-sub">
          NutriGuide recommends the Nigerian dishes you love — just in the right quantities for your
          goals.
        </p>
        <div className="foods-grid">
          {[
            { emoji: "🍲", name: "Egusi soup", origin: "South-West · High protein", c: "18g", p: "22g", f: "28g", d: "" },
            { emoji: "🍚", name: "Jollof rice", origin: "Pan-Nigerian · Energy-rich", c: "62g", p: "8g", f: "10g", d: "reveal-delay-1" },
            { emoji: "🫘", name: "Moi moi", origin: "Pan-Nigerian · High fibre", c: "24g", p: "14g", f: "6g", d: "reveal-delay-2" },
            { emoji: "🍠", name: "Pounded yam", origin: "South-West · Complex carbs", c: "70g", p: "4g", f: "1g", d: "" },
            { emoji: "🥣", name: "Akara (bean cakes)", origin: "Pan-Nigerian · Breakfast", c: "20g", p: "10g", f: "12g", d: "reveal-delay-1" },
            { emoji: "🥬", name: "Edikang ikong", origin: "South-South · Micronutrient-rich", c: "12g", p: "18g", f: "15g", d: "reveal-delay-2" },
          ].map((food) => (
            <div className={`food-showcase-card reveal ${food.d}`.trim()} key={food.name}>
              <div className="food-emoji-lg">{food.emoji}</div>
              <div className="food-sc-name">{food.name}</div>
              <div className="food-sc-origin">{food.origin}</div>
              <div className="food-sc-macros">
                <div className="macro-pill carb">
                  <span className="macro-pill-val">{food.c}</span>Carbs
                </div>
                <div className="macro-pill prot">
                  <span className="macro-pill-val">{food.p}</span>Protein
                </div>
                <div className="macro-pill fat">
                  <span className="macro-pill-val">{food.f}</span>Fat
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="cta-section reveal">
        <div>
          <div className="cta-title">
            Ready to eat smarter
            <br />
            at university?
          </div>
          <p className="cta-sub">Join your fellow students already eating well with NutriGuide.</p>
        </div>
        <Link href="/auth" className="btn-white">
          Start for free →
        </Link>
      </div>

      {/* FOOTER */}
      <footer>
        <div className="footer-logo">
          Meal<span>Buddy</span>
        </div>
        <div className="footer-copy">© 2025 MealBuddy · University Food Recommendation System</div>
        <div className="footer-links">
          <Link href="/settings">Privacy</Link>
          <Link href="/#features">About</Link>
          <Link href="/#foods">Contact</Link>
        </div>
      </footer>

      <LandingInteractions />
    </div>
  );
}
