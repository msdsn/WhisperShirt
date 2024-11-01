import { useContext, useEffect } from "react"
import { WebSocketContext, WebSocketContextType } from "../context/WebSocketContext"


const Home = () => {
    const {isReady, val, send, ws} = useContext(WebSocketContext) as WebSocketContextType
    return (
        <div>
            
        </div>
    )
}

export default Home