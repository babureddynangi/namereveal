'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Music, MusicOff } from 'lucide-react'

const PETALS = ['🌸', '🌺', '✨', '🌼', '💮']

function Petal({ id }) {
  const left = Math.random() * 100
  const duration = 4 + Math.random() * 6
  const delay = Math.random() * 3
  const emoji = PETALS[Math.floor(Math.random() * PETALS.length)]

  return (
    <span
      className="petal"
      style={{
        left: `${left}vw`,
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
      }}
    >
      {emoji}
    </span>
  )
}

export default function RevealPage() {
  const [revealed, setRevealed] = useState(false)
  const [petals, setPetals] = useState([])
  const [musicOn, setMusicOn] = useState(false)
  const audioRef = useRef(null)

  useEffect(() => {
    if (revealed) {
      const items = Array.from({ length: 30 }, (_, i) => i)
      setPetals(items)
    }
  }, [revealed])

  const toggleMusic = () => {
    if (!audioRef.current) return
    if (musicOn) {
      audioRef.current.pause()
    } else {
      audioRef.current.play().catch(() => {})
    }
    setMusicOn(!musicOn)
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-rose-50 via-pink-50 to-amber-50 px-4">

      {/* Background music */}
      <audio ref={audioRef} loop src="/music.mp3" />

      {/* Music toggle */}
      <button
        onClick={toggleMusic}
        className="fixed top-4 right-4 z-50 bg-white/80 backdrop-blur rounded-full p-3 shadow-md text-pink-500 hover:scale-110 transition-transform"
        aria-label="Toggle music"
      >
        {musicOn ? <Music size={22} /> : <MusicOff size={22} />}
      </button>

      {/* Falling petals */}
      {petals.map((id) => <Petal key={id} id={id} />)}

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl p-8 max-w-md w-full text-center border border-pink-100"
      >
        {/* Top decoration */}
        <div className="text-4xl mb-4">🪷</div>

        <p className="text-pink-400 text-sm tracking-widest uppercase mb-2">
          With love & blessings
        </p>

        <h1 className="text-2xl font-semibold text-rose-700 mb-6 leading-snug">
          We are delighted to introduce<br />our beloved daughter
        </h1>

        <AnimatePresence>
          {!revealed ? (
            <motion.button
              key="btn"
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => setRevealed(true)}
              className="bg-gradient-to-r from-rose-400 to-pink-500 text-white text-lg font-semibold px-8 py-4 rounded-full shadow-lg tracking-wide"
            >
              Tap to Reveal Her Name ✨
            </motion.button>
          ) : (
            <motion.div
              key="name"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 12 }}
            >
              <p className="text-5xl font-bold text-rose-600 mb-2 tracking-wide">
                Lokitha Sri Hanvita
              </p>
              <p className="text-pink-400 text-lg italic mt-2">
                "She who is adored, auspicious, and beloved"
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {revealed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8 space-y-4 text-sm text-rose-800"
          >
            <div className="bg-rose-50 rounded-2xl p-4 border border-rose-100">
              <p className="font-semibold text-rose-500 mb-1">Meaning of the Name</p>
              <p>Lokitha — one who is celebrated by the world<br />
                Sri — auspicious, divine grace<br />
                Hanvita — one who is loved and cherished</p>
            </div>

            <div className="bg-pink-50 rounded-2xl p-4 border border-pink-100">
              <p className="font-semibold text-pink-500 mb-1">From Amma & Nana</p>
              <p>"Our hearts found a new melody, and that melody now has a name —<br />
                <em>Lokitha Sri Hanvita</em>"</p>
            </div>

            <p className="text-pink-300 text-xs pt-2">
              Named with love · Naming Ceremony 2026
            </p>
          </motion.div>
        )}
      </motion.div>
    </main>
  )
}
