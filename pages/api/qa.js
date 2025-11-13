import { createEmbedding, pineconeQuery } from '../../lib/vectorstore'
import OpenAI from 'openai'

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST' })
    const { question, namespace='default' } = req.body
    if (!question) return res.status(400).json({ error: 'question required' })
    const qemb = await createEmbedding(question)
    const search = await pineconeQuery(namespace, qemb, 4)
    const contexts = (search.matches || []).map(m => m.metadata?.text || '').join('\n---\n')
    const prompt = `Use the following context to answer the question. If the answer is not in context, say you don't know.\n\nContext:\n${contexts}\n\nQuestion: ${question}`
    const chat = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 700
    })
    const reply = chat.choices?.[0]?.message?.content ?? 'No answer.'
    return res.status(200).json({ answer: reply })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message })
  }
}
