import fetch from 'node-fetch'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST' })
  try {
    const r = await fetch(process.env.NEXT_PUBLIC_BASE_URL + '/api/qa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    })
    const data = await r.json()
    return res.status(r.status).json(data)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message })
  }
}
