---
phase: 3
slug: tab-content
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-16
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual visual + grep-based |
| **Config file** | none — no test runner configured |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npm run build` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run `npm run build`
- **Before `/gsd:verify-work`:** Build must succeed
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | DSGN-04 | grep | `grep -c "AdminCard" src/components/Admin/AdminPanel.jsx` | N/A | ⬜ pending |
| 03-01-02 | 01 | 1 | NAVF-01 | grep | `grep -c "Add your first" src/components/Admin/AdminPanel.jsx` | N/A | ⬜ pending |
| 03-01-03 | 01 | 1 | DSGN-04 | grep | `grep -c "AdminInput\|AdminTextarea" src/components/Admin/AdminPanel.jsx` | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No test framework needed — this is a visual/UX consistency phase verified through grep patterns and successful builds.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Card visual separation | DSGN-04 | Visual appearance requires human review | Open /admin, check each tab has distinct form and list cards with borders/shadows |
| Empty state guidance | NAVF-01 | Text content and clarity is subjective | Delete all items in a tab, verify helpful CTA text appears |
| Cross-tab consistency | DSGN-04 | Visual consistency requires comparison | Switch between all 7 tabs, verify same card/input/button styles throughout |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
