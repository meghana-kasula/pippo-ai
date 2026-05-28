"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

export default function ExpandableRhythm() {

  const [open, setOpen] = useState(false)

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
        marginTop: "26px",
        background: "rgba(255,255,255,0.78)",
        backdropFilter: "blur(18px)",
        borderRadius: "32px",
        padding: "26px",
        boxShadow:
          "0 10px 30px rgba(0,0,0,0.04)"
      }}
    >

      <button

        onClick={() => setOpen(!open)}

        style={{
          width: "100%",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: 0
        }}
      >

        <div
          style={{
            textAlign: "left"
          }}
        >

          <h2
            style={{
              fontSize: "28px",
              color: "#2E2E2E",
              marginBottom: "6px"
            }}
          >
            Your Rhythm
          </h2>

          <p
            style={{
              color: "#707070",
              fontSize: "16px",
              lineHeight: "1.7"
            }}
          >
            Pick up gently from where you left off.
          </p>

        </div>

        <motion.div

          animate={{
            rotate: open ? 180 : 0
          }}

          transition={{
            duration: 0.4
          }}

          style={{
            fontSize: "24px",
            color: "#707070"
          }}
        >
          ↓
        </motion.div>

      </button>

      <AnimatePresence>

        {open && (

          <motion.div

            initial={{
              opacity: 0,
              height: 0
            }}

            animate={{
              opacity: 1,
              height: "auto"
            }}

            exit={{
              opacity: 0,
              height: 0
            }}

            transition={{
              duration: 0.45
            }}

            style={{
              overflow: "hidden"
            }}
          >

            <div
              style={{
                marginTop: "26px",
                display: "flex",
                flexDirection: "column",
                gap: "14px"
              }}
            >

              {[
                "Continue your focus session gently.",
                "Organic chemistry still feels mentally heavy.",
                "Maybe keep today slower and lighter."
              ].map((item) => (

                <div

                  key={item}

                  style={{
                    background: "#F8F7F4",
                    borderRadius: "18px",
                    padding: "18px"
                  }}
                >

                  <p
                    style={{
                      color: "#5F5F5F",
                      lineHeight: "1.7",
                      fontSize: "16px"
                    }}
                  >
                    {item}
                  </p>

                </div>

              ))}

            </div>

          </motion.div>

        )}

      </AnimatePresence>

    </motion.div>
  )
}