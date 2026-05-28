"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import PippoChatInterface from "./PippoChatInterface"

export default function PippoRantSpace({
  name,
  answers,
  topics,
  onAddTodo,
  onBack
}) {
  const [emotion, setEmotion] = useState("/happy.png")

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={{
        minHeight: "calc(100vh - 64px)",
        position: "relative",
        background:
          "radial-gradient(circle at 20% 18%, rgba(184,227,255,0.42), transparent 28%), radial-gradient(circle at 82% 12%, rgba(220,212,244,0.36), transparent 26%), rgba(255,255,255,0.72)",
        backdropFilter: "blur(20px)",
        borderRadius: "36px",
        padding: "30px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column"
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "18px",
          marginBottom: "18px"
        }}
      >
        <div>
          <h1 style={titleStyle}>Talk to Pippo</h1>
          <p style={subtextStyle}>
            Say the messy part first. Pippo can help shape it into one gentle next step.
          </p>
        </div>

        <button onClick={onBack} style={softButtonStyle}>
          Back
        </button>
      </div>

      <motion.img
        src={emotion}
        alt="Pippo"
        animate={{
          y: [0, -10, 0],
          rotate: [0, -1.5, 0, 1.5, 0]
        }}
        transition={{
          duration: 5.4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          position: "absolute",
          right: "36px",
          top: "112px",
          width: "132px",
          zIndex: 1,
          pointerEvents: "none"
        }}
      />

      <div
        style={{
          flex: 1,
          maxWidth: "860px",
          width: "100%",
          margin: "0 auto",
          paddingTop: "18px",
          position: "relative",
          zIndex: 2
        }}
      >
        <PippoChatInterface
          name={name}
          answers={answers}
          topics={topics}
          onEmotionChange={setEmotion}
          onAddTodo={onAddTodo}
          persistKey="pippo-shared-chat"
          immersive
        />
      </div>
    </motion.section>
  )
}

const titleStyle = {
  color: "#2E2E2E",
  fontSize: "42px",
  marginBottom: "8px"
}

const subtextStyle = {
  color: "#707070",
  lineHeight: "1.7",
  fontSize: "17px",
  maxWidth: "650px"
}

const softButtonStyle = {
  border: "none",
  borderRadius: "999px",
  background: "#B8E3FF",
  color: "#2E2E2E",
  padding: "12px 18px",
  fontWeight: "700",
  cursor: "pointer",
  fontFamily: "inherit",
  whiteSpace: "nowrap"
}
