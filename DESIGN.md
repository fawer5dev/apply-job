---
version: alpha
name: Apply Job
description: Clean, flat, modern SaaS design system for a job application management platform.
colors:
  primary: "#185FA5"
  primary-hover: "#164E8A"
  success-bg: "#F0FDF4"
  success-text: "#166534"
  success-border: "#BBF7D0"
  warning-bg: "#FFFBEB"
  warning-text: "#92400E"
  warning-border: "#FDE68A"
  error-bg: "#FEF2F2"
  error-text: "#991B1B"
  error-border: "#FECACA"
  neutral-900: "#111827"
  neutral-800: "#1F2937"
  neutral-700: "#374151"
  neutral-500: "#6B7280"
  neutral-400: "#9CA3AF"
  neutral-200: "#E5E7EB"
  neutral-100: "#F3F4F6"
  neutral-50: "#F9FAFB"
  white: "#FFFFFF"
typography:
  h1:
    fontFamily: Inter, system-ui, sans-serif
    fontSize: 22px
    fontWeight: 500
    lineHeight: 1.3
  h2:
    fontFamily: Inter, system-ui, sans-serif
    fontSize: 18px
    fontWeight: 500
    lineHeight: 1.4
  body:
    fontFamily: Inter, system-ui, sans-serif
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: Inter, system-ui, sans-serif
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.4
  caption:
    fontFamily: Inter, system-ui, sans-serif
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.5
rounded:
  sm: 4px
  md: 8px
  lg: 12px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.white}"
    rounded: "{rounded.md}"
    padding: 8px 16px
    typography: "{typography.body}"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-secondary:
    backgroundColor: "{colors.white}"
    textColor: "{colors.neutral-800}"
    rounded: "{rounded.md}"
    padding: 8px 16px
    border: "1px solid {colors.neutral-200}"
  button-secondary-hover:
    backgroundColor: "{colors.neutral-50}"
  button-ghost:
    backgroundColor: transparent
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    padding: 8px 16px
    border: "1px solid {colors.primary}"
  button-ghost-hover:
    backgroundColor: "{colors.neutral-50}"
  button-destructive:
    backgroundColor: "{colors.error-bg}"
    textColor: "{colors.error-text}"
    rounded: "{rounded.md}"
    padding: 8px 16px
    border: "1px solid {colors.error-border}"
  button-destructive-hover:
    backgroundColor: "#FEE2E2"
  input:
    backgroundColor: "{colors.white}"
    textColor: "{colors.neutral-900}"
    rounded: "{rounded.md}"
    padding: 8px 12px
    border: "1px solid {colors.neutral-200}"
    typography: "{typography.body}"
  input-focus:
    border: "2px solid {colors.primary}"
  input-error:
    border: "1px solid #F87171"
  card:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.lg}"
    padding: 16px
    border: "1px solid {colors.neutral-100}"
  badge-success:
    backgroundColor: "{colors.success-bg}"
    textColor: "{colors.success-text}"
    rounded: "{rounded.full}"
    padding: 2px 10px
    typography: "{typography.caption}"
  badge-info:
    backgroundColor: "#EFF6FF"
    textColor: "#1E40AF"
    rounded: "{rounded.full}"
    padding: 2px 10px
  badge-warning:
    backgroundColor: "{colors.warning-bg}"
    textColor: "{colors.warning-text}"
    rounded: "{rounded.full}"
    padding: 2px 10px
  badge-error:
    backgroundColor: "{colors.error-bg}"
    textColor: "{colors.error-text}"
    rounded: "{rounded.full}"
    padding: 2px 10px
  badge-neutral:
    backgroundColor: "{colors.neutral-100}"
    textColor: "{colors.neutral-700}"
    rounded: "{rounded.full}"
    padding: 2px 10px
  nav-bar:
    height: 56px
    backgroundColor: "rgba(255, 255, 255, 0.9)"
    border: "1px solid {colors.neutral-100}"
  nav-link:
    textColor: "{colors.neutral-500}"
    rounded: "{rounded.md}"
    padding: 6px 12px
    typography: "{typography.body}"
  nav-link-active:
    textColor: "{colors.primary}"
    backgroundColor: "#EFF6FF"
  sidebar:
    width: 192px
    backgroundColor: "{colors.neutral-50}"
    border: "1px solid {colors.neutral-100}"
  avatar:
    width: 32px
    height: 32px
    backgroundColor: "#EFF6FF"
    textColor: "{colors.primary}"
    rounded: "{rounded.full}"
    typography: "{typography.caption}"
