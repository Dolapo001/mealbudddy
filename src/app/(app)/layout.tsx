import { Sidenav } from "@/components/layout/Sidenav";

// Authenticated app shell: persistent sidenav + scrollable content area.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream">
      <Sidenav />
      <div className="lg:pl-64">
        <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">{children}</div>
      </div>
    </div>
  );
}
