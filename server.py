from fastapi import FastAPI, WebSocket
from typing import Union
from decouple import config
from supabase import create_client, Client
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.websockets import WebSocketDisconnect
from live2d_model import Live2dModel
import os
import asyncio
import json
import numpy as np

from bot import Bot


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Güvenlik için burada belirli origin'leri belirtmek daha iyidir
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase ayarları
SUPABASE_URL = config("SUPABASE_URL")
SUPABASE_KEY = config("SUPABASE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

@app.get("/api/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    response = supabase.table('dene').insert({"q": q}).execute()
    return {"item_id": item_id, "q": q}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    print("WebSocket Connection Established")
    await websocket.accept()
    await websocket.send_text(
        json.dumps({"type": "full-text", "text": "Connection established"})
    )
    received_data_buffer = np.array([])
    l2d = Live2dModel('shizuku-local')
    bot = Bot()
    
    try:
        while True:
            message = await websocket.receive_text()
            data = json.loads(message)
            if data.get("type") == "mic-audio-data":
                received_data_buffer = np.append(
                    received_data_buffer,
                    np.array(
                        list(data.get("audio").values()), dtype=np.float32
                    ),
                )
            elif data.get("type") == "mic-audio-end":
                audio = received_data_buffer
                received_data_buffer = np.array([])
                async def _run_conversation():
                    try:
                        await websocket.send_text(
                            json.dumps(
                                {
                                    "type": "control",
                                    "text": "conversation-chain-start",
                                }
                            )
                        )
                        await asyncio.to_thread(
                            bot.conversation_chain,
                            user_input=audio,
                        )
                        await websocket.send_text(
                            json.dumps(
                                {
                                    "type": "control",
                                    "text": "conversation-chain-end",
                                }
                            )
                        )
                        print("One Conversation Loop Completed")
                    except asyncio.CancelledError:
                        print("Conversation task was cancelled.")
                    except InterruptedError as e:
                        print(f"😢Conversation was interrupted. {e}")
                conversation_task = asyncio.create_task(_run_conversation())
            
    except WebSocketDisconnect:
        await websocket.close()

app.mount(
    "/live2d-models",
    StaticFiles(directory="live2d-models"),
    name="live2d-models",
)
app.mount("/assets", StaticFiles(directory="app/dist/assets"), name="assets")
@app.get("/{full_path:path}")
async def serve_react_app(full_path: str):
    file_path = os.path.join('app', 'dist', full_path)
    if os.path.exists(file_path) and os.path.isfile(file_path):
        print('ll')
        return FileResponse(file_path)
    else:
        print('ll2')
        return FileResponse(os.path.join('app', 'dist', 'index.html'))





