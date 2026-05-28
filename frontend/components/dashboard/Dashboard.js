"use client"

import { useEffect, useState } from "react"
import DashboardHeader from "./DashboardHeader"
import PippoSidebar from "./PippoSidebar"
import DashboardCard from "./DashboardCard"
import StudyPlanWorkspace from "./StudyPlanWorkspace"
import FocusWorkspace from "./FocusWorkspace"
import PippoRantSpace from "./PippoRantSpace"
import { collectTopics, looksLikeChatReply } from "./studyHelpers"

const initialPlan = {
  exams: [
    {
      id: "exam-jee",
      title: "Main exam map",
      subjects: [
        {
          id: "chemistry",
          title: "Chemistry",
          chapters: [
            {
              id: "organic",
              title: "Organic chemistry",
              topics: [
                {
                  id: "organic-basics",
                  title: "Reaction basics",
                  lastStudied: "Not yet",
                  weakArea: "Mechanism recall",
                  completion: 35,
                  timeStudied: 0,
                  description: "Core organic reaction behavior.",
                  dueDate: "",
                  priority: "soon",
                  emotionalNote: "Can feel mentally crowded.",
                  revisions: ["First pass pending"],
                  resources: ["Class notes", "Mechanism playlist"],
                  links: [],
                  comments: []
                },
                {
                  id: "nomenclature",
                  title: "Nomenclature",
                  lastStudied: "2 days ago",
                  weakArea: "Naming edge cases",
                  completion: 62,
                  timeStudied: 40,
                  description: "Naming rules and exceptions.",
                  dueDate: "",
                  priority: "gentle",
                  emotionalNote: "",
                  revisions: ["Revised once"],
                  resources: ["NCERT notes"],
                  links: [],
                  comments: []
                }
              ]
            }
          ]
        },
        {
          id: "math",
          title: "Math",
          chapters: [
            {
              id: "calculus",
              title: "Calculus",
              topics: [
                {
                  id: "derivatives",
                  title: "Derivatives",
                  lastStudied: "Yesterday",
                  weakArea: "Chain rule speed",
                  completion: 70,
                  timeStudied: 55,
                  description: "Differentiation basics and speed.",
                  dueDate: "",
                  priority: "important",
                  emotionalNote: "Needs calm repetition.",
                  revisions: ["Revised once this week"],
                  resources: ["Formula sheet"],
                  links: [],
                  comments: []
                }
              ]
            }
          ]
        }
      ]
    }
  ],
  revisions: [
    "Derivatives revised once this week.",
    "Organic chemistry needs a slower second pass."
  ]
}

const initialTodos = [
  {
    id: "todo-derivatives",
    title: "Revise derivatives for 25 minutes",
    topicId: "derivatives",
    done: false
  },
  {
    id: "todo-organic",
    title: "Read reaction basics slowly",
    topicId: "organic-basics",
    done: false
  }
]

