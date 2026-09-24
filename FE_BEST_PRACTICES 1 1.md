# Frontend Web Application Engineering Best Practices

> **Purpose:** This document is the engineering contract for building production-quality frontend web applications and guiding AI coding agents.
>
> **Primary principle:** Build features the way a senior frontend engineer would build and maintain them in a real production application: correctly, consistently, accessibly, performantly, and with restraint.

---

## 1. Core Engineering Principles

### 1.1 Build for production, not demos

Every implementation should be designed for real users, real data, and long-term maintenance.

Prioritize:

1. Correctness
2. Maintainability
3. Performance
4. Accessibility
5. Security
6. UX consistency
7. Developer experience

Do not introduce complexity without a real requirement.

### 1.2 Prefer simple solutions

Before adding a library, abstraction, hook, context, or utility, determine whether the existing stack already provides a solution.

Avoid:

- Unnecessary abstractions
- Premature optimization
- Duplicate utilities
- Duplicate API logic
- Over-engineered component hierarchies
- Global state for local UI state

### 1.3 Reuse before creating

Before creating a new component:

1. Search for an existing component.
2. Check the shared UI/component library.
3. Check shadcn/ui components.
4. Extend an existing component if appropriate.
5. Create a new component only when necessary.

---

# 2. Default Technology Stack

The default frontend stack is:

- **Next.js**
- **React**
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui**   (mcp-server setup follow "https://ui.shadcn.com/docs/mcp")
- **Radix UI**, through shadcn where applicable
- **Lucide React** for icons
- **Motion / Framer Motion** where animation provides UX value ("https://21st.dev/mcp")
- **Redux Toolkit**
- **RTK Query** for server-state/API caching
- **React Hook Form**
- **Zod**
- **Vitest/Jest + React Testing Library**
- **Playwright/Cypress** for E2E where required

Use the project's existing versions and configuration.

Do not upgrade major dependencies unless explicitly requested.

---

# 3. AI Coding Agent: Non-Negotiable Rules

The AI coding agent MUST follow these rules unless the user explicitly overrides them.

### Architecture

- MUST inspect the existing project structure before implementing a feature.
- MUST search for existing patterns and reusable components before creating new ones.
- MUST follow the existing architecture instead of introducing a new architecture for one feature.
- MUST keep Server/Client Component boundaries intentional in Next.js.
- MUST keep business logic separate from presentation where practical.

### UI

- MUST use shadcn/ui for standard UI components when the component exists.
- MUST reuse the project's design tokens and existing component patterns.
- MUST NOT introduce another UI component library without explicit approval.
- MUST avoid AI-generated visual clichés such as excessive gradients, glassmorphism, huge rounded cards, heavy shadows, decorative blobs, and unnecessary animations.
- MUST prioritize hierarchy, readability, usability, and consistency.

### State

- MUST distinguish server state from client/UI state.
- MUST use RTK Query for server state when RTK Query is the project's chosen API/data layer.
- MUST NOT duplicate API/server state unnecessarily inside Redux slices.
- MUST use local state for genuinely local UI state.

### Performance

- MUST consider pagination for large datasets.
- MUST consider virtualization for large lists/tables.
- MUST consider lazy loading and code splitting for expensive modules.
- MUST avoid duplicate API requests and unnecessary refetching.
- MUST optimize images and heavy client-side dependencies where appropriate.

### Reliability

- MUST handle loading, success, empty, and error states for data-driven UI.
- MUST provide retry/recovery actions where appropriate.
- MUST not expose raw backend errors to users.
- MUST preserve existing functionality.

### TypeScript

- MUST NOT use `any` to silence TypeScript errors.
- MUST use proper types for API responses, component props, and domain models.
- MUST fix type errors rather than hiding them.

### Code Changes

