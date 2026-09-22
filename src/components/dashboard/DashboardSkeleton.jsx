export function DashboardSkeleton() {
  return (
    <div className="dash-skeleton" aria-busy="true" aria-label="Loading dashboard">
      <div className="skeleton dash-skeleton__title" />
      <div className="skeleton dash-skeleton__subtitle" />

      <div className="dash-summary-grid">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="skeleton dash-skeleton__card" />
        ))}
      </div>

      <div className="skeleton dash-skeleton__actions" />

      <div className="dash-grid">
        <div className="skeleton dash-skeleton__panel" />
        <div className="skeleton dash-skeleton__panel" />
      </div>

      <span className="sr-only">Loading dashboard…</span>
    </div>
  );
}