export default function Dashboard({
  name,
  answers
}) {
  const [view, setView] = useState("home")
  const [homeOpenCount, setHomeOpenCount] = useState(0)
  const [plan, setPlan] = useState(() => loadSavedDashboard().plan)
  const [todos, setTodos] = useState(() => loadSavedDashboard().todos)
  const [events, setEvents] = useState(() => loadSavedDashboard().events)
  const topics = collectTopics(plan)
  const revisionSuggestions = topics
    .slice()
    .sort((a, b) => a.completion - b.completion)
    .slice(0, 4)
    .map((topic) => ({
      id: `suggest-${topic.id}`,
      title: `Revisit ${topic.title}`,
      topicId: topic.id,
      reason: topic.weakArea
    }))

  useEffect(() => {
    window.localStorage.setItem(
      "pippo-dashboard",
      JSON.stringify({
        plan,
        todos,
        events
      })
    )
  }, [plan, todos, events])

  function addTodo(title) {
    return addTodoFromTopic({
      title,
      topicId: inferTopicId(title)
    })
  }

  function addTodoFromTopic(topic) {
    const newTodo = {
      id: `todo-${Date.now()}`,
      title: topic.taskTitle || topic.title,
      topicId: topic.topicId || topic.id || inferTopicId(topic.title),
      done: false
    }

    setTodos((current) => [...current, newTodo])
    setEvents((current) =>
      [
        {
          id: `event-${Date.now()}`,
          type: "today",
          text: `Added ${newTodo.title} to today shelf.`,
          createdAt: new Date().toISOString()
        },
        ...current
      ].slice(0, 24)
    )

    return newTodo
  }

  function removeTodo(todoId) {
    setTodos((current) =>
      current.filter((item) => item.id !== todoId)
    )
  }

  function addPlanNode(parentType, parentId, title) {
    if (!title.trim()) {
      return
    }

    const id = `${parentType}-${Date.now()}`

    setPlan((current) => ({
      ...current,
      exams:
        parentType === "exam-root"
          ? [
              ...current.exams,
              {
                id,
                title,
                revisions: [],
                resources: [],
                subjects: []
              }
            ]
          : current.exams.map((exam) => {
              if (parentType === "exam" && exam.id === parentId) {
                return {
                  ...exam,
                  subjects: [
                    ...exam.subjects,
                    {
                      id,
                      title,
                      revisions: [],
                      resources: [],
                      chapters: []
                    }
                  ]
                }
              }

              return {
                ...exam,
                subjects: exam.subjects.map((subject) => {
                  if (parentType === "subject" && subject.id === parentId) {
                    return {
                      ...subject,
                      chapters: [
                        ...subject.chapters,
                        {
                          id,
                          title,
                          revisions: [],
                          resources: [],
                          topics: []
                        }
                      ]
                    }
                  }

                  return {
                    ...subject,
                    chapters: subject.chapters.map((chapter) => {
                      if (parentType === "chapter" && chapter.id === parentId) {
                        return {
                          ...chapter,
                          topics: [
                            ...chapter.topics,
                            {
                              id,
                              title,
                              lastStudied: "Not yet",
                              weakArea: "Still getting mapped",
                              completion: 0,
                              revisions: [],
                              resources: [],
                              links: [],
                              videos: []
                            }
                          ]
                        }
                      }

                      return chapter
                    })
                  }
                })
              }
            })
    }))
  }

  function completeTodo(todoId, minutes = 25, note = "") {
    const todo = todos.find((item) => item.id === todoId)

    setTodos((current) =>
      current.map((item) =>
        item.id === todoId
          ? {
              ...item,
              done: true
            }
          : item
      )
    )

    if (todo?.topicId) {
      updateTopicProgress(todo.topicId, minutes, note)
    }

    if (todo) {
      setEvents((current) =>
        [
          {
            id: `event-${Date.now()}`,
            type: "session",
            text: `Kept a ${minutes}-minute pass on ${todo.title}.`,
            createdAt: new Date().toISOString()
          },
          ...current
        ].slice(0, 24)
      )
    }
  }

  function updateTopicProgress(topicId, minutes = 25, note = "") {
    const today = new Date().toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric"
    })

    setPlan((current) => ({
      ...current,
      exams: current.exams.map((exam) => ({
        ...exam,
        subjects: exam.subjects.map((subject) => ({
          ...subject,
          chapters: subject.chapters.map((chapter) => ({
            ...chapter,
            topics: chapter.topics.map((topic) =>
              topic.id === topicId
                ? updateTopicAfterSession(topic, today, minutes, note)
                : topic
            )
          }))
        }))
      })),
      revisions: [
        `Completed a focus pass on ${readableTopic(topicId)}.`,
        ...current.revisions
      ].slice(0, 5)
    }))
  }

  function updateTopicDetails(topicId, patch) {
    setPlan((current) => ({
      ...current,
      exams: current.exams.map((exam) => ({
        ...exam,
        subjects: exam.subjects.map((subject) => ({
          ...subject,
          chapters: subject.chapters.map((chapter) => ({
            ...chapter,
            topics: chapter.topics.map((topic) =>
              topic.id === topicId
                ? {
                    ...topic,
                    ...patch
                  }
                : topic
            )
          }))
        }))
      }))
    }))
  }

  function moveTopic(topicId, targetChapterId) {
    let movingTopic = null

    setPlan((current) => {
      const withoutTopic = {
        ...current,
        exams: current.exams.map((exam) => ({
          ...exam,
          subjects: exam.subjects.map((subject) => ({
            ...subject,
            chapters: subject.chapters.map((chapter) => {
              const remaining = chapter.topics.filter((topic) => {
                if (topic.id === topicId) {
                  movingTopic = topic
                  return false
                }

                return true
              })

              return {
                ...chapter,
                topics: remaining
              }
            })
          }))
        }))
      }

      if (!movingTopic) {
        return current
      }

      return {
        ...withoutTopic,
        exams: withoutTopic.exams.map((exam) => ({
          ...exam,
          subjects: exam.subjects.map((subject) => ({
            ...subject,
            chapters: subject.chapters.map((chapter) =>
              chapter.id === targetChapterId
                ? {
                    ...chapter,
                    topics: [...chapter.topics, movingTopic]
                  }
                : chapter
            )
          }))
        }))
      }
    })
  }

  return (

    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(to bottom right, #F8F7F4, #EEF6FB)",
        padding: "32px",
        position: "relative",
        overflow: "hidden"
      }}
    >

        <PippoSidebar
          name={name}
          answers={answers}
          topics={topics}
          onAddTodo={addTodo}
        />

      <div
        style={{
          maxWidth: "1450px",
          margin: "0 auto"
        }}
      >

        {view === "home" && (
          <DashboardHeader
            name={name}
            answers={answers}
            noteIndex={homeOpenCount}
          />
        )}

        {view === "home" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "24px",
              marginTop: "28px"
            }}
          >
            <DashboardCard
              title="Plan with Pippo"
              subtext="Keep the big syllabus folded into something your brain can actually open."
              accent="#B8E3FF"
              onClick={() => setView("plan")}
              delay={0.05}
            />

            <DashboardCard
              title="Focus with Pippo"
              subtext="Choose one piece, settle in, and let Pippo keep the room steady."
              accent="#C7D9C8"
              onClick={() => setView("focus")}
              delay={0.12}
            />

            <DashboardCard
              title="Talk to Pippo"
              subtext="Put the messy thoughts somewhere gentle before they turn heavy."
              accent="#DCD4F4"
              onClick={() => setView("chat")}
              delay={0.19}
            />
          </div>
        )}

        {view === "home" && (
          <StatsRibbon
            todos={todos}
            topics={topics}
            events={events}
          />
        )}

        {view === "plan" && (
          <StudyPlanWorkspace
            plan={plan}
            todos={todos}
            topics={topics}
            onAddTodo={addTodo}
            onAddTodoFromTopic={addTodoFromTopic}
            onRemoveTodo={removeTodo}
            onCompleteTodo={completeTodo}
            onAddPlanNode={addPlanNode}
            onUpdateTopic={updateTopicDetails}
            onMoveTopic={moveTopic}
            onBack={() => {
              setHomeOpenCount((current) => current + 1)
              setView("home")
            }}
          />
        )}

        {view === "focus" && (
          <FocusWorkspace
            todos={todos}
            topics={topics}
            suggestions={revisionSuggestions}
            onAddTodo={addTodo}
            onRemoveTodo={removeTodo}
            onCompleteTodo={completeTodo}
            onSessionEvent={(event) =>
              setEvents((current) => [event, ...current].slice(0, 24))
            }
            onBack={() => {
              setHomeOpenCount((current) => current + 1)
              setView("home")
            }}
          />
        )}

        {view === "chat" && (
          <PippoRantSpace
            name={name}
            answers={answers}
            topics={topics}
            onAddTodo={addTodo}
            onBack={() => {
              setHomeOpenCount((current) => current + 1)
              setView("home")
            }}
          />
        )}

      </div>

    </main>
  )
}