- MUST make the smallest reasonable change.
- MUST NOT refactor unrelated code unless explicitly requested.
- MUST NOT remove tests to make a build pass.
- MUST NOT disable lint/type-check rules without a clear reason.
- MUST verify the implementation with available linting, type checking, tests, and build commands.

---

# 4. AI Agent Workflow

Before changing code, follow this sequence.

```text
Understand
   ↓
Inspect existing architecture
   ↓
Search for reusable components/patterns
   ↓
Identify state ownership
   ↓
Identify API/data requirements
   ↓
Consider performance requirements
   ↓
Implement
   ↓
Handle Loading / Error / Empty / Success
   ↓
Accessibility + Responsive Design
   ↓
Review Performance
   ↓
Lint + Typecheck + Test + Build
```

### Step 1: Understand the application

Inspect relevant files such as:

```text
package.json
app/
components/
lib/
hooks/
services/
store/
features/
types/
```

Do not immediately start writing code.

### Step 2: Find existing patterns

Search for similar implementations.

For example:

- Existing dialogs
- Existing forms
- Existing tables
- Existing pagination
- Existing API endpoints
- Existing RTK Query slices
- Existing loading states
- Existing error states
- Existing design tokens

### Step 3: Implement consistently

Follow the existing conventions unless they clearly conflict with these guidelines.

### Step 4: Verify

Run the project's available:

```text
lint
typecheck
tests
build
```

Do not claim the feature is complete without checking the relevant validation steps.

---

# 5. Next.js Architecture

Prefer the **App Router**.

Use Next.js features appropriately:

- Server Components by default
- Client Components only when required
- Server-side data fetching where appropriate
- Route handlers where appropriate
- Dynamic imports for expensive client modules
- `loading.tsx`
- `error.tsx`
- `not-found.tsx`
- Metadata API for SEO

## 5.1 Server Components

Prefer Server Components by default.

Use them for:

- Static UI
- Server-side data fetching
- Content that does not require browser APIs
- Layouts
- Pages

## 5.2 Client Components

Do not add:

```tsx
"use client";
```

unless the component genuinely requires:

- `useState`
- `useEffect`
- Browser APIs
- Interactive event handling
- Client-only libraries
- Redux hooks
- RTK Query hooks

Keep the Client Component boundary as small as practical.

---

# 6. Component Architecture

Use a layered, feature-oriented architecture as the application grows.

Example:

```text
components/
├── ui/
│   ├── button.tsx
│   ├── dialog.tsx
│   ├── input.tsx
│   └── ...
│
├── shared/
│   ├── DataTable/
│   ├── Pagination/
│   ├── EmptyState/
│   ├── ErrorState/
│   └── LoadingState/
│
├── features/
│   ├── users/
│   │   ├── UserTable.tsx
│   │   ├── UserForm.tsx
│   │   └── UserFilters.tsx
│   └── orders/
│
└── layouts/
```

The exact structure may vary based on the existing project.

## 6.1 Component responsibility

Components should generally have one clear responsibility.

Avoid large components containing:

- API calls
- Table logic
- Filtering
- Pagination
- Modal logic
- Form validation
- Business calculations
- Complex rendering

Prefer:

```text
UserDashboard
 ├── UserFilters
 ├── UserTable
 ├── UserPagination
 └── UserFormDialog
```

Do not split components merely to reduce line count. Split when the separation improves clarity, reuse, testing, or ownership.

---

# 7. TypeScript

Use TypeScript throughout the application.

Avoid:

```ts
any
```

unless there is a genuinely unavoidable and documented reason.

Prefer:

```ts
unknown
```

when data is genuinely unknown.

Use:

- Domain types
- API response types
- Union types for finite states
- Generic types where they improve reuse
- Type-safe component props
- Type-safe API interactions

Avoid excessive type complexity.

Do not create types that unnecessarily duplicate existing types.

---

# 8. State Management

Use the smallest appropriate state scope.

## 8.1 Local UI State

Use React state for:

