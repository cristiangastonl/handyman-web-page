# Handyman Zurich 🔧

Professional handyman services website for Zurich, Switzerland.

## Features

- Clean, responsive landing page
- Photo carousels organized by work category
- Integrated Google Reviews
- Admin panel for content management
- FAQ section
- Social media integration (Facebook, YouTube)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- npm (comes with Node.js)

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/handyman-zurich.git
cd handyman-zurich

# Install dependencies
npm install

# Start development server
npm run dev
```

The site will open at [http://localhost:3000](http://localhost:3000).

### Build for Production

```bash
npm run build
```

The output will be in the `dist/` folder, ready to deploy.

### Preview Production Build

```bash
npm run preview
```

## Tech Stack

- **React 18** — UI components
- **Vite** — Build tool & dev server
- **Inline styles** — No CSS framework dependency

## Project Structure

```
handyman-zurich/
├── public/
│   └── favicon.svg
├── src/
│   ├── App.jsx          # Main application component
│   └── main.jsx         # React entry point
├── index.html           # HTML entry point
├── package.json
├── vite.config.js
└── README.md
```

## Deployment

The `dist/` folder from `npm run build` can be deployed to any static hosting:

- **Vercel**: `npx vercel`
- **Netlify**: Drag & drop the `dist/` folder
- **GitHub Pages**: Use `gh-pages` package

## License

Private project — All rights reserved.
