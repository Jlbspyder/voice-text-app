# Voice-to-Text AI Assistant

Voice-to-Text AI Assistant is a full-stack application that allows users to ask questions using their voice and receive AI-generated answers as text.

The application uses browser speech recognition or typed input, then sends the question and recent conversation context to a backend powered by Groq. Supabase authentication is optional, so visitors can use the assistant as guests or create an account.


The project demonstrates practical integration of browser audio recording, speech-to-text processing, REST APIs, AI language models, asynchronous request handling, and frontend/backend communication.

## Tech Stack

React, TypeScript, Vite, Node.js, Express, Groq API, Supabase Auth, and Tailwind CSS.

## Optional Supabase authentication

1. Create a Supabase project and copy its Project URL and publishable key from the project's Connect dialog.
2. Copy `.env.example` to `.env` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
3. In Supabase Authentication settings, add `http://localhost:5173` and the deployed Vercel URL to the allowed redirect URLs.
4. Add the same two environment variables to the Vercel project and redeploy.

Email/password authentication is optional. Without these variables, the rest of the app remains available to guests.