- Modal open/close
- Tabs
- Dropdown state
- Temporary UI state
- Local interaction state

Example:

```tsx
const [isOpen, setIsOpen] = useState(false);
```

## 8.2 Derived State

Prefer calculating derived values instead of storing them separately.

Avoid:

```tsx
const [filteredUsers, setFilteredUsers] = useState([]);
```

when `filteredUsers` can be derived from:

```text
users + filters
```

## 8.3 Global Client State

Use Redux Toolkit when state genuinely needs to be shared across unrelated parts of the application.

Potential examples:

- Application preferences
- Complex client-side workflows
- Shared UI state
- Client-only domain state

Do not put every piece of state into Redux.

---

# 9. Server State vs Client State

This distinction is mandatory.

### Server State

Examples:

- Users
- Products
- Orders
- Dashboard data
- Search results
- API responses

Use **RTK Query**.

### Client State

Examples:

- Sidebar open/closed
- Modal state
- UI preferences
- Temporary wizard state

Use:

- Local React state
- Redux Toolkit when genuinely global

Do not duplicate server state unnecessarily in Redux.

---

# 10. RTK Query

When RTK Query is part of the project, it should be the default server-state/data-fetching mechanism.

Use RTK Query for:

- Queries
- Mutations
- Caching
- Refetching
- Loading states
- Error states
- Cache invalidation

Preferred flow:

```text
Component
   ↓
RTK Query Hook
   ↓
API Slice
   ↓
Backend
```

Avoid manually implementing:

```text
useEffect
   ↓
fetch()
   ↓
setState()
```

for server state that belongs in RTK Query.

## 10.1 Cache Strategy

Use appropriate:

- `tagTypes`
- `providesTags`
- `invalidatesTags`
- `keepUnusedDataFor`
- Refetch policies
- Polling only when required

Do not invalidate the entire API cache when only one resource changed.

Prefer targeted cache invalidation.

---

# 11. API Layer

Keep API logic outside UI components.

Centralize:

- Base URL
- Authentication handling
- API endpoints
- Request types
- Response types
- Common error handling

Preferred structure:

```text
UI
 ↓
Feature Hook
 ↓
RTK Query
 ↓
API Layer
 ↓
Backend
```

Components should focus primarily on rendering and user interaction.

---

# 12. Data Fetching Contract

Every data-driven screen must consider:

- Loading
- Success
- Empty
- Error
- Refetching
- Pagination
- Filtering
- Sorting
- Caching

Never design only the happy path.

---

# 13. Pagination

Large datasets should not be downloaded and rendered entirely in the browser.

Prefer server-side pagination when supported.

Example:

```text
GET /users?page=2&limit=20
```

Pagination should preserve, where appropriate:

- Current page
- Page size
- Search
- Filters
- Sorting

Consider synchronizing these with URL search parameters when the state should be shareable or bookmarkable.

---

# 14. Virtualization

Use virtualization when rendering large numbers of DOM elements can negatively affect performance.

Potential tools:

- TanStack Virtual
- Existing virtualized table/list implementation
- Appropriate virtualization support from the project's table solution

Good candidates:

- Large tables
- Logs
- Chat/message histories
- Large search results
- Large file lists
- Large dropdowns

Do not virtualize tiny lists unnecessarily.

### Important

Virtualization is not a substitute for pagination.

For very large server datasets, prefer:

```text
Server-side pagination
        +
Virtualization when the current page/window is still large
```

where the product requirements justify it.

---

# 15. Code Splitting

Do not load expensive functionality into the initial bundle unless required.

Use dynamic imports where appropriate.

Good candidates:

- Charts
- Rich text editors
- Maps
- PDF viewers
- Large visualization libraries
- Complex admin modules

Example:

```tsx
const HeavyChart = dynamic(() => import("./HeavyChart"));
```

Do not dynamically import every component.

Code splitting should solve a meaningful bundle or loading problem.

