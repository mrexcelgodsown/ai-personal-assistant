import { createEmbedding, pineconeUpsert } from '../../lib/vectorstore'

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST' })
    const { id, text, namespace='default' } = req.body
    if (!text || !id) return res.status(400).json({ error: 'id and text required' })
    const emb = await createEmbedding(text)
    await pineconeUpsert(namespace, id, emb, { text })
    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message })
  }
}
