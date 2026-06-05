from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import hashlib
import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

# Connect to Supabase using our secret key
supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_KEY")
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# This defines what one packet looks like
class Packet(BaseModel):
    captured_at: str
    protocol: str
    src_ip: str
    dst_ip: str
    src_port: Optional[int] = None
    dst_port: Optional[int] = None
    packet_size: Optional[int] = None

# This defines what the agent sends in one POST request
class IngestPayload(BaseModel):
    hostname: str
    interface: str
    session_id: Optional[str] = None
    packets: List[Packet]

@app.get("/api/health")
def health():
    return {"status": "ok"}

@app.post("/api/ingest")
def ingest(payload: IngestPayload, x_api_key: str = Header(...)):
    # Step 1: Hash the incoming API key
    key_hash = hashlib.sha256(x_api_key.encode()).hexdigest()

    # Step 2: Look up the hash in Supabase to find which user this belongs to
    result = supabase.table("api_keys").select("user_id").eq("key_hash", key_hash).single().execute()

    if not result.data:
        raise HTTPException(status_code=401, detail="Invalid API key")

    user_id = result.data["user_id"]

    # Step 3: Insert all packets into Supabase
    packets_to_insert = [
        {**p.dict(), "user_id": user_id, "session_id": payload.session_id}
        for p in payload.packets
    ]
    supabase.table("packets").insert(packets_to_insert).execute()

    return {"status": "ok", "received": len(payload.packets)}

@app.get("/api/packets")
def get_packets(
    authorization: str = Header(...),
    limit: int = 100,
    protocol: Optional[str] = None
):
    # Step 1: Pull the JWT out of the "Bearer <token>" header
    token = authorization.replace("Bearer ", "")

    # Step 2: Validate the token and find out which user is asking
    try:
        user_response = supabase.auth.get_user(token)
        user_id = user_response.user.id
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    # Step 3: Fetch this user's packets, newest first.
    # We use the service key (bypasses RLS), so we MUST filter by user_id ourselves.
    query = (
        supabase.table("packets")
        .select("*")
        .eq("user_id", user_id)
        .order("captured_at", desc=True)
        .limit(limit)
    )
    if protocol:
        query = query.eq("protocol", protocol)

    result = query.execute()
    return {"packets": result.data, "count": len(result.data)}