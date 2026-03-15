'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import dynamic from 'next/dynamic'

const Scene3D = dynamic(() => import('./Scene3D'), { ssr: false })

// ── Speed lines ───────────────────────────────────────────────
function SpeedLines() {
  const lines = useRef(Array.from({ length: 18 }, (_, i) => ({
    id: i,
    top: `${5 + i * 5.2}vh`,
    dur: `${0.6 + Math.random() * 0.8}s`,
    delay: `${Math.random() * 2}s`,
  }))).current
  return (
    <>
      {lines.map(l => (
        <span key={l.id} className="speed-line"
          style={{ '--top': l.top, '--dur': l.dur, '--delay': l.delay }} />
      ))}
    </>
  )
}

// ── Falling sparks ────────────────────────────────────────────
const SPARK_COLORS = ['#00f5ff', '#bf00ff', '#0080ff', '#ffffff', '#ff00aa']
const SPARK_CHARS  = ['⚡', '✦', '◆', '▸', '★', '✸']

function Sparks({ active }) {
  const sparks = useRef(Array.from({ length: 35 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    dur: `${3 + Math.random() * 5}s`,
    delay: `${Math.random() * 8}s`,
    size: `${0.6 + Math.random() * 1}rem`,
    drift: `${(Math.random() - 0.5) * 150}px`,
    spin: `${Math.random() * 540}deg`,
    color: SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)],
    char: SPARK_CHARS[Math.floor(Math.random() * SPARK_CHARS.length)],
  }))).current
  if (!active) return null
  return (
    <>
      {sparks.map(s => (
        <span key={s.id} className="spark" style={{
          left: `${s.left}vw`,
          '--dur': s.dur, '--delay': s.delay, '--size': s.size,
          '--drift': s.drift, '--spin': s.spin, '--color': s.color,
        }}>{s.char}</span>
      ))}
    </>
  )
}

// ── Music icons ───────────────────────────────────────────────
function IconMusic() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
    </svg>
  )
}
function IconMusicOff() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
      <line x1="2" y1="2" x2="22" y2="22"/>
    </svg>
  )
}

// ── Tilt card ─────────────────────────────────────────────────
function TiltCard({ children }) {
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useTransform(y, [-0.5, 0.5], [10, -10])
  const rotateY = useTransform(x, [-0.5, 0.5], [-10, 10])

  const onMove = useCallback((e) => {
    const el = ref.current; if (!el) return
    const r = el.getBoundingClientRect()
    x.set((e.clientX - r.left) / r.width - 0.5)
    y.set((e.clientY - r.top)  / r.height - 0.5)
  }, [x, y])

  const onLeave = useCallback(() => { x.set(0); y.set(0) }, [x, y])

  return (
    <motion.div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 1000 }}
      className="w-full">
      {children}
    </motion.div>
  )
}

