---
phase: 2
slug: shell-and-feedback
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-16
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None configured |
| **Config file** | none |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npm run build` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run `npm run build` + manual visual check in dev server
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | NAVF-02 | manual-only | `npm run build` | N/A | ⬜ pending |
| 02-01-02 | 01 | 1 | NAVF-03 | manual-only | `npm run build` | N/A | ⬜ pending |
| 02-01-03 | 01 | 1 | NAVF-04 | manual-only | `npm run build` | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No test framework needed — all 3 requirements (NAVF-02, NAVF-03, NAVF-04) are visual/CSS behaviors verified by visual inspection.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Flash messages green with checkmark (success) and red with X (error), smooth fade-out | NAVF-02 | Visual CSS behavior — color, icon, animation | 1. Add a category → green flash with ✓ appears, fades after 4s. 2. Submit empty form → red flash with ✗ persists until closed |
| Tab bar sticky at top when scrolling | NAVF-03 | Visual CSS behavior — sticky positioning | Scroll down within any tab content → tab bar stays fixed at top |
| Spinner next to submit button during async | NAVF-04 | Visual CSS behavior — spinner visibility | Click any submit button → spinner appears beside text, button disabled |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