---

## Overview

Apply Job is a job application management platform. The design follows a clean, flat, modern SaaS aesthetic inspired by Linear, Vercel, and Notion. The interface prioritizes clarity, speed, and minimal visual noise. No heavy borders, no gray blocks, no decorative flourishes.

The UI should feel professional and efficient — a tool people rely on daily. White space is used deliberately to create breathing room. Color is used sparingly and purposefully, reserved for actions and state indicators.

## Colors

The palette is built around a single blue primary with semantic colors for states and a neutral gray scale for structure.

- **Primary (#185FA5):** A confident, medium-dark blue used exclusively for interactive elements — buttons, links, active states, and focus rings. Never used as a background fill for large areas.
- **Success (#166534 on #F0FDF4):** Green tones for applied/confirmed states, positive alerts, and completion indicators.
- **Warning (#92400E on #FFFBEB):** Amber tones for review states, pending items, and caution alerts.
- **Error (#991B1B on #FEF2F2):** Red tones for rejected states, validation errors, and destructive actions.
- **Neutrals (gray-900 to gray-50):** A full gray scale for text hierarchy, borders, backgrounds, and card surfaces. Primary text uses gray-900, secondary uses gray-500, muted uses gray-400.

The page background is pure white. Cards are white with a 1px gray-100 border. No colored backgrounds on full pages.

## Typography

**Inter** is the sole typeface. It provides excellent legibility at all sizes and a neutral, professional tone that suits a productivity tool.

- **Page headings (h1):** 22px, font-medium (weight 500). Used once per page for the main title.
- **Section headings (h2):** 18px, font-medium. Used for card titles and form section labels.
- **Body text:** 14px, font-normal (weight 400). Default for all content, descriptions, and paragraph text.
- **Labels:** 14px, font-medium. Used for form labels and interactive text.
- **Captions/hints:** 12px, text-gray-400. Used for helper text, timestamps, and secondary metadata.

Never use font-bold or font-semibold for headings. The design relies on font-medium with generous spacing for hierarchy, not weight contrast.

### Font aliases

The custom utility classes `font-display` and `font-body` are both aliased to Inter via `tailwind.config.ts`. They exist for future font swap flexibility but currently render identically to `font-sans`.

### Iconography

All lucide-react icons use a consistent `strokeWidth={1.5}`. Never use `strokeWidth={2}` or higher — it creates visual noise against the clean, light-weight typography system.

Use icon libraries in this priority: `lucide-react` (primary), `@phosphor-icons/react` (secondary). Never hand-roll SVG icon paths.

## Layout

The layout uses a mobile-first responsive grid:

- **Mobile (< 640px):** Single column, full-width elements, `p-4` padding. Sidebar hidden, accessible via hamburger menu.
- **Tablet (640px–1023px):** Two-column grid where appropriate, `p-6` padding. Sidebar still hidden.
- **Desktop (1024px+):** Three-column grid for cards, `p-8` padding. Sidebar visible at `w-48`.

Spacing follows a consistent scale: 4px (xs), 8px (sm), 16px (md), 24px (lg), 32px (xl). All grids start at `grid-cols-1` and expand with breakpoints. Fixed widths are avoided — use `w-full sm:w-auto` instead.

Form buttons always span full width on mobile (`w-full sm:w-auto`).

### Dashboard Back Bar

The shared `DashboardBackBar` component (`src/components/DashboardBackBar.tsx`) renders the sticky back-navigation bar used in all dashboard sub-pages (CV management, application details, profile settings, 2FA setup, etc.). It accepts a `label` prop for the translated "Back to Dashboard" text. Never copy-paste this bar — always use the component.

### Animations

Two custom animations are defined in `tailwind.config.ts`:

- **`animate-fade-in-up`** — Fade in from 16px below (0.5s ease-out). Used for section and page headers.
- **`animate-scale-in`** — Scale in from 95% with opacity (0.3s ease-out). Used for cards and feature grids.

Keep animation usage minimal. Only use these for page-load reveals. Avoid decorative micro-interactions, hover scale transforms, or staggered delays as per the "no decorative animations" rule.

## Shapes

The shape language is **softly rounded**. All interactive elements use 8px (`rounded-lg`) corner radii. This provides a modern, approachable feel without being overly playful.

- Cards use 12px (`rounded-xl`) for a slightly more generous curve.
- Badges and status indicators use full rounding (`rounded-full`) for pill shapes.
- Icons and avatars use circular shapes.

No sharp corners anywhere in the interface. Consistency in rounding creates visual cohesion.

## Components

### Buttons

Four button variants cover all use cases:

- **Primary:** Blue-700 background, white text. Reserved for the single most important action in each view (e.g., "Sign In", "Create Account", "Submit").
- **Secondary (outline):** White background, gray-200 border, gray-800 text. Used for secondary actions like "Cancel", "Back", or alternative choices.
- **Ghost:** Blue-700 text with blue-700 border, transparent background. Used for tertiary actions or navigation-style buttons.
- **Danger (destructive):** Red-50 background, red-200 border, red-700 text. Used for destructive actions like "Delete" or "Revoke".

All buttons are 14px font-medium with 16px horizontal and 8px vertical padding. Small variant uses 12px text with 12px/6px padding. Icon buttons always place the Lucide icon on the left with a 6px right margin.

### Form Inputs

- **Label:** 14px font-medium, gray-800 text, 4px bottom margin, block display.
- **Input:** White background, gray-200 border, 8px border-radius, 12px horizontal / 8px vertical padding. Placeholder text uses gray-400.
- **Focus state:** 2px blue-500 ring with transparent border replacement.
- **Error state:** Red-400 border. Error message below in 12px red-700 text.
- **Hint text:** 12px gray-400 text below the input.

### Cards

Cards are white containers with 12px rounded corners, 1px gray-100 border, and 16px padding. No heavy shadows — use `shadow-sm` at most for subtle depth. Inner sections are separated by `border-t border-gray-100 pt-3 mt-3`.

### Status Badges

Pill-shaped indicators with a Lucide icon inside:

- **Applied/success:** Green-50 background, green-800 text, CheckCircle icon.
- **Pending/info:** Blue-50 background, blue-800 text, Clock icon.
- **Review/warning:** Amber-50 background, amber-800 text, Clock icon.
- **Rejected/error:** Red-50 background, red-800 text, XCircle icon.
- **Archived/neutral:** Gray-100 background, gray-600 text.

All badges use 12px font-medium text with 2.5px horizontal and 0.5px vertical padding.

### Error States

All error banners follow a consistent pattern across the application:

- **Container:** `rounded-lg border border-destructive/50 bg-destructive/10 p-4`
- **Layout:** Flex row with `gap-3`, containing an `AlertCircle` icon (`h-4 w-4 shrink-0`) and the error message text
- **Text:** `text-sm text-destructive`
- **Nav bar backdrop:** Omit the colored accent bar (the old `border-l-4` pattern). Use the above container pattern everywhere.

Success states follow the same layout with `border-emerald-500/50 bg-emerald-50` and `CheckCircle` icon.

### Navigation

The top bar is 56px tall, sticky, with a semi-transparent white background and subtle bottom border. Logo combines an icon with the app name in font-medium gray-900. Nav links are 14px font-medium text. Active links use `text-primary` (via CSS variable token, maps to blue-700). Inactive links use `text-muted-foreground`. Active state is detected via `usePathname()` — never hardcode nav styles per page.

Hover states on desktop nav links transition to `text-primary` with a 200ms color transition. Mobile nav uses `bg-primary/10 text-primary` for active items and `bg-accent` hover for inactive items.

The user avatar is a 32px circle with blue-50 background and blue-700 initials in 12px font-medium text.

### Sidebar

The dashboard sidebar is 192px wide on desktop, hidden on mobile. It uses gray-50 background with gray-100 right border. Navigation items follow the same pattern as top nav links but span full width. Active items use blue-50 background with blue-700 text. Section labels are 12px font-medium gray-400 uppercase with wide letter spacing.

## Do's and Don'ts

- **Do** use the primary blue only for the single most important action per screen.
- **Do** maintain WCAG AA contrast ratios (4.5:1 for normal text).
- **Do** use font-medium for all headings — never font-bold or font-semibold.
- **Do** include a Lucide icon in every status badge.
- **Do** make all form buttons full-width on mobile.
- **Do** use text-xs (12px) as the minimum font size on mobile.
- **Don't** use heavy shadows or colored backgrounds on cards.
- **Don't** mix corner radii within the same component group.
- **Don't** use more than two font weights (400 and 500) on a single screen.
- **Don't** use gray-300 or gray-600 — stick to the defined neutral scale (900, 800, 700, 500, 400, 200, 100, 50).
- **Don't** use decorative animations or transitions beyond simple opacity and color changes.