// ── Main page ─────────────────────────────────────────────────
export default function RevealPage() {
  const [revealed, setRevealed]   = useState(false)
  const [musicOn,  setMusicOn]    = useState(false)
  const [phase,    setPhase]      = useState(0)
  const audioRef = useRef(null)

  const toggleMusic = () => {
    if (!audioRef.current) return
    musicOn ? audioRef.current.pause() : audioRef.current.play().catch(() => {})
    setMusicOn(m => !m)
  }

  const handleReveal = () => {
    setPhase(1)
    setTimeout(() => { setRevealed(true); setPhase(2) }, 1000)
  }

  useEffect(() => {
    const els = document.querySelectorAll('.fade-up')
    const obs = new IntersectionObserver(entries =>
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.1 }
    )
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [revealed])

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-start overflow-x-hidden"
      style={{ background: 'radial-gradient(ellipse at 50% 30%, #001030 0%, #000510 50%, #000 100%)' }}>

      <Scene3D revealed={revealed} />
      <SpeedLines />
      <Sparks active={revealed} />
      <audio ref={audioRef} loop src="/music.mp3" />

      {/* Music toggle */}
      <motion.button
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
        onClick={toggleMusic}
        className="fixed top-5 right-5 z-50 rounded-none p-3 glass-card sonic-border"
        style={{ color: '#00f5ff', clipPath: 'polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)' }}
        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
        aria-label="Toggle music"
      >
        {musicOn ? <IconMusic /> : <IconMusicOff />}
      </motion.button>

      {/* ── Hero ── */}
      <section className="relative z-10 w-full max-w-2xl mx-auto px-6 pt-14 pb-8 flex flex-col items-center text-center">

        {/* Top label */}
        <motion.p
          initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="font-sonic text-xs tracking-[0.5em] uppercase mb-5"
          style={{ color: '#00f5ff', textShadow: '0 0 10px #00f5ff' }}
        >
          ▸ Incoming Transmission
        </motion.p>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="ornament-line w-64 mb-6"
        />

        {/* Main heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="font-sonic cyan-text text-3xl md:text-4xl leading-tight mb-3 uppercase"
        >
          Breaking<br />The Speed of Joy
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}
          className="font-speed text-lg mb-10"
          style={{ color: 'rgba(0,245,255,0.6)', letterSpacing: '0.1em' }}
        >
          A name arriving at supersonic speed
        </motion.p>

        {/* ── Tilt card ── */}
        <TiltCard>
          <div className="glass-card sonic-border rounded-none p-8 md:p-12 w-full relative"
            style={{ clipPath: 'polygon(20px 0%,100% 0%,calc(100% - 20px) 100%,0% 100%)' }}>

            {/* Scan line */}
            <div className="scan-line" />

            {/* Corner accents */}
            <div className="corner-tl"/><div className="corner-tr"/>
            <div className="corner-bl"/><div className="corner-br"/>

            <AnimatePresence mode="wait">
              {!revealed ? (
                <motion.div key="pre" initial={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.9, y: -20 }}
                  className="flex flex-col items-center gap-7">

                  {/* Sonic icon */}
                  <motion.div
                    animate={{ scale: [1, 1.08, 1], rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    className="text-6xl"
                    style={{ filter: 'drop-shadow(0 0 20px #00f5ff)' }}
                  >
                    ⚡
                  </motion.div>

                  <p className="font-speed text-base tracking-widest"
                    style={{ color: 'rgba(0,245,255,0.7)' }}>
                    CLASSIFIED · AWAITING AUTHORIZATION
                  </p>

                  <motion.button
                    onClick={handleReveal}
                    disabled={phase === 1}
                    className="sonic-btn font-sonic text-xs tracking-widest px-10 py-4 pulse-ring uppercase"
                    style={{ color: '#00f5ff' }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {phase === 1 ? '▸▸ LOADING...' : '▸ INITIATE REVEAL'}
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div key="post" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ duration: 0.6 }} className="flex flex-col items-center gap-6">

                  {/* Name */}
                  <motion.div
                    initial={{ scale: 0.2, opacity: 0, rotateX: 90 }}
                    animate={{ scale: 1, opacity: 1, rotateX: 0 }}
                    transition={{ type: 'spring', stiffness: 150, damping: 12 }}
                  >
                    <h2 className="font-sonic cyan-text neon-glow text-3xl md:text-5xl leading-tight text-center uppercase">
                      Lokitha<br />Sri Hanvita
                    </h2>
                  </motion.div>

                  <motion.div
                    initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                    transition={{ delay: 0.5 }} className="ornament-line w-48"
                  />

                  <motion.p
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="font-speed text-base tracking-widest text-center"
                    style={{ color: 'rgba(0,245,255,0.8)' }}
                  >
                    "She who is celebrated, auspicious,<br />and forever cherished"
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </TiltCard>
      </section>

      {/* ── Details after reveal ── */}
      <AnimatePresence>
        {revealed && (
          <motion.section
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
            className="relative z-10 w-full max-w-2xl mx-auto px-6 pb-20 flex flex-col gap-5"
          >
            {/* Meaning */}
            <div className="fade-up glass-card sonic-border p-6 relative"
              style={{ clipPath: 'polygon(12px 0%,100% 0%,calc(100% - 12px) 100%,0% 100%)' }}>
              <div className="corner-tl"/><div className="corner-tr"/>
              <div className="corner-bl"/><div className="corner-br"/>
              <p className="font-sonic text-xs tracking-widest mb-4" style={{ color: '#00f5ff' }}>
                ▸ NAME DECRYPTED
              </p>
              <div className="font-speed space-y-2 text-base" style={{ color: 'rgba(0,245,255,0.8)' }}>
                <p><span style={{ color: '#00f5ff', fontWeight: 600 }}>LOKITHA</span> — celebrated and adored by the world</p>
                <p><span style={{ color: '#bf00ff', fontWeight: 600 }}>SRI</span> — divine grace, auspiciousness, prosperity</p>
                <p><span style={{ color: '#0080ff', fontWeight: 600 }}>HANVITA</span> — deeply loved and forever cherished</p>
              </div>
            </div>

            {/* From parents */}
            <div className="fade-up glass-card sonic-border p-6 text-center relative"
              style={{ clipPath: 'polygon(12px 0%,100% 0%,calc(100% - 12px) 100%,0% 100%)' }}>
              <div className="corner-tl"/><div className="corner-tr"/>
              <div className="corner-bl"/><div className="corner-br"/>
              <p className="font-sonic text-xs tracking-widest mb-4" style={{ color: '#00f5ff' }}>
                ▸ MESSAGE FROM AMMA &amp; NANA
              </p>
              <p className="font-speed text-lg leading-relaxed" style={{ color: 'rgba(0,245,255,0.85)' }}>
                "Our hearts found a new frequency,<br />
                and that frequency now has a name —<br />
                <span style={{ color: '#00f5ff', fontWeight: 600 }}>Lokitha Sri Hanvita</span>"
              </p>
            </div>

            {/* Footer */}
            <div className="fade-up text-center pt-2">
              <motion.div
                initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                transition={{ delay: 0.3 }} className="ornament-line w-48 mx-auto mb-4"
              />
              <p className="font-sonic text-xs tracking-widest" style={{ color: 'rgba(0,245,255,0.35)' }}>
                NAMING CEREMONY · 2026 · SIGNAL COMPLETE
              </p>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </main>
  )
}
