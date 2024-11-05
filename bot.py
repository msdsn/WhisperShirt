from groq_whisper import VoiceRecognition
from llm import LLM
from llmAdmin import LLMAdmin
import asyncio
from decouple import config
from realtime import AsyncRealtimeClient


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

    def initAnonymous(self):
        self.llm = LLM(supabase=self.supabase, subdomain=self.subdomain, s3=self.s3)
        self.start_db_listener("likes", self.llm.what_user_likes)
        self.start_db_listener("dislikes", self.llm.what_user_dislikes)
        self.start_db_listener("peopleloved", self.llm.who_user_loves)
        self.start_db_listener("peopledisliked", self.llm.who_user_dont_like)
        self.start_db_listener("tobetold", self.llm.user_request_something_to_be_told)
        self.isInitialized = True
        self.isUser = False

    def initAsUser(self):
        self.llm = LLMAdmin(supabase=self.supabase, subdomain=self.subdomain, s3=self.s3)
        self.isInitialized = True
        self.isUser = True
    
        
    async def start_db_listener(self, table, callback):
        URL = config("REALTIME_URL")
        JWT = config("SUPABASE_KEY")
        # Setup the Supabase listener
        self.socket = AsyncRealtimeClient(f"{URL}", JWT, auto_reconnect=True)
        await self.socket.connect()
        channel = self.socket.channel("test-postgres-changes")
        await channel.on_postgres_changes(
            event="INSERT",
            schema="public",
            table=table,
            filter=f"subdomain=eq.{self.subdomain}",
            callback=callback,
        ).subscribe()
        self.supabase_listener_task = asyncio.create_task(self.socket.listen())
        self.supabase_listener_tasks.append(self.supabase_listener_task)

    async def conversation_chain(self, user_input):
        if not self.isInitialized:
            return None, "Bot is not initialized"
        if type(user_input) == str:
            print("--------------------------------------------calisiyor-1")
            return await self.llm.chat(user_input, self.ws)
        
        transcription = self.asr.transcribe_np(user_input)
        print(f"Transcription: {transcription}")
        
        return await self.llm.chat(transcription, self.ws)
 