---

# 16. Lazy Loading

Lazy-load functionality that is not required for the initial experience.

Potential candidates:

- Below-the-fold sections
- Heavy dialogs
- Secondary dashboards
- Rich editors
- Analytics modules
- Large maps

Prioritize critical content first.

---

# 17. Images and Media

Use Next.js image optimization where applicable.

Prefer:

```tsx
<Image />
```

over raw:

```html
<img />
```

unless there is a specific reason.

Consider:

- Correct dimensions
- Responsive images
- Appropriate image formats
- Lazy loading
- Priority loading only for critical above-the-fold images
- Avoiding layout shift

Do not load unnecessarily large images and scale them down with CSS.

---

# 18. Performance Engineering

Performance should be intentional rather than cosmetic.

## Rendering

Consider:

- Component boundaries
- Unnecessary re-renders
- Expensive calculations
- Large DOM trees
- Large lists
- Unnecessary state updates

Use `useMemo`, `useCallback`, and `React.memo` only when they provide a meaningful benefit.

Do not add memoization blindly.

## Network

Avoid:

- Duplicate requests
- Request waterfalls
- Unnecessary refetches
- Large API payloads
- Fetching data that is not needed

Prefer:

- Caching
- Parallel requests where appropriate
- Pagination
- Server-side filtering
- Server-side sorting

## Bundle

Consider:

- Dynamic imports
- Dependency size
- Tree-shaking-friendly imports
- Removing unused dependencies

Do not add large dependencies for trivial functionality.

---

# 19. Error Handling

Every major route and feature should have proper error handling.

Use Next.js:

```text
error.tsx
```

for route-level error boundaries.

For reusable components, provide appropriate:

- Error states
- Retry actions
- Recovery paths

Avoid exposing raw backend errors.

Bad:

```text
AxiosError: Request failed with status code 500
```

Better:

```text
Something went wrong while loading users.
Please try again.
```

Technical error details should be logged appropriately for developers.

---

# 20. Error Boundaries

Use error boundaries at meaningful feature or route boundaries.

An error in one independent section should not unnecessarily destroy the entire application.

Potential boundaries:

```text
Page
 ├── Header
 ├── Dashboard
 │    ├── RevenueWidget
 │    ├── UserWidget
 │    └── ActivityWidget
 └── Footer
```

A failure in `RevenueWidget` should not necessarily prevent unrelated dashboard sections from rendering.

Do not add boundaries everywhere without a meaningful recovery strategy.

---

# 21. Loading States

Avoid blank screens during data fetching.

Use:

- Skeletons
- Spinners when appropriate
- Progressive rendering
- Suspense where appropriate

Skeletons should resemble the eventual content layout.

Avoid unnecessary full-page loaders.

Prefer showing already available content while only the changing area indicates refetching when appropriate.

---

# 22. Empty States

Every data-driven component should intentionally handle empty data.

Example:

```text
No users found

No users match your current filters.
Try changing your search criteria.
```

For first-use states:

```text
No projects yet

Create your first project to get started.
```

An empty state should explain:

1. What happened
2. Why it may have happened
3. What the user can do next

---

# 23. Forms

Prefer:

- React Hook Form
- Zod
- Typed validation schemas

Forms should provide:

- Field-level validation
- Submit-level errors
- Loading/submitting state
- Disabled state during submission
- Success feedback
- Clear error messages

Prevent accidental duplicate submissions.

Do not rely on frontend validation as a security mechanism.

---

# 24. shadcn/ui

Use **shadcn/ui as the default UI foundation**.

Prefer existing shadcn components for:

- Button
- Dialog
- Sheet
- Dropdown Menu
- Select
- Tabs
- Tooltip
- Popover
- Command
- Form
- Input
- Table
- Alert
- Toast
- Card where appropriate

If a required component does not exist, build it using the project's existing design-system principles.

