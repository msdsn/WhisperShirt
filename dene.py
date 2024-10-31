# from openai import OpenAI
# from decouple import config
# import base64
# import io
# from pydub import AudioSegment
# api_key = config("OPENAI_KEY")
# client = OpenAI(
#     base_url="https://api.openai.com/v1",
#     api_key=api_key,
# )
# response = client.audio.speech.create(
#     model="tts-1",
#     voice="nova",
#     input="Hello world! This is a streaming test. Hello world! This is a streaming test. Hello world! This is a streaming test. Hello world! This is a streaming test. Hello world! This is a streaming test.",
#     response_format="wav",
# )
# audio = AudioSegment.from_wav(io.BytesIO(response.content))
# audio_bytes = audio.export(format="wav").read()
# audio_base64 = base64.b64encode(audio_bytes).decode("utf-8")
# print(audio_base64)


