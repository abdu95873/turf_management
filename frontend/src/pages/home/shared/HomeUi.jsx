export const DS_PRIMARY = "#097E52";
export const DS_SECONDARY = "#192335";
export const DS_ACCENT = "#A4DA01";
export const DS_DARK = "#0a0f14";
export const DS_BG = "#f4f7f5";

export function HomeSectionHeading({ eyebrow, title, accent, description, align = "center", dark = false, className = "" }) {
  const alignClass = align === "center" ? "mx-auto text-center" : "text-left";
  const titleClass = dark ? "text-white" : "text-ds-secondary";
  const descClass = dark ? "text-slate-300" : "text-ds-muted";

  return (
    <div className={`mb-10 max-w-3xl ${alignClass} ${className}`}>
      {eyebrow ? (
        <span
          className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] ${
            dark ? "text-ds-accent" : "text-ds-secondary"
          }`}
        >
          <span className={`h-0.5 w-8 ${dark ? "bg-ds-accent" : "bg-ds-accent"}`} />
          {eyebrow}
        </span>
      ) : null}
      <h2 className={`mt-3 text-3xl font-extrabold uppercase leading-tight tracking-tight md:text-4xl ${titleClass}`}>
        {title}
        {accent ? <span className="text-ds-primary"> {accent}</span> : null}
      </h2>
      {description ? <p className={`mt-3 text-base leading-relaxed ${descClass}`}>{description}</p> : null}
    </div>
  );
}

export function DsLimeButton({ children, className = "", ...props }) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-xl bg-ds-accent px-6 py-3 text-sm font-bold uppercase tracking-wide text-ds-dark transition hover:bg-[#b8ef1a] disabled:opacity-60 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function DsPrimaryButton({ children, className = "", ...props }) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-xl bg-ds-primary px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-ds-secondary disabled:opacity-60 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function DsFieldLabel({ children }) {
  return <span className="mb-1.5 block text-sm font-semibold text-ds-secondary">{children}</span>;
}

export function DsInput({ className = "", ...props }) {
  return (
    <input
      className={`w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-ds-secondary outline-none transition focus:border-ds-accent focus:ring-2 focus:ring-ds-accent/20 ${className}`}
      {...props}
    />
  );
}

export function DsSelect({ className = "", ...props }) {
  return (
    <select
      className={`w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-ds-secondary outline-none transition focus:border-ds-accent focus:ring-2 focus:ring-ds-accent/20 ${className}`}
      {...props}
    />
  );
}
