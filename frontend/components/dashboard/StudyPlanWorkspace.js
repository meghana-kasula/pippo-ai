"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { findTopicMatches } from "./studyHelpers"

export default function StudyPlanWorkspace({
  plan,
  todos,
  topics,
  onAddTodo,
  onAddTodoFromTopic,
  onRemoveTodo,
  onCompleteTodo,
  onAddPlanNode,
  onUpdateTopic,
  onMoveTopic,
  onBack
}) {
  const [view, setView] = useState("tree")
  const [search, setSearch] = useState("")
  const [openIds, setOpenIds] = useState({
    "exam-jee": true,
    chemistry: true,
    math: true
  })
  const [addTarget, setAddTarget] = useState(null)
  const [planning, setPlanning] = useState({
    daysLeft: "",
    hoursPerDay: "",
    preferredTime: ""
  })
  const [paceNote, setPaceNote] = useState("")

  const matches = findTopicMatches(topics, search)

  function toggle(id) {
    setOpenIds((current) => ({
      ...current,
      [id]: !current[id]
    }))
  }

  function addTopicToToday(topic) {
    onAddTodoFromTopic({
      ...topic,
      taskTitle: `Spend a soft 25 minutes with ${topic.title}`
    })
    setSearch("")
  }

  function makeGentlePlan() {
    const hours = Number(planning.hoursPerDay || 1)
    const count = Math.max(1, Math.min(Math.ceil(hours * 2), 5))

    const chosen = topics
      .slice()
      .sort((a, b) => {
        const aScore = (a.completion || 0) + (a.lastStudied === "Not yet" ? -20 : 0)
        const bScore = (b.completion || 0) + (b.lastStudied === "Not yet" ? -20 : 0)
        return aScore - bScore
      })
      .slice(0, count)
    chosen.forEach((topic) =>
        onAddTodoFromTopic({
          ...topic,
          taskTitle: `Spend 25 minutes with ${topic.title}`
        })
      )
    setPaceNote(
      chosen.length
        ? `Pippo picked ${chosen.map((topic) => topic.title).join(", ")} because they look unfinished, tender, or due for a return.`
        : "Add a few branches first, then Pippo can choose gently."
    )
  }

  return (
    <motion.section
      initial={{
        opacity: 0,
        y: 16
      }}
      animate={{
        opacity: 1,
        y: 0
      }}
      transition={{
        duration: 0.6
      }}
      style={{
        paddingBottom: "34px"
      }}
    >
      <WorkspaceHeader
        title="Plan with Pippo"
        subtext="A study map that opens only as much as you need."
        onBack={onBack}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) 360px",
          gap: "22px",
          alignItems: "start"
        }}
      >
        <main
          style={{
            background: "rgba(255,255,255,0.82)",
            backdropFilter: "blur(18px)",
            borderRadius: "30px",
            padding: "24px",
            minHeight: "680px"
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "16px",
              marginBottom: "20px",
              flexWrap: "wrap"
            }}
          >
            <div>
              <h2 style={headingStyle}>Anti-overwhelm map</h2>
              <p style={mutedStyle}>
                Keep branches closed until you are ready to look.
              </p>
            </div>

            <div style={segmentedStyle}>
              {["tree", "list"].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setView(mode)}
                  style={{
                    ...segmentButtonStyle,
                    background: view === mode ? "#B8E3FF" : "transparent"
                  }}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() =>
              setAddTarget({
                type: "exam-root",
                id: "root",
                label: "exam"
              })
            }
            style={{
              ...softButtonStyle,
              marginBottom: "18px"
            }}
          >
            Add exam space
          </button>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "14px"
            }}
          >
            {plan.exams.map((exam) => (
                <TreeBranch
                key={exam.id}
                level={0}
                title={exam.title}
                subtitle={branchSummary(
                  exam.subjects.flatMap((subject) =>
                    subject.chapters.flatMap((chapter) => chapter.topics)
                  )
                )}
                open={openIds[exam.id]}
                view={view}
                onToggle={() => toggle(exam.id)}
                onAdd={() =>
                  setAddTarget({
                    type: "exam",
                    id: exam.id,
                    label: "subject"
                  })
                }
              >
                {exam.subjects.map((subject) => (
                  <TreeBranch
                    key={subject.id}
                    level={1}
                    title={subject.title}
                    subtitle={branchSummary(
                      subject.chapters.flatMap((chapter) => chapter.topics)
                    )}
                    open={openIds[subject.id]}
                    view={view}
                    onToggle={() => toggle(subject.id)}
                    onAdd={() =>
                      setAddTarget({
                        type: "subject",
                        id: subject.id,
                        label: "chapter"
                      })
                    }
                  >
                    {subject.chapters.map((chapter) => (
                      <TreeBranch
                        key={chapter.id}
                        level={2}
                        title={chapter.title}
                        subtitle={branchSummary(chapter.topics)}
                        open={openIds[chapter.id]}
                        view={view}
                        onToggle={() => toggle(chapter.id)}
                        onAdd={() =>
                          setAddTarget({
                            type: "chapter",
                            id: chapter.id,
                            label: "topic"
                          })
                        }
                        onDropTopic={(topicId) =>
                          onMoveTopic(topicId, chapter.id)
                        }
                      >
                        <div
                          style={{
                            display:
                              view === "list" ? "flex" : "grid",
                            gridTemplateColumns:
                              view === "list"
                                ? undefined
                                : "repeat(auto-fit, minmax(220px, 1fr))",
                            flexDirection: "column",
                            gap: "12px"
                          }}
                        >
                          {chapter.topics.map((topic) => (
                            <TopicLeaf
                              key={topic.id}
                              topic={topic}
                              view={view}
                              onUpdateTopic={onUpdateTopic}
                              onAddToday={() => addTopicToToday(topic)}
                            />
                          ))}
                        </div>
                      </TreeBranch>
                    ))}
                  </TreeBranch>
                ))}
              </TreeBranch>
            ))}
          </div>
        </main>

        <aside
          style={{
            position: "sticky",
            top: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "16px"
          }}
        >
          <Panel title="Today shelf">
            <p style={mutedStyle}>
              Pull one branch here when you want the day to feel smaller.
            </p>

            <div
              style={{
                position: "relative",
                marginTop: "12px"
              }}
            >
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Find a topic from your map"
                style={inputStyle}
              />

              {search && (
                <div style={suggestionBoxStyle}>
                  {matches.length > 0 ? (
                    matches.slice(0, 5).map((topic) => (
                      <button
                        key={topic.id}
                        onClick={() => addTopicToToday(topic)}
                        style={suggestionStyle}
                      >
                        {topic.title}
                      </button>
                    ))
                  ) : (
                    <button
                      onClick={() => {
                        onAddTodo(search)
                        setSearch("")
                      }}
                      style={suggestionStyle}
                    >
                      Keep “{search}” as a loose task
                    </button>
                  )}
                </div>
              )}
            </div>

            <div
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                const dropped = event.dataTransfer.getData("application/json")

                if (dropped) {
                  addTopicToToday(JSON.parse(dropped))
                }
              }}
              style={dropZoneStyle}
            >
              {todos.map((todo) => (
                <div key={todo.id} style={todoStyle}>
                  <span
                    style={{
                      color: todo.done ? "#8A8A8A" : "#444",
                      textDecoration: todo.done ? "line-through" : "none"
                    }}
                  >
                    {todo.title}
                  </span>

                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => onCompleteTodo(todo.id)}
                      style={{
                        ...tinyButtonStyle,
                        background: todo.done ? "#ECECEC" : "#C7D9C8"
                      }}
                    >
                      {todo.done ? "Kept" : "Done"}
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
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Pippo can pace it">
            <p style={mutedStyle}>
              Give Pippo the edges. The map can become a gentler plan.
            </p>

            <div style={{ display: "grid", gap: "10px", marginTop: "12px" }}>
              <input
                value={planning.daysLeft}
                onChange={(event) =>
                  setPlanning({
                    ...planning,
                    daysLeft: event.target.value
                  })
                }
                placeholder="Days left"
                style={inputStyle}
              />
              <input
                value={planning.hoursPerDay}
                onChange={(event) =>
                  setPlanning({
                    ...planning,
                    hoursPerDay: event.target.value
                  })
                }
                placeholder="Hours you can study daily"
                style={inputStyle}
              />
              <input
                value={planning.preferredTime}
                onChange={(event) =>
                  setPlanning({
                    ...planning,
                    preferredTime: event.target.value
                  })
                }
                placeholder="Best time of day"
                style={inputStyle}
              />
              <button onClick={makeGentlePlan} style={softButtonStyle}>
                Let Pippo choose today
              </button>
              {paceNote && (
                <p style={mutedStyle}>{paceNote}</p>
              )}
            </div>
          </Panel>
        </aside>
      </div>

      {addTarget && (
        <AddBranchModal
          label={addTarget.label}
          onClose={() => setAddTarget(null)}
          onSave={(title) => {
            onAddPlanNode(addTarget.type, addTarget.id, title)
            setAddTarget(null)
          }}
        />
      )}
    </motion.section>
  )
}

