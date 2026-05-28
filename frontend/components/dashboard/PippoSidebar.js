"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import PippoChatInterface from "./PippoChatInterface"

export default function PippoSidebar({
  name,
  answers,
  topics,
  onAddTodo
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [emotion, setEmotion] = useState("/happy.png")

  return (
    <>
      {isOpen && (
        <motion.div
          initial={{
            opacity: 0,
            y: 18,
            scale: 0.98
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1
          }}
          transition={{
            duration: 0.35
          }}
          style={{
            position: "fixed",
            right: "26px",
            bottom: "132px",
            width: "390px",
            maxWidth: "calc(100vw - 32px)",
            height: "560px",
            maxHeight: "calc(100vh - 164px)",
            borderRadius: "28px",
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(20px)",
            boxShadow:
              "0 18px 50px rgba(0,0,0,0.12)",
            zIndex: 1001,
            padding: "22px",
            display: "flex",
            flexDirection: "column",
            gap: "16px"
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px"
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                minWidth: 0
              }}
            >
              <motion.img
                src={emotion}
                alt="Pippo"
                style={{
                  width: "46px",
                  flex: "0 0 auto"
                }}
              />

              <div
                style={{
                  minWidth: 0
                }}
              >
                <h2
                  style={{
                    color: "#2E2E2E",
                    fontSize: "22px",
                    margin: 0
                  }}
                >
                  Pippo
                </h2>

                <p
                  style={{
                    color: "#707070",
                    fontSize: "13px",
                    margin: 0
                  }}
                >
                  Study companion
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close Pippo chat"
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "999px",
                border: "none",
                background: "#F1F1EE",
                color: "#2E2E2E",
                cursor: "pointer",
                fontSize: "22px",
                lineHeight: "1"
              }}
            >
              x
            </button>
          </div>

          <PippoChatInterface
            name={name}
            answers={answers}
            topics={topics}
            onAddTodo={onAddTodo}
            onEmotionChange={setEmotion}
            persistKey="pippo-shared-chat"
          />
        </motion.div>
      )}

    <motion.div

      initial={{
        opacity: 0,
        x: 20
      }}

      animate={{
        opacity: 1,
        x: 0
      }}

      transition={{
        duration: 1,
        delay: 0.4
      }}

      whileHover={{
        scale: 1.02
      }}

      onClick={() => setIsOpen(!isOpen)}

      style={{
        position: "fixed",
        right: "26px",
        bottom: "26px",
        width: "90px",
        height: "90px",
        borderRadius: "28px",
        background: "rgba(255,255,255,0.82)",
        backdropFilter: "blur(18px)",
        boxShadow:
          "0 10px 30px rgba(0,0,0,0.06)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        cursor: "pointer",
        zIndex: 1000
      }}
      role="button"
      aria-label={isOpen ? "Close Pippo chat" : "Open Pippo chat"}
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          setIsOpen(!isOpen)
        }
      }}
    >

      <motion.img

        src={emotion}

        animate={{
          y: [0, -6, 0]
        }}

        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}

        alt="Pippo"

        style={{
          width: "62px"
        }}
      />

    </motion.div>
    </>
  )
}
