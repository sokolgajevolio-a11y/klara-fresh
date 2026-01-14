# Klara Mockup Reference

This document contains all the key files extracted from `/Users/sandrav/Downloads/klara_mockup/client/src`

## Design System Overview

The mockup uses:
- **Framework**: React + TypeScript + Vite
- **UI Library**: shadcn/ui (Radix UI primitives)
- **Styling**: TailwindCSS v4 with custom theme
- **Router**: Wouter (lightweight client-side routing)
- **Icons**: Lucide React
- **Theme**: Dark mode with OKLCH color space

## Color Palette (Dark Theme)

```css
--background: oklch(0.05 0 0);           /* #0d0d0d - Almost black */
--foreground: oklch(0.95 0.001 0);       /* #f2f2f2 - Almost white */
--card: oklch(0.1 0.002 0);              /* #1a1a1a - Dark gray */
--card-foreground: oklch(0.93 0.002 0);  /* #ececec - Light gray */
--muted: oklch(0.25 0.002 0);            /* #404040 - Medium gray */
--muted-foreground: oklch(0.65 0.002 0); /* #a6a6a6 - Light medium gray */
--accent: oklch(1 0 0);                  /* #ffffff - Pure white */
--accent-foreground: oklch(0.05 0 0);    /* #0d0d0d - Almost black */
--border: oklch(0.15 0.002 0);           /* #262626 - Darker gray */
--input: oklch(0.12 0.002 0);            /* #1f1f1f - Dark input bg */
--sidebar: oklch(0.08 0.001 0);          /* #141414 - Sidebar bg */
--sidebar-border: oklch(0.15 0.002 0);   /* #262626 - Sidebar border */
```

## Key Application Files

### 1. Main Entry Point (`main.tsx`)

```tsx
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
```

### 2. App Component (`App.tsx`)

```tsx
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
```

### 3. Theme Context (`contexts/ThemeContext.tsx`)

```tsx
import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme?: () => void;
  switchable: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({
  children,
  defaultTheme = "light",
  switchable = false,
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (switchable) {
      const stored = localStorage.getItem("theme");
      return (stored as Theme) || defaultTheme;
    }
    return defaultTheme;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    if (switchable) {
      localStorage.setItem("theme", theme);
    }
  }, [theme, switchable]);

  const toggleTheme = switchable
    ? () => setTheme(prev => (prev === "light" ? "dark" : "light"))
    : undefined;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, switchable }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
```

### 4. Error Boundary (`components/ErrorBoundary.tsx`)

```tsx
import { cn } from "@/lib/utils";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Component, ReactNode } from "react";

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen p-8 bg-background">
          <div className="flex flex-col items-center w-full max-w-2xl p-8">
            <AlertTriangle size={48} className="text-destructive mb-6" />
            <h2 className="text-xl mb-4">An unexpected error occurred.</h2>
            <div className="p-4 w-full rounded bg-muted overflow-auto mb-6">
              <pre className="text-sm text-muted-foreground whitespace-break-spaces">
                {this.state.error?.stack}
              </pre>
            </div>
            <button
              onClick={() => window.location.reload()}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg",
                "bg-primary text-primary-foreground hover:opacity-90 cursor-pointer"
              )}
            >
              <RotateCcw size={16} />
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
```

### 5. Utils (`lib/utils.ts`)

```tsx
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

## UI Components (shadcn/ui)

### Button Component

**Variants**: default, destructive, outline, secondary, ghost, link
**Sizes**: default, sm, lg, icon, icon-sm, icon-lg

```tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-white hover:bg-destructive/90",
        outline: "border bg-transparent shadow-xs hover:bg-accent",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md gap-1.5 px-3",
        lg: "h-10 rounded-md px-6",
        icon: "size-9",
      },
    },
  }
);
```

### Card Component

```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
    <CardAction>Action button</CardAction>
  </CardHeader>
  <CardContent>Main content</CardContent>
  <CardFooter>Footer content</CardFooter>