function TreeBranch({
  title,
  subtitle,
  level,
  open,
  view,
  onToggle,
  onAdd,
  onDropTopic,
  children
}) {
  return (
    <div
      style={{
        borderLeft: level > 0 ? "2px solid #DDEBEE" : "none",
        paddingLeft: level > 0 ? "16px" : 0
      }}
      onDragOver={(event) => {
        if (onDropTopic) event.preventDefault()
      }}
      onDrop={(event) => {
        const topicId = event.dataTransfer.getData("text/topic-id")

        if (topicId && onDropTopic) {
          onDropTopic(topicId)
        }
      }}
    >
      <div
        style={{
          background:
            view === "tree"
              ? level === 0
                ? "linear-gradient(135deg, #EEF6FB, #F8F7F4)"
                : "#FFFFFF"
              : "#F8F7F4",
          borderRadius: view === "tree" ? "999px" : "20px",
          padding: view === "tree" ? "16px 18px" : "14px",
          border: "1px solid rgba(0,0,0,0.04)",
          marginBottom: "10px"
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
          <button onClick={onToggle} style={treeToggleStyle}>
            <span>{open ? "v" : ">"}</span>
            <span>
              <strong>{title}</strong>
              {subtitle && (
                <span style={branchMetaStyle}>{subtitle}</span>
              )}
            </span>
          </button>

          <button onClick={onAdd} style={tinyButtonStyle}>
            Add branch
          </button>
        </div>
      </div>

      {open && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            marginBottom: "12px"
          }}
        >
          {children}
        </div>
      )}
    </div>
  )
}

