"use client"

import { motion } from "framer-motion"
import PippoChatInterface from "./PippoChatInterface"

export default function TalkToPippo({
  name,
  answers
}) {

  return (

    <motion.div

      initial={{
        opacity: 0,
        y: 18
      }}

      animate={{
        opacity: 1,
        y: 0
      }}

      transition={{
        duration: 1,
        delay: 0.3
      }}

      style={{
        background: "rgba(255,255,255,0.78)",
        backdropFilter: "blur(18px)",
        borderRadius: "32px",
        padding: "28px"
      }}
    >

      <h2
        style={{
          fontSize: "30px",
          color: "#2E2E2E",
          marginBottom: "8px"
        }}
      >
        Talk to Pippo
      </h2>

      <p
        style={{
          color: "#707070",
          lineHeight: "1.7",
          marginBottom: "18px"
        }}
      >
        Unload your thoughts here without
        overwhelming yourself.
      </p>

      <PippoChatInterface
        name={name}
        answers={answers}
        compact
      />

    </motion.div>
  )
}
