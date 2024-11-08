import { createContext, useState, useEffect, useRef, useContext } from 'react'
import { useMicVAD } from "@ricky0123/vad-react";
import { SubdomainContext } from './SubdomainContext';
import { WebSocketContext } from './WebSocketContext';

export type MicContextType = {
    toggleAudio: () => void
    onSpeechEndFunctions: React.MutableRefObject<Array<Function>>
    isMicOn: boolean
}

export const MicContext = createContext<MicContextType>({
    toggleAudio: () => { },
    onSpeechEndFunctions: { current: [] },
    isMicOn: false
})

type MicProviderProps = {
    children: React.ReactNode
}

export const MicProvider = ({ children }: MicProviderProps) => {
    const { subdomain } = useContext(SubdomainContext)
    const [isMicOn, setIsMicOn] = useState<boolean>(false)
    const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
    // define onSpeechEndFunctions: Array<Function> = [], will pass to context, useRef
    const onSpeechEndFunctions = useRef<Array<Function>>([]);
    const toggleAudio = async () => {
        if (isMicOn) {
            if (mediaStream) {
                mediaStream.getTracks().forEach((track) => {
                    mediaStream.removeTrack(track);
                    return track.stop()
                });
                setMediaStream(null);
            }
            setIsMicOn(false);
        } else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                setMediaStream(stream);
                setIsMicOn(true);
            } catch (error) {
                console.error("Mikrofon açma hatası:", error);
            }
        }
    };
    useEffect(() => {
        if (subdomain){
            if (!mediaStream){
                async function getMediaStream() {
                    try {
                        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                        setMediaStream(stream);
                        setIsMicOn(true);
                    } catch (error) {
                        console.error("Mikrofon açma hatası:", error);
                    }
                }
                getMediaStream();
            }
        }
    }, [subdomain])
    
    return (
        <MicContext.Provider value={{ toggleAudio, onSpeechEndFunctions, isMicOn }}>
            {
                mediaStream && <VadProvider stream={mediaStream} isMicOn={isMicOn} onSpeechEndFunctions={onSpeechEndFunctions} />
            }
            {children}
        </MicContext.Provider>
    )
}

const VadProvider = ({stream, isMicOn, onSpeechEndFunctions}: {stream: MediaStream, isMicOn: boolean, onSpeechEndFunctions: React.MutableRefObject<Array<Function>>}) => {
    const { val, isReady } = useContext(WebSocketContext)
    
    const vad = useMicVAD({
        preSpeechPadFrames: 10,
        minSpeechFrames: 10,
        negativeSpeechThreshold: 0.2,
        positiveSpeechThreshold: 0.5,
        redemptionFrames: 5,
        ortConfig: (ort) => {
            ort.env.wasm.wasmPaths = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.19.0/dist/"
        },
        workletURL: "https://cdn.jsdelivr.net/npm/@ricky0123/vad-web@0.0.18/dist/vad.worklet.bundle.min.js",
        modelURL: "https://cdn.jsdelivr.net/npm/@ricky0123/vad-web@0.0.18/dist/silero_vad.onnx",
        startOnLoad: true,
        onSpeechEnd: (audio) => {
            console.log("User stopped talking")
            if (onSpeechEndFunctions.current.length > 0) {
                onSpeechEndFunctions.current.forEach((func) => func(audio));
            }
            vad.pause();
        },
        stream: stream,
    });
    useEffect(() => {
        if (isMicOn){
            vad.start();
        }else{
            vad.pause();
        }
    }, [isMicOn])
    useEffect(() => {
        if(isReady){
            if(val){
                const parsedVal = JSON.parse(val);
                if (parsedVal.type === 'control') {
                    if(parsedVal.text === 'conversation-chain-end'){
                        vad.start();
                    }
                }
            }
        }
    }, [val, isReady])
    return (
        <></>
    )
}