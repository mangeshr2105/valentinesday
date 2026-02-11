'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export default function RootLayout({ children }) {
  const pathname = usePathname()
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [previousPath, setPreviousPath] = useState(pathname)

  useEffect(() => {
    if (pathname !== previousPath) {
      setIsTransitioning(true)
      const timer = setTimeout(() => {
        setIsTransitioning(false)
        setPreviousPath(pathname)
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [pathname, previousPath])

  return (
    <html lang="en">
      <head>
        <style jsx global>{`
          @keyframes fadeInScale {
            0% {
              opacity: 0;
              transform: scale(0.98) translateY(10px);
            }
            100% {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }

          .page-transition-container {
            min-height: 100vh;
            position: relative;
          }

          .page-transition-enter {
            animation: fadeInScale 0.8s ease-out forwards;
          }

          /* Smooth transitions for all interactive elements */
          a, button {
            transition: all 0.2s ease;
          }

          a:hover, button:hover {
            transform: translateY(-1px);
            filter: brightness(1.1);
          }

          /* Prevent layout shift during transitions */
          body {
            overflow-x: hidden;
          }
        `}</style>
      </head>
      <body style={{ 
        fontFamily: 'Georgia, "Times New Roman", serif', 
        margin: 0, 
        padding: 0
      }}>
        <div className={`page-transition-container ${isTransitioning ? 'page-transition-enter' : ''}`}>
          {children}
        </div>
      </body>
    </html>
  )
}

