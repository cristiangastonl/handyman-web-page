---
phase: 1
slug: design-system
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-16
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual verification (no test runner configured) |
| **Config file** | none |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npm run build` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run `npm run build`
- **Before `/gsd:verify-work`:** Build must succeed
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 1-01-01 | 01 | 1 | DSGN-05 | build | `npm run build` | ❌ W0 | ⬜ pending |
| 1-01-02 | 01 | 1 | DSGN-01 | build + grep | `npm run build && grep -q "fontSize.*18" src/lib/adminStyles.js` | ❌ W0 | ⬜ pending |
| 1-01-03 | 01 | 1 | DSGN-02 | build + grep | `npm run build && grep -q "AdminButton" src/components/Admin/adminUI.jsx` | ❌ W0 | ⬜ pending |
| 1-01-04 | 01 | 1 | DSGN-03 | build + grep | `npm run build && grep -q "AdminInput" src/components/Admin/adminUI.jsx` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/lib/adminStyles.js` — design tokens file (created by Phase 1)
- [ ] `src/components/Admin/adminUI.jsx` — UI primitives file (created by Phase 1)

*These files ARE the phase deliverables — no pre-existing test infrastructure needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Typography visual scale | DSGN-01 | Visual correctness needs human eye | Import primitives in a test component, verify 18/14/13/11px render correctly |
| Button variants look distinct | DSGN-02 | Color contrast and visual weight are subjective | Render all 3 button variants side by side, confirm primary=orange, secondary=ghost, danger=red |
| Input focus ring visible | DSGN-03 | Focus state requires interaction | Tab through inputs, verify brand-color focus ring appears |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
