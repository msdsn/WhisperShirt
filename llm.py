from decouple import config
from typing import Iterator
from openai import OpenAI
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
    def chat_iter(self, prompt: str) -> str:

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
        return completion.choices[0].message.content
        