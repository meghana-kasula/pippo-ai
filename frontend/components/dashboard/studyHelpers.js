export function collectTopics(plan) {
  return plan.exams.flatMap((exam) =>
    exam.subjects.flatMap((subject) =>
      subject.chapters.flatMap((chapter) =>
        chapter.topics.map((topic) => ({
          ...topic,
          examTitle: exam.title,
          subjectTitle: subject.title,
          chapterTitle: chapter.title
        }))
      )
    )
  )
}

export function findTopicMatches(topics, query) {
  const text = query.trim().toLowerCase()

  if (!text) {
    return []
  }

  return topics.filter((topic) =>
    [
      topic.title,
      topic.examTitle,
      topic.subjectTitle,
      topic.chapterTitle,
      topic.weakArea
    ]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(text))
  )
}

export function emotionForMessage(message) {
  const text = message.toLowerCase()

  if (
    text.includes("panic") ||
    text.includes("scared") ||
    text.includes("cry") ||
    text.includes("worried") ||
    text.includes("anxious")
  ) {
    return "/sad.png"
  }

  if (
    text.includes("tired") ||
    text.includes("sleep") ||
    text.includes("burnt") ||
    text.includes("exhausted") ||
    text.includes("drained") ||
    text.includes("numb")
  ) {
    return "/sleepy.png"
  }

  if (
    text.includes("stuck") ||
    text.includes("overwhelm") ||
    text.includes("too much") ||
    text.includes("can't") ||
    text.includes("cannot")
  ) {
    return "/sad.png"
  }

  if (
    text.includes("confused") ||
    text.includes("plan") ||
    text.includes("how") ||
    text.includes("what should") ||
    text.includes("help me")
  ) {
    return "/thinking.png"
  }

  if (
    text.includes("done") ||
    text.includes("finished") ||
    text.includes("better") ||
    text.includes("good") ||
    text.includes("thanks")
  ) {
    return "/happy.png"
  }

  return "/neutral.png"
}

export function looksLikeChatReply(title) {
  const text = title.toLowerCase()

  return (
    text.includes("sorry you") ||
    text.includes("i'm sorry") ||
    text.includes("i am sorry") ||
    text.includes("that sounds") ||
    text.includes("that feeling") ||
    text.includes("you are feeling")
  )
}
