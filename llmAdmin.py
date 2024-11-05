from decouple import config
from openai import AsyncOpenAI
import json
import io
from pydub import AudioSegment
import random
from decouple import config
import os
import asyncio

class LLMAdmin:
    def __init__(self, subdomain: str = None, supabase=None, s3=None):
        api_key = config("OPENAI_KEY")
        self.supabase = supabase
        self.subdomain = subdomain
        self.s3 = s3
        self.client = AsyncOpenAI(
            base_url="https://api.openai.com/v1",
            api_key=api_key,
        )
        self.memory = []
        self.memory.append(
            {
                "role": "system",
                "content": "You're a talking shirt. You can talk to me about anything. You are belonging to a person named "+subdomain+"." +f"You are a good friend to {subdomain}. You are kind and helpful. You are a good listener. You are a good friend. Give short responses. Now you are talking with {subdomain}.",
            }
        )
        self.tools =[
            {
                "type": "function",
                "function": {
                    "name": "what_user_likes",
                    "description": "if user tells you what user likes, record it. This can be an item or it can be definition (for example it can be =>i like walk alone).",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "what": {
                                "type": "string",
                                "description": "what is the thing that user likes. can be an item or it can be definition.",
                            },
                            "why": {
                                "type": "string",
                                "description": "If user tells you why user like the thing, record it.",
                            },
                        },
                        "required": ["what"],
                        "additionalProperties": False,
                    },
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "save_user_dislikes",
                    "description": "if user tells you what user dislikes, record it. This can be an item or it can be definition (for example it can be =>i don't like to be late).",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "what": {
                                "type": "string",
                                "description": "what is the thing that user likes. can be an item or it can be definition.",
                            },
                            "why": {
                                "type": "string",
                                "description": "If user tells you why they like the thing, record it.",
                            },
                        },
                        "required": ["what"],
                        "additionalProperties": False,
                    },
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "record_who_user_loves",
                    "description": "if user tells you who they love, record it.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "who": {
                                "type": "string",
                                "description": "Who is the person that user loves.",
                            },
                            "why": {
                                "type": "string",
                                "description": "If user tells you why they love the person, record it.",
                            },
                        },
                        "required": ["who"],
                        "additionalProperties": False,
                    },
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "record_who_user_dont_like",
                    "description": "if user tells you someone they don't like or at least don't like to much, record it.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "who": {
                                "type": "string",
                                "description": "Who is the person that user don't like to much.",
                            },
                            "why": {
                                "type": "string",
                                "description": "If user tells you why they don't like the person, record it.",
                            },
                        },
                        "required": ["who"],
                        "additionalProperties": False,
                    },
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "handle_user_request_something_to_be_told",
                    "description": "if user tells you something that user want from you, record it. This probably something user wants you to tell someone",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "who": {
                                "type": "string",
                                "description": "Who is the person that user wants you to tell something.",
                            },
                            "what": {
                                "type": "string",
                                "description": "what user wants you to tell to the person.",
                            },
                        },
                        "required": ["who", "what"],
                        "additionalProperties": False,
                    },
                }
            },
        ]
    def what_user_likes(self, what, why):
        if self.supabase and self.subdomain:
            try:
                if why == None or why == "":
                    why = ""
                response = self.supabase.table("likes").insert({"what": what, "why": why, "subdomain": self.subdomain}).execute()
                print(response)
            except Exception as e:
                print(f"Error: {e}")
    
    def save_user_dislikes(self, what, why):
        if self.supabase and self.subdomain:
            try:
                if why == None or why == "":
                    why = ""
                response = self.supabase.table("dislikes").insert({"what": what, "why": why, "subdomain": self.subdomain}).execute()
                print(response)
            except Exception as e:
                print(f"Error: {e}")

    def record_who_user_loves(self, people, why):
        if self.supabase and self.subdomain:
            try:
                if why == None or why == "":
                    why = ""
                response = self.supabase.table("peopleloved").insert({"who": people, "why": why, "subdomain": self.subdomain}).execute()
                print(response)
            except Exception as e:
                print(f"Error: {e}")
    def record_who_user_dont_like(self, people, why):
        if self.supabase and self.subdomain:
            try:
                if why == None or why == "":
                    why = ""
                response = self.supabase.table("peopledisliked").insert({"who": people, "why": why, "subdomain": self.subdomain}).execute()
                print(response)
            except Exception as e:
                print(f"Error: {e}")
    
    def handle_user_request_something_to_be_told(self, who, what):
        if self.supabase and self.subdomain:
            try:
                response = self.supabase.table("tobetold").insert({"who": who, "what": what, "subdomain": self.subdomain}).execute()
                print(response)
                print("------------------------------------------------------------tobetold eklendi")
            except Exception as e:
                print(f"Error: {e}")

    async def checkTools(self, prompt):
        messages = [self.memory[0]]
        messages.append(
            {
                "role": "user",
                "content": prompt,
            }
        )
        completion = await self.client.chat.completions.create(
            messages=messages,
            model='gpt-4o',
            max_tokens=150,
            tools=self.tools
        )
        if completion.choices[0].message.tool_calls:
            for tool_call in completion.choices[0].message.tool_calls:
                tool_call = tool_call.model_dump()
                print("---"*20)
                print(tool_call)
                print("---"*20)
                tool_name = tool_call["function"]["name"]
                tool_parameters = json.loads(tool_call["function"]["arguments"])
                if tool_name == "what_user_likes":
                    why = tool_parameters["why"] if "why" in tool_parameters else ""
                    #self.what_user_likes(tool_parameters["what"], why)
                    await asyncio.to_thread(self.what_user_likes, tool_parameters["what"], why)
                elif tool_name == "save_user_dislikes":
                    why = tool_parameters["why"] if "why" in tool_parameters else ""
                    #self.save_user_dislikes(tool_parameters["what"], why)
                    await asyncio.to_thread(self.save_user_dislikes, tool_parameters["what"], why)
                elif tool_name == "record_who_user_loves":
                    why = tool_parameters["why"] if "why" in tool_parameters else ""
                    #self.record_who_user_loves(tool_parameters["who"], why)
                    await asyncio.to_thread(self.record_who_user_loves, tool_parameters["who"], why)
                elif tool_name == "record_who_user_dont_like":
                    why = tool_parameters["why"] if "why" in tool_parameters else ""
                    #self.record_who_user_dont_like(tool_parameters["who"], why)
                    await asyncio.to_thread(self.record_who_user_dont_like, tool_parameters["who"], why)
                elif tool_name == "handle_user_request_something_to_be_told":
                    await asyncio.to_thread(self.handle_user_request_something_to_be_told, tool_parameters["who"], tool_parameters["what"])
                    #self.handle_user_request_something_to_be_told(tool_parameters["who"], tool_parameters["what"])

    async def chat(self, prompt: str, ws) -> str:
        
        self.memory.append(
            {
                "role": "user",
                "content": prompt,
            }
        )
        try:
            
            asyncio.create_task(self.checkTools(prompt))
           
            completion = await self.client.chat.completions.create(
                messages=self.memory,
                model='gpt-4o',
                max_tokens=150,
            )
           
            print('lll'*20)
            print(completion.choices[0].message.content)
            file_path = await self.saveFileToB3(completion.choices[0].message.content)
           
            return file_path, completion.choices[0].message.content
        except Exception as e:
            print("Error calling the chat endpoint: " + str(e))
            return "Error calling the chat endpoint: " + str(e)
        
    async def saveFileToB3(self, text: str):
        try:
            response = await self.client.audio.speech.create(
                model="tts-1",
                voice="nova",
                input= text,
                response_format="wav",
            ) 
            random_number = random.randint(0, 100000)
            random_number2 = random.randint(0, 100000)
            file_name = f'{"user_name"}-{random_number}-{random_number2}.ogg'
            ogg_path = f'./tmp/' + file_name
            audio_file = io.BytesIO()
            for chunk in response.iter_bytes(4096):
                if chunk:
                    audio_file.write(chunk)
            audio_file.seek(0)
            audio = AudioSegment.from_wav(audio_file)
            audio.export(ogg_path, format="ogg")

            self.s3.upload_file(
                ogg_path,
                config("AWS_STORAGE_BUCKET_NAME"),
                'whispershirt/'+file_name,
            )
            # delete file
            os.remove(ogg_path)

            return file_name
        except Exception as e:
            print(f"Error: {e}")
