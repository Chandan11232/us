import React, { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import confetti from "canvas-confetti";

// Fun emoji list for the "wrong" names
const CROWD_EMOJIS = [
  "👻",
  "🤡",
  "🤖",
  "👽",
  "🐱",
  "🐶",
  "🦊",
  "🐸",
  "🐹",
  "🐼",
];
const NAMES = [
  "Aarav",
  "Liam",
  "Sophia",
  "Priya",
  "Vikram",
  "Zoe",
  "Samiksha",
  "Diya",
  "Rohini",
  "Hans",
  "Yuki",
  "Chloe",
];

// Create 80 random people for the background
const others = Array.from({ length: 80 }).map((_, i) => ({
  id: i,
  name: NAMES[i % NAMES.length],
  emoji: CROWD_EMOJIS[i % CROWD_EMOJIS.length],
  x: Math.random() * 90, // Percentage based for responsiveness
  y: Math.random() * 90,
}));

export default function App() {
  const [met, setMet] = useState(false);
  const containerRef = useRef(null);

  // Saumya's position (Draggable)
  const saumyaX = useMotionValue(100);
  const saumyaY = useMotionValue(100);

  // Chandan's position (Uses a Spring for smooth "Magnet" effect)
  const chandanX = useSpring(window.innerWidth - 150, {
    stiffness: 50,
    damping: 15,
  });
  const chandanY = useSpring(window.innerHeight - 150, {
    stiffness: 50,
    damping: 15,
  });

  useEffect(() => {
    const checkDistance = () => {
      const sx = saumyaX.get();
      const sy = saumyaY.get();
      const cx = chandanX.get();
      const cy = chandanY.get();

      const dist = Math.sqrt(Math.pow(sx - cx, 2) + Math.pow(sy - cy, 2));

      // 1. Magnetic Pull: If Saumya gets close, Chandan is sucked in
      if (dist < 400 && !met) {
        chandanX.set(sx + 40); // Snap slightly to the side
        chandanY.set(sy);
      }

      // 2. The Big Meet
      if (dist < 60 && !met) {
        setMet(true);
        triggerHugeHeartBlast();
      }
    };

    const unsubscribe = saumyaX.on("change", checkDistance);
    return () => unsubscribe();
  }, [met]);

  const triggerHugeHeartBlast = () => {
    const end = Date.now() + 5 * 1000;
    const heart = confetti.shapeFromText({ text: "❤️", scalar: 3 });

    (function frame() {
      confetti({
        particleCount: 15,
        angle: 60,
        spread: 100,
        origin: { x: 0, y: 0.7 },
        shapes: [heart],
        colors: ["#ff69b4", "#ff0000"],
      });
      confetti({
        particleCount: 15,
        angle: 120,
        spread: 100,
        origin: { x: 1, y: 0.7 },
        shapes: [heart],
        colors: ["#ff69b4", "#ff0000"],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  };

  return (
    <div ref={containerRef} style={styles.container}>
      {/* Background Crowd */}
      {others.map((person) => (
        <div
          key={person.id}
          style={{
            ...styles.person,
            left: `${person.x}%`,
            top: `${person.y}%`,
          }}
        >
          <span style={{ fontSize: "1.5rem" }}>{person.emoji}</span>
          <p style={styles.nameLabel}>{person.name}</p>
        </div>
      ))}

      {/* Chandan (The Boy) */}
      <motion.div
        style={{ ...styles.vip, x: chandanX, y: chandanY, zIndex: 5 }}
      >
        <span style={{ fontSize: "4rem" }}>👦</span>
        <p style={styles.vipLabel}>Chandan</p>
      </motion.div>

      {/* Saumya (The Girl - Draggable) */}
      <motion.div
        drag
        dragMomentum={false}
        style={{
          ...styles.vip,
          x: saumyaX,
          y: saumyaY,
          zIndex: 10,
          cursor: "grab",
        }}
      >
        <span style={{ fontSize: "4rem" }}>👧</span>
        <p style={{ ...styles.vipLabel, color: "#ff69b4" }}>Saumya</p>
      </motion.div>

      {/* Success UI */}
      {met && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          style={styles.overlay}
        >
          <h1 style={styles.destinyText}>SAUMYA ❤️ CHANDAN</h1>
          <img src="/love.gif" style={styles.meetingGif} alt="Love" />
        </motion.div>
      )}
    </div>
  );
}

const styles = {
  container: {
    width: "100vw",
    height: "100vh",
    background: "#0f0f0f",
    overflow: "hidden",
    position: "relative",
  },
  person: {
    position: "absolute",
    opacity: 0.3,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  nameLabel: { color: "white", fontSize: "10px", margin: 0 },
  vip: {
    position: "absolute",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  vipLabel: {
    color: "#00d2ff",
    fontWeight: "bold",
    fontSize: "1.2rem",
    margin: 0,
    textShadow: "0 0 10px rgba(255,255,255,0.5)",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "rgba(0,0,0,0.7)",
    zIndex: 100,
  },
  destinyText: {
    color: "#fff",
    fontSize: "3rem",
    fontFamily: "cursive",
    marginBottom: "20px",
  },
  meetingGif: {
    width: "300px",
    borderRadius: "20px",
    border: "5px solid #ff69b4",
  },
};
