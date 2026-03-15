'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import dynamic from 'next/dynamic'

const Scene3D = dynamic(() => import('./Scene3D'), { ssr: false })

// ── Ornament SVG ──────────────────────────────────────────────
function Ornament({ flip = false }) {
  return (
    <svg width="120" height="20" viewBox="0 0 120 20"
      style={{ transform: flip ? 'scaleX(-1)' : 'none' }}
      className="inline-block opacity-70">
      <path d="M0,10 Q30,2 60,10 Q90,18 120,10" stroke="#c9a84c" strokeWidth="0.8" fill="none"/>
      <circle cx="60" cy="10" r="2.5" fill="#c9a84c"/>
      <circle cx="20" cy="8" r="1.2" fill="#c9a84c" opacity="0.6"/>
      <circle cx="100" cy="12" r="1.2" fill="#c9a84c" opacity="0.6"/>
    </svg>
  )
}

// ── Music icons ───────────────────────────────────────────────
function IconMusic() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
    </svg>
  )
}
function IconMusicOff() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
      <line x1="2" y1="2" x2="22" y2="22"/>
    </svg>
  )
}

// ── Falling petals ────────────────────────────────────────────
const PETAL_EMOJIS = ['✦', '✧', '❋', '✿', '❀', '✾', '❁']

function Petals({ active }) {
  const petals = useRef([])
  if (petals.current.length === 0) {
    petals.current = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      dur: 6 + Math.random() * 8,
      delay: Math.random() * 10,
      size: 0.8 + Math.random() * 1.2,
      drift: (Math.random() - 0.5) * 200,
      spin: Math.random() * 720,
      emoji: PETAL_EMOJIS[Math.floor(Math.random() * PETAL_EMOJIS.length)],
    }))
  }
  if (!active) return null
  return (
    <>
      {petals.current.map(p => (
        <span key={p.id} className="petal" style={{
          left: `${p.left}vw`,
          '--dur': `${p.dur}s`,
          '--delay': `${p.delay}s`,
          '--size': `${p.size}rem`,
          '--drift': `${p.drift}px`,
          '--spin': `${p.spin}deg`,
          color: '#c9a84c',
        }}>{p.emoji}</span>
      ))}
    </>
  )
}

// ── 3D tilt card wrapper ──────────────────────────────────────
function TiltCard({ children }) {
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useTransform(y, [-0.5, 0.5], [8, -8])
  const rotateY = useTransform(x, [-0.5, 0.5], [-8, 8])

  const handleMove = useCallback((e) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const cx = (e.clientX - rect.left) / rect.width - 0.5
    const cy = (e.clientY - rect.top) / rect.height - 0.5
    x.set(cx); y.set(cy)
  }, [x, y])

  const handleLeave = useCallback(() => {
    x.set(0); y.set(0)
  }, [x, y])

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 1000 }}
      className="w-full"
    >
      {children}
    </motion.div>
  )
}

