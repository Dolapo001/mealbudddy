// Shell for authenticated app routes. The full sidenav (ported from the
// recommendations prototype) is built in M2; this keeps the group cohesive now.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <div style={{ minHeight: "100vh", background: "var(--cream)" }}>{children}</div>;
}
