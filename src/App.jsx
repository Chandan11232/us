import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import confetti from "canvas-confetti";

const NAMES = [
  "Aarav",
  "Liam",
  "Sophia",
  "Priya",
  "Vikram",
  "Zoe",
  "Sneha",
  "Hans",
  "Yuki",
  "Chloe",
];
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

export default function App() {
  const [met, setMet] = useState(false);
  const [isDragging, setIsDragging] = useState(false); // Track if user is actually holding Saumya

  // Saumya's Position
  const saumyaX = useMotionValue(100);
  const saumyaY = useMotionValue(200);

  // Chandan's Position (Stiffer spring for better "hold" feel)
  const chandanX = useSpring(window.innerWidth - 250, {
    stiffness: 150,
    damping: 30,
  });
  const chandanY = useSpring(window.innerHeight - 250, {
    stiffness: 150,
    damping: 30,
  });

  const crowd = useMemo(
    () =>
      Array.from({ length: 45 }).map((_, i) => ({
        id: i,
        name: NAMES[i % NAMES.length],
        emoji: CROWD_EMOJIS[i % CROWD_EMOJIS.length],
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2,
      })),
    [],
  );

  useEffect(() => {
    let frameId;
    const runPhysics = () => {
      const sx = saumyaX.get();
      const sy = saumyaY.get();
      const cx = chandanX.get();
      const cy = chandanY.get();

      const dist = Math.sqrt(Math.pow(sx - cx, 2) + Math.pow(sy - cy, 2));

      // ONLY MOVE CHANDAN IF USER IS DRAGGING SAUMYA
      if (isDragging && dist < 450 && !met) {
        chandanX.set(sx + 120); // Maintain that gap you wanted
        chandanY.set(sy);
      }

      // MEETING TRIGGER
      if (dist < 130 && isDragging && !met) {
        setMet(true);
        setIsDragging(false);
        triggerWeddingBliss();
      }
      frameId = requestAnimationFrame(runPhysics);
    };
    frameId = requestAnimationFrame(runPhysics);
    return () => cancelAnimationFrame(frameId);
  }, [isDragging, met, chandanX, chandanY, saumyaX, saumyaY]);

  const triggerWeddingBliss = () => {
    const end = Date.now() + 6 * 1000;
    (function frame() {
      confetti({
        particleCount: 10,
        spread: 100,
        origin: { y: 0.6 },
        shapes: [confetti.shapeFromText({ text: "❤️" })],
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  };

  return (
    <div style={styles.container}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bungee+Spice&display=swap');
      `}</style>

      {/* MOVING CROWD */}
      {!met &&
        crowd.map((p) => (
          <FloatingName
            key={p.id}
            person={p}
            saumyaX={saumyaX}
            saumyaY={saumyaY}
          />
        ))}

      {/* CHANDAN (The Groom) */}
      <motion.div
        style={{ ...styles.vip, x: chandanX, y: chandanY, zIndex: 5 }}
      >
        <span style={{ fontSize: "4.5rem" }}>👦</span>
        <p
          style={{
            ...styles.vipLabel,
            color: "#00d2ff",
            fontFamily: met ? '"Bungee Spice", cursive' : "sans-serif",
            marginTop: met ? "60px" : "5px",
          }}
        >
          {met ? "Chandan (Groom)" : "Chandan"}
        </p>
      </motion.div>

      {/* SAUMYA (The Bride - Draggable) */}
      <motion.div
        drag
        dragMomentum={false}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setIsDragging(false)}
        style={{
          ...styles.vip,
          x: saumyaX,
          y: saumyaY,
          zIndex: 10,
          cursor: "grab",
        }}
      >
        <span style={{ fontSize: "4.5rem" }}>👧</span>
        <p
          style={{
            ...styles.vipLabel,
            color: "#ff69b4",
            fontFamily: met ? '"Bungee Spice", cursive' : "sans-serif",
            marginTop: met ? "60px" : "5px",
          }}
        >
          {met ? "Saumya (Bride)" : "Saumya"}
        </p>
      </motion.div>

      {/* SUCCESS OVERLAY */}
      {met && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={styles.overlay}
        >
          <h1 style={styles.destinyText}>NOW, YOU'RE MARRIED! 💍</h1>
          <img
            src="https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExZjNqbHRlZ2c2NGs0amgybnFxN2UzZjZmMjhvZnp4M2F3ZWw0MHdzNSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ytu2GUYbvhz7zShGwS/giphy.gif"
            style={styles.meetingGif}
            onError={(e) =>
              (e.target.src =
                "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExZjNqbHRlZ2c2NGs0amgybnFxN2UzZjZmMjhvZnp4M2F3ZWw0MHdzNSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ytu2GUYbvhz7zShGwS/giphy.gif")
            }
          />
          <button onClick={() => window.location.reload()} style={styles.btn}>
            Restart
          </button>
        </motion.div>
      )}
    </div>
  );
}

function FloatingName({ person, saumyaX, saumyaY }) {
  const x = useMotionValue(Math.random() * window.innerWidth);
  const y = useMotionValue(Math.random() * window.innerHeight);

  useEffect(() => {
    let frameId;
    let vx = person.vx;
    let vy = person.vy;
    const move = () => {
      let curX = x.get() + vx;
      let curY = y.get() + vy;
      if (curX < 0 || curX > window.innerWidth) vx *= -1;
      if (curY < 0 || curY > window.innerHeight) vy *= -1;

      // REPEL: Crowd pushes away from Saumya
      const dx = curX - saumyaX.get();
      const dy = curY - saumyaY.get();
      if (Math.sqrt(dx * dx + dy * dy) < 200) {
        curX += dx * 0.08;
        curY += dy * 0.08;
      }
      x.set(curX);
      y.set(curY);
      frameId = requestAnimationFrame(move);
    };
    frameId = requestAnimationFrame(move);
    return () => cancelAnimationFrame(frameId);
  }, [saumyaX, saumyaY, x, y, person.vx, person.vy]);

  return (
    <motion.div style={{ position: "absolute", x, y, opacity: 0.4 }}>
      <span style={{ fontSize: "2.5rem" }}>{person.emoji}</span>
      <p style={{ color: "white", fontSize: "14px", margin: 0 }}>
        {person.name}
      </p>
    </motion.div>
  );
}

const styles = {
  container: {
    width: "100vw",
    height: "100vh",
    background: "#0a0a0a",
    overflow: "hidden",
    position: "relative",
    touchAction: "none",
  },
  vip: {
    position: "absolute",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  vipLabel: { fontWeight: "bold", fontSize: "1.4rem" },
  overlay: {
    position: "absolute",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "rgba(0,0,0,0.9)",
    zIndex: 100,
  },
  destinyText: {
    color: "white",
    fontSize: "3rem",
    fontFamily: '"Bungee Spice"',
    textAlign: "center",
  },
  meetingGif: {
    width: "350px",
    borderRadius: "40px",
    border: "8px solid #ff69b4",
  },
  btn: {
    marginTop: "25px",
    padding: "10px 20px",
    borderRadius: "20px",
    background: "#ff69b4",
    color: "white",
    border: "none",
  },
};