// ── Main page ─────────────────────────────────────────────────
export default function RevealPage() {
  const [revealed, setRevealed] = useState(false)
  const [musicOn, setMusicOn] = useState(false)
  const [phase, setPhase] = useState(0) // 0=intro 1=revealing 2=done
  const audioRef = useRef(null)

  const toggleMusic = () => {
    if (!audioRef.current) return
    if (musicOn) { audioRef.current.pause() }
    else { audioRef.current.play().catch(() => {}) }
    setMusicOn(m => !m)
  }

  const handleReveal = () => {
    setPhase(1)
    setTimeout(() => { setRevealed(true); setPhase(2) }, 1200)
  }

  // fade-up observer
  useEffect(() => {
    const els = document.querySelectorAll('.fade-up')
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') })
    }, { threshold: 0.1 })
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [revealed])

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-start overflow-x-hidden"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, #1a0a2e 0%, #0a0005 60%)' }}>

      {/* 3D particle background */}
      <Scene3D revealed={revealed} />

      {/* Falling petals */}
      <Petals active={revealed} />

      {/* Background music */}
      <audio ref={audioRef} loop src="/music.mp3" />

      {/* Music toggle */}
      <motion.button
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
        onClick={toggleMusic}
        className="fixed top-5 right-5 z-50 rounded-full p-3 royal-border glass-card"
        style={{ color: '#c9a84c' }}
        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
        aria-label="Toggle music"
      >
        {musicOn ? <IconMusic /> : <IconMusicOff />}
      </motion.button>

      {/* ── Hero section ── */}
      <section className="relative z-10 w-full max-w-2xl mx-auto px-6 pt-16 pb-8 flex flex-col items-center text-center">

        {/* Crown icon */}
        <motion.div
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="text-5xl mb-6"
          style={{ filter: 'drop-shadow(0 0 20px rgba(201,168,76,0.8))' }}
        >
          👑
        </motion.div>

        {/* Top label */}
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="font-elegant text-xs tracking-[0.4em] uppercase mb-4"
          style={{ color: 'rgba(201,168,76,0.7)' }}
        >
          With the blessings of our elders
        </motion.p>

        {/* Ornament */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="flex items-center gap-3 mb-8"
        >
          <Ornament /><span style={{ color: '#c9a84c', fontSize: '1.2rem' }}>✦</span><Ornament flip />
        </motion.div>

        {/* Main heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 1 }}
          className="font-royal gold-text text-3xl md:text-4xl leading-tight mb-3"
        >
          A Royal Name<br />Awaits Revelation
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}
          className="font-elegant text-lg italic mb-10"
          style={{ color: 'rgba(255,220,180,0.7)' }}
        >
          Our beloved daughter, our greatest treasure
        </motion.p>

        {/* ── Tilt card ── */}
        <TiltCard>
          <div className="glass-card royal-border rounded-3xl p-8 md:p-12 w-full">

            <AnimatePresence mode="wait">
              {!revealed ? (
                <motion.div key="pre" initial={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                  className="flex flex-col items-center gap-6">

                  {/* Lotus */}
                  <motion.div
                    animate={{ scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    className="text-6xl"
                    style={{ filter: 'drop-shadow(0 0 30px rgba(201,168,76,0.6))' }}
                  >
                    🪷
                  </motion.div>

                  <p className="font-elegant text-base" style={{ color: 'rgba(255,220,180,0.8)' }}>
                    A name chosen with love, blessed by the divine
                  </p>

                  <motion.button
                    onClick={handleReveal}
                    disabled={phase === 1}
                    className="reveal-btn font-royal text-sm tracking-widest px-10 py-4 rounded-full pulse-ring"
                    style={{ color: '#f5e27a' }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {phase === 1 ? '✦  Revealing  ✦' : '✦  Reveal Her Name  ✦'}
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div key="post" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ duration: 0.8 }} className="flex flex-col items-center gap-6">

                  {/* Name */}
                  <motion.div
                    initial={{ scale: 0.3, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 120, damping: 10 }}
                  >
                    <h2 className="font-royal gold-text name-glow text-3xl md:text-5xl leading-tight text-center">
                      Lokitha<br />Sri Hanvita
                    </h2>
                  </motion.div>

                  <motion.div
                    initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="ornament-line w-48"
                  />

                  <motion.p
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="font-elegant italic text-lg text-center"
                    style={{ color: 'rgba(255,220,180,0.85)' }}
                  >
                    "She who is celebrated by the world,<br />
                    auspicious, and forever cherished"
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </TiltCard>
      </section>

      {/* ── Details section (visible after reveal) ── */}
      <AnimatePresence>
        {revealed && (
          <motion.section
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
            className="relative z-10 w-full max-w-2xl mx-auto px-6 pb-20 flex flex-col gap-6"
          >
            {/* Meaning */}
            <div className="fade-up glass-card royal-border rounded-2xl p-6">
              <p className="font-royal text-xs tracking-widest mb-3" style={{ color: '#c9a84c' }}>
                ✦  Meaning of the Name
              </p>
              <div className="font-elegant space-y-2 text-base" style={{ color: 'rgba(255,220,180,0.85)' }}>
                <p><span style={{ color: '#f5e27a' }}>Lokitha</span> — one celebrated and adored by the world</p>
                <p><span style={{ color: '#f5e27a' }}>Sri</span> — divine grace, auspiciousness, and prosperity</p>
                <p><span style={{ color: '#f5e27a' }}>Hanvita</span> — one who is deeply loved and cherished</p>
              </div>
            </div>

            {/* From parents */}
            <div className="fade-up glass-card royal-border rounded-2xl p-6 text-center">
              <p className="font-royal text-xs tracking-widest mb-3" style={{ color: '#c9a84c' }}>
                ✦  From Amma &amp; Nana
              </p>
              <p className="font-elegant italic text-lg leading-relaxed" style={{ color: 'rgba(255,220,180,0.85)' }}>
                "Our hearts found a new melody,<br />
                and that melody now has a name —<br />
                <span style={{ color: '#f5e27a' }}>Lokitha Sri Hanvita</span>"
              </p>
            </div>

            {/* Footer */}
            <div className="fade-up text-center pt-4">
              <div className="flex items-center justify-center gap-3 mb-3">
                <Ornament /><span style={{ color: '#c9a84c' }}>✦</span><Ornament flip />
              </div>
              <p className="font-elegant text-xs tracking-widest" style={{ color: 'rgba(201,168,76,0.5)' }}>
                Named with love · Naming Ceremony 2026
              </p>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </main>
  )
}