Do not introduce another UI library simply because it contains a component that can reasonably be built using the existing stack.

---

# 25. shadcn MCP

When shadcn components are available through MCP:

1. Check whether the required component already exists.
2. Prefer the existing shadcn component.
3. Use supported variants and project conventions.
4. Customize through Tailwind/design tokens where appropriate.
5. Do not recreate visually similar duplicate components.

The agent should prefer **composition and extension** over duplication.

---

# 26. Design System

Maintain consistency across:

- Typography
- Spacing
- Colors
- Borders
- Radius
- Icons
- Buttons
- Inputs
- Tables
- Modals
- Notifications

Prefer design tokens.

Use semantic tokens where available:

```text
bg-background
text-foreground
text-muted-foreground
border-border
bg-primary
bg-destructive
```

Avoid repeatedly inventing arbitrary colors.

---

# 27. UI/UX: Avoid AI Slop

The interface should feel intentional and product-designed, not like a generic AI-generated dashboard.

Avoid excessive use of:

- Gradients
- Glassmorphism
- Huge rounded cards
- Heavy shadows
- Neon colors
- Decorative blobs
- Random icons
- Excessive badges
- Giant headings
- Excessive whitespace
- Cards around every section
- Excessive pills
- Excessive visual effects

Do not add visual effects merely because they make a screenshot look impressive.

Prefer:

- Strong hierarchy
- Good typography
- Meaningful spacing
- Clear actions
- Consistent alignment
- Appropriate contrast
- Subtle interaction feedback

---

# 28. Visual Hierarchy

Every screen should make these things obvious:

- Where the user is
- What the page is for
- What information matters
- What action is primary
- What actions are secondary
- What requires attention
- What happens next

Example:

```text
Page
 ├── Primary purpose
 ├── Important information
 ├── Primary action
 ├── Secondary actions
 └── Supporting information
```

---

# 29. Borders, Radius and Shadows

Use restrained visual styling.

## Radius

Do not make everything:

```text
rounded-full
rounded-3xl
```

Use radius according to the component.

Examples:

- Buttons: small/moderate radius
- Inputs: small/moderate radius
- Cards: moderate radius
- Pills: `rounded-full` only when semantically appropriate

## Shadows

Use shadows sparingly.

Prefer:

- Borders
- Contrast
- Background hierarchy
- Spacing

before adding heavy shadows.

---

# 30. Colors

Use a restrained semantic color system.

Examples:

- Success → success
- Error → destructive
- Warning → warning
- Information → informational

Do not introduce a new color for every feature.

Prefer semantic design tokens over hardcoded colors.

---

# 31. Typography

Typography should establish hierarchy without excessive decoration.

Maintain consistency in:

- Font family
- Font weights
- Heading sizes
- Body sizes
- Line heights
- Text colors

Avoid excessive font-size variation.

---

# 32. Icons

Prefer **Lucide React** or the project's existing icon system.

Avoid mixing random icon libraries.

Icons should:

- Have consistent sizing
- Match the visual language
- Support the meaning of an action
- Have accessible labels when necessary

Do not use icons as decoration everywhere.

---

# 33. Animation and Motion

Use Motion / Framer Motion where animation provides UX value.

Good use cases:

- Dialog entrance/exit
- Expand/collapse
- List insertion/removal
- Navigation transitions
- Subtle hover interactions
- Page transitions
- Scroll-triggered storytelling

Avoid:

- Animating every element
- Constant floating animations
- Excessive parallax
- Long transitions
- Animation that delays interaction
- Motion that distracts from content

Animation should support usability, not compete with content.

---

# 34. Scroll Animations

Scroll animation should be subtle and intentional.

Prefer:

- Fade-in
- Small translate
- Staggered entrance

Avoid large movements or effects that make the interface difficult to use.

Do not animate critical content in ways that:

- Delay access
- Cause layout instability
- Make reading difficult

Respect reduced-motion preferences:

