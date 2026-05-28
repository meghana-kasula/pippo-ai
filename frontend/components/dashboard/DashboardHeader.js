"use client"

import { motion } from "framer-motion"

export default function DashboardHeader({
  name,
  noteIndex = 0
}) {
  const notes = [
    "Pick one small corner of the day. Pippo can sit with the rest.",
    "No need to hold the whole exam in your head right now.",
    "A soft start still counts as a start.",
    "We can keep today smaller than the pressure makes it feel.",
    "Open the door gently. The work can come after."
  ]

  const note = notes[noteIndex % notes.length]

  return (

    <motion.div

      initial={{
        opacity: 0,
        y: 16
      }}

      animate={{
        opacity: 1,
        y: 0
      }}

      transition={{
        duration: 1
      }}

      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "rgba(255,255,255,0.75)",
        backdropFilter: "blur(18px)",
        padding: "28px",
        borderRadius: "32px"
      }}
    >

      <div>

        <h1
          style={{
            fontSize: "42px",
            color: "#2E2E2E",
            marginBottom: "10px"
          }}
        >
          Good evening{name ? `, ${name}` : ""}.
        </h1>

        <p
          style={{
            color: "#6E6E6E",
            fontSize: "18px",
            lineHeight: "1.7"
          }}
        >
          {note}
        </p>

      </div>

      <motion.img

        src="/happy.png"

        animate={{
          y: [0, -8, 0]
        }}

        transition={{
          duration: 5,
          repeat: Infinity
        }}

        style={{
          width: "120px"
        }}
      />

    </motion.div>
  )
}
