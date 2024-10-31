from decouple import config
from typing import Iterator
from openai import OpenAI
import json
import base64
import io
from pydub import AudioSegment
import boto3
import time
import random
from decouple import config
import os
from server import s3


print("LLM is starting...")

class LLM:
    def __init__(self, person_name: str = "emily", person_features: Iterator[str] = ['loves blue', 'likes to read']):
        api_key = config("OPENAI_KEY")
        self.client = OpenAI(
            base_url="https://api.openai.com/v1",
            api_key=api_key,
        )
        self.memory = []
        self.memory.append(
            {
                "role": "system",
                "content": "You're a talking shirt. You can talk to me about anything. You are belonging to a person named "+person_name+"."+f"{person_name} has some features that you know: " +"".join([f"{feature}, " for feature in person_features])+". You will speak with someone about "+person_name+". You are like a friend to "+person_name+". You are kind and helpful. You are a good listener. You are a good friend. Give short responses.",
            }
        )
    def chat(self, prompt: str, ws) -> str:

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
            completion = self.client.chat.completions.create(
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
        # calculate time
        try:
            time_in = time.time()
            response = self.client.audio.speech.create(
                model="tts-1",
                voice="nova",
                input=completion.choices[0].message.content,
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
            s3.upload_file(
                ogg_path,
                config("AWS_STORAGE_BUCKET_NAME"),
                'whispershirt/'+file_name,
            )
            # delete file
            os.remove(ogg_path)
                    
            time_out = time.time()
            print(f"Time taken s: {(time_out-time_in)}")
        except Exception as e:
            print(f"Error: {e}")
            
        return file_name, completion.choices[0].message.content
               
        
        