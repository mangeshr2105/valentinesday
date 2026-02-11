"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [floatingHearts, setFloatingHearts] = useState([]);
  const [name, setName] = useState("");
  const router = useRouter();

  const handleStart = () => {
    if (!name.trim()) return;
    const slug = encodeURIComponent(name.trim());
    router.push(`/${slug}`);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleStart();
    }
  };

  useEffect(() => {
    const hearts = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      size: 12 + Math.random() * 48, // Now ranges from 12px to 60px for more variety
      duration: 6 + Math.random() * 6,
    }));
    setFloatingHearts(hearts);
  }, []);

  return (
    <div style={styles.container}>
      {/* Floating Hearts */}
      {floatingHearts.map((heart) => (
        <div
          key={heart.id}
          style={{
            position: "absolute",
            left: `${heart.left}%`,
            bottom: "-40px",
            fontSize: `${heart.size}px`,
            animation: `floatUp ${heart.duration}s linear infinite`,
            animationDelay: `${heart.delay}s`,
            opacity: 0.7,
            zIndex: 1,
            pointerEvents: "none",
          }}
        >
          ❤️
        </div>
      ))}

      <h1 style={styles.title} className="fadeIn titleFloat">
        Welcome to <span style={{ color: "#8b0000", textShadow: "0 0 20px rgba(139, 0, 0, 0.8), 0 0 40px rgba(255, 107, 157, 0.6), 0 0 60px rgba(255, 107, 157, 0.4)" }}>Valentine&apos;s Day</span> Website ❤️
      </h1>

      <p style={styles.subtitle} className="fadeIn delay">
        Visit <strong style={{ color: "#ff6b9d", textShadow: "0 2px 8px rgba(255, 107, 157, 0.3)" }}>/[name]</strong> to start your love story ✨
      </p>

      <div style={styles.inputWrapper} className="fadeIn delay">
        <input
          type="text"
          placeholder="Enter your name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyPress={handleKeyPress}
          style={styles.input}
        />
        <button style={styles.startBtn} className="start-button" onClick={handleStart}>
          Start 💘
        </button>
      </div>

      <div style={styles.glow} />
      
      <style jsx global>{`
        @keyframes floatUp {
          0% {
            transform: translateY(0) scale(1);
            opacity: 0;
          }
          10% {
            opacity: 0.7;
          }
          100% {
            transform: translateY(-110vh) scale(1.2);
            opacity: 0;
          }
        }

        .fadeIn {
          opacity: 0;
          transform: translateY(20px);
          animation: fadeUp 1s ease forwards;
        }

        .fadeIn.delay {
          animation-delay: 0.5s;
        }

        .titleFloat {
          animation: fadeUp 1s ease forwards, floatTitle 4s ease-in-out 1s infinite;
        }

        @keyframes fadeUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes pulseGlow {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
          50% { transform: translate(-50%, -50%) scale(1.15); opacity: 0.9; }
        }

        @keyframes floatTitle {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .start-button:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 
            '0 8px 16px rgba(255, 77, 109, 0.5), ' +
            '0 4px 8px rgba(0, 0, 0, 0.3), ' +
            'inset 0 1px 0 rgba(255, 255, 255, 0.4), ' +
            'inset 0 -1px 0 rgba(0, 0, 0, 0.3)';
        }
        .start-button:active {
          transform: translateY(0) scale(0.98);
          box-shadow: 
            '0 3px 6px rgba(255, 77, 109, 0.4), ' +
            '0 1px 2px rgba(0, 0, 0, 0.2), ' +
            'inset 0 1px 2px rgba(0, 0, 0, 0.2)';
        }
        button:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 20px rgba(0,0,0,0.2);
        }
        @media (max-width: 480px) {
          .title {
            font-size: 1.6rem !important;
            margin: 0 auto; /* Ensure perfect centering */
            word-wrap: break-word;
            overflow-wrap: break-word;
            transform: translateX(0); /* Reset any transform */
          }
          .subtitle {
            margin: 0 auto; /* Ensure perfect centering */
            transform: translateX(0); /* Reset any transform */
          }
        }
        @media (max-width: 768px) {
          .title {
            font-size: 1.8rem !important;
            margin: 0 auto; /* Ensure perfect centering */
            word-wrap: break-word;
            overflow-wrap: break-word;
            transform: translateX(0); /* Reset any transform */
          }
          .subtitle {
            margin: 0 auto; /* Ensure perfect centering */
            transform: translateX(0); /* Reset any transform */
          }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: `
  radial-gradient(circle at 50% 40%, #ff4d6d 0%, #b3122d 35%, #5a0a14 65%, #2a0006 100%),
  linear-gradient(135deg, #2a0006, #5a0a14)
`,
    boxShadow: "inset 0 0 120px rgba(255, 80, 120, 0.25)",
    padding: "40px 10px",
    fontFamily: 'Georgia, "Times New Roman", serif',
    position: "fixed",
    top: 0,
    left: 0,
    height: "100vh",
    maxHeight: "100vh",
    overflow: "hidden",
    touchAction: "none",
  },
  title: {
    fontSize: "clamp(1.5rem, 8vw, 2.5rem)", /* More conservative sizing to prevent overflow */
    marginBottom: "1.5rem",
    fontWeight: "700",
    lineHeight: "1.2",
    letterSpacing: "-0.02em",
    textShadow: "0 4px 20px rgba(255, 255, 255, 0.8)",
    zIndex: 2,
    maxWidth: "95vw", /* Increased max width to allow better centering */
    textAlign: "center",
    margin: "0 auto",
    color: "#ffffff",
  },
  subtitle: {
    fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
    color: "#ffd4e5",
    fontWeight: "400",
    zIndex: 2,
    textAlign: "center",
    margin: "0 auto",
    textShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
  },
  glow: {
    position: "absolute",
    width: "500px",
    height: "500px",
    background:
      "radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 70%)",
    borderRadius: "50%",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    filter: "blur(40px)",
    zIndex: 1,
    animation: "pulseGlow 6s ease-in-out infinite",
  },
  inputWrapper: {
    marginTop: "20px",
    display: "flex",
    gap: "10px",
    zIndex: 2,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  input: {
    padding: "12px 20px",
    borderRadius: "25px",
    border: "2px solid rgba(255, 255, 255, 0.3)",
    outline: "none",
    fontSize: "16px",
    minWidth: "220px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    color: "#2d1b3d",
  },
  startBtn: {
    padding: "12px 20px",
    borderRadius: "25px",
    border: "none",
    background: "linear-gradient(145deg, #ff4d6d 0%, #ff6b9d 50%, #ff8fab 100%)",
    color: "white",
    fontSize: "16px",
    cursor: "pointer",
    boxShadow: 
      "0 6px 12px rgba(255, 77, 109, 0.4), " +
      "0 3px 6px rgba(0, 0, 0, 0.2), " +
      "inset 0 1px 0 rgba(255, 255, 255, 0.3), " +
      "inset 0 -1px 0 rgba(0, 0, 0, 0.2)",
    transition: "all 0.3s ease",
    position: "relative",
    transform: "translateY(0)"
  },
};
