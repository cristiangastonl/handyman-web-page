# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Handyman services landing page for Zurich, Switzerland. Single-page React app with Vite.

## Commands

- `npm run dev` — Start dev server on http://localhost:3000 (auto-opens browser)
- `npm run build` — Production build to `dist/`
- `npm run preview` — Preview production build

No test runner or linter is configured.

## Architecture

This is a **single-component app**. Almost all code lives in `src/App.jsx` (~637 lines), which contains:

- **Animation utilities**: `useFadeIn` hook, `AnimatedCounter`, `FadeIn` wrapper component
- **Constants**: brand color (`R = "#C62828"`), phone number, WhatsApp link, Google Maps embed, service categories (`CATS`), work portfolio (`WORK`), reviews (`REVIEWS`), FAQs (`FAQS`), social URLs
- **UI components** (defined in same file): `Stars`, `Socials`, `Logo`, `Carousel`, `GoogleG`
- **Main `App` component**: renders all page sections (hero, services, work gallery, reviews, FAQ, footer) with a lightbox modal for images
- **Inline styles**: all styling uses React inline style objects and a `<style>` tag injected via template literal (`css` variable at bottom). No CSS files or framework.

Entry point: `src/main.jsx` renders `<App />` into `#root`.

## Key Conventions

- **No component files**: everything is in `App.jsx`. When adding sections or components, add them to this file.
- **Inline styles only**: no CSS modules, Tailwind, or external stylesheets. Style objects are defined inline or in the `S` constant at the bottom of `App.jsx`.
- **Global CSS** is injected via a template literal string (`css` variable) rendered as a `<style>` tag.
- **Static assets** go in `public/`.
