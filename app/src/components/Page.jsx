import {useEffect, useContext, useState} from 'react'
import { useMicVAD } from "@ricky0123/vad-react"
import { WebsocketContext } from '../context/WebSocketContext';
import { model, downloadFile } from '../utils/live2d';

const Page = () => {
    const [inputValue, setInputValue] = useState('');
    const [isReady, val, send, ws] = useContext(WebsocketContext)
    const [audioChunks, setAudioChunks] = useState([]);
    const chunkSize = 4096;
    const vad = useMicVAD({
        ortConfig: (ort) => {
            ort.env.wasm.wasmPaths = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.19.0/dist/"
        },
        workletURL: "https://cdn.jsdelivr.net/npm/@ricky0123/vad-web@0.0.18/dist/vad.worklet.bundle.min.js",
        modelURL: "https://cdn.jsdelivr.net/npm/@ricky0123/vad-web@0.0.18/dist/silero_vad.onnx",
        startOnLoad: true,
        onSpeechEnd: (audio) => {
            console.log("User stopped talking")
            if (false) {
                for (let index = 0; index < audio.length; index += chunkSize) {
                    const endIndex = Math.min(index + chunkSize, audio.length);
                    const chunk = audio.slice(index, endIndex);
                    send(JSON.stringify({ type: "mic-audio-data", audio: chunk }));
                }
                waitForBufferToEmpty(()=>send(JSON.stringify({ type: "mic-audio-end" })));
            }
        },
    })

    const waitForBufferToEmpty = (func) => {
        console.log("...waiting for buffer to empty...");
        if(ws){
            console.log("sd", ws.bufferedAmount)
            if (ws.bufferedAmount === 0) {
                // Tampon boşaldı, artık "mic-audio-end" mesajını gönderebiliriz
                func()
            } else {
                // Tampon henüz boşalmadı, bir süre sonra tekrar kontrol edelim
                setTimeout(()=>waitForBufferToEmpty(func), 50); // 50 milisaniye sonra tekrar kontrol
            }
        }
    }


    useEffect(() => {
        if (val) {
            const parsedVal = JSON.parse(val);
            if (parsedVal.type === 'audio-response') {
                console.log(parsedVal)
                const file_path = parsedVal.text;
                // fetch /audio?audio_path=file_path
                fetch(`/audio?audio_path=${file_path}`).then(res => res.json()).then(data => {
                    const base64audio = data.audio;
                    console.log(base64audio)
                    const blob = new Blob([base64audio], { type: 'audio/wav' });
                    const url = URL.createObjectURL(blob);
                    //const audio = new Audio(base64audio);
                    //audio.play();
                    model.speak(base64audio);
                })
            }
        }
    }, [val]);
    const sendText = () => {
        send(JSON.stringify({ type: "text", text: inputValue }));
    }
    
    return (
        <div>
            Page
            <input type='text' value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
            <button onClick={sendText}>Send</button>
            <button onClick={downloadFile}>download</button>
        </div>
    )
}

export default Page