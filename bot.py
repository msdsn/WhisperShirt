from groq_whisper import VoiceRecognition
from llm import LLM
from typing import Iterator

class Bot:
    def __init__(self):
        self.asr = VoiceRecognition()
        self.llm = LLM()

    def conversation_chain(self, user_input):
        transcription = self.asr.transcribe_np(user_input)
        print(f"Transcription: {transcription}")

        chat_completion: str= self.llm.chat_iter(transcription)

        print(f"Chat completion: {chat_completion}")