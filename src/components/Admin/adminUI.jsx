// src/components/Admin/adminUI.jsx
// Reusable admin UI primitive components.
// Thin wrappers that apply design tokens from adminStyles.js.

import { A, colors, spacing, typography, radii, adminCss } from "../../lib/adminStyles";

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
 * AdminFlash -- Color-coded flash message with icon, auto-detect error type, close button for errors.
 * Uses admin-flash CSS class for slide-down/fade-out animation.
 */
export function AdminFlash({ message, onDismiss }) {
  if (!message) return null;
  const isError = message.startsWith("Error");
  const icon = isError ? "\u2715" : "\u2713";
  const bg = isError ? colors.dangerLight : colors.successLight;
  const fg = isError ? colors.danger : colors.success;
  const borderColor = isError ? colors.danger : colors.success;

  return (
    <div
      className="admin-flash"
      style={{
        position: "sticky",
        top: 48,
        zIndex: 101,
        display: "flex",
        alignItems: "center",
        gap: spacing.sm,
        padding: `${spacing.sm}px ${spacing.lg}px`,
        background: bg,
        border: `1px solid ${borderColor}30`,
        borderRadius: radii.md,
        marginBottom: spacing.md,
        ...typography.body,
        color: fg,
        fontWeight: 500,
        animation: "admin-flash-in 0.3s ease-out",
      }}
    >
      <span style={{ fontSize: 16, lineHeight: 1 }}>{icon}</span>
      <span style={{ flex: 1 }}>{message}</span>
      {isError && (
        <button
          onClick={onDismiss}
          style={{
            background: "none",
            border: "none",
            color: fg,
            cursor: "pointer",
            fontSize: 16,
            lineHeight: 1,
            padding: 0,
          }}
        >
          {"\u2715"}
        </button>
      )}
    </div>
  );
}

/**
 * AdminStyles -- Render once in AdminPanel to inject admin-specific CSS for focus/hover states.
 */
export function AdminStyles() {
  return <style>{adminCss}</style>;
}