```css
@media (prefers-reduced-motion: reduce) {
  /* Reduce or disable non-essential motion */
}
```

---

# 35. Accessibility

Accessibility is mandatory.

Follow WCAG principles.

Ensure:

- Semantic HTML
- Keyboard navigation
- Visible focus states
- Proper labels
- Accessible forms
- Appropriate ARIA only when needed
- Sufficient color contrast
- Screen-reader-friendly interactions
- Correct dialog focus management
- Logical tab order
- Escape behavior where appropriate

Prefer:

```html
<button>
```

over:

```html
<div onClick={...}>
```

when the element performs a button action.

---

# 36. Responsive Design

Design responsive interfaces rather than simply shrinking desktop layouts.

Support:

- Mobile
- Tablet
- Desktop
- Large desktop

Consider responsive behavior for:

- Navigation
- Tables
- Forms
- Dialogs
- Filters
- Sidebars
- Touch targets
- Long text

For large tables on mobile, consider:

- Horizontal scrolling
- Responsive column visibility
- Alternative card/list presentation

---

# 37. URL State

Use URL search parameters when state should be:

- Shareable
- Bookmarkable
- Refresh-safe
- Navigation-aware

Good candidates:

```text
/search?q=react
/users?page=2
/orders?status=pending
/products?sort=price
```

Avoid storing shareable/filtering/search state only in React state.

---

# 38. Tables

Tables should be designed for real datasets.

Consider:

- Server-side pagination
- Sorting
- Filtering
- Search
- Column visibility
- Loading states
- Empty states
- Error states
- Row actions
- Bulk actions
- Virtualization for large datasets

Do not render thousands of rows into the DOM unnecessarily.

---

# 39. Search and Filtering

Search should not normally trigger an API request on every keystroke.

Prefer:

```text
User types
   ↓
Debounce
   ↓
API request
   ↓
RTK Query cache
   ↓
Render results
```

Use server-side filtering for large datasets.

Synchronize search/filter state with the URL when it benefits navigation and shareability.

---

# 40. Security

Frontend validation is not security.

The backend must independently enforce:

- Authentication
- Authorization
- Permissions
- Input validation
- Data access rules

Never expose:

- Private API keys
- Database credentials
- Secret tokens
- Internal credentials

Treat API responses as untrusted input.

Avoid unsafe HTML rendering.

If HTML must be rendered, sanitize it using an appropriate established approach.

---

# 41. Authentication and Authorization

Frontend authorization is primarily a UX concern.

Example:

```tsx
if (isAdmin) {
  // Show admin action
}
```

can control visibility, but it does not provide security.

The backend must independently verify permissions.

The frontend should not assume that hiding a button protects an operation.

---

# 42. SEO

For public-facing pages, use Next.js metadata appropriately.

Consider:

- Title
- Description
- Open Graph
- Canonical URLs
- Structured data where appropriate
- Semantic HTML
- Crawlable content

Do not prioritize SEO techniques for private authenticated dashboards where they provide no value.

---

# 43. Testing

Tests should focus on behavior and user outcomes rather than implementation details.

## Unit Tests

Use for:

- Utility functions
- Business logic
- Data transformations
- Validation logic

## Component Tests

Test:

- User interactions
- Forms
- Loading states
- Error states
- Empty states
- Important conditional behavior

## E2E Tests

Use for critical workflows such as:

```text
Login
Create
Update
Delete
Checkout
Payment
Important business workflows
```

Do not write tests merely to increase coverage numbers.

---

# 44. Dependency Rules

Before adding a dependency, ask:

1. Does the project already provide this functionality?
2. Can an existing dependency solve it?
3. Can it be implemented simply without a dependency?
4. What is the bundle-size impact?
5. Is the dependency actively maintained?
6. Does it fit the project's architecture?

Only introduce a dependency when there is a meaningful reason.

---

# 45. Code Quality

