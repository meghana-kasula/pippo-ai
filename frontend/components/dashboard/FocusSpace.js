"use client"

import { motion } from "framer-motion"

export default function FocusSpace() {

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
        duration: 1
      }}

      style={{
        background: "rgba(255,255,255,0.78)",
        backdropFilter: "blur(18px)",
        borderRadius: "36px",
        padding: "34px",
        minHeight: "620px"
      }}
    >

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px"
        }}
      >

        <div>

          <h2
            style={{
              fontSize: "36px",
              color: "#2E2E2E",
              marginBottom: "8px"
            }}
          >
            Focus Space
          </h2>

          <p
            style={{
              color: "#707070",
              fontSize: "17px",
              lineHeight: "1.7"
            }}
          >
            Study with Pippo at your own pace.
          </p>

        </div>

        <div
          style={{
            background: "#EEF6FB",
            padding: "10px 18px",
            borderRadius: "999px",
            fontSize: "15px",
            color: "#4D6B7C",
            fontWeight: "600"
          }}
        >
          Studying
        </div>

      </div>

      <div
        style={{
          background: "#F8F7F4",
          borderRadius: "26px",
          padding: "24px",
          marginTop: "28px"
        }}
      >

        <h3
          style={{
            fontSize: "24px",
            color: "#2E2E2E",
            marginBottom: "14px"
          }}
        >
          Today’s Focus
        </h3>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "14px"
          }}
        >

          {[
            "Chemistry — Atomic Structure",
            "Math — Derivatives Revision",
            "Physics — Current Electricity"
          ].map((task) => (

            <div

              key={task}

              style={{
                background: "white",
                padding: "18px",
                borderRadius: "18px",
                fontSize: "17px",
                color: "#444"
              }}
            >
              {task}
            </div>

          ))}

        </div>

      </div>

    </motion.div>
  )
}