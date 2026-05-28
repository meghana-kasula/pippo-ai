"use client"

import { useState, useEffect, useRef } from "react"
import { Quicksand } from "next/font/google"
import { motion, AnimatePresence } from "framer-motion"
import Dashboard from "../components/dashboard/Dashboard"

const quicksand = Quicksand({
  subsets: ["latin"],
})

export default function Home() {

  const [started, setStarted] = useState(false)

  const [name, setName] = useState("")

  const nameInputRef = useRef(null)

  const [step, setStep] = useState(-1)

  const [answers, setAnswers] = useState({})

  const [pippoMessage, setPippoMessage] =
    useState("")

  const [showIntroMessage, setShowIntroMessage] =
  useState(false)

const [showClosing, setShowClosing] =
  useState(false)

  const questions = [

    {
      key: "difficulty",

      emotion: "/thinking.png",

      intro:
        "Everyone struggles with studying differently.",

      question:
        "What usually makes studying feel difficult?",

      options: [

        {
          text:
            "Starting feels heavier than continuing",

          reaction:
            "Yeah… starting can sometimes carry the most emotional weight."
        },

        {
          text:
            "I plan excessively and still can’t start",

          reaction:
            "Hmm. Your brain may be searching for certainty before beginning."
        },

        {
          text:
            "I get pulled into distractions quickly",

          reaction:
            "I can see how your focus gets pulled away before it settles."
        },

        {
          text:
            "I lose energy partway through",

          reaction:
            "That sounds exhausting… especially when you genuinely want to keep going."
        }

      ]
    },

    {
      key: "support",

      emotion: "/happy.png",

      intro:
        "Different kinds of support help different people.",

      question:
        "What usually helps you keep going when studying gets hard?",

      options: [

        {
          text:
            "Someone encouraging me gently",

          reaction:
            "Gentle support can make things feel much less heavy."
        },

        {
          text:
            "Having a clear plan to follow",

          reaction:
            "Clarity probably helps your brain relax into studying."
        },

        {
          text:
            "Seeing small signs of progress",

          reaction:
            "Tiny moments of progress can create emotional momentum."
        },

        {
          text:
            "Feeling pressure from deadlines",

          reaction:
            "Pressure may currently be carrying a lot of your momentum."
        }

      ]
    },

    {
      key: "environment",

      emotion: "/neutral.png",

      intro:
        "Your environment affects your energy more than you think.",

      question:
        "What kind of study environment feels best for you?",

      options: [

        {
          text:
            "Quiet and calm",

          reaction:
            "Your brain probably settles more easily in peaceful spaces."
        },

        {
          text:
            "Soft music or background noise",

          reaction:
            "A little ambient stimulation may help your focus stay grounded."
        },

        {
          text:
            "Other people nearby",

          reaction:
            "You may focus better when things feel shared instead of isolated."
        },

        {
          text:
            "Taking frequent breaks",

          reaction:
            "Your brain may work best with room to breathe between sessions."
        }

      ]
    },

    {
      key: "burnout",

      emotion: "/sleepy.png",

      intro:
        "Burnout can show up in really different ways.",

      question:
        "When you’re burnt out, what usually happens first?",

      options: [

        {
          text:
            "I avoid studying completely",

          reaction:
            "Avoidance can happen when studying starts feeling emotionally unsafe."
        },

        {
          text:
            "I distract myself with my phone",

          reaction:
            "Your brain may be trying to escape pressure for a while."
        },

        {
          text:
            "I keep pushing even when exhausted",

          reaction:
            "You probably carry a lot more pressure than people realize."
        },

        {
          text:
            "My brain starts feeling numb",

          reaction:
            "That kind of mental shutdown can feel really draining."
        }

      ]
    },

    {
      key: "support_goal",

      emotion: "/happy.png",

      intro:
        "I want to support the parts that feel hardest right now.",

      question:
        "What do you want the most help with right now?",

      options: [

        {
          text:
            "Starting study sessions",

          reaction:
            "Starting gently and consistently matters more than forcing intensity."
        },

        {
          text:
            "Staying consistent over time",

          reaction:
            "Consistency usually grows from emotional safety, not pressure."
        },

        {
          text:
            "Feeling less overwhelmed",

          reaction:
            "Things probably feel mentally crowded sometimes."
        },

        {
          text:
            "Knowing what to focus on",

          reaction:
            "Too many directions at once can make studying feel much heavier."
        }

      ]
    }

  ]

  const current = questions[step]

  function toggleOption(option) {

    const currentAnswers =
      answers[current.key] || []

    const exists =
      currentAnswers.includes(option.text)

    let updated

    if (exists) {

      updated =
        currentAnswers.filter(
          (item) => item !== option.text
        )

    } else {

      updated = [...currentAnswers, option.text]
    }

    setAnswers({
      ...answers,
      [current.key]: updated
    })

    setTimeout(() => {

      setPippoMessage(option.reaction)

    }, 180)
  }

  function nextStep() {

    const next = step + 1

    if (next > questions.length - 1) {

      setShowClosing(true)

      return
    }

    setStep(next)

    setPippoMessage("")
  }

  function previousStep() {

    if (step > 0) {

      setStep(step - 1)

      setPippoMessage("")
    }
  }

  useEffect(() => {

    if (started && step === -1) {
      requestAnimationFrame(() => {
        nameInputRef.current?.focus()
      })
    }

  }, [started, step])

  useEffect(() => {

    function handleKey(event) {

      if (event.key === "Enter") {

        if (!started) {

          setStarted(true)
          return
        }

        if (step === -1 && name.trim() !== "") {

          setStep(0)
          return
        }

        if (showIntroMessage) {

          setShowIntroMessage(false)

          setStep(0)

          return
        }

        if (showClosing) {

          setStep(questions.length + 1)

          return
        }

        if (
          step >= 0 &&
          step <= questions.length - 1
        ) {

          nextStep()
        }
      }
    }

    window.addEventListener(
      "keydown",
      handleKey
    )

    return () =>
      window.removeEventListener(
        "keydown",
        handleKey
      )

  }, [started, step, name])

  if (step > questions.length) {

    return (

      <Dashboard
        name={name}
        answers={answers}
      />

    )
  }
if (showIntroMessage) {

  return (

    <main
      className={quicksand.className}
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background:
          "linear-gradient(to bottom right, #F8F7F4, #EEF6FB)",
        padding: "30px",
        overflow: "hidden"
      }}
    >

      <motion.div

        initial={{
          opacity: 0,
          y: 20
        }}

        animate={{
          opacity: 1,
          y: 0
        }}

        transition={{
          duration: 1.4
        }}

        style={{
          width: "100%",
          maxWidth: "760px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center"
        }}
      >

        <motion.img

          src="/thinking.png"

          animate={{
            y: [0, -8, 0]
          }}

          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
          }}

          alt="Pippo"

          style={{
            width: "220px",
            marginBottom: "28px"
          }}
        />

        <motion.h1

          initial={{
            opacity: 0
          }}

          animate={{
            opacity: 1
          }}

          transition={{
            duration: 1.2,
            delay: 0.3
          }}

          style={{
            fontSize: "54px",
            color: "#2E2E2E",
            marginBottom: "24px",
            lineHeight: "1.3"
          }}
        >
          Nice to meet you,
          <br />
          {name}.
        </motion.h1>

        <motion.p

          initial={{
            opacity: 0
          }}

          animate={{
            opacity: 1
          }}

          transition={{
            duration: 1.2,
            delay: 0.8
          }}

          style={{
            fontSize: "22px",
            color: "#666",
            lineHeight: "1.9",
            maxWidth: "620px"
          }}
        >
          I want to understand how
          studying tends to feel for you,
          so I can slowly adapt to the way
          your brain works best.
        </motion.p>

        <motion.button

          initial={{
            opacity: 0
          }}

          animate={{
            opacity: 1
          }}

          transition={{
            duration: 1,
            delay: 1.4
          }}

          whileHover={{
            scale: 1.03
          }}

          whileTap={{
            scale: 0.98
          }}

          onClick={() => {

            setShowIntroMessage(false)

            setStep(0)
          }}

          style={{
            marginTop: "38px",
            backgroundColor: "#B8E3FF",
            border: "none",
            padding: "18px 38px",
            borderRadius: "999px",
            fontSize: "18px",
            cursor: "pointer",
            color: "#2E2E2E",
            fontWeight: "600",
            boxShadow:
              "0 8px 20px rgba(184,227,255,0.35)"
          }}
        >
          Continue
        </motion.button>

      </motion.div>

    </main>
  )
}
  if (showClosing) {

    return (

      <main
        className={quicksand.className}
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background:
            "linear-gradient(to bottom right, #F8F7F4, #EEF6FB)",
          padding: "30px",
          overflow: "hidden"
        }}
      >

        <motion.div

          initial={{
            opacity: 0,
            y: 20
          }}

          animate={{
            opacity: 1,
            y: 0
          }}

          transition={{
            duration: 1.4
          }}

          style={{
            width: "100%",
            maxWidth: "760px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center"
          }}
        >

          <motion.img

            src="/thinking.png"

            animate={{
              y: [0, -8, 0]
            }}

            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut"
            }}

            alt="Pippo"

            style={{
              width: "220px",
              marginBottom: "28px"
            }}
          />

          <motion.h1

            initial={{
              opacity: 0
            }}

            animate={{
              opacity: 1
            }}

            transition={{
              duration: 1.2,
              delay: 0.3
            }}

            style={{
              fontSize: "54px",
              color: "#2E2E2E",
              marginBottom: "24px",
              lineHeight: "1.3"
            }}
          >
            I’m starting to understand
            <br />
            how studying feels for you.
          </motion.h1>

          <motion.p

            initial={{
              opacity: 0
            }}

            animate={{
              opacity: 1
            }}

            transition={{
              duration: 1.2,
              delay: 0.9
            }}

            style={{
              fontSize: "22px",
              color: "#666",
              lineHeight: "1.9",
              maxWidth: "620px"
            }}
          >
            I’ll slowly adapt to your pace,
            your pressure patterns,
            and the ways your focus naturally works.
            <br /><br />
            We’ll make this feel lighter together.
          </motion.p>

          <motion.button

            initial={{
              opacity: 0
            }}

            animate={{
              opacity: 1
            }}

            transition={{
              duration: 1,
              delay: 1.4
            }}

            whileHover={{
              scale: 1.03
            }}

            whileTap={{
              scale: 0.98
            }}

            onClick={() =>
              setStep(questions.length + 1)
            }

            style={{
              marginTop: "38px",
              backgroundColor: "#C7D9C8",
              border: "none",
              padding: "18px 38px",
              borderRadius: "999px",
              fontSize: "18px",
              cursor: "pointer",
              color: "#2E2E2E",
              fontWeight: "600",
              boxShadow:
                "0 8px 20px rgba(199,217,200,0.35)"
            }}
          >
            Continue
          </motion.button>

        </motion.div>

      </main>
    )
  }

  if (!started) {

    return (

      <main
        className={quicksand.className}
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background:
            "linear-gradient(to bottom right, #F8F7F4, #EEF6FB)",
          padding: "30px",
          overflow: "hidden"
        }}
      >

        <motion.div

          initial={{
            opacity: 0,
            y: 20
          }}

          animate={{
            opacity: 1,
            y: 0
          }}

          transition={{
            duration: 1.4
          }}

          style={{
            width: "100%",
            maxWidth: "760px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center"
          }}
        >

          <motion.img

            src="/happy.png"

            animate={{
              y: [0, -8, 0]
            }}

            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut"
            }}

            alt="Pippo"

            style={{
              width: "240px",
              marginBottom: "26px"
            }}
          />

          <motion.h1

            initial={{
              opacity: 0
            }}

            animate={{
              opacity: 1
            }}

            transition={{
              duration: 1.4,
              delay: 0.4
            }}

            style={{
              fontSize: "74px",
              color: "#2E2E2E",
              marginBottom: "20px"
            }}
          >
            Hi, I’m Pippo.
          </motion.h1>

          <motion.p

            initial={{
              opacity: 0
            }}

            animate={{
              opacity: 1
            }}

            transition={{
              duration: 1.4,
              delay: 0.9
            }}

            style={{
              fontSize: "26px",
              color: "#666",
              marginBottom: "44px",
              lineHeight: "1.8",
              maxWidth: "560px"
            }}
          >
            Let’s make studying feel
            a little lighter.
          </motion.p>

          <motion.button

            whileHover={{
              scale: 1.03
            }}

            whileTap={{
              scale: 0.98
            }}

            onClick={() => setStarted(true)}

            style={{
              backgroundColor: "#B8E3FF",
              border: "none",
              padding: "18px 40px",
              borderRadius: "999px",
              fontSize: "20px",
              cursor: "pointer",
              color: "#2E2E2E",
              fontWeight: "600",
              boxShadow:
                "0 8px 20px rgba(184,227,255,0.35)"
            }}
          >
            Start
          </motion.button>

        </motion.div>

      </main>
    )
  }

  if (step === -1) {

    return (

      <main
        className={quicksand.className}
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background:
            "linear-gradient(to bottom right, #F8F7F4, #EEF6FB)",
          padding: "30px",
          overflow: "hidden"
        }}
      >

        <motion.div

          initial={{
            opacity: 0,
            y: 20
          }}

          animate={{
            opacity: 1,
            y: 0
          }}

          transition={{
            duration: 1.2
          }}

          style={{
            background: "rgba(255,255,255,0.82)",
            backdropFilter: "blur(18px)",
            padding: "44px",
            borderRadius: "36px",
            width: "100%",
            maxWidth: "700px",
            textAlign: "center",
            boxShadow:
              "0 10px 30px rgba(0,0,0,0.05)"
          }}
        >

          <motion.img

            src="/happy.png"

            animate={{
              y: [0, -8, 0]
            }}

            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut"
            }}

            alt="Pippo"

            style={{
              width: "180px",
              marginBottom: "18px"
            }}
          />

          <motion.h2

            initial={{
              opacity: 0
            }}

            animate={{
              opacity: 1
            }}

            transition={{
              duration: 1,
              delay: 0.5
            }}

            style={{
              fontSize: "42px",
              color: "#2E2E2E",
              marginBottom: "18px"
            }}
          >
            What should I call you?
          </motion.h2>


          <motion.input

            ref={nameInputRef}

            initial={{
              opacity: 0
            }}

            animate={{
              opacity: 1
            }}

            transition={{
              duration: 1,
              delay: 0.8
            }}

            value={name}

            onChange={(e) =>
              setName(e.target.value)
            }

            placeholder="Your name"

            style={{
              width: "100%",
              padding: "20px",
              borderRadius: "22px",
              border: "2px solid #ECECEC",
              background: "#F8F7F4",
              fontSize: "20px",
              marginBottom: "24px",
              outline: "none",
              color: "#2E2E2E"
            }}
          />

          <motion.button

            whileHover={{
              scale: 1.03
            }}

            whileTap={{
              scale: 0.98
            }}

            onClick={() => {

              if (name.trim() !== "") {
                setShowIntroMessage(true)
              }
            }}

            style={{
              backgroundColor: "#B8E3FF",
              border: "none",
              padding: "16px 36px",
              borderRadius: "999px",
              fontSize: "18px",
              cursor: "pointer",
              color: "#2E2E2E",
              fontWeight: "600"
            }}
          >
            Continue
          </motion.button>

        </motion.div>

      </main>
    )
  }

  return (

    <main
      className={quicksand.className}
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(to bottom right, #F8F7F4, #EEF6FB)",
        padding: "24px",
        overflow: "hidden"
      }}
    >

      <div
        style={{
          maxWidth: "1300px",
          margin: "0 auto",
          display: "flex",
          gap: "24px",
          minHeight: "calc(100vh - 48px)"
        }}
      >

        <motion.div

          initial={{
            opacity: 0,
            x: -20
          }}

          animate={{
            opacity: 1,
            x: 0
          }}

          transition={{
            duration: 1
          }}

          style={{
            width: "280px",
            display: "flex",
            flexDirection: "column",
            gap: "18px",
            justifyContent: "center",
            minHeight: "620px"
          }}
        >

          <motion.img

            src={current?.emotion || "/happy.png"}

            animate={{
              y: [0, -8, 0]
            }}

            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut"
            }}

            alt="Pippo"

            style={{
              width: "200px",
              margin: "0 auto"
            }}
          />

          <div
            style={{
              background: "rgba(255,255,255,0.82)",
              backdropFilter: "blur(18px)",
              padding: "22px",
              borderRadius: "28px",
              boxShadow:
                "0 8px 24px rgba(0,0,0,0.04)",
              minHeight: "170px",
              display: "flex",
              alignItems: "center"
            }}
          >

            <AnimatePresence mode="wait">

              <motion.p

                key={pippoMessage}

                initial={{
                  opacity: 0,
                  y: 8
                }}

                animate={{
                  opacity: 1,
                  y: 0
                }}

                exit={{
                  opacity: 0
                }}

                transition={{
                  duration: 0.5
                }}

                style={{
                  color: "#666",
                  fontSize: "17px",
                  lineHeight: "1.8"
                }}
              >
                {pippoMessage || current.intro}
              </motion.p>

            </AnimatePresence>

          </div>

        </motion.div>

        <motion.div

          initial={{
            opacity: 0,
            y: 20
          }}

          animate={{
            opacity: 1,
            y: 0
          }}

          transition={{
            duration: 1
          }}

          style={{
            flex: 1,
            background: "rgba(255,255,255,0.82)",
            backdropFilter: "blur(18px)",
            borderRadius: "36px",
            padding: "32px",
            boxShadow:
              "0 10px 30px rgba(0,0,0,0.05)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: "20px"
          }}
        >

          <div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                marginBottom: "26px",
                flexWrap: "wrap"
              }}
            >

              {questions.map((_, index) => (

                <button

                  key={index}

                  onClick={() => setStep(index)}

                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "999px",
                    border: "none",

                    background:
                      index === step
                        ? "#B8E3FF"
                        : "#ECECEC",

                    cursor: "pointer",
                    fontWeight: "700",
                    color: "#2E2E2E"
                  }}
                >
                  {index + 1}
                </button>

              ))}

            </div>

            <AnimatePresence mode="wait">

              <motion.div

                key={current.question}

                initial={{
                  opacity: 0,
                  y: 14
                }}

                animate={{
                  opacity: 1,
                  y: 0
                }}

                exit={{
                  opacity: 0,
                  y: -10
                }}

                transition={{
                  duration: 0.6
                }}
              >

                <motion.h2

                  style={{
                    fontSize: "42px",
                    color: "#2E2E2E",
                    lineHeight: "1.2",
                    marginBottom: "14px",
                    maxWidth: "850px"
                  }}
                >
                  {current.question}
                </motion.h2>

                <motion.p

                  initial={{
                    opacity: 0
                  }}

                  animate={{
                    opacity: 1
                  }}

                  transition={{
                    duration: 0.7,
                    delay: 0.15
                  }}

                  style={{
                    color: "#8A8A8A",
                    fontSize: "15px",
                    marginBottom: "24px"
                  }}
                >
                  Choose all that feel true.
                </motion.p>

              </motion.div>

            </AnimatePresence>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px"
              }}
            >

              {current.options.map((option, index) => {

                const active =
                  answers[current.key]?.includes(
                    option.text
                  )

                return (

                  <motion.button

                    key={option.text}

                    initial={{
                      opacity: 0,
                      y: 10
                    }}

                    animate={{
                      opacity: 1,
                      y: 0
                    }}

                    transition={{
                      duration: 0.5,
                      delay: index * 0.08
                    }}

                    whileHover={{
                      scale: 1.01
                    }}

                    whileTap={{
                      scale: 0.99
                    }}

                    onClick={() =>
                      toggleOption(option)
                    }

                    style={{
                      padding: "18px 22px",
                      borderRadius: "22px",

                      border:
                        active
                          ? "2px solid #B8E3FF"
                          : "2px solid #ECECEC",

                      background:
                        active
                          ? "#EAF6FD"
                          : "#F8F7F4",

                      textAlign: "left",
                      fontSize: "18px",
                      color: "#2E2E2E",
                      cursor: "pointer",
                      transition:
                        "all 0.3s ease"
                    }}
                  >
                    {option.text}
                  </motion.button>
                )
              })}

            </div>

          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "10px"
            }}
          >

            {step > 0 ? (

              <button

                onClick={previousStep}

                style={{
                  padding: "14px 26px",
                  borderRadius: "999px",
                  border: "none",
                  background: "#ECECEC",
                  fontSize: "17px",
                  cursor: "pointer",
                  color: "#2E2E2E",
                  fontWeight: "600"
                }}
              >
                Back
              </button>

            ) : (

              <div />

            )}

            <button

              onClick={nextStep}

              style={{
                padding: "14px 28px",
                borderRadius: "999px",
                border: "none",
                background: "#C7D9C8",
                fontSize: "17px",
                cursor: "pointer",
                color: "#2E2E2E",
                fontWeight: "600",
                boxShadow:
                  "0 8px 20px rgba(199,217,200,0.35)"
              }}
            >
              Continue
            </button>

          </div>

        </motion.div>

      </div>

    </main>
  )
}
