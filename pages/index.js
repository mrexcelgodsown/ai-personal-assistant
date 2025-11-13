import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Home() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi — I am your assistant. Ask me anything or press 🎤 to speak.' }
  ])
  const [input, setInput] = useState('')
  const [listening, setListening] = useState(false)
  const [user, setUser] = useState(null)
  const recognitionRef = useRef(null)

  // init user session from Supabase
  useEffect(() => {
    const s = supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
    })
    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
  }, [])

  useEffect(() => {
    // load tsParticles via CDN
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/tsparticles@3.5.0/tsparticles.bundle.min.js'
    script.onload = () => {
      if (window && window.tsParticles) {
        window.tsParticles.load('tsparticles', {
          particles: {
            number: { value: 60 },
            color: { value: ['#7C3AED', '#6EE7B7', '#60A5FA'] },
            move: { enable: true, speed: 1.5 },
            size: { value: { min: 1, max: 3 } },
            links: { enable: true, distance: 150 },
          },
        })
      }
    }
    document.body.appendChild(script)
  }, [])

  useEffect(() => {
    // setup SpeechRecognition if available
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return
    const recog = new SpeechRecognition()
    recog.lang = 'en-US'
    recog.interimResults = false
    recog.onresult = (e) => {
      const text = e.results[0][0].transcript
      setInput(text)
      handleSend(text)
    }
    recog.onend = () => setListening(false)
    recognitionRef.current = recog
  }, [])

  const handleVoice = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition not supported in this browser.')
      return
    }
    setListening(true)
    recognitionRef.current.start()
  }

  const speakText = (text) => {
    if (!window.speechSynthesis) return
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'en-US'
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(u)
  }

  // store message to Supabase (if signed in)
  async function storeMessage(role, content) {
    try {
      if (!user) return
      await supabase.from('messages').insert([{ user_id: user.id, role, content }])
    } catch (err) {
      console.error('supabase store error', err)
    }
  }

  const handleSend = async (overrideText) => {
    const text = overrideText ?? input
    if (!text) return
    const userMsg = { role: 'user', content: text }
    setMessages(m => [...m, userMsg])
    setInput('')
    await storeMessage('user', text)
    // call backend
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg] })
      })
      const data = await res.json()
      const reply = data.reply || data.error || 'No response.'
      const assistantMsg = { role: 'assistant', content: reply }
      setMessages(m => [...m, assistantMsg])
      await storeMessage('assistant', reply)
      // speak
      speakText(reply)
    } catch (err) {
      const assistantMsg = { role: 'assistant', content: 'Error contacting server.' }
      setMessages(m => [...m, assistantMsg])
    }
  }

  const signIn = async () => {
    const email = prompt('Enter your email for magic link sign-in:')
    if (!email) return
    const { error } = await supabase.auth.signInWithOtp({ email })
    if (error) alert('Error: ' + error.message)
    else alert('Check your email for the magic link.')
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#020617] text-white relative">
      <div id="tsparticles" className="absolute inset-0 -z-10" />
      <header className="px-8 py-6 flex justify-between items-center">
        <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-600 to-green-400 flex items-center justify-center shadow-lg">AI</span>
          Personal Assistant
        </h1>
        <nav className="space-x-4">
          {user ? (
            <>
              <span className="text-sm">Signed in</span>
              <button onClick={signOut} className="px-3 py-2 rounded bg-white/6">Sign out</button>
            </>
          ) : (
            <button onClick={signIn} className="px-3 py-2 rounded bg-white/6">Sign in</button>
          )}
        </nav>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <section className="bg-white/5 rounded-2xl p-8 shadow-2xl backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">Talk or Type — it listens and replies</h2>
              <p className="text-sm text-white/80 mt-2">Built with privacy-first design: your key stays on the server (Vercel env var). Use RAG to give it knowledge from your docs.</p>
            </div>
            <div className="text-right">
              <button onClick={handleVoice} className={`px-4 py-2 rounded-lg font-semibold ${listening ? 'bg-red-500' : 'bg-white/6'}`}>
                {listening ? 'Listening…' : '🎤 Voice'}
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="space-y-3 max-h-[60vh] overflow-y-auto p-4 rounded-lg bg-gradient-to-b from-white/3 to-white/2">
                {messages.map((m, i) => (
                  <div key={i} className={`p-3 rounded-lg ${m.role === 'user' ? 'bg-white/6 self-end text-right' : 'bg-white/8'}`}>
                    <div className="text-sm">{m.content}</div>
                    <div className="text-xs text-white/60 mt-1">{m.role}</div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex gap-3">
                <input value={input} onChange={e=>setInput(e.target.value)} placeholder="Type your message..." className="flex-1 px-4 py-3 rounded-lg bg-transparent border border-white/10 outline-none" />
                <button onClick={()=>handleSend()} className="px-4 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-green-400 font-semibold">Send</button>
              </div>
            </div>

            <aside className="md:col-span-1 p-4 rounded-lg bg-white/3">
              <h3 className="font-bold">Quick Actions</h3>
              <ul className="mt-3 space-y-2 text-sm">
                <li className="p-2 rounded bg-white/6">Ask about your calendar</li>
                <li className="p-2 rounded bg-white/6">Draft an email</li>
                <li className="p-2 rounded bg-white/6">Summarize a webpage</li>
              </ul>
              <div className="mt-4 text-xs text-white/80">Tip: Deploy to Vercel and set <code>OPENAI_API_KEY</code>, <code>PINECONE_API_KEY</code>, and Supabase env vars.</div>
            </aside>
          </div>
        </section>

        <section className="mt-8 p-6 rounded-xl bg-white/4">
          <h3 className="text-lg font-bold">Hero Animation</h3>
          <div id="lottie" className="h-48"></div>
          <script dangerouslySetInnerHTML={{
            __html: `
            // load lottie and play a simple animation (user can replace with their own JSON)
            (function() {
              const s = document.createElement('script')
              s.src = 'https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.10.1/lottie.min.js'
              s.onload = () => {
                const anim = lottie.loadAnimation({
                  container: document.getElementById('lottie'),
                  renderer: 'svg',
                  loop: true,
                  autoplay: true,
                  
                  
animationData: {
  "v": "5.7.4",
  "fr": 30,
  "ip": 0,
  "op": 180,
  "w": 800,
  "h": 800,
  "nm": "orbit_pulse_v2",
  "ddd": 0,
  "assets": [],
  "layers": [
    {
      "ty": 4,
      "nm": "outer_ring",
      "ks": { "o": { "k": 100 }, "r": { "k": 0 }, "p": { "k": [400,400,0] }, "a": { "k": [0,0,0] }, "s": { "k": [100,100,100] } },
      "shapes": [
        { "ty": "gr", "it": [
            { "ty": "el", "p": { "k": [0,0] }, "s": { "k": [520,520] } },
            { "ty": "st", "c": { "k": [0.48,0.24,0.91,1] }, "w": { "k": 8 } }
        ] }
      ]
    },
    {
      "ty": 4,
      "nm": "orbiting_dots",
      "ks": { "o": { "k": 100 }, "r": { "k": 0 }, "p": { "k": [400,400,0] }, "a": { "k": [0,0,0] }, "s": { "k": [100,100,100] } },
      "shapes": [
        { "ty": "gr", "it": [
            { "ty": "el", "p": { "k": [0,-220] }, "s": { "k": [20,20] } },
            { "ty": "fl", "c": { "k": [0.43,0.77,0.69,1] } }
        ] }
      ],
      "ao": 0,
      "ip": 0,
      "op": 180
    },
    {
      "ty": 4,
      "nm": "center_pulse",
      "ks": { "o": { "k": 100 }, "r": { "k": 0 }, "p": { "k": [400,400,0] }, "a": { "k": [0,0,0] }, "s": { "k": [60,60,100] } },
      "shapes": [
        { "ty": "el", "p": { "k": [0,0] }, "s": { "k": [160,160] } },
        { "ty": "fl", "c": { "k": [0.47,0.29,0.91,1] } }
      ],
      "ip": 0,
      "op": 180
    }
  ]
}

              }
              document.body.appendChild(s)
            })();
          `}} />
        </section>
      </main>

      <footer className="py-6 text-center text-sm text-white/60">Made with ❤️ — inspired by ChatGPT & Rose's portfolio</footer>
    </div>
  )
}
