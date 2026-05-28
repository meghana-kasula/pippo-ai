"use client"

import { motion } from "framer-motion"

export default function PlanWithPippo() {

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
        delay: 0.15
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
        Plan with Pippo
      </h2>

      <p
        style={{
          color: "#707070",
          lineHeight: "1.7",
          marginBottom: "22px"
        }}
      >
        Your long-term study planning system.
      </p>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "14px"
        }}
      >

        {[
          "Derivatives",
          "Organic Chemistry",
          "Alternating Current"
        ].map((topic) => (

          <div

            key={topic}

            style={{
              background: "#F8F7F4",
              padding: "16px",
              borderRadius: "18px"
            }}
          >

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "10px"
              }}
            >

              <span
                style={{
                  color: "#2E2E2E",
                  fontWeight: "600"
                }}
              >
                {topic}
              </span>

              <span
                style={{
                  color: "#6E6E6E",
                  fontSize: "14px"
                }}
              >
                Revised 2x
              </span>

            </div>

            <div
              style={{
                width: "100%",
                height: "10px",
                background: "#E8E8E8",
                borderRadius: "999px"
              }}
            >

              <div
                style={{
                  width: "65%",
                  height: "100%",
                  background: "#B8E3FF",
                  borderRadius: "999px"
                }}
              />

            </div>

          </div>

        ))}

      </div>

    </motion.div>
  )
}