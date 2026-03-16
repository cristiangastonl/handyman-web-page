// src/lib/adminStyles.js
// Admin panel design tokens and compound styles.
// Consumed by adminUI.jsx primitives and admin components.
// Does NOT modify or depend on the S object in constants.js.

import { R } from "./constants";

// ── Color Tokens ──
export const colors = {
  brand: R,
  brandLight: "#FFF3E8",
  brandDark: "#C06A18",

  // Warm neutral grays (complement orange, not cool blue-gray)
  gray50:  "#FAFAF8",
  gray100: "#F5F3F0",
  gray200: "#E8E6E3",
  gray300: "#D4D1CC",
  gray400: "#AAA69F",
  gray500: "#888480",
  gray600: "#6B6762",
  gray700: "#555250",
  gray800: "#333130",
  gray900: "#222120",

  white: "#FFFFFF",

  // Semantic
  success:      "#2E7D4F",
  successLight: "#E8F5EE",
  danger:       "#D64545",
  dangerLight:  "#FEF2F2",
  info:         "#3B82F6",
  infoLight:    "#EFF6FF",
};

// ── Spacing (4px base grid) ──
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 48,
};

// ── Typography ──
export const typography = {
  pageTitle:     { fontSize: 18, fontWeight: 700, lineHeight: 1.3, color: colors.gray900 },
  sectionHeader: { fontSize: 14, fontWeight: 600, lineHeight: 1.4, color: colors.gray900 },
  body:          { fontSize: 13, fontWeight: 400, lineHeight: 1.6, color: colors.gray700 },
  bodyMedium:    { fontSize: 13, fontWeight: 500, lineHeight: 1.6, color: colors.gray700 },
  caption:       { fontSize: 11, fontWeight: 400, lineHeight: 1.5, color: colors.gray500 },
  label:         { fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: colors.gray600, marginBottom: spacing.xs },
};

// ── Border Radius ──
export const radii = {
  sm: 4,
  md: 8,
  lg: 12,
  full: 999,
};

// ── Shadows ──
export const shadows = {
  sm: "0 1px 3px rgba(0,0,0,0.06)",
  md: "0 4px 12px rgba(0,0,0,0.08)",
  lg: "0 8px 24px rgba(0,0,0,0.12)",
};

// ── Compound Styles (the A object) ──
export const A = {
  // Card
  card: {
    background: colors.white,
    border: "1px solid #e8e8e8",
    borderRadius: radii.lg,
    padding: spacing.xl,
    boxShadow: shadows.sm,
  },
  cardTitle: {
    ...typography.sectionHeader,
    marginBottom: spacing.md,
  },

  // Buttons
  btnPrimary: {
    background: colors.brand,
    color: colors.white,
    border: "none",
    height: 36,
    padding: "0 20px",
    borderRadius: radii.md,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  btnSecondary: {
    background: "none",
    color: colors.gray800,
    border: `1px solid ${colors.gray300}`,
    height: 36,
    padding: "0 16px",
    borderRadius: radii.md,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 500,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  btnDanger: {
    background: "none",
    color: colors.danger,
    border: `1px solid ${colors.danger}`,
    height: 36,
    padding: "0 16px",
    borderRadius: radii.md,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 500,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  btnSmall: {
    height: 28,
    padding: "0 12px",
    fontSize: 12,
  },

  // Inputs
  input: {
    width: "100%",
    height: 40,
    padding: "0 12px",
    border: `1px solid ${colors.gray300}`,
    borderRadius: radii.md,
    fontSize: 13,
    fontFamily: "inherit",
    outline: "none",
    color: colors.gray900,
    background: colors.white,
  },
  textarea: {
    width: "100%",
    padding: "10px 12px",
    border: `1px solid ${colors.gray300}`,
    borderRadius: radii.md,
    fontSize: 13,
    fontFamily: "inherit",
    outline: "none",
    color: colors.gray900,
    background: colors.white,
    resize: "vertical",
    minHeight: 80,
  },
  inputLabel: {
    ...typography.label,
    display: "block",
    marginBottom: spacing.xs,
  },

  // List
  listItem: {
    display: "flex",
    alignItems: "center",
    gap: spacing.md,
    padding: `${spacing.md}px 0`,
    borderBottom: `1px solid ${colors.gray200}`,
  },

  // Info box
  infoBox: {
    background: colors.infoLight,
    border: "1px solid #DBEAFE",
    borderRadius: radii.md,
    padding: spacing.lg,
    fontSize: 13,
    lineHeight: 1.6,
    color: colors.gray700,
  },

  // Empty state
  emptyState: {
    textAlign: "center",
    padding: `${spacing["4xl"]}px ${spacing["2xl"]}px`,
    color: colors.gray500,
    fontSize: 13,
  },
};

// ── Admin CSS for pseudo-state styles ──
// Injected as a <style> tag by AdminStyles component in adminUI.jsx
export const adminCss = `
.admin-input:focus { border-color: #D4781F !important; box-shadow: 0 0 0 3px rgba(212,120,31,0.12) !important; outline: none !important; }
.admin-btn-primary:hover { opacity: 0.88 !important; }
.admin-btn-danger:hover { background: #FEF2F2 !important; color: #D64545 !important; }
.admin-btn-secondary:hover { background: #F5F3F0 !important; }
.admin-tab:hover { background: #F5F3F0 !important; }
.admin-tabs::-webkit-scrollbar { display: none; }
.admin-tabs { -ms-overflow-style: none; scrollbar-width: none; }
@keyframes admin-flash-in {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes admin-flash-out {
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(-4px); }
}
@media (prefers-reduced-motion: reduce) {
  .admin-flash { animation: none !important; }
}
`;
