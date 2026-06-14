"use client";

import { useEffect } from "react";

// Reproduces the prototype's two interactions exactly:
// IntersectionObserver scroll-reveal, and the hero meal-item active toggle.
export function LandingInteractions() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        });
      },
      { threshold: 0.12 }
    );
    const reveals = document.querySelectorAll(".mb-landing .reveal");
    reveals.forEach((el) => observer.observe(el));

    const items = Array.from(document.querySelectorAll<HTMLElement>(".mb-landing .meal-item"));
    const onClick = (e: Event) => {
      items.forEach((i) => i.classList.remove("active"));
      (e.currentTarget as HTMLElement).classList.add("active");
    };
    items.forEach((item) => item.addEventListener("click", onClick));

    return () => {
      observer.disconnect();
      items.forEach((item) => item.removeEventListener("click", onClick));
    };
  }, []);

  return null;
}