Avoid:

```text
TODO everywhere
console.log everywhere
dead code
unused imports
duplicated logic
magic numbers
magic strings
deeply nested conditionals
huge functions
huge components
```

Prefer:

- Clear naming
- Small focused functions
- Reusable utilities where justified
- Explicit types
- Consistent patterns
- Predictable control flow

Do not over-abstract.

---

# 46. Naming

Use descriptive names.

Avoid:

```ts
const data = ...
const x = ...
const temp = ...
```

Prefer:

```ts
const users = ...
const pagination = ...
const selectedUser = ...
```

Components:

```text
UserTable
UserFilters
UserForm
UserDetails
```

Hooks:

```text
useUsers
useDebounce
useUserPermissions
```

---

# 47. Avoid Premature Abstraction

Do not create generic abstractions before there is a real repeated pattern.

Avoid unnecessary abstractions such as:

```text
UniversalDataManager
UniversalComponent
UniversalForm
UniversalAPIHandler
```

Abstractions should emerge from actual repeated requirements.

A little duplication is sometimes better than a misleading abstraction.

---

# 48. AI Agent: Things It Must Not Do Automatically

Do not:

- Install a new library without justification.
- Replace an existing library without approval.
- Rewrite working components unnecessarily.
- Change the design system without a requirement.
- Introduce another state-management solution.
- Duplicate existing components.
- Use `any` to bypass type errors.
- Remove tests to make builds pass.
- Disable ESLint rules without justification.
- Ignore TypeScript errors.
- Add unnecessary animations.
- Add gradients merely for visual appeal.
- Turn every section into a card.
- Add excessive rounded corners.
- Add excessive shadows.
- Hardcode API data when an API exists.
- Put secrets in frontend code.
- Store server state redundantly in Redux.
- Refactor unrelated code during feature implementation.

---

# 49. Performance Decision Guide

Before optimizing, identify the actual bottleneck.

### Large server dataset?

Consider:

```text
Server-side pagination
+
Server-side filtering/sorting
```

### Large number of DOM elements?

Consider:

```text
Virtualization
```

### Heavy JavaScript module?

Consider:

```text
Dynamic import / Code splitting
```

### Expensive below-the-fold content?

Consider:

```text
Lazy loading
```

### Duplicate API requests?

Consider:

```text
RTK Query caching
```

### Search API called too often?

Consider:

```text
Debouncing
```

### Slow image loading?

Consider:

```text
Next.js Image optimization
Responsive sizing
Proper loading priority
```

Do not optimize something merely because an optimization technique exists.

---

# 50. Data-Driven UI Contract

For every API-driven feature:

```text
                ┌── Loading
                │
API Request ────┼── Error
                │
                ├── Empty
                │
                └── Success
```

The UI should intentionally handle each state.

For mutations, additionally consider:

```text
Idle
 ↓
Submitting
 ↓
Success / Error
```

---

# 51. Definition of Done

A frontend feature is not complete merely because it works locally.

A feature should be considered complete when applicable:

### Architecture

- [ ] Existing architecture was inspected.
- [ ] Existing patterns/components were reused.
- [ ] Server/Client boundaries are intentional.
- [ ] Business logic is appropriately separated.

### State

- [ ] Local state is used for local UI state.
- [ ] Redux is used only when global client state is justified.
- [ ] RTK Query handles server state where applicable.
- [ ] Cache invalidation is appropriately scoped.

### Performance

- [ ] Pagination was considered.
- [ ] Virtualization was considered for large lists.
- [ ] Code splitting was considered for expensive modules.
- [ ] Lazy loading was considered where appropriate.
- [ ] Images are optimized.
- [ ] Duplicate requests were avoided.

### UX

- [ ] Loading state exists.
- [ ] Error state exists.
- [ ] Empty state exists where applicable.
- [ ] Success feedback exists for important mutations.
- [ ] Responsive behavior works.
- [ ] Accessibility has been considered.