function StatsRibbon({
  todos,
  topics,
  events
}) {
  const [open, setOpen] = useState(false)
  const doneCount = todos.filter((todo) => todo.done).length
  const totalMinutes = topics.reduce(
    (sum, topic) => sum + (topic.timeStudied || 0),
    0
  )
  const average =
    topics.length === 0
      ? 0
      : Math.round(
          topics.reduce((sum, topic) => sum + topic.completion, 0) /
            topics.length
        )
  const lowTopic = topics
    .slice()
    .sort((a, b) => a.completion - b.completion)[0]

  return (
    <div
      style={{
        marginTop: "24px",
        borderRadius: "24px",
        overflow: "hidden",
        background:
          "linear-gradient(90deg, rgba(199,217,200,0.44), rgba(184,227,255,0.38), rgba(220,212,244,0.32))",
        border: "1px solid rgba(255,255,255,0.7)"
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          border: "none",
          background: "transparent",
          padding: "14px 18px",
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "#2E2E2E",
          fontFamily: "inherit",
          fontWeight: "700"
        }}
      >
        <span>
          Today has {todos.length || "no"} pieces on the shelf. {doneCount} kept.
        </span>
        <span>{open ? "v" : ">"}</span>
      </button>

      {open && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
            gap: "12px",
            padding: "0 18px 18px"
          }}
        >
          <StatPill label="Map softness" value={`${average}%`} />
          <StatPill label="Minutes kept" value={`${totalMinutes}`} />
          <StatPill
            label="Next gentle return"
            value={lowTopic?.title || "Add one topic"}
          />
          <StatPill
            label="Pippo note"
            value={
              doneCount > 0
                ? "Something moved. Keep it small enough to return."
                : "Start with the smallest visible piece."
            }
          />
          <div
            style={{
              background: "rgba(255,255,255,0.72)",
              borderRadius: "18px",
              padding: "14px",
              gridColumn: "1 / -1"
            }}
          >
            <p style={{ color: "#707070", fontSize: "13px", marginBottom: "8px" }}>
              Recent thread
            </p>
            {(events.length ? events : [{
              id: "empty",
              text: "Nothing logged yet. The first small pass will show up here."
            }]).slice(0, 4).map((event) => (
              <p
                key={event.id}
                style={{
                  color: "#444",
                  lineHeight: "1.6",
                  marginBottom: "6px"
                }}
              >
                {event.text}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function StatPill({
  label,
  value
}) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.72)",
        borderRadius: "18px",
        padding: "14px"
      }}
    >
      <p
        style={{
          color: "#707070",
          fontSize: "13px",
          marginBottom: "5px"
        }}
      >
        {label}
      </p>
      <strong
        style={{
          color: "#2E2E2E",
          lineHeight: "1.4"
        }}
      >
        {value}
      </strong>
    </div>
  )
}

