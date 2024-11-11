from groq_whisper import VoiceRecognition
from llm import LLM
from llmAdmin import LLMAdmin
import asyncio
from decouple import config
from realtime import AsyncRealtimeClient
import random

class Bot:
    def __init__(self, ws, supabase=None, subdomain="", s3=None):
        self.ws = ws
        self.supabase = supabase
        self.s3 = s3
        self.subdomain = subdomain
        self.asr = VoiceRecognition()
        self.llm = None
        self.supabase_listener_tasks = []
        self.isInitialized = False
        self.isUser = False

    async def initAnonymous(self):
        print(f"listener baslatiliyor")
        self.llm = LLM(supabase=self.supabase, subdomain=self.subdomain, s3=self.s3)
        await self.start_db_listener("likes", self.llm.what_user_likes)
        await self.start_db_listener("dislikes", self.llm.what_user_dislikes)
        await self.start_db_listener("peopleloved", self.llm.who_user_loves)
        await self.start_db_listener("peopledisliked", self.llm.who_user_dont_like)
        await self.start_db_listener("tobetold", self.llm.user_request_something_to_be_told)
        self.isInitialized = True
        self.isUser = False
        print(f"listener baslatilmasi bitti")

    def initAsUser(self):
        self.llm = LLMAdmin(supabase=self.supabase, subdomain=self.subdomain, s3=self.s3)
        self.isInitialized = True
        self.isUser = True
    
        
    async def start_db_listener(self, table, callback):
        URL = config("REALTIME_URL")
        JWT = config("SUPABASE_KEY")
        # Setup the Supabase listener
        socket = AsyncRealtimeClient(f"{URL}", JWT, auto_reconnect=True)
        await socket.connect()
        channel = socket.channel("test-postgres-changes"+str(random.randint(1, 1000)))
        db = channel.on_postgres_changes(
            event="INSERT",
            schema="public",
            table=table,
            filter=f"subdomain=eq.{self.subdomain}",
            callback=callback,
        )
        await db.subscribe()

        self.supabase_listener_task = asyncio.create_task(socket.listen())
        self.supabase_listener_tasks.append(self.supabase_listener_task)

    async def stop_db_listener(self):
        for task in self.supabase_listener_tasks:
            task.cancel()
        self.supabase_listener_tasks = []

    async def conversation_chain(self, user_input):
        if not self.isInitialized:
            return None, "Bot is not initialized"
        if type(user_input) == str:
            print("--------------------------------------------calisiyor-1")
            return await self.llm.chat(user_input, self.ws)
        
        transcription = self.asr.transcribe_np(user_input)
        print(f"Transcription: {transcription}")
        
        return await self.llm.chat(transcription, self.ws)
 
