import { Link } from "react-router-dom";

export function DashboardPage({ title, subtitle, message, actions, children }) {
  return (
    <div className="dashboard-page-wrap">
      <header className="dashboard-page-header">
        <div>
          <p className="dashboard-page-eyebrow">Dashboard</p>
          <h1 className="dashboard-page-title">{title}</h1>
          {subtitle ? <p className="dashboard-page-subtitle">{subtitle}</p> : null}
        </div>
        {actions ? <div className="dashboard-page-actions">{actions}</div> : null}
      </header>
      {message ? <div className="dashboard-alert dashboard-alert-info">{message}</div> : null}
      {children}
    </div>
  );
}

export function DashboardCard({ title, description, actions, children, className = "" }) {
  return (
    <section className={`dashboard-card ${className}`.trim()}>
      {title ? (
        <div className="dashboard-card-head">
          <div className="dashboard-card-head-main">
            <h2 className="dashboard-card-title">{title}</h2>
            {description ? <p className="dashboard-card-desc">{description}</p> : null}
          </div>
          {actions ? <div className="dashboard-card-actions">{actions}</div> : null}
        </div>
      ) : null}
      <div className="dashboard-card-body">{children}</div>
    </section>
  );
}

export function StatCard({ label, value, hint, tone = "default", icon: Icon }) {
  const toneClass =
    tone === "success"
      ? "dashboard-stat-success"
      : tone === "warning"
        ? "dashboard-stat-warning"
        : tone === "danger"
          ? "dashboard-stat-danger"
          : tone === "accent"
            ? "dashboard-stat-accent"
            : "";

  return (
    <article className={`dashboard-stat-card ${toneClass}`}>
      <div className="dashboard-stat-top">
        <p className="dashboard-stat-label">{label}</p>
        {Icon ? (
          <span className="dashboard-stat-icon" aria-hidden="true">
            <Icon />
          </span>
        ) : null}
      </div>
      <p className="dashboard-stat-value">{value}</p>
      {hint ? <p className="dashboard-stat-hint">{hint}</p> : null}
    </article>
  );
}

export function StatGrid({ children }) {
  return <div className="dashboard-stat-grid">{children}</div>;
}

export function Badge({ children, tone = "neutral" }) {
  const toneClass =
    tone === "success"
      ? "dashboard-badge-success"
      : tone === "warning"
        ? "dashboard-badge-warning"
        : tone === "danger"
          ? "dashboard-badge-danger"
          : tone === "primary"
            ? "dashboard-badge-primary"
            : "dashboard-badge-neutral";
  return <span className={`dashboard-badge ${toneClass}`}>{children}</span>;
}

export function Alert({ children, tone = "info" }) {
  const toneClass =
    tone === "success"
      ? "dashboard-alert-success"
      : tone === "warning"
        ? "dashboard-alert-warning"
        : tone === "danger"
          ? "dashboard-alert-danger"
          : "dashboard-alert-info";
  return <div className={`dashboard-alert ${toneClass}`}>{children}</div>;
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="dashboard-empty">
      <h3>{title}</h3>
      {description ? <p>{description}</p> : null}
      {action}
    </div>
  );
}

export function FormGrid({ children, columns = 2 }) {
  return <div className={`dashboard-form-grid dashboard-form-grid-${columns}`}>{children}</div>;
}

export function Field({ label, htmlFor, hint, required, className = "", children }) {
  return (
    <label className={`dashboard-field ${className}`.trim()} htmlFor={htmlFor}>
      <span className="dashboard-field-label">
        {label}
        {required ? <span className="dashboard-field-required">*</span> : null}
      </span>
      {children}
      {hint ? <span className="dashboard-field-hint">{hint}</span> : null}
    </label>
  );
}

export function Input(props) {
  return <input className="dashboard-input" {...props} />;
}

export function Select(props) {
  return <select className="dashboard-select" {...props} />;
}

export function Textarea(props) {
  return <textarea className="dashboard-textarea" {...props} />;
}

export function Button({ children, variant = "primary", className = "", ...props }) {
  const variantClass =
    variant === "secondary"
      ? "dashboard-btn-secondary"
      : variant === "ghost"
        ? "dashboard-btn-ghost"
        : variant === "danger"
          ? "dashboard-btn-danger"
          : "dashboard-btn-primary";
  return (
    <button type="button" className={`dashboard-btn ${variantClass} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({ to, children, variant = "ghost" }) {
  const variantClass = variant === "primary" ? "dashboard-btn-primary" : "dashboard-btn-ghost";
  return (
    <Link to={to} className={`dashboard-btn ${variantClass}`}>
      {children}
    </Link>
  );
}

export function DataTable({ columns, rows, emptyMessage = "No records found." }) {
  if (!rows?.length) {
    return <EmptyState title={emptyMessage} />;
  }

  return (
    <div className="dashboard-table-wrap">
      <table className="dashboard-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              {columns.map((col) => (
                <td key={col.key}>{col.render ? col.render(row) : row[col.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ProgressBar({ label, value, max = 100 }) {
  const percent = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="dashboard-progress">
      <div className="dashboard-progress-head">
        <span>{label}</span>
        <span>{percent}%</span>
      </div>
      <div className="dashboard-progress-track">
        <div className="dashboard-progress-fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

// Legacy exports
export { DashboardPage as default };
