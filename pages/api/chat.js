import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST' });
    const { messages, stream } = req.body;
    if (!messages) return res.status(400).json({ error: 'No messages' });

    // Using Chat Completions
    const chat = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      max_tokens: 800,
    });

    const reply = chat.choices?.[0]?.message?.content ?? 'Sorry, no reply.';
    return res.status(200).json({ reply });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || err.toString() });
  }
}