function TopicLeaf({
  topic,
  view,
  onUpdateTopic,
  onAddToday
}) {
  const [open, setOpen] = useState(false)
  const [resourceDraft, setResourceDraft] = useState("")
  const [linkDraft, setLinkDraft] = useState("")
  const [commentDraft, setCommentDraft] = useState("")
  const [details, setDetails] = useState({
    description: topic.description || "",
    dueDate: topic.dueDate || "",
    priority: topic.priority || "gentle",
    emotionalNote: topic.emotionalNote || ""
  })

  function patchTopic(patch) {
    onUpdateTopic(topic.id, patch)
  }

  function addToList(key, value, setter) {
    const clean = value.trim()

    if (!clean) {
      return
    }

    patchTopic({
      [key]: [clean, ...(topic[key] || [])]
    })
    setter("")
  }

  return (
    <div
      draggable
      onDragStart={(event) =>
      {
        event.dataTransfer.setData("text/topic-id", topic.id)
        event.dataTransfer.setData(
          "application/json",
          JSON.stringify(topic)
        )
      }
      }
      style={{
        background: "#FFFFFF",
        borderRadius: view === "tree" && !open ? "999px" : "18px",
        padding: "15px",
        border: "1px solid #ECECEC"
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={treeToggleStyle}
      >
        <span>{open ? "v" : ">"}</span>
        <strong>{topic.title}</strong>
      </button>

      <div
        style={{
          marginTop: "10px",
          display: "grid",
          gap: "7px",
          color: "#707070",
          fontSize: "14px",
          lineHeight: "1.5"
        }}
      >
        <span>Last touched: {topic.lastStudied}</span>
        <span>Still tender: {topic.weakArea}</span>
        <span>{topic.completion}% mapped</span>
        <span>{topic.timeStudied || 0} minutes kept here</span>
      </div>

      {open && (
        <div
          style={{
            marginTop: "12px",
            display: "grid",
            gap: "10px"
          }}
        >
          <NestedNote
            title="Things saved here"
            items={topic.resources}
            empty="Notes, links, playlists, PDFs can live here."
          />
          <div style={resourceBoxStyle}>
            <strong style={{ color: "#4D4D4D", fontSize: "14px" }}>
              Node details
            </strong>
            <div style={{ display: "grid", gap: "8px", marginTop: "9px" }}>
              <input
                value={details.description}
                onChange={(event) =>
                  setDetails({ ...details, description: event.target.value })
                }
                onBlur={() => patchTopic({ description: details.description })}
                placeholder="What this branch means"
                style={miniInputStyle}
              />
              <input
                value={details.dueDate}
                onChange={(event) =>
                  setDetails({ ...details, dueDate: event.target.value })
                }
                onBlur={() => patchTopic({ dueDate: details.dueDate })}
                placeholder="Due date"
                style={miniInputStyle}
              />
              <input
                value={details.emotionalNote}
                onChange={(event) =>
                  setDetails({ ...details, emotionalNote: event.target.value })
                }
                onBlur={() =>
                  patchTopic({ emotionalNote: details.emotionalNote })
                }
                placeholder="What feels heavy here?"
                style={miniInputStyle}
              />
              <select
                value={details.priority}
                onChange={(event) => {
                  setDetails({ ...details, priority: event.target.value })
                  patchTopic({ priority: event.target.value })
                }}
                style={miniInputStyle}
              >
                <option value="gentle">Gentle</option>
                <option value="soon">Soon</option>
                <option value="important">Important</option>
              </select>
            </div>
          </div>
          <div style={resourceBoxStyle}>
            <strong style={{ color: "#4D4D4D", fontSize: "14px" }}>
              Add links or notes
            </strong>
            <div style={{ display: "flex", gap: "8px", marginTop: "9px" }}>
              <input
                value={resourceDraft}
                onChange={(event) => setResourceDraft(event.target.value)}
                placeholder="Video, link, note title"
                style={miniInputStyle}
              />
              <button
                onClick={() => addToList("resources", resourceDraft, setResourceDraft)}
                style={tinyButtonStyle}
              >
                Add
              </button>
              <label style={tinyButtonStyle}>
                Upload
                <input type="file" style={{ display: "none" }} />
              </label>
            </div>
          </div>
          <div style={resourceBoxStyle}>
            <strong style={{ color: "#4D4D4D", fontSize: "14px" }}>
              Links and comments
            </strong>
            <div style={{ display: "flex", gap: "8px", marginTop: "9px" }}>
              <input
                value={linkDraft}
                onChange={(event) => setLinkDraft(event.target.value)}
                placeholder="Important link"
                style={miniInputStyle}
              />
              <button
                onClick={() => addToList("links", linkDraft, setLinkDraft)}
                style={tinyButtonStyle}
              >
                Add
              </button>
            </div>
            <div style={{ display: "flex", gap: "8px", marginTop: "9px" }}>
              <input
                value={commentDraft}
                onChange={(event) => setCommentDraft(event.target.value)}
                placeholder="Small comment"
                style={miniInputStyle}
              />
              <button
                onClick={() => addToList("comments", commentDraft, setCommentDraft)}
                style={tinyButtonStyle}
              >
                Add
              </button>
            </div>
            <NestedNote title="Links" items={topic.links || []} empty="No links yet." />
            <NestedNote
              title="Comments"
              items={topic.comments || []}
              empty="No comments yet."
            />
          </div>
          <NestedNote
            title="Revisits"
            items={topic.revisions}
            empty="Pippo will keep track as you come back."
          />
        </div>
      )}

      <button
        onClick={onAddToday}
        style={{
          ...tinyButtonStyle,
          marginTop: "12px",
          background: "#B8E3FF"
        }}
      >
        Place on today shelf
      </button>
    </div>
  )
}

function NestedNote({
  title,
  items = [],
  empty
}) {
  return (
    <div
      style={{
        background: "#F8F7F4",
        borderRadius: "14px",
        padding: "12px"
      }}
    >
      <strong style={{ color: "#4D4D4D", fontSize: "14px" }}>
        {title}
      </strong>
      {(items.length ? items : [empty]).map((item) => (
        <p key={item} style={nestedTextStyle}>
          {item}
        </p>
      ))}
    </div>
  )
}

function branchSummary(topics) {
  if (!topics.length) {
    return "empty for now"
  }

  const progress = Math.round(
    topics.reduce((sum, topic) => sum + (topic.completion || 0), 0) /
      topics.length
  )
  const minutes = topics.reduce(
    (sum, topic) => sum + (topic.timeStudied || 0),
    0
  )

  return `${progress}% mapped · ${minutes} min`
}

function AddBranchModal({
  label,
  onClose,
  onSave
}) {
  const [title, setTitle] = useState("")

  return (
    <div style={modalBackdropStyle}>
      <div style={modalStyle}>
        <h3 style={headingStyle}>Add {label}</h3>
        <p style={mutedStyle}>
          Keep it plain. Pippo can help soften the shape later.
        </p>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder={`${label} name`}
          style={{
            ...inputStyle,
            margin: "16px 0"
          }}
          autoFocus
        />
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={() => onSave(title)} style={softButtonStyle}>
            Add
          </button>
          <button
            onClick={onClose}
            style={{
              ...softButtonStyle,
              background: "#ECECEC"
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

function WorkspaceHeader({
  title,
  subtext,
  onBack
}) {
  return (
    <div style={workspaceHeaderStyle}>
      <div>
        <h1 style={titleStyle}>{title}</h1>
        <p style={headerSubtextStyle}>{subtext}</p>
      </div>
      <button onClick={onBack} style={softButtonStyle}>
        Back
      </button>
    </div>
  )
}

function Panel({
  title,
  children
}) {
  return (
    <div style={panelStyle}>
      <h3 style={panelTitleStyle}>{title}</h3>
      {children}
    </div>
  )
}

const workspaceHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "18px",
  alignItems: "center",
  marginBottom: "24px"
}

const titleStyle = {
  color: "#2E2E2E",
  fontSize: "42px",
  marginBottom: "8px"
}

const headerSubtextStyle = {
  color: "#707070",
  fontSize: "17px",
  lineHeight: "1.7"
}

const headingStyle = {
  color: "#2E2E2E",
  fontSize: "26px",
  marginBottom: "6px"
}

const mutedStyle = {
  color: "#707070",
  lineHeight: "1.7",
  fontSize: "15px"
}

const panelStyle = {
  background: "rgba(255,255,255,0.86)",
  backdropFilter: "blur(18px)",
  borderRadius: "24px",
  padding: "20px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.035)"
}

const panelTitleStyle = {
  color: "#2E2E2E",
  fontSize: "22px",
  marginBottom: "10px"
}

const segmentedStyle = {
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
  fontWeight: "600",
  textTransform: "capitalize"
}

const treeToggleStyle = {
  border: "none",
  background: "transparent",
  display: "flex",
  alignItems: "center",
  gap: "9px",
  color: "#2E2E2E",
  fontFamily: "inherit",
  fontSize: "16px",
  cursor: "pointer",
  padding: 0,
  textAlign: "left"
}

const branchMetaStyle = {
  display: "block",
  color: "#707070",
  fontSize: "12px",
  fontWeight: "500",
  marginTop: "4px"
}

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

const suggestionStyle = {
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

const dropZoneStyle = {
  marginTop: "14px",
  minHeight: "160px",
  border: "1px dashed #C7D9C8",
  borderRadius: "20px",
  padding: "12px",
  display: "flex",
  flexDirection: "column",
  gap: "10px"
}

const todoStyle = {
  background: "#F8F7F4",
  borderRadius: "16px",
  padding: "14px",
  color: "#444",
  display: "grid",
  gap: "10px"
}

const nestedTextStyle = {
  color: "#707070",
  fontSize: "13px",
  lineHeight: "1.6",
  marginTop: "7px"
}

const resourceBoxStyle = {
  background: "#F8F7F4",
  borderRadius: "14px",
  padding: "12px"
}

const miniInputStyle = {
  ...inputStyle,
  padding: "9px 10px",
  fontSize: "13px"
}

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
  maxWidth: "430px",
  background: "#FFFFFF",
  borderRadius: "28px",
  padding: "24px",
  boxShadow: "0 20px 60px rgba(0,0,0,0.16)"
}
