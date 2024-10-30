import {useEffect, useContext} from 'react'
import { useMicVAD } from "@ricky0123/vad-react"
import { WebsocketContext } from '../context/WebSocketContext';

const Page = () => {
    const [isReady, val, send, ws] = useContext(WebsocketContext)
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
            if (isReady) {
                for (let index = 0; index < audio.length; index += chunkSize) {
                    const endIndex = Math.min(index + chunkSize, audio.length);
                    const chunk = audio.slice(index, endIndex);
                    send(JSON.stringify({ type: "mic-audio-data", audio: chunk }));
                }
                waitForBufferToEmpty();
            }
        },
    })

    const waitForBufferToEmpty = () => {
        console.log("...waiting for buffer to empty...");
        if(ws.current){
            if (ws.current.bufferedAmount === 0) {
                // Tampon boşaldı, artık "mic-audio-end" mesajını gönderebiliriz
                send(JSON.stringify({ type: "mic-audio-end" }));
            } else {
                // Tampon henüz boşalmadı, bir süre sonra tekrar kontrol edelim
                setTimeout(waitForBufferToEmpty, 50); // 50 milisaniye sonra tekrar kontrol
            }
        }
    }


    useEffect(() => {
        console.log('....ll')
        console.log(val)
    }, [val])
    
    return (
        <div>Page</div>
    )
}

export default Page