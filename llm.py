from decouple import config
from openai import AsyncOpenAI
import io
from pydub import AudioSegment
import random
from decouple import config
import os

class LLM:
    def __init__(self, subdomain: str = None,supabase=None, s3=None):
        api_key = config("OPENAI_KEY")
        self.supabase = supabase
        self.subdomain = subdomain
        self.s3 = s3
        self.client = AsyncOpenAI(
            base_url="https://api.openai.com/v1",
            api_key=api_key,
        )
        self.memory = []
        self.system_base = "You're a talking shirt. You can talk to me about anything. You are belonging to a person named "+subdomain+"." +f"You are a good friend to {subdomain}. You are kind and helpful. You are a good listener. You are a good friend. Give short responses."
        self.memory.append(
            {
                "role": "system",
                "content": self.system_base,
            }
        )
        self.likes = []
        self.dislikes = []
        self.peopleloved = []
        self.peopledisliked = []
        self.tobetold = []

    def updateSystem(self):
        system = self.system_base
        if len(self.likes) > 0:
            system += "\n"+self.subdomain+ " likes: "
            for like in self.likes:
                system += f"\n- {like['what']} because {like['why']}"
        if len(self.dislikes) > 0:
            system += "\n"+self.subdomain+ " dislikes: "
            for dislike in self.dislikes:
                system += f"\n- {dislike['what']} because {dislike['why']}"
        if len(self.peopleloved) > 0:
            system += "\n"+self.subdomain+ " loves: "
            for love in self.peopleloved:
                system += f"\n- {love['who']} because {love['why']}"
        if len(self.peopledisliked) > 0:
            system += "\n"+self.subdomain+ " doesn't like: "
            for dislike in self.peopledisliked:
                system += f"\n- {dislike['who']} because {dislike['why']}"

        self.memory[0]["content"] = system
    def what_user_likes(self, payload):
        data = payload["data"]['record']
        self.likes.append(
            {
                "what": data['what'],
                "why": data['why'],
            }
        )
        self.updateSystem()
    def what_user_dislikes(self, payload):
        data = payload["data"]['record']
        self.dislikes.append(
            {
                "what": data['what'],
                "why": data['why'],
            }
        )
        self.updateSystem()
    def who_user_loves(self, payload):
        data = payload["data"]['record']
        self.peopleloved.append(
            {
                "who": data['who'],
                "why": data['why'],
            }
        )
        self.updateSystem()
    def who_user_dont_like(self, payload):
        data = payload["data"]['record']
        self.peopledisliked.append(
            {
                "who": data['who'],
                "why": data['why'],
            }
        )
        self.updateSystem()
    def user_request_something_to_be_told(self, payload):
        data = payload["data"]['record']
        self.tobetold.append(
            {
                "what": data['what']
            }
        )
        self.updateSystem()
    async def chat(self, prompt: str, ws) -> str:
        self.memory.append(
            {
                "role": "user",
                "content": prompt,
            }
        )
        try:
            print("---"*20)
            print(self.memory)
            print("---"*20)
            completion = await self.client.chat.completions.create(
                messages=self.memory,
                model='gpt-4o',
                max_tokens=150,
            )
        except Exception as e:
            print("Error calling the chat endpoint: " + str(e))
            return "Error calling the chat endpoint: " + str(e)
        self.memory.append(
            {
                "role": "assistant",
                "content": completion.choices[0].message.content,
            }
        )
        file_name = await self.saveFileToB3(completion.choices[0].message.content)  
        return file_name, completion.choices[0].message.content
    
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
            return "Error: "+str(e)
               
        
        