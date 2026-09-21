# Portfolio City

A personal portfolio built with Next.js, TypeScript and Tailwind CSS. Visitors walk down a night street and
step into buildings (About, Projects, Skills, Contact). There is also a plain scrolling version of the same
content ("Read as a page"), which is used automatically for people who prefer reduced motion.

## Make it yours

All text lives in one file: `src/data/site.ts`. Change your name, role, email, links, projects and skills there.
Building shapes and positions are in `src/components/City.tsx` (the `LAYOUT` object).

## Run it locally

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build check
```

## Deploy on Vercel

**Option A: from GitHub (recommended)**
1. Create a new GitHub repository and push this folder to it.
2. Go to vercel.com/new, choose "Import" next to your repository.
3. Leave the defaults (Framework: Next.js) and click Deploy.
Every push to `main` then redeploys automatically.

**Option B: from the command line**
```bash
npx vercel        # first deploy, follow the prompts
npx vercel --prod # publish to production
```
