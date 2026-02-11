'use client'

import { useState, useEffect } from 'react'

export default function NoPage({ params }) {
  const name = decodeURIComponent(params.name)
  
  // Capitalize first letter of each word
  const formattedName = name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')

  const [floatingHearts, setFloatingHearts] = useState([])

  useEffect(() => {
    const hearts = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      size: 16 + Math.random() * 24,
      duration: 8 + Math.random() * 8,
      emoji: ['💔', '😢', '💧'][Math.floor(Math.random() * 3)]
    }))
    setFloatingHearts(hearts)
  }, [])

  return (
    <>
      <style jsx>{`
        @keyframes floatUp {
          0% {
            transform: translateY(0) translateX(0) scale(1);
            opacity: 0;
          }
          10% {
            opacity: 0.7;
          }
          50% {
            transform: translateY(-50vh) translateX(20px) scale(1.1);
            opacity: 0.5;
          }
          100% {
            transform: translateY(-110vh) translateX(-20px) scale(1.3);
            opacity: 0;
          }
        }
        .floating-heart {
          position: absolute;
          bottom: -40px;
          pointer-events: none;
          user-select: none;
          z-index: 1;
        }
        @media (max-width: 768px) {
          h1 {
            padding: 0 20px;
            word-wrap: break-word;
            overflow-wrap: break-word;
          }
        }
      `}</style>
      <div style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
        padding: '40px 20px',
        color: '#2d1b3d',
        textAlign: 'center',
        fontFamily: 'Georgia, "Times New Roman", serif',
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        maxHeight: '100vh',
        overflow: 'hidden'
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
        
        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          fontWeight: '600',
          lineHeight: '1.2',
          letterSpacing: '-0.02em',
          color: '#2d1b3d',
          textShadow: '0 2px 10px rgba(255, 255, 255, 0.3)',
          padding: '0 20px',
          position: 'relative',
          zIndex: 2,
          marginBottom: '1.5rem'
        }}>
          {formattedName} said no 😢
        </h1>
      </div>
    </>
  )
}
