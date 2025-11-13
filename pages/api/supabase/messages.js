import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '')

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase.from('messages').select('*').order('inserted_at', { ascending: true }).limit(200)
      if (error) throw error
      return res.status(200).json({ data })
    }
    if (req.method === 'POST') {
      const { user_id, role, content } = req.body
      const { data, error } = await supabase.from('messages').insert([{ user_id, role, content }])
      if (error) throw error
      return res.status(200).json({ data })
    }
    return res.status(405).json({ error: 'Only GET/POST' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message })
  }
}
