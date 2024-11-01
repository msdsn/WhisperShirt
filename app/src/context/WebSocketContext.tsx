import { createContext, useState, useEffect, useContext } from 'react'
import { SubdomainContext, SubdomainContextType } from './SubdomainContext'

export type WebSocketContextType = {
    isReady: boolean,
    val: string | null,
    send: (data: string) => void,
    ws: WebSocket | null,
    connectToServer: (subdomain: string | null) => void
}

export const WebSocketContext = createContext<WebSocketContextType>({
    isReady: false,
    val: null,
    send: () => { },
    ws: null,
    connectToServer: () => { }
})

type WebSocketProviderProps = {
    children: React.ReactNode
}

export const WebSocketProvider = ({ children }: WebSocketProviderProps) => {
    const { subdomain } = useContext(SubdomainContext) as SubdomainContextType
    const [isReady, setIsReady] = useState<boolean>(false)
    const [val, setVal] = useState<string | null>(null)
    const [ws, setWs] = useState<WebSocket | null>(null)
    const send = ws ? ws.send.bind(ws) : () => { };
    const connectToServer = () => {
        const socket = new WebSocket(`wss://whispershirt.com/ws${subdomain ? ("/" + subdomain) : ''}`)
        socket.onopen = () => setIsReady(true)
        socket.onclose = () => setIsReady(false)
        socket.onmessage = (event) => setVal(event.data)
        setWs(socket);
    }
    useEffect(() => {
        if (subdomain) {
            if (ws) {
                ws.close()
            }
            connectToServer()
        }
    }, [subdomain])
    useEffect(() => {
        if (ws) {
            send(JSON.stringify({ type: 'subdomain', text: subdomain }))
        }
    }, [isReady])
    useEffect(() => {
        return () => {
            if (ws) {
                ws.close()
            }
        }
    }, [])
    

    return (
        <WebSocketContext.Provider value={ { isReady, val, send, ws, connectToServer } }>
            { children }
        </WebSocketContext.Provider>
    )

}