import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { User, Volume2, VolumeX } from "lucide-react"
import { useTypingEffect } from "@/hooks/useTypingEffect"
import { useState, useContext, useEffect } from "react"
import { WebSocketContext, WebSocketContextType } from "@/context/WebSocketContext"

const Header = () => {
    const { isReady, val } = useContext(WebSocketContext) as WebSocketContextType
    const [currentText, setCurrentText] = useState("Merhaba! Ben bir AI sohbet botuyum. Size nasıl yardımcı olabilirim?")
    const { displayedText } = useTypingEffect(currentText)
    const [isSoundOn, setIsSoundOn] = useState(false)
    const toggleSound = () => {
        setIsSoundOn(!isSoundOn)
    }
    useEffect(() => {
        if (isReady) {
            if (val) {
                const data = JSON.parse(val)
                if (data.type === 'audio_response') {
                    setCurrentText(data.text)
                    const url = 'https://whispershirt.com/audio?audio_path=' + data.file_path
                    fetch(url).then(response => response.blob()).then(blob => {
                        const audio = new Audio(URL.createObjectURL(blob))
                        audio.play()
                    })
                }
            }
        }
    }, [isReady, val])
    return (
        <>
            <div className="">
                <header className="bg-white bg-opacity-10 backdrop-blur-md rounded-3xl shadow-lg overflow-hidden">
                    <div className="container mx-auto h-full flex flex-col p-4 md:p-6">
                        <div className="flex flex-col md:flex-row items-center justify-between mb-4">
                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 md:mb-0 font-game">WhisperShirt</h1>
                            <div className="flex items-center space-x-2 md:space-x-4">
                                <Button onClick={ toggleSound } className="bg-black bg-opacity-20 hover:bg-opacity-30 text-white rounded-full p-2 transition-all duration-300 ease-in-out transform hover:scale-105">
                                    { isSoundOn ? <Volume2 size={ 20 } /> : <VolumeX size={ 20 } /> }
                                </Button>
                                <Link to='/login' className="bg-black bg-opacity-20 hover:bg-opacity-30 text-white rounded-full px-4 py-2 flex items-center space-x-2 transition-all duration-300 ease-in-out transform hover:scale-105">
                                    <User size={ 16 } />
                                    <span className="hidden md:inline">Login</span>
                                </Link>
                            </div>
                        </div>
                        <div className="bg-black bg-opacity-30 rounded-2xl p-4 pl-6 md:p-6 flex-grow overflow-auto max-h-[60vh] md:max-h-[40vh]">
                            <p className="text-lg md:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#333333] via-[#0e0808] to-[#000000] animate-pulse">
                                { displayedText }
                            </p>
                        </div>
                    </div>
                </header>
            </div>
        </>
    )
}

export default Header