'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

export default function ValentinePage({ params }) {
  const name = decodeURIComponent(params.name)
  
  // Capitalize first letter of each word
  const formattedName = name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')

  const [escapeAttempts, setEscapeAttempts] = useState(0)
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 })
  const [isMobile, setIsMobile] = useState(false)
  const [initialButtonPos, setInitialButtonPos] = useState({ x: 0, y: 0 })
  const [floatingHearts, setFloatingHearts] = useState([])
  const [buttonStats, setButtonStats] = useState({ noPresses: 0, yesPressed: false })
  const noButtonRef = useRef(null)
  const containerRef = useRef(null)
  const escapeLock = useRef(false)
  const MAX_ESCAPES = 14

  // Initialize floating hearts
  useEffect(() => {
    const hearts = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      size: 12 + Math.random() * 48, // Now ranges from 12px to 60px for more variety
      duration: 8 + Math.random() * 8,
      emoji: ['❤️', '💖', '💕', '💗', '💓', '💝'][Math.floor(Math.random() * 6)]
    }))
    setFloatingHearts(hearts)
  }, [])

  // Detect mobile and store initial button position
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    // Store initial button position after render
    const timer = setTimeout(() => {
      if (noButtonRef.current) {
        const rect = noButtonRef.current.getBoundingClientRect()
        setInitialButtonPos({ x: rect.left, y: rect.top })
      }
    }, 100)
    
    return () => {
      window.removeEventListener('resize', checkMobile)
      clearTimeout(timer)
    }
  }, [])

  // Save button statistics to server
  const saveButtonStats = async () => {
    try {
      console.log('Saving button stats:', { name: formattedName, stats: buttonStats });
      const response = await fetch('/api/button-stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name: formattedName,
          stats: buttonStats 
        }),
      });
      if (response.ok) {
        console.log('Button stats saved successfully');
      } else {
        console.error('Failed to save button stats:', response.status);
      }
    } catch (error) {
      console.error('Error saving button stats:', error);
    }
  };

  // Save stats when component unmounts or user navigates away
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveButtonStats();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [formattedName, buttonStats]);

  const handleYesClick = () => {
    // Mark yes as pressed
    setButtonStats(prev => ({ 
      ...prev, 
      yesPressed: true 
    }))
    
    // Save stats immediately when yes is pressed
    setTimeout(() => {
      saveButtonStats()
      router.push(`/${encodeURIComponent(name)}/yes`)
    }, 100)
  }

  const moveButtonToRandomPosition = () => {
    if (escapeLock.current) return
    if (!noButtonRef.current) return
    escapeLock.current = true
    
    const buttonRect = noButtonRef.current.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const buttonWidth = buttonRect.width
    const buttonHeight = buttonRect.height
    
    // Calculate available space (keeping button within viewport with padding)
    const padding = 20
    const maxX = viewportWidth - buttonWidth - padding
    const maxY = viewportHeight - buttonHeight - padding
    const minX = padding
    const minY = padding
    
    // Get current button position
    const currentX = escapeAttempts === 0 ? buttonRect.left : buttonPosition.x
    const currentY = escapeAttempts === 0 ? buttonRect.top : buttonPosition.y
    
    // Generate random position, ensuring it's far enough from current position
    let newX, newY
    let attempts = 0
    do {
      newX = Math.random() * (maxX - minX) + minX
      newY = Math.random() * (maxY - minY) + minY
      attempts++
    } while (
      Math.abs(newX - currentX) < 80 && 
      Math.abs(newY - currentY) < 80 && 
      attempts < 20
    )
    
    // Store the new position (will be used with fixed positioning)
    setButtonPosition({ x: newX, y: newY })
    setEscapeAttempts(prev => {
      // Allow up to MAX_ESCAPES attempts
      if (prev < MAX_ESCAPES) {
        return prev + 1
      }
      return prev
    })

    setTimeout(() => {
      escapeLock.current = false
    }, 300)
  }

  const handleNoButtonClick = (e) => {
    // Always prevent navigation - button is unclickable after max escapes
    if (escapeAttempts >= MAX_ESCAPES) {
      e.preventDefault()
      e.stopPropagation()
      return
    }
    
    // Track button press
    setButtonStats(prev => ({ 
      ...prev, 
      noPresses: prev.noPresses + 1 
    }))
    
    e.preventDefault()
    // Move button on click for both desktop and mobile
    moveButtonToRandomPosition()
  }

  const getNoButtonText = () => {
    const texts = [
      'No 💔🥺',
      'No Wait… are you sure? 😏',
      'No Arre soch lo phir se 😌',
      'No Really?? 😳',
      'No Itni jaldi no bol diya? 😏',
      'No Try again 😂',
      'No You sure about that? 👀',
      'No Dil tod dogi kya? 💔🥺',
      'No Ha ha, nice try! 😜',
      'No Retry maar lo na once more 😜',
      'No Sach me?? 😈',
      'No Ab toh haan bol do yaar 💖',
      'No Bas karo… destiny likh chuki hai ✨💘',
      'No System says: Wrong answer 😤',
      "No you can't escape my love! 💘",
    ]

    return texts[Math.min(escapeAttempts, texts.length - 1)]
  }

  const isButtonDisabled = escapeAttempts >= MAX_ESCAPES

  return (
    <>
      <style jsx>{`
        .yes-button:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 
            '0 12px 24px rgba(255, 107, 157, 0.5), ' +
            '0 6px 12px rgba(0, 0, 0, 0.3), ' +
            'inset 0 1px 0 rgba(255, 255, 255, 0.4), ' +
            'inset 0 -1px 0 rgba(0, 0, 0, 0.3)';
        }
        .yes-button:active {
          transform: translateY(0) scale(0.98);
          box-shadow: 
            '0 4px 8px rgba(255, 107, 157, 0.4), ' +
            '0 2px 4px rgba(0, 0, 0, 0.2), ' +
            'inset 0 1px 2px rgba(0, 0, 0, 0.2)';
        }
        .no-button:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 
            '0 8px 16px rgba(0, 0, 0, 0.2), ' +
            '0 4px 8px rgba(0, 0, 0, 0.15), ' +
            'inset 0 1px 0 rgba(255, 255, 255, 0.9), ' +
            'inset 0 -1px 0 rgba(0, 0, 0, 0.15)';
        }
        .no-button:active {
          transform: translateY(0) scale(0.98);
          box-shadow: 
            '0 2px 4px rgba(0, 0, 0, 0.15), ' +
            'inset 0 1px 2px rgba(0, 0, 0, 0.1)';
        }
        .no-button-wrapper {
          position: relative;
          transition: transform 0.2s ease-out;
        }
        @keyframes floatUp {
          0% {
            transform: translateY(0) translateX(0) scale(1);
            opacity: 0;
          }
          10% {
            opacity: 0.8;
          }
          50% {
            transform: translateY(-50vh) translateX(20px) scale(1.1);
            opacity: 0.6;
          }
          100% {
            transform: translateY(-110vh) translateX(-20px) scale(1.3);
            opacity: 0;
          }
        }
        @keyframes floatUpDown {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
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
          .main-heading {
            font-size: 2rem !important;
            padding: 0 20px;
            word-wrap: break-word;
            overflow-wrap: break-word;
            margin: 0 auto; /* Ensure perfect centering */
            transform: translateX(0); /* Reset any transform */
          }
          .button-container {
            padding: 0 20px;
            max-width: 100%;
            margin: 0 auto; /* Ensure perfect centering */
          }
        }
      `}</style>
      <div 
        ref={containerRef}
        style={{
          minHeight: '100vh',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
          padding: '40px 10px',
          color: '#2d1b3d',
          textAlign: 'center',
          fontFamily: 'Georgia, "Times New Roman", serif',
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          maxHeight: '100vh',
          overflow: 'hidden'
        }}
      >
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
        
        <h1 className="main-heading" style={{
          position: 'relative',
          zIndex: 2,
          fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          marginBottom: '4rem',
          fontWeight: '600',
          lineHeight: '1.2',
          letterSpacing: '-0.02em',
          background: 'linear-gradient(135deg, #ff1493 0%, #c71585 25%, #db7093 50%, #ff69b4 75%, #ff1493 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          textShadow: 'none',
          maxWidth: '95vw',
          margin: '0 auto 4rem auto',
          animation: 'floatUpDown 3s ease-in-out infinite'
        }}>
          {formattedName}, will you be my Valentine? ❤️
        </h1>
        
        <div className="button-container" style={{
          display: 'flex',
          gap: '24px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          zIndex: 2,
          marginTop: '1rem'
        }}>
          <Link href={`/${params.name}/yes`} style={{ textDecoration: 'none' }}>
            <button className="yes-button" style={{
              padding: '18px 48px',
              fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)',
              borderRadius: '50px',
              border: 'none',
              background: 'linear-gradient(145deg, #ff6b9d 0%, #ff8fab 50%, #ffa8c5 100%)',
              color: 'white',
              cursor: 'pointer',
              fontWeight: '600',
              boxShadow: 
                '0 8px 16px rgba(255, 107, 157, 0.4), ' +
                '0 4px 8px rgba(0, 0, 0, 0.2), ' +
                'inset 0 1px 0 rgba(255, 255, 255, 0.3), ' +
                'inset 0 -1px 0 rgba(0, 0, 0, 0.2)',
              transition: 'all 0.3s ease',
              letterSpacing: '0.5px',
              position: 'relative',
              transform: 'translateY(0)'
            }}>
              YES 💖
            </button>
          </Link>
          
          <div 
            className="no-button-wrapper"
            style={{
              position: escapeAttempts > 0 ? 'fixed' : 'relative',
              left: escapeAttempts > 0 ? `${buttonPosition.x}px` : 'auto',
              top: escapeAttempts > 0 ? `${buttonPosition.y}px` : 'auto',
              display: 'inline-block',
              zIndex: escapeAttempts > 0 ? 10 : 1,
              transition: escapeAttempts > 0 ? 'left 0.2s ease-out, top 0.2s ease-out' : 'none'
            }}
          >
            <button 
              ref={noButtonRef}
              className="no-button" 
              onClick={handleNoButtonClick}
              disabled={isButtonDisabled}
              style={{
                padding: '18px 48px',
                fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)',
                borderRadius: '50px',
                border: '2px solid rgba(45, 27, 61, 0.2)',
                background: isButtonDisabled 
                  ? 'linear-gradient(145deg, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.3))'
                  : 'linear-gradient(145deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.6))',
                color: isButtonDisabled ? '#9ca3af' : '#6b7280',
                cursor: isButtonDisabled ? 'not-allowed' : 'default',
                fontWeight: '600',
                boxShadow: isButtonDisabled 
                  ? '0 2px 4px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                  : '0 6px 12px rgba(0, 0, 0, 0.15), ' +
                    '0 3px 6px rgba(0, 0, 0, 0.1), ' +
                    'inset 0 1px 0 rgba(255, 255, 255, 0.8), ' +
                    'inset 0 -1px 0 rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease',
                letterSpacing: '0.5px',
                opacity: isButtonDisabled ? 0.7 : 1,
                pointerEvents: isButtonDisabled ? 'none' : 'auto',
                position: 'relative',
                transform: 'translateY(0)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px'
              }}
            >
              <span style={{ fontSize: '0.7em', lineHeight: '1.2' }}>
                {getNoButtonText().replace('No ', '')}
              </span>
              <span style={{ fontSize: '1.3em', fontWeight: '700' }}>No</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

