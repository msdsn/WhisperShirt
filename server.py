from fastapi import FastAPI, WebSocket, HTTPException
from typing import Union
from decouple import config
from supabase import create_client, Client
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.websockets import WebSocketDisconnect
from fastapi.responses import StreamingResponse
from live2d_model import Live2dModel
import os
import asyncio
import json
import numpy as np
import base64
import io
import boto3
from pydub import AudioSegment



s3 = boto3.client(
    's3',
    aws_access_key_id=config("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=config("AWS_SECRET_ACCESS_KEY"),
    region_name=config("AWS_REGION_NAME"),
)

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



@app.get("/audio")
def read_item(audio_path: str):
    s3_path = 'whispershirt/'+audio_path
    print(s3_path)
    try:
        result = s3.get_object(Bucket=config("AWS_STORAGE_BUCKET_NAME"), Key=s3_path)
        # ogg to wav
        audio_file = io.BytesIO()
        for chunk in result["Body"].iter_chunks():
            if chunk:
                audio_file.write(chunk)
        audio_file.seek(0)
        audio = AudioSegment.from_ogg(audio_file)
        audio_bytes = audio.export(format="wav").read()
        audio_base64 = base64.b64encode(audio_bytes).decode("utf-8")
        audio_base64 = f"data:audio/wav;base64,{audio_base64}"
        return {"audio": audio_base64}
        #return StreamingResponse(content=result["Body"].iter_chunks())
    except Exception as e:
        if hasattr(e, "message"):
            raise HTTPException(
                status_code=e.message["response"]["Error"]["Code"],
                detail=e.message["response"]["Error"]["Message"],
            )
        else:
            raise HTTPException(status_code=500, detail=str(e))

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
    bot = Bot(ws=websocket)
    
    try:
        while True:
            message = await websocket.receive_text()
            print(f"Message received: {message}")
            data = json.loads(message)
            print(f"Data received: {data}")
            if data.get("type") == 'text':
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
                        file_path, text = await asyncio.to_thread(
                            bot.conversation_chain,
                            user_input=data.get("text"),
                        )
                        try:
                            await websocket.send_text(
                                json.dumps({"type": "audio-response", "text": file_path})
                            )  
                        except Exception as e:
                            print(f"Error sending text response: {e}")
                        
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

            elif data.get("type") == "mic-audio-data":
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
                        file_path, text = await asyncio.to_thread(
                            bot.conversation_chain,
                            user_input=audio,
                        )
                        try:
                            await websocket.send_text(
                                json.dumps({"type": "audio-response", "text": file_path})
                            )  
                        except Exception as e:
                            print(f"Error sending text response: {e}")
                        
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
        return FileResponse(file_path)
    else:
        return FileResponse(os.path.join('app', 'dist', 'index.html'))
    







