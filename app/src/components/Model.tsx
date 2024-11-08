import { useContext, useEffect, useRef } from 'react'
import { Live2DModel } from 'pixi-live2d-display-lipsyncpatch';
import { Application, Assets, Sprite } from 'pixi.js';
import { motion } from 'framer-motion';
import { WebSocketContext } from '@/context/WebSocketContext';
import { MicContext } from '@/context/MicContext';

const model_info = {
    "name": "shizuku-local",
    "description": "Orange-Haired Girl, locally available. no internet required.",
    "url": "/live2d-models/shizuku/shizuku.model.json",
    "kScale": 0.001725,
    "kXOffset": 1150,
    "idleMotionGroupName": "Idle",
    "emotionMap": {
        "neutral": 0,
        "anger": 2,
        "disgust": 2,
        "fear": 1,
        "joy": 3,
        "smirk": 3,
        "sadness": 1,
        "surprise": 3
    }
}
function isMobile() {
    return window.innerWidth <= 768;
}

export var app: any = null;
export var model: any = null;
export var fabric: any = null;

type ModelProps = {
    userInput: string
    setModelResponse: (response: string) => void
    setIsModelWhispering: (isModelWhispering: boolean) => void
    startThinking: () => void
}

export const Model = ({ userInput, setModelResponse, setIsModelWhispering, startThinking }: ModelProps) => {
    const { val, send, isReady, ws } = useContext(WebSocketContext)
    const { onSpeechEndFunctions } = useContext(MicContext)
    const chunkSize = 4096;
    const canvas = useRef<HTMLCanvasElement>(null);
    const canvasWrapper = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (canvas.current && canvasWrapper.current) {
            app = new Application({
                view: canvas.current,
                autoStart: true,
                resizeTo: canvasWrapper.current,
                backgroundAlpha: 0,
            });
            app.stage.sortableChildren = true;
            (async function () {
                model = await Live2DModel.from(model_info.url);
                app.stage.addChild(model);
                model.anchor.set(0.5);
                model.scale.set(0.7);
                model.y = app.screen.height / 1.5;
                model.x = app.screen.width / 1.8;
                model.zIndex = 1;
            })()
            const texturePromise = Assets.load('/white.png');
            texturePromise.then((resolvedTexture) => {
                // create a new Sprite from the resolved loaded Texture
                fabric = Sprite.from(resolvedTexture);

                // center the sprite's anchor point
                fabric.anchor.set(0.5);

                // move the sprite to the center of the screen
                fabric.scale.set(0.7);
                console.log(`app.screen.height: ${app.screen.height}, app.screen.width: ${app.screen.width}`)
                fabric.x = app.screen.width / 2;
                fabric.y = app.screen.height / 2;
                // add fabric to background
                fabric.zIndex = -1;

                app.stage.addChild(fabric);
            });
        }
    }, [canvas, canvasWrapper])
    const handleResize = () => {
        // Uygulamanın boyutunu güncelle
        console.log("..sda.asd")
        setTimeout(() => {
            if (app && fabric) {
                if (canvasWrapper.current) {
                    console.log(`canvasWrapper.current.clientWidth: ${canvasWrapper.current.clientWidth}, canvasWrapper.current.clientHeight: ${canvasWrapper.current.clientHeight}`)
                    app.renderer.resize(canvasWrapper.current.clientWidth, canvasWrapper.current.clientHeight);
                }
                fabric.x = app.screen.width / 2;
                fabric.y = app.screen.height / 2;
                model.y = app.screen.height / 1.6;
                model.x = app.screen.width / 1.95;

                if (isMobile()) {
                    fabric.scale.set(0.6);
                } else {

                    fabric.scale.set(0.7);
                }
            } else {
                console.log("app not ready")
            }
        }, 60);
    }
    useEffect(() => {

        window.addEventListener('resize', handleResize);

        return () => {
            //window.removeEventListener('resize', handleResize);
        }
    }, [])

    useEffect(() => {
        if (isReady) {
            if (userInput) {
                send(JSON.stringify({ type: 'user_input', text: userInput }))
            }
        }
    }, [userInput])
    useEffect(() => {
        console.log("val=> ", val)
        if (model) {
            if (val) {
                const parsedVal = JSON.parse(val);
                if (parsedVal.type === 'audio-response') {
                    console.log(parsedVal)
                    const file_path = parsedVal.file_path;
                    // fetch /audio?audio_path=file_path
                    fetch(`/audio?audio_path=${file_path}`).then(res => res.json()).then(data => {
                        const base64audio = data.audio;
                        console.log(base64audio)
                        //const blob = new Blob([base64audio], { type: 'audio/wav' });
                        //const url = URL.createObjectURL(blob);
                        //const audio = new Audio(base64audio);
                        //audio.play();
                        model.speak(
                            base64audio,
                            {
                                onFinish: () => { setIsModelWhispering(false) },
                            }
                        );
                        setModelResponse(parsedVal.text);
                    })
                }
            }
        }
    }, [val])
    useEffect(() => {
        if (isReady) {
            onSpeechEndFunctions.current = []
            onSpeechEndFunctions.current.push((audio: any) => {
                startThinking();
                for (let index = 0; index < audio.length; index += chunkSize) {
                    const endIndex = Math.min(index + chunkSize, audio.length);
                    const chunk = audio.slice(index, endIndex);
                    send(JSON.stringify({ type: "mic-audio-data", audio: chunk }));
                }
                waitForBufferToEmpty(() => send(JSON.stringify({ type: "mic-audio-end" })));
            })
        }
    }, [isReady])
    const waitForBufferToEmpty = (func: Function) => {
        console.log("...waiting for buffer to empty...");
        if (ws) {
            console.log("sd", ws.bufferedAmount)
            if (ws.bufferedAmount === 0) {
                // Tampon boşaldı, artık "mic-audio-end" mesajını gönderebiliriz
                func()
            } else {
                // Tampon henüz boşalmadı, bir süre sonra tekrar kontrol edelim
                setTimeout(() => waitForBufferToEmpty(func), 50); // 50 milisaniye sonra tekrar kontrol
            }
        }
    }
    return (
        <>
            <motion.div
                initial={ { opacity: 0, marginTop: -50 } }
                animate={ { opacity: 1, marginTop: 0 } }
                transition={ { duration: 0.3 } }
                ref={ canvasWrapper }
                className="w-full h-full"
            >
                <canvas ref={ canvas }></canvas>
            </motion.div>
        </>

    )
}