### UI

- [ ] shadcn/ui is used where appropriate.
- [ ] Existing design tokens are reused.
- [ ] Visual hierarchy is clear.
- [ ] No unnecessary gradients.
- [ ] No excessive shadows.
- [ ] No excessive rounded corners.
- [ ] No unnecessary cards.
- [ ] No unnecessary animation.

### Code

- [ ] TypeScript passes.
- [ ] No unjustified `any`.
- [ ] Lint passes.
- [ ] Tests pass.
- [ ] Build passes.
- [ ] No debug logs.
- [ ] No dead code.
- [ ] No duplicate logic.
- [ ] No unrelated files were modified unnecessarily.

---

# 52. Pull Request Checklist

## Architecture

- [ ] Correct component boundaries
- [ ] Correct Server/Client boundaries
- [ ] Existing patterns reused
- [ ] Business logic separated appropriately

## State

- [ ] Local state used where appropriate
- [ ] Redux used only when necessary
- [ ] Server state handled through RTK Query
- [ ] Cache invalidation is scoped correctly

## Performance

- [ ] Pagination considered
- [ ] Virtualization considered
- [ ] Code splitting considered
- [ ] Lazy loading considered
- [ ] Images optimized
- [ ] No unnecessary API calls
- [ ] No obvious rendering bottlenecks

## UX

- [ ] Loading state
- [ ] Error state
- [ ] Empty state
- [ ] Success feedback where appropriate
- [ ] Responsive design
- [ ] Keyboard accessibility
- [ ] Proper feedback after mutations

## UI

- [ ] shadcn/ui used where applicable
- [ ] Existing design tokens reused
- [ ] No unnecessary gradients
- [ ] No excessive shadows
- [ ] No excessive rounded corners
- [ ] No unnecessary cards
- [ ] No excessive animation
- [ ] Consistent typography and spacing

## Code

- [ ] No unjustified `any`
- [ ] No unnecessary `useMemo`
- [ ] No unnecessary `useCallback`
- [ ] No dead code
- [ ] No debug logs
- [ ] No duplicated logic
- [ ] No unrelated refactoring

---

# 53. Senior Frontend Engineering Principles

Keep these principles in mind when making implementation decisions:

### Principle 1: Reuse before reinventing

Search the codebase before creating something new.

### Principle 2: Server state is not client state

Use RTK Query for API/server state. Use Redux/local state for client state.

### Principle 3: Performance is about tradeoffs

Do not blindly add virtualization, memoization, lazy loading, or caching.

Use them when they solve a real problem.

### Principle 4: UX states are part of the feature

Loading, error, empty, success, and refetching states are not optional polish.

### Principle 5: Accessibility is part of correctness

A feature is incomplete if users cannot reasonably access or operate it.

### Principle 6: Consistency beats novelty

A new component that looks slightly better but breaks the design system is usually a worse engineering decision.

### Principle 7: Less visual noise is usually better

Use gradients, shadows, radius, animation, and decoration intentionally.

### Principle 8: Don't optimize blindly

Identify the bottleneck first.

### Principle 9: Don't abstract blindly

Abstraction should solve repeated complexity, not anticipated complexity.

### Principle 10: Minimize the blast radius

When implementing a feature, change only what is necessary.

---

# 54. Final AI Agent Rule

The agent should not ask:

> "How can I generate this UI quickly?"

It should ask:

> **"How would a senior frontend engineer build this feature so that another engineer can maintain it six months from now?"**

For architecture:

> **Reuse existing project patterns before introducing new ones.**

For state:

> **Keep server state and client state separate.**

For performance:

> **Identify the expensive operation, then optimize the actual bottleneck.**

For UI:

> **Prefer clarity, hierarchy, restraint, consistency, and usability over visual effects.**

For code changes:

> **Make the smallest correct change that solves the requirement.**
