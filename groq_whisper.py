import io
import wave
import numpy as np
from groq import Groq
from decouple import config

class VoiceRecognition:

    SAMPLE_RATE = 16000
    NUM_CHANNELS = 1
    SAMPLE_WIDTH = 2

    def __init__(
        self, model: str = "whisper-large-v3"
    ) -> None:
        print("Initializing Groq ASR...")
        api_key = config("GROQ_API_KEY")
        self.client = Groq(api_key=api_key)
        self.model = model

    # Implemented in asr_interface.py
    # def transcribe_with_local_vad(self) -> str:

    def transcribe_np(self, audio: np.ndarray) -> str:
        """Transcribe speech audio in numpy array format and return the transcription.

        Args:
            audio: The numpy array of the audio data to transcribe.
        """

        print("Transcribing audio (GroqWhisperASR)...")

        # Turn the audio into an audio file
        # Make sure the audio is in the range [-1, 1]
        audio = np.clip(audio, -1, 1)
        # Convert the audio to 16-bit PCM
        audio_integer = (audio * 32767).astype(np.int16)

        # groq api requires a file-like object for the audio data, so we use a BytesIO object
        audio_buffer = io.BytesIO()

        with wave.open(audio_buffer, "wb") as wf:
            wf.setnchannels(self.NUM_CHANNELS)
            wf.setsampwidth(self.SAMPLE_WIDTH)
            wf.setframerate(self.SAMPLE_RATE)
            wf.writeframes(audio_integer.tobytes())

        audio_buffer.seek(0)

        # Transcribe the audio with the BytesIO object
        transcription = self.client.audio.transcriptions.create(
            file=("audio.wav", audio_buffer.read()),
            model=self.model,
            # prompt="Specify context or spelling",
            response_format="text",
            temperature=0.0,
            language="tr",
        )

        return transcription
