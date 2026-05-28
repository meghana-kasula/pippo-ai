"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { findTopicMatches } from "./studyHelpers"

export default function FocusWorkspace({
  todos,
  topics,
  suggestions,
  onAddTodo,
  onRemoveTodo,
  onCompleteTodo,
  onSessionEvent,
  onBack
}) {
  const [selectedTaskId, setSelectedTaskId] = useState(
    todos.find((todo) => !todo.done)?.id || ""
  )
  const [draft, setDraft] = useState("")
  const [topicQuery, setTopicQuery] = useState("")
  const [secondsLeft, setSecondsLeft] = useState(25 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [mode, setMode] = useState("study")
  const [showWrap, setShowWrap] = useState(false)
  const [sessionNote, setSessionNote] = useState("")
  const [hiddenSuggestions, setHiddenSuggestions] = useState([])
  const [returnsOpen, setReturnsOpen] = useState(false)
  const [checkedIds, setCheckedIds] = useState([])

  const selectedTask = useMemo(
    () => todos.find((todo) => todo.id === selectedTaskId),
    [selectedTaskId, todos]
  )
  const matches = findTopicMatches(topics, topicQuery)
  const visibleSuggestions = suggestions.filter(
    (item) => !hiddenSuggestions.includes(item.id)
  )

  useEffect(() => {
    if (!isRunning || secondsLeft <= 0 || mode !== "study") {
      return undefined
    }

    const timer = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(current - 1, 0))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [isRunning, secondsLeft, mode])

  useEffect(() => {
    function pauseForRecovery() {
      if (isRunning) {
        setIsRunning(false)
        setMode("recovery")
      }
    }

    window.addEventListener("blur", pauseForRecovery)

    return () => window.removeEventListener("blur", pauseForRecovery)
  }, [isRunning])

  function addTask(event) {
    event.preventDefault()

    if (!draft.trim()) {
      return
    }

    const created = onAddTodo(draft.trim())
    setSelectedTaskId(created.id)
    setDraft("")
  }

  function addTopicTask(topic) {
    const created = onAddTodo(`Spend 25 minutes with ${topic.title}`)
    setSelectedTaskId(created.id)
    setTopicQuery("")
  }

  function addSuggestion(suggestion) {
    const created = onAddTodo(suggestion.title || suggestion)
    setSelectedTaskId(created.id)
  }

  function startFocus() {
    if (!selectedTask) {
      return
    }

    setMode("study")
    setIsRunning(true)
  }

  function wrapSession(status) {
    const studiedMinutes = Math.max(
      1,
      Math.round((25 * 60 - secondsLeft) / 60)
    )

    if (status === "finished") {
      checkedIds.forEach((id) =>
        onCompleteTodo(id, studiedMinutes, sessionNote)
      )
    }

    onSessionEvent?.({
      id: `event-${Date.now()}`,
      type: mode,
      text:
        status === "finished"
          ? `Wrapped ${checkedIds.length || 1} piece with ${studiedMinutes} minutes kept.`
          : `Kept a partial ${studiedMinutes}-minute pass for later.`,
      createdAt: new Date().toISOString()
    })

    setShowWrap(false)
    setSessionNote("")
    setCheckedIds([])
    setIsRunning(false)
    setMode("recovery")
  }

  const minutes = Math.floor(secondsLeft / 60)
    .toString()
    .padStart(2, "0")
  const seconds = (secondsLeft % 60).toString().padStart(2, "0")
  const recoveryOn = mode === "recovery" || mode === "restart"
  const modeTheme = modeThemes[mode] || modeThemes.study

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={{
        minHeight: "calc(100vh - 64px)"
      }}
    >
      <div style={workspaceHeaderStyle}>
        <div>
          <h1 style={titleStyle}>Focus with Pippo</h1>
          <p style={headerSubtextStyle}>
            One chosen piece. A quieter room. No pretending the whole mountain moved.
          </p>
        </div>

        <button onClick={onBack} style={softButtonStyle}>
          Back
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "340px minmax(0, 1fr)",
          gap: "22px"
        }}
      >
        <aside style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <Panel title="Pick one thing">
            <div style={{ position: "relative", marginBottom: "12px" }}>
              <input
                value={topicQuery}
                onChange={(event) => setTopicQuery(event.target.value)}
                placeholder="Search your map, or type a new task"
                style={inputStyle}
              />

              {topicQuery && (
                <div style={suggestionBoxStyle}>
                  {matches.length > 0 ? (
                    matches.slice(0, 5).map((topic) => (
                      <button
                        key={topic.id}
                        onClick={() => addTopicTask(topic)}
                        style={suggestionButtonStyle}
                      >
                        {topic.title}
                      </button>
                    ))
                  ) : (
                    <button
                      onClick={() => {
                        const created = onAddTodo(topicQuery)
                        setSelectedTaskId(created.id)
                        setTopicQuery("")
                      }}
                      style={suggestionButtonStyle}
                    >
                      Keep “{topicQuery}” for today
                    </button>
                  )}
                </div>
              )}
            </div>

            {todos.some((todo) => !todo.done) ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {todos
                  .filter((todo) => !todo.done)
                  .map((todo) => (
                    <div key={todo.id} style={taskRowStyle}>
                      <button
                        onClick={() => setSelectedTaskId(todo.id)}
                        style={{
                          ...taskButtonStyle,
                          background:
                            selectedTaskId === todo.id ? "#EAF6FD" : "transparent"
                        }}
                      >
                        {todo.title}
                      </button>
                      <button
                        onClick={() => onRemoveTodo(todo.id)}
                        style={{
                          ...tinyButtonStyle,
                          background: "#F1E7E4"
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
              </div>
            ) : (
              <p style={mutedStyle}>
                Nothing is waiting here. Add one small thing and we will start there.
              </p>
            )}

            <form onSubmit={addTask} style={inlineFormStyle}>
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Quick add"
                style={inputStyle}
              />
              <button type="submit" style={softButtonStyle}>
                Add
              </button>
            </form>
          </Panel>

          <Panel
            title="Comeback shelf"
            action={
              <button
                onClick={() => setReturnsOpen(!returnsOpen)}
                style={tinyButtonStyle}
              >
                {returnsOpen ? "Show less" : "Open"}
              </button>
            }
          >
            <div style={{ display: "grid", gap: "10px" }}>
              {visibleSuggestions
                .slice(0, returnsOpen ? visibleSuggestions.length : 2)
                .map((suggestion) => (
                <div
                  key={suggestion.id}
                  draggable
                  onDragStart={(event) =>
                    event.dataTransfer.setData("text/plain", suggestion.title)
                  }
                  style={suggestionCardStyle}
                >
                  <strong style={{ color: "#444" }}>{suggestion.title}</strong>
                  <p style={{ ...mutedStyle, fontSize: "13px", marginTop: "4px" }}>
                    {suggestion.reason}
                  </p>
                  <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                    <button
                      onClick={() => addSuggestion(suggestion)}
                      style={{
                        ...tinyButtonStyle,
                        background: "#C7D9C8"
                      }}
                    >
                      Put in today
                    </button>
                    <button
                      onClick={() =>
                        setHiddenSuggestions((current) => [
                          ...current,
                          suggestion.id
                        ])
                      }
                      style={{
                        ...tinyButtonStyle,
                        background: "#F1E7E4"
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </aside>

        <main
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            const title = event.dataTransfer.getData("text/plain")
            if (title) addSuggestion(title)
          }}
          style={{
            background: modeTheme.background,
            backdropFilter: "blur(18px)",
            borderRadius: "34px",
            padding: "30px",
            minHeight: "640px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: "22px",
            transition: "background 0.35s ease"
          }}
        >
          <div style={topRowStyle}>
            <div>
              <p style={eyebrowStyle}>{recoveryOn ? "Recovery pause" : "Current focus"}</p>
              <h2 style={focusTitleStyle}>
                {selectedTask?.title || "Choose one small study task"}
              </h2>
            </div>

              <div style={toggleWrapStyle}>
                {["study", "deep", "restart", "recovery"].map((choice) => (
                  <button
                    key={choice}
                    onClick={() => {
                      setMode(choice)
                      if (choice === "recovery") {
                        setIsRunning(false)
                      }
                    }}
                    style={{
                      ...segmentButtonStyle,
                      background: mode === choice ? modeTheme.accent : "transparent"
                    }}
                  >
                    {modeLabels[choice]}
                  </button>
                ))}
              </div>
          </div>

          <div style={timerRoomStyle}>
            <motion.img
              src={modeTheme.pippo}
              alt="Pippo"
              animate={{ y: [0, -7, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
              style={{ width: "132px", marginBottom: "8px" }}
            />

            <div style={timerStyle}>{minutes}:{seconds}</div>
            <p style={timerTextStyle}>
              {recoveryOn
                ? "Pause is allowed. Come back through one tiny door."
                : modeTheme.line}
            </p>
          </div>

          <div style={fixedControlsStyle}>
            <button
              onClick={isRunning ? () => setIsRunning(false) : startFocus}
              disabled={!selectedTask}
              style={{
                ...softButtonStyle,
                background: selectedTask ? "#B8E3FF" : "#ECECEC"
              }}
            >
              {isRunning ? "Pause" : "Start focus"}
            </button>

            <button
              onClick={() => {
                setMode("recovery")
                setIsRunning(false)
              }}
              disabled={!isRunning && mode !== "deep"}
              style={{
                ...softButtonStyle,
                background: isRunning ? "#DCD4F4" : "#ECECEC"
              }}
            >
              I got pulled away
            </button>

            <button
              onClick={() => {
                setCheckedIds(selectedTaskId ? [selectedTaskId] : [])
                setShowWrap(true)
              }}
              disabled={!selectedTask}
              style={{
                ...softButtonStyle,
                background: selectedTask ? "#C7D9C8" : "#ECECEC"
              }}
            >
              Wrap this session
            </button>
          </div>
        </main>
      </div>

      {showWrap && (
        <div style={modalBackdropStyle}>
          <div style={modalStyle}>
            <h3 style={panelTitleStyle}>What actually moved?</h3>
            <p style={mutedStyle}>
              Be honest. Partial progress is still useful signal for Pippo.
            </p>
            <div style={{ display: "grid", gap: "8px", marginTop: "14px" }}>
              {todos
                .filter((todo) => !todo.done)
                .map((todo) => (
                  <label key={todo.id} style={checkRowStyle}>
                    <input
                      type="checkbox"
                      checked={checkedIds.includes(todo.id)}
                      onChange={(event) =>
                        setCheckedIds((current) =>
                          event.target.checked
                            ? [...current, todo.id]
                            : current.filter((id) => id !== todo.id)
                        )
                      }
                    />
                    {todo.title}
                  </label>
                ))}
            </div>
            <textarea
              value={sessionNote}
              onChange={(event) => setSessionNote(event.target.value)}
              placeholder="Tiny note, weak spot, or what got done"
              style={textareaStyle}
            />
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button onClick={() => wrapSession("finished")} style={softButtonStyle}>
                This is done
              </button>
              <button
                onClick={() => wrapSession("partial")}
                style={{ ...softButtonStyle, background: "#DCD4F4" }}
              >
                Keep it for later
              </button>
              <button
                onClick={() => setShowWrap(false)}
                style={{ ...softButtonStyle, background: "#ECECEC" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.section>
  )
}

function Panel({ title, action, children }) {
  return (
    <div style={panelStyle}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "10px"
        }}
      >
        <h3 style={panelTitleStyle}>{title}</h3>
        {action}
      </div>
      {children}
    </div>
  )
}

const workspaceHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "18px",
  marginBottom: "24px"
}

const titleStyle = { color: "#2E2E2E", fontSize: "42px", marginBottom: "8px" }
const headerSubtextStyle = { color: "#707070", fontSize: "17px", lineHeight: "1.7" }
const mutedStyle = { color: "#707070", lineHeight: "1.7", fontSize: "15px" }
const panelStyle = {
  background: "rgba(255,255,255,0.84)",
  backdropFilter: "blur(18px)",
  borderRadius: "24px",
  padding: "20px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.035)"
}
const panelTitleStyle = { color: "#2E2E2E", fontSize: "22px", marginBottom: "12px" }
const inlineFormStyle = { display: "flex", gap: "10px", marginTop: "14px" }
const inputStyle = {
  width: "100%",
  minWidth: 0,
  border: "1px solid #ECECEC",
  background: "#F8F7F4",
  borderRadius: "16px",
  padding: "13px 14px",
  color: "#2E2E2E",
  outline: "none",
  fontFamily: "inherit"
}
const textareaStyle = {
  ...inputStyle,
  minHeight: "110px",
  resize: "vertical",
  margin: "16px 0"
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
const tinyButtonStyle = {
  border: "none",
  borderRadius: "999px",
  background: "#EEF6FB",
  color: "#2E2E2E",
  padding: "8px 11px",
  fontWeight: "700",
  cursor: "pointer",
  fontFamily: "inherit",
  whiteSpace: "nowrap",
  fontSize: "13px"
}
const taskRowStyle = {
  display: "grid",
  gridTemplateColumns: "1fr auto",
  gap: "8px",
  background: "#F8F7F4",
  borderRadius: "16px",
  padding: "6px"
}
const taskButtonStyle = {
  border: "none",
  borderRadius: "13px",
  padding: "12px",
  textAlign: "left",
  color: "#444",
  cursor: "pointer",
  fontFamily: "inherit"
}
const suggestionCardStyle = {
  background: "#F8F7F4",
  borderRadius: "16px",
  padding: "14px",
  color: "#5F5F5F",
  lineHeight: "1.6"
}
const topRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "18px",
  flexWrap: "wrap"
}
const eyebrowStyle = { color: "#707070", marginBottom: "8px" }
const focusTitleStyle = {
  color: "#2E2E2E",
  fontSize: "34px",
  lineHeight: "1.25",
  maxWidth: "580px"
}
const toggleWrapStyle = {
  display: "flex",
  background: "#F8F7F4",
  borderRadius: "999px",
  padding: "5px",
  gap: "4px"
}
const segmentButtonStyle = {
  border: "none",
  borderRadius: "999px",
  padding: "9px 14px",
  color: "#2E2E2E",
  cursor: "pointer",
  fontFamily: "inherit",
  fontWeight: "700",
  textTransform: "capitalize"
}
const timerRoomStyle = {
  background: "rgba(248,247,244,0.82)",
  borderRadius: "32px",
  minHeight: "330px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center",
  padding: "28px"
}
const timerStyle = {
  color: "#2E2E2E",
  fontSize: "72px",
  fontWeight: "700",
  marginBottom: "12px"
}
const timerTextStyle = { color: "#707070", lineHeight: "1.7", maxWidth: "430px" }
const modalBackdropStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(46,46,46,0.18)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 2000,
  padding: "22px"
}
const modalStyle = {
  width: "100%",
  maxWidth: "480px",
  background: "#FFFFFF",
  borderRadius: "28px",
  padding: "24px",
  boxShadow: "0 20px 60px rgba(0,0,0,0.16)"
}

const modeLabels = {
  study: "Study",
  deep: "Deep",
  restart: "Restart",
  recovery: "Recover"
}

const modeThemes = {
  study: {
    accent: "#B8E3FF",
    pippo: "/thinking.png",
    line: "Stay with the next small piece. Pippo has the room.",
    background:
      "linear-gradient(135deg, rgba(255,255,255,0.86), #EEF6FB 55%, #F4EFFA)"
  },
  deep: {
    accent: "#C7D9C8",
    pippo: "/thinking.png",
    line: "A quieter lane. Fewer choices, more room to stay.",
    background:
      "linear-gradient(135deg, #EEF6FB, rgba(199,217,200,0.48) 58%, #F8F7F4)"
  },
  restart: {
    accent: "#DCD4F4",
    pippo: "/neutral.png",
    line: "Restart gently. One small visible action is enough.",
    background:
      "linear-gradient(135deg, #F8F7F4, rgba(220,212,244,0.42) 56%, #EEF6FB)"
  },
  recovery: {
    accent: "#F1D7CC",
    pippo: "/sleepy.png",
    line: "Pause is allowed. Come back through one tiny door.",
    background:
      "linear-gradient(135deg, #FFF4EE, #EAF6FD 58%, #F8F7F4)"
  }
}

const fixedControlsStyle = {
  position: "sticky",
  bottom: "18px",
  display: "flex",
  gap: "12px",
  flexWrap: "wrap",
  background: "rgba(255,255,255,0.72)",
  backdropFilter: "blur(18px)",
  borderRadius: "24px",
  padding: "12px",
  boxShadow: "0 14px 36px rgba(0,0,0,0.08)"
}

const checkRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  background: "#F8F7F4",
  borderRadius: "14px",
  padding: "12px",
  color: "#444",
  lineHeight: "1.5"
}

const suggestionBoxStyle = {
  position: "absolute",
  left: 0,
  right: 0,
  top: "calc(100% + 8px)",
  background: "#FFFFFF",
  borderRadius: "18px",
  padding: "8px",
  boxShadow: "0 14px 32px rgba(0,0,0,0.08)",
  zIndex: 5
}

const suggestionButtonStyle = {
  width: "100%",
  border: "none",
  background: "transparent",
  textAlign: "left",
  padding: "11px",
  borderRadius: "12px",
  color: "#444",
  cursor: "pointer",
  fontFamily: "inherit"
}
