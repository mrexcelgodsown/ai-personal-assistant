# AI Personal Assistant (Next.js + Tailwind)

A polished voice + chat personal assistant inspired by ChatGPT and styled with Tailwind + particle background.  
This project is prepped for deployment on Vercel. It uses a server-side API route to proxy requests to OpenAI; set your `OPENAI_API_KEY` in Vercel environment variables.

## Features
- Chat UI with persistent conversation
- Voice input (Web Speech API) and speech output (SpeechSynthesis)
- Beautiful hero, particles background, Tailwind animations
- API route that calls OpenAI Chat Completions

## Quick start (local)
1. Install dependencies:
```bash
npm install
```
2. Create a `.env.local` in project root:
```
OPENAI_API_KEY=sk-...
```
3. Run dev:
```bash
npm run dev
```

## Deploy to Vercel
1. Push repo to GitHub.
2. Import the repository in Vercel.
3. Set environment variable `OPENAI_API_KEY` in the Vercel project settings.
4. Deploy.

## Notes
- This code does not include your API key. Provide it via env vars.
- The client uses browser SpeechRecognition and SpeechSynthesis. On unsupported browsers the app still works with typed input.

Enjoy — tweak the UI in `pages/index.js` and `styles/globals.css` to make it your own.


## New Features Added
- RAG scaffold with Pinecone: `/api/ingest` to upsert embeddings and `/api/qa` to query.
  - Required env vars: `PINECONE_API_KEY`, `PINECONE_ENV`, `PINECONE_INDEX`.
- Supabase auth + message history (magic link):
  - Required env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
  - Run the SQL in `supabase/migrations/001_create_messages_table.sql` to create the `messages` table.
- Lottie animated hero (replace animation JSON in `pages/index.js` or point to your Lottie file).
- ESLint and Prettier config included. Run `npm run lint` and `npm run format`.
- Demo GIF (placeholder) included at `public/demo.gif`.

## Demo GIF
A small placeholder animated GIF is included in `public/demo.gif`. Replace it with a screen-recording GIF for your real demo.

