from groq_whisper import VoiceRecognition
from llm import LLM
from typing import Iterator


class Bot:
    def __init__(self, ws):
        self.ws = ws
        self.asr = VoiceRecognition()
        self.llm = LLM()

    def conversation_chain(self, user_input):
        if type(user_input) == str:
            return self.llm.chat(user_input, self.ws)
        transcription = self.asr.transcribe_np(user_input)
        print(f"Transcription: {transcription}")
        
        file_path, text = self.llm.chat(transcription, self.ws)
        print(f"Text: {text}")
        return file_path, text
