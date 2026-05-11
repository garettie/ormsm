---
colors:
  primary: "#1e8e3e"
  accent: "#1e8e3e"
  neutral: "#111827"
  background: "#f9fafb"
  success: "#34a853"
  warning: "#f9ab00"
  error: "#d93025"
  info: "#80868b"
typography:
  family: "'Inter', 'DM Sans', system-ui, sans-serif"
  size:
    base: "16px"
    sm: "14px"
    xs: "12px"
rounded:
  base: "0.5rem"
  large: "1rem"
  xl: "1.5rem"
---

# Design

## Overview
ORMSM uses a "Modern Glass" aesthetic designed for clarity and professional reassurance. It combines tinted neutrals with high-chroma severity indicators to guide user attention through complex risk data.

## Colors
The palette is rooted in a "Google-adjacent" professional spectrum.

- **Primary**: `#1e8e3e` (Green 700). Used for primary actions and brand identity.
- **Surface**: `#ffffff` with `80%` opacity in glass panels.
- **Neutrals**: `Gray 900` (`#111827`) for text, `Gray 50` (`#f9fafb`) for background.
- **Severity Scale**:
  - **Safe/Minor**: `#34a853` (Green)
  - **Slight/Moderate**: `#f9ab00` (Amber)
  - **Moderate/Major**: `#ff6d00` (Orange)
  - **Severe/Critical**: `#d93025` (Red)

## Typography
Hierarchy is maintained through weight contrast and tight tracking on headings.

- **Headings**: Inter, Bold, `tracking-tight`. Used for dashboard titles and module headers.
- **Body**: Inter, Regular. `65-75ch` max-width for readability in documentation.
- **Metadata**: Inter, Medium, `text-[10px]`, `uppercase`, `tracking-wide`. Used for labels and secondary info.

## Elevation
Elevation is achieved through blur and subtle shadows rather than dark overlays.

- **Glass Panel**: `backdrop-blur-xl`, `bg-white/80`, `border-white/50`. Used for the main app shell and navigation headers.
- **Glass Card**: `bg-white`, `shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]`. Used for dashboard metrics and risk register items.

## Components
### Badges
Used for status and risk level labeling.
- **Shape**: Full pill (`rounded-full`).
- **Style**: Soft background tint with high-contrast text and matching border.

### Charts
Recharts-powered visualizations with custom interactions.
- **Interaction**: Donut sectors scale on hover (`scale(1.04)`) with brightness increase.
- **Transition**: Smooth ease-out transitions for all state changes.

## Do's and Don'ts
- **Do** use tinted neutrals (`bg-gray-50/50`) to separate layout sections.
- **Do** apply `backdrop-blur` to sticky headers to maintain context.
- **Don't** use pure black (`#000`) for text; use `#111827`.
- **Don't** use side-stripe borders for severity; use full badges or background tints.
- **Don't** use nested cards; use layout spacing and separators instead.