</Card>
```

### Badge Component

**Variants**: default, secondary, destructive, outline

```tsx
const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-white",
        outline: "text-foreground",
      },
    },
  }
);
```

## Home Page Structure

The mockup's Home page (`pages/Home.tsx`) has this layout:

```
┌─────────────────────────────────────────────────────┐
│  Sidebar (320px)              Main Panel (flex-1)   │
│  ┌────────────────┐          ┌──────────────────┐   │
│  │ + New Scan     │          │ Klara            │   │
│  ├────────────────┤          │ AI Store Operator│   │
│  │                │          ├──────────────────┤   │
│  │ Chat History   │          │                  │   │
│  │ - You          │          │  Content Area:   │   │
│  │ - Klara        │          │  - Welcome       │   │
│  │                │          │  - Scanning      │   │
│  │                │          │  - Results       │   │
│  │                │          │                  │   │
│  ├────────────────┤          └──────────────────┘   │
│  │ Ask Klara...   │                                  │
│  │ [Send]         │                                  │
│  └────────────────┘                                  │
└─────────────────────────────────────────────────────┘
```

### Key Features:

1. **Sidebar Chat**:
   - "New Scan" button at top
   - Chat history (user/assistant messages)
   - Input field with Send button at bottom

2. **Main Panel States**:
   - **Welcome**: Large title, category grid, "Start 360° Scan" button
   - **Scanning**: Spinner with "Scanning Your Store" message
   - **Results**: Category cards with issue counts, expandable details

3. **Category Cards** (2x2 grid):
   - Product Images (47 issues)
   - Product Descriptions (34 issues)
   - SEO & Metadata (56 issues)
   - Store Structure (22 issues)

4. **Issue Details**:
   - Severity badges (critical, warning, info)
   - Issue count
   - Description
   - "Fix These Issues" button

## Design Patterns to Apply

1. **Dark Theme**:
   - Background: #000 to #0a0a0a
   - Borders: #1a1a1a to #2a2a2a
   - Text: #f5f5f5 to #e5e5e5
   - Accents: Pure white (#fff)

2. **Spacing**:
   - Cards: 16px padding
   - Grid gaps: 16px
   - Section gaps: 24px
   - Large gaps: 32px-48px

3. **Typography**:
   - Headings: Font-bold
   - Body: 14px regular
   - Muted text: opacity-70 or specific muted color

4. **Interactive Elements**:
   - Hover states on all clickable items
   - Smooth transitions (0.2s)
   - Focus rings for accessibility
   - Disabled states with opacity-50

5. **Layout**:
   - Sidebar: Fixed 320px width
   - Main: flex-1 (takes remaining space)
   - Full height: 100vh
   - Overflow: auto on content areas

## Next Steps for Klara Fresh

To fully adopt the mockup design:

1. ✅ **Already Done**:
   - Ported Home page layout
   - Dark theme colors
   - Chat sidebar
   - 360° scan workflow
   - Category cards

2. **To Implement**:
   - Connect to real Shopify data
   - Implement actual scanning logic
   - Add fix application functionality
   - Create detail pages for each category
   - Add progress tracking
   - Implement chat with AI backend
   - Add authentication flow
   - Create settings page

3. **Design Improvements**:
   - Add smooth animations
   - Implement skeleton loaders
   - Add toast notifications
   - Create empty states
   - Add confirmation dialogs
   - Implement keyboard shortcuts

## Available UI Components from Mockup

The mockup includes these shadcn/ui components that can be ported:

- Accordion
- Alert / Alert Dialog
- Avatar
- Badge ✅
- Breadcrumb
- Button ✅
- Calendar
- Card ✅
- Carousel
- Chart
- Checkbox
- Collapsible
- Command
- Context Menu
- Dialog
- Drawer
- Dropdown Menu
- Empty (custom)
- Field (custom)
- Form
- Hover Card
- Input
- Input Group (custom)
- Input OTP
- Item (custom)
- Kbd (keyboard key)
- Label
- Menubar
- Navigation Menu
- Pagination
- Popover
- Progress
- Radio Group
- Resizable
- Scroll Area
- Select
- Separator
- Sheet
- Sidebar (custom)
- Skeleton
- Slider
- Sonner (toast)
- Spinner (custom)
- Switch
- Table
- Tabs
- Textarea
- Toggle / Toggle Group
- Tooltip

## File Structure Mapping

```
Mockup                          →  Klara Fresh
────────────────────────────────────────────────────────
client/src/App.tsx              →  app/root.jsx (partial)
client/src/pages/Home.tsx       →  app/routes/app._index.jsx ✅
client/src/components/ui/*      →  app/components/ui/* (to create)
client/src/index.css            →  app/styles/globals.css (to create)
client/src/lib/utils.ts         →  app/lib/utils.js (to create)
```

## Notes

- Mockup uses TypeScript; Klara Fresh uses JavaScript
- Mockup uses Wouter router; Klara Fresh uses React Router
- Mockup uses Radix UI primitives; Klara Fresh uses Shopify Polaris
- Colors should be adapted to work with Polaris components
- Layout is fully compatible with Remix/React Router
