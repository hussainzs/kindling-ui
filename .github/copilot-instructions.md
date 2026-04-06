---
applyTo: "**/*"
---

# Kindling UI Project Conventions

These rules apply to all tasks in the Kindling UI project.

## Architecture & Repository Structure
- The project explicitly separates a `client` (frontend) and `server` (backend).
- **Dependency Management**: This is NOT a standard npm workspace. Manage dependencies per folder. Run `npm run install:all` from the root to install both, or use `--prefix` (e.g., `npm install <pkg> --prefix client`).
- **Commands**: Run down both servers simultaneously from the root using `npm run dev`. If only client or server is needed, cd to the respective folder and run `npm run dev` there.

The structure is as follows:
```
KINDLING-UI/
├── client/             # React frontend with Vite
  |--- assets/            # Images, SVGs, and global fonts
  |--- components/        # Reusable UI (Buttons, Navbar, Modals)
  |--- pages/             # "Views" or "Screens" mapped to routes
  |--- routes/            # Route definitions and configuration
  |--- hooks/             # Custom React hooks
|--- services/          # API calls and external integrations
└── server/             # Node.js backend with express
└── .gitignore
└── package.json        # Root package.json for scripts and dev dependencies
└── package-lock.json
└── README.md
```

## CSS Organization & index.css Pattern

### Grep-Friendly Section Markers
Avoid reading the entire index.css, its too long. The `client/src/index.css` file uses consistent section markers to enable fast discovery by AI agents and developers:

**Format:** `/* SECTION: Name | keyword1, keyword2, keyword3 */`

**Benefits:**
- Fast grep search: `grep "SECTION:" client/src/index.css` lists all sections
- Specific lookups: `grep "SECTION: Button" client/src/index.css` finds button section
- Keywords allow semantic discovery even without exact section names. Read a few lines from the section start to read the section.

**TOC Location:**
The file includes a comprehensive Table of Contents (TOC) at the top with all sections, keywords, and usage guide. This TOC explains how to use grep search and when each section should be consulted.

### CSS Class Reuse Protocol
When writing React components, always:
1. Check the index.css TOC for relevant sections
2. Grep for keywords before adding new classes: `grep "btn-" client/src/index.css`
3. Prefer composition of existing classes over one-off additions, unless necessary.
4. If adding a new class, place it in the correct section using section markers as guides

## Client (Frontend) Conventions
- **Tech Stack**: React 19, TypeScript, Vite, and Tailwind CSS v4.
- **React Compiler**: Enabled via `babel-plugin-react-compiler`. Avoid manually wrapping components/hooks in `useMemo`, `useCallback`, or `memo` unless explicitly necessary—let the compiler handle it.
- **Routing**: Use React Router v7. See below for this section guidelines. 
- **Network**: The Vite dev server proxies `/api` to `http://localhost:5000`. All backend calls from the client should use relative `/api/...` paths.
- **Linting**: Uses ESLint v9 (Flat Config) + Prettier. Follow strict React hooks rules and Prettier formatting standard.
- **Imports**: Use path aliases (`@/`) for internal modules located in `client/src/` (e.g., `import Button from '@/components/ui/Button'`).

## Server (Backend) Conventions
- **Tech Stack**: Node.js, Express 5.
- **Module System**: The server uses native ECMAScript Modules (`"type": "module"`). Always use `import`/`export` syntax, and include file extensions (`.js`) in relative imports where necessary.

## React Router v7 Best Practices & Conventions

### 1. Package Usage
- **ALWAYS** use the `react-router` package.
- **NEVER** use `react-router-dom` or `@remix-run/*` as they are legacy/consolidated in v7.

### 2. Routing Mode: Data Router
- **ALWAYS** use `createBrowserRouter` (Data Router) instead of `<BrowserRouter>`.
- **REASON**: Enables advanced features like Loaders, Actions, and automatic revalidation.

### 3. Component Architecture & Routing
- **Pages**: Store full-screen views in `src/pages/`.
- **Layouts**: Use Layout Routes for shared UI (Navbar/Sidebar).
- **Outlets**: Use `<Outlet />` within Layouts to render child routes.
- **Links**: Use `<Link to="...">` or `<NavLink>` for internal navigation. **NEVER** use `<a>` tags.
- **Programmatic Navigation**: Use the `useNavigate()` hook for manual redirects or "go back" (`Maps(-1)`) logic.

### 4. Data Flow (Loaders & Actions)
- **Data Fetching**: Use `loader` functions defined in the route module. Access data via `useLoaderData()`.
- **Mutations**: Use `action` functions and the `<Form>` component (from `react-router`) for data submissions.
- **No Side Effects**: **AVOID** fetching data inside `useEffect` for page-level data.

### Performance & UX
- Define an `ErrorBoundary` export in route modules to catch and isolate errors locally.
- Hydration: For SPAs, prefer clientLoader and clientAction when bypassing server-side logic.

> Important: Use web search when you're unsure of latest standards or conventions.
