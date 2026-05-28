"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { emotionForMessage, findTopicMatches } from "./studyHelpers"

const apiBase =
  process.env.NEXT_PUBLIC_PIPPO_API_URL ||
  "http://127.0.0.1:8000"

export default function PippoChatInterface({
  name,
  answers,
  compact = false,
  immersive = false,
  onEmotionChange,
  onAddTodo,
  topics = [],
  persistKey
}) {
  const initialMessages = [
    {
      role: "assistant",
      content:
        "I'm here. Start anywhere. We can find the next small piece after."
    }
  ]

  const [messages, setMessages] = useState(() => {
    if (typeof window === "undefined" || !persistKey) {
      return initialMessages
    }

    try {
      return (
        JSON.parse(window.localStorage.getItem(persistKey)) ||
        initialMessages
      )
    } catch {
      return initialMessages
    }
  })

  const [draft, setDraft] = useState("")
  const [toolOpen, setToolOpen] = useState(false)
  const [topicSearch, setTopicSearch] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState("")
  const inputRef = useRef(null)
  const messagesEndRef = useRef(null)
  const topicMatches = findTopicMatches(topics, topicSearch)

  const placeholder = useMemo(() => {
    if (name) {
      return `Talk to Pippo, ${name}...`
    }

    return "Talk to Pippo..."
  }, [name])

  useEffect(() => {
    if (!persistKey) {
      return
    }

    window.localStorage.setItem(
      persistKey,
      JSON.stringify(messages.slice(-20))
    )
  }, [messages, persistKey])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end"
    })
  }, [messages, isSending])

  async function sendMessage(event) {
    event?.preventDefault()

    const message = draft.trim()

    if (!message || isSending) {
      return
    }

    onEmotionChange?.(emotionForMessage(message))

    const nextMessages = [
      ...messages,
      {
        role: "user",
        content: message
      }
    ]

    setMessages(nextMessages)
    setDraft("")
    setError("")
    setIsSending(true)

    try {
      const response = await fetch(`${apiBase}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message,
          name,
          answers,
          study_context: {
            visible_topics: topics.slice(0, 12).map((topic) => ({
              title: topic.title,
              progress: topic.completion,
              weak_area: topic.weakArea,
              last_studied: topic.lastStudied
            }))
          },
          history: messages
        })
      })

      if (!response.ok) {
        throw new Error("Pippo could not answer yet.")
      }

      const data = await response.json()
      const assistantText =
        data.response ||
        "I'm still here. Could you say that one more time, softly?"

      onEmotionChange?.(emotionForMessage(assistantText))

      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content: assistantText
        }
      ])
    } catch {
      setError(
        "Pippo is having trouble reaching the backend right now."
      )

      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content:
            "I could not reach the backend just now. Keep the thought here, and try once more in a moment."
        }
      ])
    } finally {
      setIsSending(false)
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: compact ? "14px" : "16px",
        height: "100%",
        minHeight: immersive
          ? 0
          : compact
            ? "260px"
            : "430px",
        flex: immersive ? 1 : undefined,
        fontFamily: "inherit"
      }}
    >
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          paddingRight: "4px",
          paddingBottom: "8px"
        }}
      >
        <AnimatePresence initial={false}>
          {messages.map((message, index) => {
            const fromPippo = message.role === "assistant"

            return (
              <motion.div
                key={`${message.role}-${index}-${message.content}`}
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
                  duration: 0.25
                }}
                style={{
                  alignSelf: fromPippo ? "flex-start" : "flex-end",
                  maxWidth: "88%",
                  background: fromPippo ? "#F8F7F4" : "#EAF6FD",
                  border: fromPippo
                    ? "1px solid rgba(0,0,0,0.04)"
                    : "1px solid rgba(184,227,255,0.8)",
                  color: "#3A3A3A",
                  borderRadius: fromPippo
                    ? "18px 18px 18px 8px"
                    : "18px 18px 8px 18px",
                  padding: compact ? "13px 14px" : "14px 16px",
                  fontSize: immersive ? "16px" : compact ? "14px" : "15px",
                  lineHeight: "1.65",
                  whiteSpace: "pre-wrap",
                  fontFamily: "inherit"
                }}
              >
                {message.content}

              </motion.div>
            )
          })}
        </AnimatePresence>

        {isSending && (
          <motion.div
            initial={{
              opacity: 0
            }}
            animate={{
              opacity: 1
            }}
            style={{
              alignSelf: "flex-start",
              background: "#F8F7F4",
              color: "#707070",
              borderRadius: "18px 18px 18px 8px",
              padding: "13px 14px",
              fontSize: "14px",
              fontFamily: "inherit"
            }}
          >
            Pippo is listening...
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div
          style={{
            color: "#8B5E57",
            background: "#FFF3EF",
            borderRadius: "14px",
            padding: "10px 12px",
            fontSize: "13px",
            lineHeight: "1.5",
            fontFamily: "inherit"
          }}
        >
          {error}
        </div>
      )}

      <div style={composerShellStyle}>
        {onAddTodo && (
          <div>
            <button
              type="button"
              onClick={() => setToolOpen(!toolOpen)}
              style={toolToggleStyle}
            >
              {toolOpen ? "Close study tools" : "Open study tools"}
            </button>

            {toolOpen && (
              <div style={toolPanelStyle}>
                <input
                  value={topicSearch}
                  onChange={(event) => setTopicSearch(event.target.value)}
                  placeholder="Search your map or add a study piece"
                  style={toolInputStyle}
                />
                {topicSearch && (
                  <div style={{ display: "grid", gap: "7px", marginTop: "8px" }}>
                    {(topicMatches.length ? topicMatches : [{ title: topicSearch }])
                      .slice(0, 4)
                      .map((topic) => (
                        <button
                          key={topic.id || topic.title}
                          onClick={() => {
                            onAddTodo(
                              topic.id
                                ? `Spend 25 minutes with ${topic.title}`
                                : topic.title
                            )
                            setTopicSearch("")
                            setToolOpen(false)
                          }}
                          style={toolResultStyle}
                        >
                          {topic.id
                            ? `Add ${topic.title} to today`
                            : `Keep “${topic.title}” as a task`}
                        </button>
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <form onSubmit={sendMessage} style={composerStyle}>
          <input
            ref={inputRef}
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value)
              onEmotionChange?.(emotionForMessage(event.target.value))
            }}
            placeholder={placeholder}
            style={inputStyleFor(compact, immersive)}
          />

          <button
            type="submit"
            disabled={isSending || draft.trim() === ""}
            style={{
              width: compact ? "54px" : "64px",
              flex: "0 0 auto",
              borderRadius: "18px",
              border: "none",
              background:
                isSending || draft.trim() === ""
                  ? "#E1E1E1"
                  : "#B8E3FF",
              color: "#2E2E2E",
              fontWeight: "700",
              cursor:
                isSending || draft.trim() === ""
                  ? "default"
                  : "pointer",
              fontFamily: "inherit"
            }}
            aria-label="Send message to Pippo"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
}

function inputStyleFor(compact, immersive) {
  return {
    width: "100%",
    minWidth: 0,
    padding: compact ? "14px" : "16px",
    borderRadius: "18px",
    border: "1px solid #ECECEC",
    background: "#F8F7F4",
    fontSize: immersive ? "16px" : compact ? "14px" : "15px",
    outline: "none",
    color: "#2E2E2E",
    fontFamily: "inherit"
  }
}

const composerShellStyle = {
  position: "sticky",
  bottom: 0,
  display: "grid",
  gap: "10px",
  background: "rgba(255,255,255,0.76)",
  backdropFilter: "blur(18px)",
  borderRadius: "24px",
  padding: "10px",
  boxShadow: "0 12px 32px rgba(0,0,0,0.06)"
}

const composerStyle = {
  display: "flex",
  gap: "10px"
}

const toolToggleStyle = {
  border: "none",
  borderRadius: "999px",
  background: "#F4EFFA",
  color: "#2E2E2E",
  padding: "9px 12px",
  cursor: "pointer",
  fontFamily: "inherit",
  fontWeight: "700",
  fontSize: "13px"
}

const toolPanelStyle = {
  marginTop: "8px",
  background: "#FFFFFF",
  borderRadius: "18px",
  padding: "10px"
}

const toolInputStyle = {
  ...inputStyleFor(true, false),
  padding: "11px 12px"
}

const toolResultStyle = {
  border: "none",
  borderRadius: "13px",
  background: "#F8F7F4",
  color: "#444",
  padding: "10px",
  textAlign: "left",
  cursor: "pointer",
  fontFamily: "inherit"
}
