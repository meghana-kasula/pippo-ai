from fastapi.middleware.cors import CORSMiddleware
from fastapi import Depends, FastAPI, HTTPException
from openai import OpenAI
from dotenv import load_dotenv
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
import os

from auth import create_access_token, current_user, hash_password, verify_password
from database import Base, engine, get_db
from models import ChatEntry, PlanNode, StudySession, User, UserProfile



# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI()
Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize OpenAI client
client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY")
)


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    name: str | None = None
    answers: dict[str, list[str]] | None = None
    study_context: dict = Field(default_factory=dict)
    history: list[ChatMessage] = Field(default_factory=list)


class AuthRequest(BaseModel):
    email: str
    password: str
    name: str | None = None


class ProfileRequest(BaseModel):
    onboarding_data: dict = Field(default_factory=dict)
    study_preferences: dict = Field(default_factory=dict)
    emotional_patterns: dict = Field(default_factory=dict)
    ai_memory_summary: str = ""
    app_state: dict = Field(default_factory=dict)


class AppStateRequest(BaseModel):
    app_state: dict = Field(default_factory=dict)


class StudySessionRequest(BaseModel):
    node_id: str | None = None
    mode: str = "focus"
    minutes: int = 0
    emotional_state: str | None = None
    notes: str = ""


class PlanNodeRequest(BaseModel):
    node_key: str
    parent_key: str | None = None
    title: str
    node_type: str = "topic"
    data: dict = Field(default_factory=dict)


PIPPO_SYSTEM_PROMPT = """
You are Pippo, a cozy AI study companion for students.

Your voice:
- warm, safe, thoughtful, observant, gentle, and emotionally regulated
- cozy and deeply human, but not lazy or vague
- short enough to feel calming, not like homework
- supportive without sounding clinical, therapeutic, corporate, or overly formal
- practical when the student asks for help planning, focusing, or starting

Never sound overly cheerful, startup-y, productivity-bro, fake therapeutic,
robotic, generic, hyper-clinical, manipulative, verbose, or infantilizing.

How Pippo helps:
- validate the feeling first in one small sentence
- offer one doable next step, not a giant plan
- ask at most one soft follow-up question when needed
- never shame, pressure, diagnose, or overpromise
- notice patterns gently without naming diagnoses
- if a student sounds distressed or unsafe, encourage reaching out to a trusted person or local emergency support
""".strip()


def profile_context(name, answers):
    if not answers:
        return "No onboarding profile yet."

    lines = []

    if name:
        lines.append(f"Student name: {name}")

    for key, values in answers.items():
        if values:
            readable_key = key.replace("_", " ")
            lines.append(f"{readable_key}: {', '.join(values)}")

    return "\n".join(lines) or "No onboarding profile yet."

# Home route
@app.get("/")
def home():
    return {"message": "Pippo backend running"}


@app.post("/auth/signup")
def signup(request: AuthRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == request.email).first()

    if existing:
        raise HTTPException(status_code=409, detail="Email already exists")

    user = User(
        email=request.email,
        name=request.name,
        password_hash=hash_password(request.password)
    )
    db.add(user)
    db.flush()
    db.add(UserProfile(user_id=user.id))
    db.commit()
    db.refresh(user)

    return {
        "access_token": create_access_token({"sub": str(user.id)}),
        "token_type": "bearer",
        "user": serialize_user(user)
    }


