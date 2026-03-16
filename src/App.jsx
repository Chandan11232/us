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
  const containerRef = useRef(null);

  // Saumya & Chandan Positions
  const saumyaX = useMotionValue(150);
  const saumyaY = useMotionValue(200);
  const chandanX = useSpring(window.innerWidth - 200, {
    stiffness: 120,
    damping: 20,
  });
  const chandanY = useSpring(window.innerHeight - 200, {
    stiffness: 120,
    damping: 20,
  });

  // Dynamic Crowd Setup
  const crowd = useMemo(
    () =>
      Array.from({ length: 50 }).map((_, i) => ({
        id: i,
        name: NAMES[i % NAMES.length],
        emoji: CROWD_EMOJIS[i % CROWD_EMOJIS.length],
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
      })),
    [],
  );

  // Physics & Meeting Logic
  useEffect(() => {
    let frameId;
    const runPhysics = () => {
      const sx = saumyaX.get();
      const sy = saumyaY.get();
      const cx = chandanX.get();
      const cy = chandanY.get();

      const dist = Math.sqrt(Math.pow(sx - cx, 2) + Math.pow(sy - cy, 2));

      if (dist < 350 && !met) {
        chandanX.set(sx + 110); // Spaced apart as requested
        chandanY.set(sy);
      }

      if (dist < 120 && !met) {
        setMet(true);
        triggerWeddingBliss();
      }
      frameId = requestAnimationFrame(runPhysics);
    };
    frameId = requestAnimationFrame(runPhysics);
    return () => cancelAnimationFrame(frameId);
  }, [met, chandanX, chandanY, saumyaX, saumyaY]);

  const triggerWeddingBliss = () => {
    const end = Date.now() + 7 * 1000;
    const heart = confetti.shapeFromText({ text: "❤️", scalar: 3 });
    const ring = confetti.shapeFromText({ text: "💍", scalar: 3 });
    (function frame() {
      confetti({
        particleCount: 10,
        spread: 100,
        origin: { y: 0.6 },
        shapes: [heart, ring],
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  };

  return (
    <div ref={containerRef} style={styles.container}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Bungee+Spice&display=swap');
      `}</style>

      {/* MOVING CROWD LAYER */}
      {!met &&
        crowd.map((p) => (
          <FloatingName
            key={p.id}
            person={p}
            saumyaX={saumyaX}
            saumyaY={saumyaY}
          />
        ))}

      {/* CHANDAN */}
      <motion.div
        style={{ ...styles.vip, x: chandanX, y: chandanY, zIndex: 5 }}
      >
        <span style={{ fontSize: "4.5rem" }}>👦</span>
        <p
          style={{
            ...styles.vipLabel,
            color: "#00d2ff",
            fontFamily: met ? '"Bungee Spice", cursive' : "sans-serif",
            marginTop: met ? "50px" : "5px",
          }}
        >
          {met ? "Chandan (Groom)" : "Chandan"}
        </p>
      </motion.div>

      {/* SAUMYA */}
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
        <span style={{ fontSize: "4.5rem" }}>👧</span>
        <p
          style={{
            ...styles.vipLabel,
            color: "#ff69b4",
            fontFamily: met ? '"Bungee Spice", cursive' : "sans-serif",
            marginTop: met ? "50px" : "5px",
          }}
        >
          {met ? "Saumya (Bride)" : "Saumya"}
        </p>
      </motion.div>

      {/* Success UI Overlay */}
      {met && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          style={styles.overlay}
        >
          <h1 style={styles.destinyText}>NOW, YOU'RE MARRIED! 💍</h1>
          <img
            src="/soulmates.gif"
            style={styles.meetingGif}
            alt="Wedding Celebration"
            onError={(e) =>
              (e.target.src =
                "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNXAxeXBoZzR0eXBtZzR0eXBtZzR0eXBtZzR0eXBtZzR0eXBtZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l41lTxf0ZebL6S0G4/giphy.gif")
            }
          />
          <button onClick={() => window.location.reload()} style={styles.btn}>
            Celebrate Again
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
      let curX = x.get();
      let curY = y.get();
      curX += vx;
      curY += vy;
      if (curX < 0 || curX > window.innerWidth) vx *= -1;
      if (curY < 0 || curY > window.innerHeight) vy *= -1;

      // PUSH ASIDE
      const dx = curX - saumyaX.get();
      const dy = curY - saumyaY.get();
      if (Math.sqrt(dx * dx + dy * dy) < 180) {
        curX += dx * 0.12;
        curY += dy * 0.12;
      }
      x.set(curX);
      y.set(curY);
      frameId = requestAnimationFrame(move);
    };
    frameId = requestAnimationFrame(move);
    return () => cancelAnimationFrame(frameId);
  }, [saumyaX, saumyaY, x, y, person.vx, person.vy]);

  return (
    <motion.div
      style={{
        position: "absolute",
        x,
        y,
        opacity: 0.4,
        pointerEvents: "none",
        textAlign: "center",
      }}
    >
      <span style={{ fontSize: "2.5rem" }}>{person.emoji}</span>{" "}
      {/* Larger Crowd Emojis */}
      <p
        style={{
          color: "white",
          fontSize: "14px",
          margin: 0,
          fontWeight: "bold",
        }}
      >
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
    filter: "drop-shadow(0 0 20px rgba(255,255,255,0.4))",
  },
  vipLabel: {
    fontWeight: "bold",
    fontSize: "1.4rem",
    transition: "all 0.5s ease",
  },
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
    marginBottom: "25px",
  },
  meetingGif: {
    width: "350px",
    borderRadius: "40px",
    border: "8px solid #ff69b4",
    boxShadow: "0 0 50px rgba(255, 105, 180, 0.6)",
  },
  btn: {
    marginTop: "25px",
    padding: "12px 30px",
    borderRadius: "25px",
    background: "#ff69b4",
    color: "white",
    border: "none",
    fontWeight: "bold",
    fontSize: "1rem",
    cursor: "pointer",
  },
};