function inferTopicId(title) {
  const text = title.toLowerCase()

  if (text.includes("derivative") || text.includes("chain")) {
    return "derivatives"
  }

  if (text.includes("nomenclature")) {
    return "nomenclature"
  }

  if (text.includes("organic") || text.includes("reaction")) {
    return "organic-basics"
  }

  return "organic-basics"
}

function loadSavedDashboard() {
  if (typeof window === "undefined") {
    return {
      plan: initialPlan,
      todos: initialTodos,
      events: []
    }
  }

  try {
    const saved = window.localStorage.getItem("pippo-dashboard")

    if (!saved) {
      return {
        plan: initialPlan,
        todos: initialTodos,
        events: []
      }
    }

    const parsed = JSON.parse(saved)

    return {
      plan: parsed.plan || initialPlan,
      todos: sanitizeTodos(parsed.todos || initialTodos),
      events: parsed.events || []
    }
  } catch {
    window.localStorage.removeItem("pippo-dashboard")

    return {
      plan: initialPlan,
      todos: initialTodos,
      events: []
    }
  }
}

function updateTopicAfterSession(topic, today, minutes, note) {
  const nextRevision = note
    ? `${today}: ${note}`
    : `${today}: ${minutes} minute study pass`

  return {
    ...topic,
    completion: Math.min((topic.completion || 0) + 12, 100),
    timeStudied: (topic.timeStudied || 0) + minutes,
    lastStudied: today,
    revisions: [nextRevision, ...(topic.revisions || [])].slice(0, 8)
  }
}

function sanitizeTodos(todos) {
  return todos.filter((todo) => !looksLikeChatReply(todo.title))
}

function readableTopic(topicId) {
  const labels = {
    derivatives: "Derivatives",
    nomenclature: "Nomenclature",
    "organic-basics": "Reaction basics"
  }

  return labels[topicId] || "this topic"
}
