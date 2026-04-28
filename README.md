# Math Drills

A math practice app for addition, subtraction, and multiplication. Built with Next.js 16 + TypeScript, exported as a static site.

## Development

```bash
npm install
npm run dev      # http://localhost:3000
```

## Build

```bash
npm run build    # outputs static site to dist/
```

## Routes

| URL | Description |
|-----|-------------|
| `/` | Home — preset set links and custom builder |
| `/sets/add20` | Addition to 20 |
| `/sets/sub20` | Subtraction to 20 |
| `/sets/mul9` | Multiplication to 9 |
| `/sets/custom` | Custom set builder |
| `/sets/custom?i=add20&i=sub20` | Custom set with pre-selected types |

Add `?autoStart` to any set URL to skip the Start button and begin the countdown immediately.

## Project structure

```
app/
  layout.tsx              # Root layout (header)
  page.tsx                # Home page
  globals.css             # Global styles
  App.css                 # Component styles
  components/
    TestRunner.tsx        # Test + results UI
    CustomSetBuilder.tsx  # Checkbox picker for custom sets
  sets/
    [slug]/page.tsx       # Preset set pages (add20, sub20, mul9)
    custom/
      page.tsx            # Custom set page
      CustomPageContent.tsx
  lib/
    types.ts              # Shared types + set metadata
    questions.ts          # Question generation logic
public/
  assets/
    jackhammer.png
  favicon-microsite-64.svg
```