@app.post("/auth/login")
def login(request: AuthRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()

    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return {
        "access_token": create_access_token({"sub": str(user.id)}),
        "token_type": "bearer",
        "user": serialize_user(user)
    }


@app.get("/auth/me")
def me(user: User = Depends(current_user)):
    return {"user": serialize_user(user)}


@app.get("/profile")
def read_profile(
    user: User = Depends(current_user),
    db: Session = Depends(get_db)
):
    profile = get_or_create_profile(db, user.id)

    return serialize_profile(profile)


@app.put("/profile")
def update_profile(
    request: ProfileRequest,
    user: User = Depends(current_user),
    db: Session = Depends(get_db)
):
    profile = get_or_create_profile(db, user.id)
    profile.onboarding_data = request.onboarding_data
    profile.study_preferences = request.study_preferences
    profile.emotional_patterns = request.emotional_patterns
    profile.ai_memory_summary = request.ai_memory_summary
    profile.app_state = request.app_state
    db.commit()
    db.refresh(profile)

    return serialize_profile(profile)


@app.get("/app-state")
def read_app_state(
    user: User = Depends(current_user),
    db: Session = Depends(get_db)
):
    profile = get_or_create_profile(db, user.id)

    return {"app_state": profile.app_state}


@app.put("/app-state")
def update_app_state(
    request: AppStateRequest,
    user: User = Depends(current_user),
    db: Session = Depends(get_db)
):
    profile = get_or_create_profile(db, user.id)
    profile.app_state = request.app_state
    db.commit()

    return {"app_state": profile.app_state}


@app.post("/sessions")
def create_session(
    request: StudySessionRequest,
    user: User = Depends(current_user),
    db: Session = Depends(get_db)
):
    session = StudySession(
        user_id=user.id,
        node_id=request.node_id,
        mode=request.mode,
        minutes=request.minutes,
        emotional_state=request.emotional_state,
        notes=request.notes
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    return {
        "id": session.id,
        "node_id": session.node_id,
        "mode": session.mode,
        "minutes": session.minutes,
        "created_at": session.created_at.isoformat()
    }


@app.get("/sessions")
def list_sessions(
    user: User = Depends(current_user),
    db: Session = Depends(get_db)
):
    sessions = (
        db.query(StudySession)
        .filter(StudySession.user_id == user.id)
        .order_by(StudySession.created_at.desc())
        .limit(50)
        .all()
    )

    return {
        "sessions": [
            {
                "id": session.id,
                "node_id": session.node_id,
                "mode": session.mode,
                "minutes": session.minutes,
                "emotional_state": session.emotional_state,
                "notes": session.notes,
                "created_at": session.created_at.isoformat()
            }
            for session in sessions
        ]
    }


@app.post("/plan-nodes")
def upsert_plan_node(
    request: PlanNodeRequest,
    user: User = Depends(current_user),
    db: Session = Depends(get_db)
):
    node = (
        db.query(PlanNode)
        .filter(
            PlanNode.user_id == user.id,
            PlanNode.node_key == request.node_key
        )
        .first()
    )

    if not node:
        node = PlanNode(user_id=user.id, node_key=request.node_key)
        db.add(node)

    node.parent_key = request.parent_key
    node.title = request.title
    node.node_type = request.node_type
    node.data = request.data
    db.commit()
    db.refresh(node)

    return serialize_plan_node(node)


@app.get("/plan-nodes")
def list_plan_nodes(
    user: User = Depends(current_user),
    db: Session = Depends(get_db)
):
    nodes = (
        db.query(PlanNode)
        .filter(PlanNode.user_id == user.id)
        .order_by(PlanNode.updated_at.desc())
        .all()
    )

    return {"nodes": [serialize_plan_node(node) for node in nodes]}

# Chat route
@app.get("/chat")
def chat(user_input: str):
    return ask_pippo(
        ChatRequest(
            message=user_input
        )
    )


@app.post("/chat")
def ask_pippo(request: ChatRequest):
    if not os.getenv("OPENAI_API_KEY"):
        raise HTTPException(
            status_code=503,
            detail="OPENAI_API_KEY is not configured"
        )

    clean_history = [
        {
            "role": message.role,
            "content": message.content
        }
        for message in request.history[-8:]
        if message.role in {"user", "assistant"} and message.content.strip()
    ]

    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        temperature=0.7,
        messages=[
            {
                "role": "system",
                "content": PIPPO_SYSTEM_PROMPT
            },
            {
                "role": "system",
                "content": "Use this student context gently. Do not repeat it unless useful.\n"
                + profile_context(
                    request.name,
                    request.answers
                )
                + "\nStudy context:\n"
                + str(request.study_context)
            },
            *clean_history,
            {
                "role": "user",
                "content": request.message
            }
        ]
    )

    reply = response.choices[0].message.content

    return {"response": reply}


@app.post("/chat/authenticated")
def ask_pippo_authenticated(
    request: ChatRequest,
    user: User = Depends(current_user),
    db: Session = Depends(get_db)
):
    result = ask_pippo(request)
    db.add(ChatEntry(user_id=user.id, role="user", content=request.message))
    db.add(ChatEntry(user_id=user.id, role="assistant", content=result["response"]))
    profile = get_or_create_profile(db, user.id)
    profile.ai_memory_summary = summarize_memory(
        profile.ai_memory_summary,
        request.message
    )
    db.commit()

    return result


@app.get("/chat/history")
def chat_history(
    user: User = Depends(current_user),
    db: Session = Depends(get_db)
):
    entries = (
        db.query(ChatEntry)
        .filter(ChatEntry.user_id == user.id)
        .order_by(ChatEntry.created_at.desc())
        .limit(80)
        .all()
    )

    return {
        "messages": [
            {
                "role": entry.role,
                "content": entry.content,
                "created_at": entry.created_at.isoformat()
            }
            for entry in reversed(entries)
        ]
    }


def get_or_create_profile(db: Session, user_id: int):
    profile = (
        db.query(UserProfile)
        .filter(UserProfile.user_id == user_id)
        .first()
    )

    if profile:
        return profile

    profile = UserProfile(user_id=user_id)
    db.add(profile)
    db.commit()
    db.refresh(profile)

    return profile


def serialize_user(user: User):
    return {
        "id": user.id,
        "email": user.email,
        "name": user.name
    }


def serialize_profile(profile: UserProfile):
    return {
        "onboarding_data": profile.onboarding_data,
        "study_preferences": profile.study_preferences,
        "emotional_patterns": profile.emotional_patterns,
        "ai_memory_summary": profile.ai_memory_summary,
        "app_state": profile.app_state,
        "updated_at": profile.updated_at.isoformat()
    }


def serialize_plan_node(node: PlanNode):
    return {
        "node_key": node.node_key,
        "parent_key": node.parent_key,
        "title": node.title,
        "node_type": node.node_type,
        "data": node.data,
        "updated_at": node.updated_at.isoformat()
    }


def summarize_memory(existing: str, latest_message: str):
    clues = []
    text = latest_message.lower()

    if "overwhelm" in text or "too much" in text:
        clues.append("overwhelm-sensitive")
    if "tired" in text or "drained" in text:
        clues.append("fatigue-aware pacing")
    if "stuck" in text or "can't start" in text:
        clues.append("needs smaller starts")

    if not clues:
        return existing

    updated = ", ".join(clues)

    return f"{existing}; {updated}".strip("; ")
