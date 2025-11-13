import { useState } from 'react'

export default function IngestDemo() {
  const [text, setText] = useState('')
  const [status, setStatus] = useState('')
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')

  const handleIngest = async () => {
    setStatus('Ingesting...')
    const id = 'doc-' + Date.now()
    const res = await fetch('/api/ingest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, text, namespace: 'demo' })
    })
    const data = await res.json()
    if (res.ok) setStatus('Ingested: ' + id)
    else setStatus('Error: ' + (data.error || 'unknown'))
  }

  const handleAsk = async () => {
    setAnswer('Thinking...')
    const res = await fetch('/api/qa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, namespace: 'demo' })
    })
    const data = await res.json()
    if (res.ok) setAnswer(data.answer || JSON.stringify(data))
    else setAnswer('Error: ' + (data.error || 'unknown'))
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#071024] to-[#020617] text-white p-8">
      <div className="max-w-3xl mx-auto bg-white/5 p-6 rounded-xl">
        <h2 className="text-2xl font-bold mb-4">Ingest & QA Demo (RAG)</h2>
        <textarea value={text} onChange={(e)=>setText(e.target.value)} placeholder="Paste a document or notes here..." className="w-full h-40 p-3 rounded bg-white/6" />
        <div className="mt-3 flex gap-3">
          <button onClick={handleIngest} className="px-4 py-2 rounded bg-gradient-to-r from-purple-600 to-green-400">Ingest</button>
          <div className="text-sm text-white/80 self-center">{status}</div>
        </div>

        <hr className="my-6 border-white/10" />

        <h3 className="text-lg font-semibold">Ask a question</h3>
        <input value={question} onChange={(e)=>setQuestion(e.target.value)} placeholder="Ask about the ingested documents..." className="w-full p-3 rounded bg-white/6" />
        <div className="mt-3 flex gap-3">
          <button onClick={handleAsk} className="px-4 py-2 rounded bg-white/6">Ask</button>
          <div className="text-sm text-white/80 self-center">{answer}</div>
        </div>
      </div>
    </div>
  )
}
