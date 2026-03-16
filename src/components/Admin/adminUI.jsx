// src/components/Admin/adminUI.jsx
// Reusable admin UI primitive components.
// Thin wrappers that apply design tokens from adminStyles.js.

import { A, colors, spacing, typography, adminCss } from "../../lib/adminStyles";

/**
 * AdminButton -- Three variants (primary, secondary, danger) with loading and disabled states.
 */
export function AdminButton({
  children,
  variant = "primary",
  size = "standard",
  loading = false,
  disabled = false,
  style,
  ...props
}) {
  const isDisabled = loading || disabled;
  const base = variant === "danger" ? A.btnDanger
    : variant === "secondary" ? A.btnSecondary
    : A.btnPrimary;
  const sizeOverride = size === "small" ? A.btnSmall : {};
  const className = "admin-btn" + (variant === "primary" ? " admin-btn-primary" : variant === "danger" ? " admin-btn-danger" : " admin-btn-secondary");

  return (
    <button
      className={className}
      disabled={isDisabled}
      style={{
        ...base,
        ...sizeOverride,
        opacity: isDisabled ? 0.5 : 1,
        cursor: isDisabled ? "not-allowed" : "pointer",
        ...style,
      }}
      {...props}
    >
      {loading && (
        <span
          style={{
            width: 8,
            height: 8,
            border: "2px solid currentColor",
            borderTopColor: "transparent",
            borderRadius: 999,
            display: "inline-block",
            animation: "spin 0.6s linear infinite",
          }}
        />
      )}
      {children}
    </button>
  );
}

/**
 * AdminInput -- Text input with optional label and focus ring via CSS class.
 */
export function AdminInput({
  label,
  type = "text",
  style,
  ...props
}) {
  return (
    <div style={{ marginBottom: spacing.lg }}>
      {label && <label style={A.inputLabel}>{label}</label>}
      <input
        type={type}
        className="admin-input"
        style={{ ...A.input, ...style }}
        {...props}
      />
    </div>
  );
}

/**
 * AdminTextarea -- Textarea with optional label and focus ring via CSS class.
 */
export function AdminTextarea({ label, style, ...props }) {
  return (
    <div style={{ marginBottom: spacing.lg }}>
      {label && <label style={A.inputLabel}>{label}</label>}
      <textarea
        className="admin-input"
        style={{ ...A.textarea, ...style }}
        {...props}
      />
    </div>
  );
}

/**
 * AdminCard -- Card container with optional title.
 */
export function AdminCard({ title, children, style, ...props }) {
  return (
    <div style={{ ...A.card, ...style }} {...props}>
      {title && <div style={A.cardTitle}>{title}</div>}
      {children}
    </div>
  );
}

/**
 * AdminLabel -- Standalone label element using token styles.
 */
export function AdminLabel({ children, style }) {
  return <div style={{ ...A.inputLabel, ...style }}>{children}</div>;
}

/**
 * AdminStyles -- Render once in AdminPanel to inject admin-specific CSS for focus/hover states.
 */
export function AdminStyles() {
  return <style>{adminCss}</style>;
}
