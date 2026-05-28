"use client"

import { motion } from "framer-motion"

export default function DashboardCard({
  title,
  subtext,
  accent,
  onClick,
  delay = 0
}) {
  return (
    <motion.button
      initial={{
        opacity: 0,
        y: 18
      }}
      animate={{
        opacity: 1,
        y: 0
      }}
      transition={{
        duration: 0.7,
        delay
      }}
      whileHover={{
        y: -4
      }}
      whileTap={{
        scale: 0.99
      }}
      onClick={onClick}
      style={{
        minHeight: "260px",
        background: "rgba(255,255,255,0.78)",
        backdropFilter: "blur(18px)",
        borderRadius: "28px",
        padding: "28px",
        border: "1px solid rgba(255,255,255,0.72)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.045)",
        cursor: "pointer",
        textAlign: "left",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        color: "#2E2E2E",
        fontFamily: "inherit"
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "18px",
          background: accent
        }}
      />

      <div>
        <h2
          style={{
            fontSize: "30px",
            lineHeight: "1.2",
            marginBottom: "12px",
            color: "#2E2E2E"
          }}
        >
          {title}
        </h2>

        <p
          style={{
            color: "#707070",
            lineHeight: "1.7",
            fontSize: "16px",
            maxWidth: "320px"
          }}
        >
          {subtext}
        </p>
      </div>
    </motion.button>
  )
}
