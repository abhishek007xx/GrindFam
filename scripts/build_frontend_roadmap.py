import json
import os

frontend_steps = [
    {
        "stepNumber": 1,
        "title": "Internet & How the Web Works",
        "subtitle": "HTTP, HTTPS, DNS, Domain Names & Browsers",
        "description": "Learn the foundational networking mechanics that power the web: HTTP request/response lifecycles, DNS resolution, domain hosting, and browser rendering engines.",
        "guide": """### 🌐 1. How Does the Internet Work?
The internet is a global network of interconnected computers communicating via standardized protocols (TCP/IP). When a browser makes a request, packet routing delivers data across network nodes.

### 🔒 2. HTTP & HTTPS Protocols
- **HTTP**: Stateless protocol operating on port 80 over TCP.
- **HTTPS**: Encrypted HTTP using TLS/SSL certificates over port 443.
- **Key Methods**: GET, POST, PUT, DELETE, PATCH, OPTIONS.
- **Status Codes**: 2xx (Success), 3xx (Redirection), 4xx (Client Error), 5xx (Server Error).

### 🔍 3. DNS (Domain Name System)
Translates human-readable domain names (e.g. `leetcode.com`) into IP addresses (`104.18.2.14`).
Resolution hierarchy: Browser Cache -> OS Cache -> Recursive Resolver -> Root Server -> TLD Server -> Authoritative Nameserver.""",
        "codeSnippet": """# Inspect HTTP headers using curl
curl -I -v https://api.grindfam.dev/v1/health

# DNS lookup with dig
dig A leetcode.com +short""",
        "submodules": [
            {"name": "How does the internet work?", "status": "pending"},
            {"name": "What is HTTP & HTTPS?", "status": "pending"},
            {"name": "What is Domain Name?", "status": "pending"},
            {"name": "What is web hosting & CDN?", "status": "pending"},
            {"name": "DNS & how it works?", "status": "pending"},
            {"name": "Browsers & Rendering Engines", "status": "pending"}
        ],
        "interviewFaqs": [
            "What happens step-by-step when you type a URL into a web browser address bar?",
            "What is the difference between HTTP/1.1, HTTP/2, and HTTP/3 (QUIC)?",
            "How does TLS handshaking secure HTTPS traffic?"
        ],
        "topics": ["Internet", "HTTP", "DNS", "Hosting", "Browsers"],
        "problems": ["browser-url-navigation-flow", "dns-resolution-drill"],
        "icon": "globe",
        "color": "yellow",
        "sourceUrl": "https://roadmap.sh/frontend"
    },
    {
        "stepNumber": 2,
        "title": "HTML5 & Semantic Web Structure",
        "subtitle": "Elements, Forms, Validations, Accessibility (a11y) & SEO",
        "description": "Master semantic HTML markup, accessible form architecture, native input validation, ARIA roles, and Search Engine Optimization best practices.",
        "guide": """### 🏗️ 1. Semantic HTML Elements
Semantic markup gives meaning to Web content: `<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<aside>`, `<footer>`.

### ♿ 2. Web Accessibility (a11y)
- Use proper heading hierarchy (`<h1>` to `<h6>`).
- Always provide `alt` text for images.
- ARIA attributes (`aria-label`, `aria-expanded`, `role="button"`) when custom UI controls are necessary.
- Ensure full keyboard navigation capability (`tabindex`, `Focus indicator`).

### 🔍 3. SEO Fundamentals
- Document `<title>` and `<meta name="description">`.
- Open Graph tags (`og:title`, `og:image`) for social sharing cards.
- Structured Data (JSON-LD) for Google rich search results.""",
        "codeSnippet": """<!-- Accessible & Semantic HTML Form -->
<form action="/login" method="POST" className="space-y-4">
  <label htmlFor="email-input" className="block text-sm font-medium">
    Email Address <span className="text-red-500">*</span>
  </label>
  <input 
    id="email-input" 
    type="email" 
    required 
    aria-required="true"
    placeholder="you@example.com"
    className="w-full px-3 py-2 border rounded-lg"
  />
  <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg">
    Sign In
  </button>
</form>""",
        "submodules": [
            {"name": "Learn HTML Basics", "status": "pending"},
            {"name": "Writing Semantic HTML", "status": "pending"},
            {"name": "Forms & Native Validations", "status": "pending"},
            {"name": "Accessibility (a11y & ARIA)", "status": "pending"},
            {"name": "SEO Basics & Meta Tags", "status": "pending"}
        ],
        "interviewFaqs": [
            "Why is semantic HTML critical for SEO and Accessibility?",
            "What is the difference between `<script>`, `<script async>`, and `<script defer>`?",
            "How do `aria-hidden` and `tabindex` work?"
        ],
        "topics": ["HTML5", "Semantic Markup", "Forms", "Accessibility", "SEO"],
        "problems": ["accessible-modal-component", "semantic-form-validation"],
        "icon": "code",
        "color": "yellow",
        "sourceUrl": "https://roadmap.sh/frontend"
    },
    {
        "stepNumber": 3,
        "title": "CSS Core, Layouts & Responsive Design",
        "subtitle": "Box Model, Flexbox, CSS Grid & Media Queries",
        "description": "Master CSS styling fundamentals: Box Model (margin, border, padding, content), Flexbox, CSS Grid, relative vs absolute positioning, and fluid media queries.",
        "guide": """### 📦 1. The CSS Box Model
Every HTML element is rendered as a rectangular box:
`Total Width = content + padding + border + margin`
Use `box-sizing: border-box;` globally to include padding and border within element total width.

### 📐 2. CSS Flexbox vs CSS Grid
- **Flexbox (1D)**: Ideal for linear components (navbars, button groups, vertical stacks). `display: flex; justify-content: center; align-items: center;`
- **CSS Grid (2D)**: Ideal for two-dimensional page layouts. `display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));`

### 📱 3. Responsive Design
Mobile-first approach using CSS media queries (`@media (min-width: 768px)`) and relative units (`rem`, `em`, `vw`, `vh`, `%`).""",
        "codeSnippet": """/* Modern CSS Grid & Flexbox setup */
.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1.25rem;
  border-radius: 0.75rem;
}""",
        "submodules": [
            {"name": "Learn CSS Basics & Selectors", "status": "pending"},
            {"name": "Box Model & Specificity", "status": "pending"},
            {"name": "Making Layouts (Flexbox & Grid)", "status": "pending"},
            {"name": "Responsive Design & Media Queries", "status": "pending"},
            {"name": "CSS Units (rem, em, vh, vw, px)", "status": "pending"}
        ],
        "interviewFaqs": [
            "Explain CSS specificity calculation (inline > ID > Class > Element).",
            "What is the difference between `display: none` and `visibility: hidden`?",
            "How does `position: absolute` position itself relative to `position: relative` ancestors?"
        ],
        "topics": ["CSS3", "Box Model", "Flexbox", "CSS Grid", "Responsive"],
        "problems": ["responsive-navbar-flexbox", "dashboard-grid-layout"],
        "icon": "code",
        "color": "yellow",
        "sourceUrl": "https://roadmap.sh/frontend"
    },
    {
        "stepNumber": 4,
        "title": "JavaScript Core & Language Syntax",
        "subtitle": "Variables, Scope, Execution Context, Closures & Prototypes",
        "description": "Master core JavaScript mechanics: Data Types, Hoisting, Scope Chain, Call Stack, Event Loop, Closures, High-Order Functions, and Prototypal Inheritance.",
        "guide": """### 🧠 1. Variables & Scope
- `var`: Function-scoped, hoisted with `undefined`.
- `let` & `const`: Block-scoped, Temporal Dead Zone (TDZ).

### 🔒 2. Closures & Scopes
A closure is a function bundled together with references to its surrounding state (lexical environment).
Enables private data encapsulation in modules.

### ⚡ 3. The Event Loop & Call Stack
JavaScript is single-threaded and non-blocking using the Event Loop:
Call Stack -> Microtask Queue (Promises, process.nextTick) -> Macrotask Queue (setTimeout, setInterval, I/O).""",
        "codeSnippet": """// JavaScript Closure Example
function createCounter() {
  let count = 0;
  return {
    increment: () => ++count,
    getCount: () => count
  };
}
const counter = createCounter();
console.log(counter.increment()); // 1""",
        "submodules": [
            {"name": "Learn JS Basics & Data Types", "status": "pending"},
            {"name": "Variables (var, let, const & TDZ)", "status": "pending"},
            {"name": "Functions, Arrow Functions & 'this'", "status": "pending"},
            {"name": "Scope, Hoisting & Closures", "status": "pending"},
            {"name": "Prototypes & ES6 Classes", "status": "pending"}
        ],
        "interviewFaqs": [
            "Explain the JavaScript Event Loop, Microtasks, and Macrotasks.",
            "What is a Closure and what are its practical applications?",
            "How does the `this` keyword binding work in regular vs arrow functions?"
        ],
        "topics": ["JavaScript", "ES6+", "Closures", "Event Loop", "Prototypes"],
        "problems": ["js-closure-counter", "custom-promise-all-implementation"],
        "icon": "zap",
        "color": "yellow",
        "sourceUrl": "https://roadmap.sh/frontend"
    },
    {
        "stepNumber": 5,
        "title": "JavaScript DOM Manipulation & Async JS",
        "subtitle": "DOM APIs, Event Bubbling/Delegation, Fetch API, Promises & Async/Await",
        "description": "Learn to dynamically manipulate webpage elements, attach high-performance event listeners with event delegation, handle asynchronous network calls, and parse JSON.",
        "guide": """### 🌳 1. DOM API & Manipulation
Select elements (`querySelector`, `querySelectorAll`), modify styles, classes (`classList.add`), and attributes.

### 🎯 2. Event Delegation & Bubbling
Events trigger in 3 phases: Capturing -> Target -> Bubbling.
Event Delegation attaches a single event listener to a parent container to handle events on dynamic child elements using `event.target`.

### 📡 3. Asynchronous JS: Promises & Async/Await
Handle asynchronous network requests cleanly without callback hell.""",
        "codeSnippet": """// Async Fetch API with Error Handling
async function fetchUserData(userId) {
  try {
    const res = await fetch(`https://api.github.com/users/${userId}`);
    if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Fetch failed:', error.message);
  }
}""",
        "submodules": [
            {"name": "Learn DOM Manipulation API", "status": "pending"},
            {"name": "Events & Event Delegation", "status": "pending"},
            {"name": "Promises & Async / Await", "status": "pending"},
            {"name": "Fetch API & Ajax (XHR)", "status": "pending"},
            {"name": "Browser Storage (LocalStorage, SessionStorage, Cookies)", "status": "pending"}
        ],
        "interviewFaqs": [
            "What is Event Delegation and why is it beneficial for performance?",
            "Explain the difference between `Promise.all()`, `Promise.allSettled()`, and `Promise.race()`.",
            "What are the security implications of storing JWTs in LocalStorage vs HttpOnly Cookies?"
        ],
        "topics": ["DOM", "Events", "Fetch API", "Async/Await", "Promises"],
        "problems": ["dom-event-delegation-list", "async-retry-fetch-utility"],
        "icon": "code",
        "color": "yellow",
        "sourceUrl": "https://roadmap.sh/frontend"
    },
    {
        "stepNumber": 6,
        "title": "Version Control Systems (Git & VCS)",
        "subtitle": "Git Commands, Branching Strategies, Rebase & Merge Conflict Resolution",
        "description": "Master Git version control: commit history tracking, branching models (GitFlow, Trunk-based), interactive rebase, cherry-pick, and resolving merge conflicts.",
        "guide": """### 🌿 1. Essential Git Commands
- `git init` / `git clone`
- `git add .` && `git commit -m "feat: add user authentication"`
- `git checkout -b feature/auth` / `git switch -c feature/auth`
- `git pull --rebase origin main`
- `git push origin feature/auth`

### 🔄 2. Git Merge vs Git Rebase
- **Git Merge**: Combines histories with a dedicated merge commit. Preserves exact history context.
- **Git Rebase**: Re-applies commits on top of another base tip. Creates linear, clean commit history.""",
        "codeSnippet": """# Interactive rebase to squash last 3 commits
git rebase -i HEAD~3

# Stash work in progress
git stash push -m 'WIP navigation bar'
git stash pop""",
        "submodules": [
            {"name": "Git Basics & Installation", "status": "pending"},
            {"name": "Commits, Staging & Diffing", "status": "pending"},
            {"name": "Branching & Merging Strategies", "status": "pending"},
            {"name": "Interactive Rebase & Cherry-Pick", "status": "pending"},
            {"name": "Resolving Merge Conflicts", "status": "pending"}
        ],
        "interviewFaqs": [
            "What is the difference between `git merge` and `git rebase`?",
            "How does `git reset --soft`, `--mixed`, and `--hard` differ?",
            "Explain `git reflog` and how it recovers lost commits."
        ],
        "topics": ["Git", "VCS", "Rebase", "Branching", "Merge Conflicts"],
        "problems": ["git-conflict-resolution-drill", "git-interactive-rebase"],
        "icon": "tool",
        "color": "blue",
        "sourceUrl": "https://roadmap.sh/frontend"
    },
    {
        "stepNumber": 7,
        "title": "VCS Hosting Platforms & Code Collaboration",
        "subtitle": "GitHub, GitLab, Bitbucket & Pull Request Workflows",
        "description": "Learn remote repository hosting, Pull Request / Merge Request reviews, GitHub Actions automation, issue tracking, and branch protection rules.",
        "guide": """### 🐙 1. GitHub Workflows
- **Pull Requests**: Code review process with line-by-line comments and suggestions.
- **Branch Protection Rules**: Require PR reviews, status checks, and linear history before merging into `main`.
- **Forks & Upstreams**: Contributing to open-source software.""",
        "codeSnippet": """# Standard PR CLI flow with GitHub CLI (gh)
gh pr create --title 'feat: responsive navigation' --body 'Adds mobile hamburger menu'""",
        "submodules": [
            {"name": "GitHub Basics & Repositories", "status": "pending"},
            {"name": "GitLab & Enterprise VCS", "status": "pending"},
            {"name": "Bitbucket Workflows", "status": "pending"},
            {"name": "Pull Requests & Code Reviews", "status": "pending"},
            {"name": "GitHub Actions Basics", "status": "pending"}
        ],
        "interviewFaqs": [
            "What makes an effective Pull Request description and code review?",
            "How do branch protection rules safeguard production code?"
        ],
        "topics": ["GitHub", "GitLab", "Bitbucket", "Pull Requests", "Code Review"],
        "problems": ["github-pr-collaboration-drill"],
        "icon": "tool",
        "color": "blue",
        "sourceUrl": "https://roadmap.sh/frontend"
    },
    {
        "stepNumber": 8,
        "title": "Modern Package Managers",
        "subtitle": "npm, pnpm, yarn, package.json & Lockfiles",
        "description": "Understand JavaScript package management: semantic versioning (`^`, `~`), dependency resolution (`node_modules`), workspace monorepos, and lockfile determinism.",
        "guide": """### 📦 1. Package Managers Comparison
- **npm**: Default Node package manager using `package-lock.json`.
- **yarn**: Fast package manager with workspaces support using `yarn.lock`.
- **pnpm**: Ultra-fast, disk-space efficient using content-addressable hard links and symlinks to global store.

### 🏷️ 2. Semantic Versioning (SemVer)
`MAJOR.MINOR.PATCH` (e.g. `2.4.1`)
- `^2.4.1`: Compatible with backwards-compatible updates up to `3.0.0`.
- `~2.4.1`: Compatible with patch updates only up to `2.5.0`.""",
        "codeSnippet": """# Install dependency with pnpm
pnpm add react react-dom

# Run audit for security vulnerabilities
npm audit fix""",
        "submodules": [
            {"name": "npm (Node Package Manager)", "status": "pending"},
            {"name": "pnpm (Fast & Efficient)", "status": "pending"},
            {"name": "yarn & Yarn Workspaces", "status": "pending"},
            {"name": "package.json & SemVer Versioning", "status": "pending"},
            {"name": "Lockfiles & Deterministic Builds", "status": "pending"}
        ],
        "interviewFaqs": [
            "Why is `package-lock.json` / `pnpm-lock.yaml` essential in Git repos?",
            "How does `pnpm` save disk space compared to `npm`?"
        ],
        "topics": ["npm", "pnpm", "yarn", "SemVer", "Package Managers"],
        "problems": ["package-json-dep-audit"],
        "icon": "tool",
        "color": "blue",
        "sourceUrl": "https://roadmap.sh/frontend"
    },
    {
        "stepNumber": 9,
        "title": "Pick a Framework: React, Vue, Angular, Svelte",
        "subtitle": "Component-Driven UI Architecture & State Management",
        "description": "Choose and master a modern component framework: React.js, Vue.js, Angular, Svelte, or Solid JS. Master component lifecycles, props, state, and reactivity.",
        "guide": """### ⚛️ 1. React.js Core Concepts
- **Virtual DOM**: Reconciliation algorithm (Fiber) computes minimal DOM mutations.
- **JSX**: Declarative syntax combining HTML structures with JavaScript expressions.
- **Hooks**: `useState`, `useEffect`, `useContext`, `useMemo`, `useCallback`.

### 💚 2. Vue.js & Svelte
- **Vue.js**: Reactive proxy system (`ref()`, `reactive()`) and Single File Components (`.vue`).
- **Svelte**: Compile-time framework with zero Virtual DOM overhead.""",
        "codeSnippet": """// React Functional Component with Hooks
import React, { useState, useEffect } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    document.title = `Count: ${count}`;
  }, [count]);
  return (
    <button onClick={() => setCount(c => c + 1)} className="btn">
      Clicked {count} times
    </button>
  );
}""",
        "submodules": [
            {"name": "React.js Framework", "status": "pending"},
            {"name": "Vue.js Framework", "status": "pending"},
            {"name": "Angular Framework", "status": "pending"},
            {"name": "Svelte & SvelteKit", "status": "pending"},
            {"name": "Solid JS & Qwik", "status": "pending"}
        ],
        "interviewFaqs": [
            "What is the Virtual DOM and how does React Reconciliation work?",
            "Explain the rules of Hooks in React.",
            "What is the difference between props and state?"
        ],
        "topics": ["React", "Vue.js", "Angular", "Svelte", "Frameworks"],
        "problems": ["react-custom-hooks-exercise", "vue-reactive-state-component"],
        "icon": "code",
        "color": "purple",
        "sourceUrl": "https://roadmap.sh/frontend"
    },
    {
        "stepNumber": 10,
        "title": "Writing Modern CSS & Utility Frameworks",
        "subtitle": "Tailwind CSS, CSS Modules & Styled Components",
        "description": "Learn modern CSS methodologies: Utility-first Tailwind CSS, CSS Modules for scoped component styling, and CSS-in-JS libraries (Styled Components, Emotion).",
        "guide": """### 🎨 1. Tailwind CSS
Utility-first CSS framework providing atomic low-level utility classes (`flex`, `pt-4`, `text-center`, `hover:bg-blue-600`). Purges unused CSS at build time via PostCSS.

### 🔒 2. CSS Modules & CSS-in-JS
Scoped styling preventing global CSS namespace pollution by hashing class names at compile time (`styles.header_3a9f2`).""",
        "codeSnippet": """/* Styled Components example */
import styled from 'styled-components';

const PrimaryButton = styled.button`
  background: ${props => props.primary ? '#EA5D3A' : '#1e293b'};
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 700;
`;""",
        "submodules": [
            {"name": "Tailwind CSS Utility Framework", "status": "pending"},
            {"name": "CSS Modules (Scoped Classes)", "status": "pending"},
            {"name": "CSS-in-JS (Styled Components, Emotion)", "status": "pending"},
            {"name": "Shadcn UI & UI Component Libraries", "status": "pending"}
        ],
        "interviewFaqs": [
            "What are the pros and cons of Utility-First CSS (Tailwind) vs CSS Modules?",
            "How does Tailwind CSS achieve zero runtime performance overhead?"
        ],
        "topics": ["Tailwind", "CSS Modules", "Styled Components", "Shadcn UI"],
        "problems": ["tailwind-responsive-card-grid"],
        "icon": "code",
        "color": "purple",
        "sourceUrl": "https://roadmap.sh/frontend"
    },
    {
        "stepNumber": 11,
        "title": "CSS Architecture & Preprocessors",
        "subtitle": "BEM Methodology, Sass / SCSS & PostCSS",
        "description": "Maintain scalable enterprise CSS codebases using BEM (Block Element Modifier) naming conventions, Sass CSS preprocessor nesting and mixins, and PostCSS plugins.",
        "guide": """### 🧱 1. BEM (Block Element Modifier)
- **Block**: Standalone entity (`.card`, `.nav`).
- **Element**: Part of block (`.card__title`, `.nav__item`).
- **Modifier**: Variation (`.card--featured`, `.button--disabled`).

### 💅 2. Sass / SCSS
Pre-processor adding variables, nesting, mixins (`@mixin`), extensions (`@extend`), and module imports (`@use`).""",
        "codeSnippet": """/* SCSS Mixin & Nesting */
@mixin flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

.hero-banner {
  @include flex-center;
  background: #0f172a;
  
  &__heading {
    font-size: 2rem;
    color: #f8fafc;
    
    &--highlight {
      color: #EA5D3A;
    }
  }
}""",
        "submodules": [
            {"name": "BEM (Block Element Modifier)", "status": "pending"},
            {"name": "CSS Preprocessors (Sass / SCSS)", "status": "pending"},
            {"name": "PostCSS & Autoprefixer", "status": "pending"}
        ],
        "interviewFaqs": [
            "Why is BEM naming convention useful in large team web projects?",
            "What is PostCSS Autoprefixer and why is it necessary for cross-browser support?"
        ],
        "topics": ["BEM", "Sass", "SCSS", "PostCSS", "CSS Architecture"],
        "problems": ["sass-theme-mixin-system"],
        "icon": "code",
        "color": "purple",
        "sourceUrl": "https://roadmap.sh/frontend"
    },
    {
        "stepNumber": 12,
        "title": "Build Tools: Linters, Formatters & Code Quality",
        "subtitle": "ESLint, Prettier, Biome & Husky Git Hooks",
        "description": "Enforce automated code quality, formatting consistency, and error prevention using ESLint, Prettier, Biome, and git pre-commit hooks via Husky and lint-staged.",
        "guide": """### 🧹 1. ESLint & Code Linting
Analyzes static JavaScript/TypeScript code to discover syntax errors, unused variables, anti-patterns, and hook dependency issues.

### 🎨 2. Prettier Formatters
Opinionated automatic code formatter for consistent indentation, quotes, semicolons, and trailing commas across teams.

### 🐶 3. Git Hooks with Husky
Automatically trigger `npm run lint` and `npm run format` on staged files prior to Git commit.""",
        "codeSnippet": """// .eslintrc.js config snippet
module.exports = {
  extends: ['eslint:recommended', 'plugin:react/recommended', 'prettier'],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'no-unused-vars': 'warn'
  }
};""",
        "submodules": [
            {"name": "ESLint Static Code Analysis", "status": "pending"},
            {"name": "Prettier Automatic Code Formatting", "status": "pending"},
            {"name": "Biome Toolchain (All-in-one)", "status": "pending"},
            {"name": "Husky & lint-staged Git Hooks", "status": "pending"}
        ],
        "interviewFaqs": [
            "What is the difference between code linting (ESLint) and code formatting (Prettier)?",
            "How do pre-commit hooks enforce code quality before code reaches GitHub?"
        ],
        "topics": ["ESLint", "Prettier", "Biome", "Husky", "Code Quality"],
        "problems": ["eslint-custom-rule-setup"],
        "icon": "tool",
        "color": "blue",
        "sourceUrl": "https://roadmap.sh/frontend"
    },
    {
        "stepNumber": 13,
        "title": "Build Tools: Module Bundlers & Dev Servers",
        "subtitle": "Vite, Webpack, SWC, esbuild, Rollup & Parcel",
        "description": "Understand modern JavaScript bundlers, native ES modules (ESM), Hot Module Replacement (HMR), tree shaking, code splitting, and bundle size optimization.",
        "guide": """### ⚡ 1. Vite & Native ESM
Vite serves code over native ES Modules during development for instant HMR without bundling, and bundles production builds with Rollup and esbuild.

### 📦 2. Webpack & Bundler Mechanics
Webpack bundles asset dependency graphs (JS, CSS, images) into static production bundles. Features loaders (`babel-loader`, `css-loader`) and plugins (`HtmlWebpackPlugin`).

### 🌳 3. Tree Shaking & Code Splitting
Eliminates dead, unused exports from production bundles. Dynamic `import()` splits code into separate lazy-loaded chunks.""",
        "codeSnippet": """// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  }
});""",
        "submodules": [
            {"name": "Vite Dev Server & Build Tool", "status": "pending"},
            {"name": "Webpack & Loaders / Plugins", "status": "pending"},
            {"name": "esbuild & SWC High-Speed Compilers", "status": "pending"},
            {"name": "Rollup & Parcel Bundlers", "status": "pending"},
            {"name": "Code Splitting & Tree Shaking", "status": "pending"}
        ],
        "interviewFaqs": [
            "Why is Vite dramatically faster than Webpack in development?",
            "What is Tree Shaking and how does ES6 module syntax (`import`/`export`) enable it?"
        ],
        "topics": ["Vite", "Webpack", "esbuild", "Bundlers", "Code Splitting"],
        "problems": ["vite-custom-plugin-setup", "webpack-code-split-optimization"],
        "icon": "tool",
        "color": "blue",
        "sourceUrl": "https://roadmap.sh/frontend"
    },
    {
        "stepNumber": 14,
        "title": "Frontend Testing: Unit, Integration & E2E",
        "subtitle": "Vitest, Jest, React Testing Library, Playwright & Cypress",
        "description": "Master automated testing strategies: Unit tests, component integration testing with React Testing Library, mock service workers (MSW), and End-to-End (E2E) testing with Playwright.",
        "guide": """### 🧪 1. Testing Pyramid
- **Unit Tests**: Test isolated utility functions and pure logic (Vitest / Jest).
- **Integration Tests**: Test UI components interacting together (React Testing Library).
- **E2E Tests**: Test full real browser user journeys (Playwright / Cypress).

### 🎭 2. React Testing Library Philosophy
Test components based on how users interact with them, querying by accessible text, label, and role (`getByRole('button')`) rather than implementation details.""",
        "codeSnippet": """// React Testing Library with Vitest
import { render, screen, fireEvent } from '@testing-library/react';
import { Counter } from './Counter';

test('increments counter on button click', () => {
  render(<Counter />);
  const button = screen.getByRole('button');
  fireEvent.click(button);
  expect(screen.getByText(/Clicked 1 times/i)).toBeInTheDocument();
});""",
        "submodules": [
            {"name": "Vitest & Jest Unit Testing", "status": "pending"},
            {"name": "React Testing Library (RTL)", "status": "pending"},
            {"name": "Playwright End-to-End Testing", "status": "pending"},
            {"name": "Cypress E2E Testing", "status": "pending"},
            {"name": "MSW (Mock Service Worker)", "status": "pending"}
        ],
        "interviewFaqs": [
            "Why does React Testing Library discourage testing component state directly?",
            "How does MSW (Mock Service Worker) intercept network calls at the network layer?"
        ],
        "topics": ["Testing", "Vitest", "Jest", "Playwright", "Cypress"],
        "problems": ["unit-test-component-rtl", "e2e-login-flow-playwright"],
        "icon": "award",
        "color": "green",
        "sourceUrl": "https://roadmap.sh/frontend"
    },
    {
        "stepNumber": 15,
        "title": "Authentication Strategies & User Identity",
        "subtitle": "JWT, OAuth 2.0, SSO, Session Auth & Cookie Security",
        "description": "Implement enterprise web authentication: JSON Web Tokens (JWT), OAuth 2.0 social sign-in (Google/GitHub), Single Sign-On (SSO), HttpOnly cookies, and Refresh Token rotation.",
        "guide": """### 🔑 1. Session-Based vs JWT Token Authentication
- **Session Auth**: Server stores session state in memory/Redis, sends `session_id` in HttpOnly Cookie.
- **JWT Auth**: Stateless token containing signed payload (`{ sub, exp, role }`). Sent in `Authorization: Bearer <token>` header or HttpOnly Cookie.

### 🛡️ 2. Secure Token Storage
Never store sensitive JWT access tokens in LocalStorage due to XSS vulnerability. Use `HttpOnly`, `SameSite=Strict`, `Secure` cookies for refresh tokens.""",
        "codeSnippet": """// Axios Interceptor for Automatic JWT Refresh Token Rotation
apiClient.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      await refreshAccessToken();
      return apiClient(error.config);
    }
    return Promise.reject(error);
  }
);""",
        "submodules": [
            {"name": "JWT (JSON Web Tokens)", "status": "pending"},
            {"name": "OAuth 2.0 & OpenID Connect (OIDC)", "status": "pending"},
            {"name": "SSO (Single Sign-On)", "status": "pending"},
            {"name": "Session-based Authentication & Cookies", "status": "pending"},
            {"name": "Passkeys & WebAuthn", "status": "pending"}
        ],
        "interviewFaqs": [
            "Why is storing JWT tokens in LocalStorage unsafe against XSS attacks?",
            "Explain the OAuth 2.0 Authorization Code Flow with PKCE."
        ],
        "topics": ["JWT", "OAuth", "SSO", "Authentication", "Security"],
        "problems": ["jwt-auth-interceptor-flow"],
        "icon": "shield",
        "color": "red",
        "sourceUrl": "https://roadmap.sh/frontend"
    },
    {
        "stepNumber": 16,
        "title": "Web Security Basics & Vulnerabilities",
        "subtitle": "CORS, HTTPS, Content Security Policy (CSP) & OWASP Top 10",
        "description": "Secure frontend applications against OWASP Top 10 vulnerabilities: Cross-Site Scripting (XSS), Cross-Site Request Forgery (CSRF), CORS misconfigurations, and CSP headers.",
        "guide": """### 🛡️ 1. CORS (Cross-Origin Resource Sharing)
Browser security mechanism enforcing Same-Origin Policy (SOP). Server must return `Access-Control-Allow-Origin: https://myfrontend.com` header for cross-origin requests.

### 🔒 2. XSS & CSRF Mitigation
- **XSS (Cross-Site Scripting)**: Escape user input HTML. React escapes JSX values by default.
- **CSRF (Cross-Site Request Forgery)**: Mitigate with Anti-CSRF tokens and `SameSite=Lax/Strict` cookies.

### 📜 3. Content Security Policy (CSP)
HTTP header restricting resource origins (scripts, styles, images): `Content-Security-Policy: default-src 'self'; script-src 'self' https://trusted.cdn.com`""",
        "codeSnippet": """/* Security HTTP Headers config */
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-rAnd0m';
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin""",
        "submodules": [
            {"name": "CORS (Cross-Origin Resource Sharing)", "status": "pending"},
            {"name": "HTTPS & SSL/TLS Encryption", "status": "pending"},
            {"name": "Content Security Policy (CSP)", "status": "pending"},
            {"name": "OWASP Security Risks (XSS, CSRF)", "status": "pending"}
        ],
        "interviewFaqs": [
            "What is a CORS preflight request (`OPTIONS`) and when does the browser trigger it?",
            "How does Content Security Policy (CSP) stop reflected XSS scripts?"
        ],
        "topics": ["CORS", "HTTPS", "CSP", "OWASP", "XSS", "CSRF"],
        "problems": ["xss-sanitization-utility", "cors-express-middleware-fix"],
        "icon": "shield",
        "color": "red",
        "sourceUrl": "https://roadmap.sh/frontend"
    },
    {
        "stepNumber": 17,
        "title": "Web Components & Native Modular UI",
        "subtitle": "Custom Elements, Shadow DOM & HTML Templates",
        "description": "Build framework-agnostic native web components using W3C standards: Custom Elements API (`customElements.define`), Shadow DOM encapsulation, and `<template>` tags.",
        "guide": """### 🧩 1. Web Components Standards
- **Custom Elements**: Define reusable HTML tags (`<user-avatar>`).
- **Shadow DOM**: Provides scoped DOM tree and styles isolated from global CSS.
- **HTML Templates**: Declarative template structures instantiated dynamically.""",
        "codeSnippet": """// Native Custom Element with Shadow DOM
class UserBadge extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>:host { font-weight: bold; color: #EA5D3A; }</style>
      <span>GrindFam Pro</span>
    `;
  }
}
customElements.define('user-badge', UserBadge);""",
        "submodules": [
            {"name": "Custom Elements API", "status": "pending"},
            {"name": "Shadow DOM Encapsulation", "status": "pending"},
            {"name": "HTML Templates & Slots", "status": "pending"}
        ],
        "interviewFaqs": [
            "What is Shadow DOM open vs closed mode?",
            "What are the benefits of Web Components over framework-specific components?"
        ],
        "topics": ["Web Components", "Custom Elements", "Shadow DOM", "Templates"],
        "problems": ["native-web-component-tooltip"],
        "icon": "code",
        "color": "yellow",
        "sourceUrl": "https://roadmap.sh/frontend"
    },
    {
        "stepNumber": 18,
        "title": "Type Checkers: TypeScript Masterclass",
        "subtitle": "Static Types, Interfaces, Generics, Utility Types & Type Narrowing",
        "description": "Master TypeScript static typing for robust frontend applications: Type Inference, Interfaces vs Type Aliases, Generics (`<T>`), Union & Intersection types, and Utility Types (`Partial`, `Pick`, `Omit`).",
        "guide": """### 📘 1. TypeScript Core Fundamentals
TypeScript compiles to plain JavaScript while catching type errors at build time.

### 🧬 2. Generics & Utility Types
Generics enable reusable, type-safe functions and data structures.
- `Partial<T>`: Makes all properties optional.
- `Pick<T, K>`: Extracts subset of properties.
- `Omit<T, K>`: Removes subset of properties.""",
        "codeSnippet": """// TypeScript Interface & Generic Function
interface UserProfile {
  id: string;
  username: string;
  email: string;
  rating?: number;
}

async function fetchApiData<T>(url: string): Promise<T> {
  const res = await fetch(url);
  return res.json() as Promise<T>;
}""",
        "submodules": [
            {"name": "TypeScript Syntax & Compiler Config", "status": "pending"},
            {"name": "Interfaces vs Type Aliases", "status": "pending"},
            {"name": "Generics & High-Level Constraints", "status": "pending"},
            {"name": "Utility Types (Pick, Omit, Record, Partial)", "status": "pending"},
            {"name": "Type Narrowing & Discriminated Unions", "status": "pending"}
        ],
        "interviewFaqs": [
            "What is the difference between `type` and `interface` in TypeScript?",
            "How does Discriminated Union pattern work in TypeScript pattern matching?"
        ],
        "topics": ["TypeScript", "Generics", "Interfaces", "Utility Types", "Types"],
        "problems": ["ts-generic-api-response-wrapper", "ts-discriminated-union-state"],
        "icon": "code",
        "color": "blue",
        "sourceUrl": "https://roadmap.sh/frontend"
    },
    {
        "stepNumber": 19,
        "title": "SSR & Meta Frameworks (Next.js, Nuxt, SvelteKit)",
        "subtitle": "Server-Side Rendering, App Router, Hydration & Server Components",
        "description": "Architect high-performance web apps with Next.js (App Router, Server Components, Server Actions), Nuxt.js, or SvelteKit for optimal SEO and instant initial page load speeds.",
        "guide": """### 🚀 1. Rendering Strategies
- **CSR (Client-Side Rendering)**: Empty HTML shell, JS fetches data in browser.
- **SSR (Server-Side Rendering)**: HTML rendered on server per request.
- **SSG (Static Site Generation)**: HTML generated at build time.
- **ISR (Incremental Static Regeneration)**: Re-generates static pages in background on demand.

### ⚡ 2. React Server Components (RSC)
Server Components execute exclusively on the server, sending zero JS bundle payload to the browser.""",
        "codeSnippet": """// Next.js App Router Server Component
export default async function DashboardPage() {
  const data = await fetch('https://api.grindfam.dev/stats', { next: { revalidate: 60 } });
  const stats = await data.json();
  
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Daily LeetCode Stats</h1>
      <p>Solved Today: {stats.solved}</p>
    </main>
  );
}""",
        "submodules": [
            {"name": "Server-Side Rendering (SSR) Mechanics", "status": "pending"},
            {"name": "Next.js App Router & Server Components", "status": "pending"},
            {"name": "Nuxt.js (Vue.js SSR Framework)", "status": "pending"},
            {"name": "SvelteKit (Svelte SSR)", "status": "pending"},
            {"name": "Hydration & Rehydration Performance", "status": "pending"}
        ],
        "interviewFaqs": [
            "What is React Hydration and what causes Hydration Mismatch errors?",
            "Compare SSR vs SSG vs ISR rendering strategies in Next.js."
        ],
        "topics": ["Next.js", "SSR", "Nuxt.js", "SvelteKit", "Server Components"],
        "problems": ["nextjs-server-action-form", "isr-revalidation-route"],
        "icon": "cloud",
        "color": "indigo",
        "sourceUrl": "https://roadmap.sh/frontend"
    },
    {
        "stepNumber": 20,
        "title": "GraphQL & Advanced Data Fetching",
        "subtitle": "GraphQL Schemas, Queries, Mutations, Apollo & TanStack Query",
        "description": "Fetch data efficiently using GraphQL queries, mutations, subscriptions, Apollo Client, and handle server state management with TanStack Query (React Query).",
        "guide": """### 📊 1. GraphQL vs REST
GraphQL avoids over-fetching and under-fetching by allowing clients to request exact JSON field structures in a single request endpoint (`/graphql`).

### 🔄 2. Server State with TanStack Query
Handles caching, background re-fetching, deduplication, and optimistic UI updates automatically.""",
        "codeSnippet": """# GraphQL Query Example
query GetUserProfile($userId: ID!) {
  user(id: $userId) {
    name
    email
    solvedProblems {
      title
      difficulty
    }
  }
}""",
        "submodules": [
            {"name": "GraphQL Schema Definition Language (SDL)", "status": "pending"},
            {"name": "GraphQL Queries & Mutations", "status": "pending"},
            {"name": "Apollo Client & Relay Modern", "status": "pending"},
            {"name": "TanStack Query (React Query) Caching", "status": "pending"}
        ],
        "interviewFaqs": [
            "How does GraphQL solve the N+1 problem on backend resolvers?",
            "Why is TanStack Query preferred over Redux for managing remote server data?"
        ],
        "topics": ["GraphQL", "Apollo", "TanStack Query", "REST", "API"],
        "problems": ["graphql-query-resolver-client"],
        "icon": "database",
        "color": "teal",
        "sourceUrl": "https://roadmap.sh/frontend"
    },
    {
        "stepNumber": 21,
        "title": "Static Site Generators (SSG)",
        "subtitle": "Astro, Next.js SSG, Vuepress & Eleventy",
        "description": "Build ultra-fast content websites and documentation sites using Astro (Islands Architecture), Next.js SSG, Vuepress, and Eleventy.",
        "guide": """### 🏝️ 1. Astro & Islands Architecture
Astro renders HTML at build time and ships zero client-side JavaScript by default. Interactive UI components (React/Vue) are rendered as isolated interactive 'islands' hydrated on demand.""",
        "codeSnippet": """---
// Astro Component Frontmatter
import ReactButton from '../components/ReactButton.jsx';
---
<html lang="en">
  <body>
    <h1>Welcome to Astro Docs</h1>
    <!-- Hydrates React component only when visible -->
    <ReactButton client:visible />
  </body>
</html>""",
        "submodules": [
            {"name": "Astro Islands Architecture", "status": "pending"},
            {"name": "Next.js Static Site Generation", "status": "pending"},
            {"name": "Vuepress & VitePress Documentation", "status": "pending"},
            {"name": "Eleventy (11ty) Static Site Generator", "status": "pending"}
        ],
        "interviewFaqs": [
            "What is Islands Architecture in Astro and how does it minimize client JS bundles?",
            "When should you choose SSG over SSR?"
        ],
        "topics": ["Astro", "SSG", "Vuepress", "Eleventy", "Islands Architecture"],
        "problems": ["astro-island-hydration-demo"],
        "icon": "cloud",
        "color": "indigo",
        "sourceUrl": "https://roadmap.sh/frontend"
    },
    {
        "stepNumber": 22,
        "title": "PWAs & Modern Browser APIs",
        "subtitle": "Service Workers, WebSockets, Storage & Web Push Notifications",
        "description": "Build Progressive Web Apps (PWAs) with offline functionality, Service Worker caching strategies, WebSockets for real-time bidirectional data, and native browser APIs.",
        "guide": """### 📱 1. Progressive Web Apps (PWAs)
PWAs deliver native app experiences on the web using Web App Manifest (`manifest.json`) and Service Workers for offline caching.

### 🔌 2. Real-Time WebSockets
WebSockets maintain a continuous, full-duplex TCP connection between client and server for instant live updates (chat rooms, live leaderboards).""",
        "codeSnippet": """// Registering Service Worker for Offline Cache
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('SW Registered!', reg.scope))
      .catch(err => console.error('SW Registration Failed:', err));
  });
}""",
        "submodules": [
            {"name": "Progressive Web Apps (PWAs) & Manifest", "status": "pending"},
            {"name": "Service Workers & Offline Caching", "status": "pending"},
            {"name": "WebSockets Real-Time Communication", "status": "pending"},
            {"name": "Browser APIs (IndexedDB, Web Push, Device Orientation)", "status": "pending"}
        ],
        "interviewFaqs": [
            "What are the different Service Worker caching strategies (Cache First, Network First, Stale While Revalidate)?",
            "How do WebSockets differ from Server-Sent Events (SSE) and HTTP Long Polling?"
        ],
        "topics": ["PWAs", "Service Workers", "WebSockets", "Browser APIs", "IndexedDB"],
        "problems": ["service-worker-offline-cache-strategy", "websocket-realtime-chat-client"],
        "icon": "zap",
        "color": "yellow",
        "sourceUrl": "https://roadmap.sh/frontend"
    },
    {
        "stepNumber": 23,
        "title": "Performance Optimization & Web Vitals",
        "subtitle": "PRPL Pattern, RAIL Model, Core Web Vitals (LCP, INP, CLS) & Lighthouse",
        "description": "Optimize web application performance to achieve 100/100 Lighthouse scores: Monitor Core Web Vitals (Largest Contentful Paint, Interaction to Next Paint, Cumulative Layout Shift), eliminate render-blocking resources, and use Chrome DevTools.",
        "guide": """### ⚡ 1. Core Web Vitals (Google UX Metrics)
- **LCP (Largest Contentful Paint)**: Measures loading performance (< 2.5s).
- **INP (Interaction to Next Paint)**: Measures responsiveness to user clicks (< 200ms).
- **CLS (Cumulative Layout Shift)**: Measures visual layout stability (< 0.1).

### 🏎️ 2. PRPL Pattern
- **Push / Preload** critical assets (`<link rel="preload">`).
- **Render** initial route ASAP.
- **Pre-cache** remaining assets in background.
- **Lazy load** secondary routes on demand.""",
        "codeSnippet": """<!-- Preload critical fonts and images -->
<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin />
<link rel="modulepreload" href="/src/main.js" />""",
        "submodules": [
            {"name": "Core Web Vitals (LCP, INP, CLS)", "status": "pending"},
            {"name": "PRPL & RAIL Performance Models", "status": "pending"},
            {"name": "Lighthouse Auditing & Optimization", "status": "pending"},
            {"name": "Chrome DevTools Profiling & Flamecharts", "status": "pending"},
            {"name": "Image Optimization & Next-Gen Formats (WebP/AVIF)", "status": "pending"}
        ],
        "interviewFaqs": [
            "How do you debug and fix high Cumulative Layout Shift (CLS)?",
            "What techniques reduce Largest Contentful Paint (LCP) for hero images?"
        ],
        "topics": ["Performance", "Web Vitals", "Lighthouse", "DevTools", "Optimization"],
        "problems": ["web-vitals-cls-fix", "image-lazyloading-intersection-observer"],
        "icon": "zap",
        "color": "yellow",
        "sourceUrl": "https://roadmap.sh/frontend"
    },
    {
        "stepNumber": 24,
        "title": "Mobile & Desktop Cross-Platform Apps",
        "subtitle": "React Native, Flutter, Electron & Tauri",
        "description": "Extend frontend web development skills to cross-platform native iOS, Android, and Desktop (macOS/Windows) applications using React Native, Flutter, Electron, and Tauri.",
        "guide": """### 📱 1. Mobile Development
- **React Native**: Renders native iOS/Android UI components using JavaScript bridge or New Architecture (JSI / Fabric).
- **Flutter**: Dart framework rendering custom pixels via Skia / Impeller engine.

### 🖥️ 2. Desktop Development
- **Electron**: Bundles Node.js runtime and Chromium browser into desktop app.
- **Tauri**: Ultra-lightweight Rust backend with web view web frontend.""",
        "codeSnippet": """// React Native View Component
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>GrindFam Mobile</Text>
    </View>
  );
}""",
        "submodules": [
            {"name": "React Native (iOS & Android)", "status": "pending"},
            {"name": "Flutter & Dart Cross-Platform", "status": "pending"},
            {"name": "Electron Desktop Apps (Node + Chromium)", "status": "pending"},
            {"name": "Tauri (Lightweight Rust + Web)", "status": "pending"}
        ],
        "interviewFaqs": [
            "How does Tauri achieve a fraction of Electron's bundle size and RAM usage?",
            "What is the difference between React Native bridge and new JSI architecture?"
        ],
        "topics": ["React Native", "Flutter", "Electron", "Tauri", "Mobile", "Desktop"],
        "problems": ["react-native-flexbox-mobile-view"],
        "icon": "cloud",
        "color": "indigo",
        "sourceUrl": "https://roadmap.sh/frontend"
    }
]

print(f"Generated {len(frontend_steps)} exhaustive steps for role-frontend!")
