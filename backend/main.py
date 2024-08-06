from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, Request
from fastapi.responses import RedirectResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import httpx
from typing import List
from dotenv import load_dotenv
import os
import re
import secrets
import json

# Load environment variables
load_dotenv()

# Environment Variables
UID = os.getenv('UID')
SECRET = os.getenv('SECRET')
API_BASE_URL = 'https://api.intra.42.fr'

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

REDIRECT_URI = 'http://localhost:5173/oauth_callback'
SCOPE = 'public'

@app.get("/login")
async def login():
    state = secrets.token_urlsafe(32)
    auth_url = (
        f"{API_BASE_URL}/oauth/authorize?"
        f"client_id={UID}&"
        f"redirect_uri={REDIRECT_URI}&"
        f"response_type=code&"
        f"scope={SCOPE}&"
        f"state={state}"
    )
    return JSONResponse(content={"auth_url": auth_url})

@app.post("/exchange_token")
async def exchange_token(request: Request):
    data = await request.json()
    code = data.get('code')

    if not code:
        raise HTTPException(status_code=400, detail="Authorization code not found")

    token_url = f'{API_BASE_URL}/oauth/token'
    token_data = {
        'grant_type': 'authorization_code',
        'client_id': UID,
        'client_secret': SECRET,
        'code': code,
        'redirect_uri': REDIRECT_URI,
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(token_url, data=token_data)
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Failed to fetch access token")

        token_json = response.json()
        access_token = token_json.get('access_token')

        if not access_token:
            raise HTTPException(status_code=400, detail="Access token not found")

        api_url = f'{API_BASE_URL}/v2/me'
        headers = {'Authorization': f'Bearer {access_token}'}
        api_response = await client.get(api_url, headers=headers)
        if api_response.status_code != 200:
            raise HTTPException(status_code=api_response.status_code, detail="Failed to fetch user data")

        user_data = api_response.json()

    return JSONResponse(content=user_data)


class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.broadcast(json.dumps({"message": data}))
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        await manager.broadcast(json.dumps({"message": "A user has left the game"}))

# Keep your existing HTTP endpoints here
@app.get("/")
async def root():
    return {"message": "Hello from FastAPI"}

async def get_access_token() -> str:
    async with httpx.AsyncClient() as client:
        response = await client.post(f'{API_BASE_URL}/oauth/token', params={
            'grant_type': 'client_credentials',
            'client_id': UID,
            'client_secret': SECRET
        })
        response.raise_for_status()
        data = response.json()
        return data['access_token']

async def fetch_all_users(token: str, campus_id: int):
    users = []
    page_number = 1

    while True:
        async with httpx.AsyncClient() as client:
            response = await client.get(f'{API_BASE_URL}/v2/cursus/21/cursus_users', headers={
                'Authorization': f'Bearer {token}'
            }, 
            params={'page': page_number, 'filter[campus_id]': campus_id})
            response.raise_for_status()
            data = response.json()
            users.extend(data)

            # Check pagination
            links = response.headers.get('link', '')
            if 'rel="next"' not in links:
                break

            # Parse the Link header to find the next page number
            next_page_match = re.search(r'<.*page=(\d+)>; rel="next"', links)
            page_number = int(next_page_match.group(1)) if next_page_match else None

            if page_number is None:
                break

    return users

@app.get("/")
async def get_users(campus_id: int = 9):
    try:
        token = await get_access_token()
        all_users = await fetch_all_users(token, campus_id)

        result = []
        for user in all_users:
            result.append(user)

        return {'users': result, 'total_users': len(result)}
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=f"HTTP error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")
    

