'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function YesPage({ params }) {
  const router = useRouter()
  const name = decodeURIComponent(params.name)
  
  // Capitalize first letter of each word
  const formattedName = name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')

  const canvasRef = useRef(null)
  const [floatingHearts, setFloatingHearts] = useState([])

  useEffect(() => {
    // Initialize floating hearts
    const hearts = Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 8,
      size: 10 + Math.random() * 30, // Smaller range to not distract from fireworks
      duration: 10 + Math.random() * 10, // Slower duration for subtle effect
      emoji: ['❤️', '💖', '💕', '💗', '💓', '💝'][Math.floor(Math.random() * 6)]
    }))
    setFloatingHearts(hearts)
  }, [])

  useEffect(() => {
    // If user reloaded /[name]/yes (referrer is the same page), send them back to /[name].
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const referrer = document.referrer
      const yesPath = `/${encodeURIComponent(params.name)}/yes`

      if (referrer && referrer.endsWith(yesPath)) {
        router.replace(`/${params.name}`)
        return
      }
    }

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let animationFrameId

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resize()
    window.addEventListener('resize', resize)

    const colors = [
      '#ff4b81',
      '#ffcc00',
      '#4bffdf',
      '#7c3aed',
      '#22c55e',
      '#f97316',
      '#e11d48'
    ]

    const fireworks = []

    function createFirework() {
      const x = Math.random() * canvas.width
      const y = canvas.height * (0.1 + Math.random() * 0.2) // Now explodes at 10-30% from top
      const color = colors[Math.floor(Math.random() * colors.length)]
      const particles = []

      const particleCount = 40 + Math.floor(Math.random() * 40)
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount
        const speed = 0.5 + Math.random() * 1.5 // Slower speed for mobile
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0,
          maxLife: 80 + Math.random() * 50, // Longer life for better trails
          color
        })
      }

      fireworks.push({ particles })
    }

    // Seed some fireworks
    for (let i = 0; i < 4; i++) {
      setTimeout(createFirework, i * 600) // Slower initial fireworks
    }

    const render = () => {
      ctx.globalCompositeOperation = 'source-over'
      // Keep canvas transparent so underlying gradient shows through
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      ctx.globalCompositeOperation = 'lighter'

      // Slower firework creation, especially on mobile
      const isMobile = window.innerWidth <= 768
      const creationChance = isMobile ? 0.03 : 0.08
      if (Math.random() < creationChance) {
        createFirework()
      }

      for (let i = fireworks.length - 1; i >= 0; i--) {
        const fw = fireworks[i]
        for (let j = fw.particles.length - 1; j >= 0; j--) {
          const p = fw.particles[j]
          p.x += p.vx
          p.y += p.vy
          p.vy += 0.015 // Reduced gravity for longer trails
          p.life++

          const t = p.life / p.maxLife
          if (t >= 1) {
            fw.particles.splice(j, 1)
            continue
          }

          const alpha = 1 - t
          const size = 2 + 2 * (1 - t)

          ctx.beginPath()
          ctx.fillStyle = hexToRgba(p.color, alpha)
          ctx.arc(p.x, p.y, size, 0, Math.PI * 2)
          ctx.fill()
        }

        if (fw.particles.length === 0) {
          fireworks.splice(i, 1)
        }
      }

      animationFrameId = requestAnimationFrame(render)
    }

    const hexToRgba = (hex, alpha) => {
      const stripped = hex.replace('#', '')
      const bigint = parseInt(stripped, 16)
      const r = (bigint >> 16) & 255
      const g = (bigint >> 8) & 255
      const b = bigint & 255
      return `rgba(${r}, ${g}, ${b}, ${alpha})`
    }

    render()

    return () => {
      window.removeEventListener('resize', resize)
      if (animationFrameId) cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <>
      <style jsx>{`
        .title {
          font-size: clamp(2rem, 5vw, 3.5rem);
          font-weight: 600;
          line-height: 1.2;
          letter-spacing: -0.02em;
          color: #ffffff;
          text-shadow:
            0 0 20px rgba(255, 255, 255, 0.9),
            0 0 40px rgba(255, 107, 157, 0.8),
            0 0 60px rgba(255, 107, 157, 0.6);
          padding: 0 20px;
          position: relative;
          z-index: 3; // Above fireworks (zIndex: 2) and hearts (zIndex: 1)
          text-align: center;
          margin-bottom: 1.5rem;
        }
        .subtitle {
          margin-top: 1rem;
          font-size: clamp(1rem, 2.4vw, 1.25rem);
          color: #e0e7ff;
          text-shadow: 0 2px 10px rgba(255, 107, 157, 0.5);
          text-align: center;
          position: relative;
          z-index: 3; // Above fireworks (zIndex: 2) and hearts (zIndex: 1)
        }
        @media (max-width: 768px) {
          .title {
            padding: 0 20px;
            word-wrap: break-word;
            overflow-wrap: break-word;
          }
          .subtitle {
            padding: 0 20px;
            word-wrap: break-word;
            overflow-wrap: break-word;
            text-align: center !important;
          }
          
          /* Ensure main container stays centered on mobile */
          div[style*="position: fixed"] {
            left: 0 !important;
            right: 0 !important;
            margin: 0 auto !important;
            transform: none !important;
          }
        }
        @keyframes fadeCanvas {
          to {
            opacity: 1;
          }
        }
        @keyframes floatUp {
          0% {
            transform: translateY(0) translateX(0) scale(1);
            opacity: 0;
          }
          10% {
            opacity: 0.6;
          }
          50% {
            transform: translateY(-50vh) translateX(15px) scale(1.1);
            opacity: 0.4;
          }
          100% {
            transform: translateY(-110vh) translateX(-15px) scale(1.2);
            opacity: 0;
          }
        }
        .floating-heart {
          position: absolute;
          bottom: -40px;
          pointer-events: none;
          user-select: none;
          z-index: 1; // Behind fireworks (zIndex: 2) but visible
        }

      `}</style>
      <div style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: `
          radial-gradient(circle at 50% 40%, #4a0e4e 0%, #2d1b3d 35%, #1a0f1f 65%, #0a0510 100%),
          linear-gradient(135deg, #0a0510, #1a0f1f)
        `,
        padding: '40px 20px',
        color: '#ffffff',
        textAlign: 'center',
        fontFamily: 'Georgia, "Times New Roman", serif',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        margin: '0 auto',
        height: '100vh',
        maxHeight: '100vh',
        overflow: 'hidden',
        boxSizing: 'border-box'
      }}>
        {/* Floating Hearts */}
        {floatingHearts.map((heart) => (
          <div
            key={heart.id}
            className="floating-heart"
            style={{
              left: `${heart.left}%`,
              fontSize: `${heart.size}px`,
              animation: `floatUp ${heart.duration}s linear infinite`,
              animationDelay: `${heart.delay}s`,
            }}
          >
            {heart.emoji}
          </div>
        ))}

        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            opacity: 0,
            animation: 'fadeCanvas 1.2s ease forwards',
            zIndex: 2 // Between hearts (zIndex: 1) and text (zIndex: 3)
          }}
        />


        <h1 className="title">
          YAY!<br />
          {formattedName} said YES 💘🎉
        </h1>
        <p className="subtitle">
          ✨ I knew you will say Yes! ✨
        </p>
        <p className="subtitle" style={{
          marginTop: '2rem',
          fontSize: 'clamp(1.1rem, 2.6vw, 1.4rem)',
          fontStyle: 'italic',
          color: '#ffd4e5',
          textShadow: '0 2px 15px rgba(255, 107, 157, 0.6)',
          textAlign: 'center',
          padding: '0 20px',
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
          maxWidth: '600px',
          margin: '2rem auto 0'
        }}>
          "Every moment with you feels like a beautiful dream come true. <br />
          You make my heart skip a beat and my world shine brighter. <br />
          I love you more than words can express. 💕"
        </p>
      </div>
    </>
  )
}
