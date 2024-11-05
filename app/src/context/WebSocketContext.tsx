import { createContext, useState, useEffect, useContext, useRef } from 'react'
import { SubdomainContext, SubdomainContextType } from './SubdomainContext'
import { SessionContext, SessionContextType } from './SessionContext'

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
    const { session } = useContext(SessionContext) as SessionContextType
    const sessionRef = useRef(session);
    const { subdomain, isLocal } = useContext(SubdomainContext) as SubdomainContextType
    const [isReady, setIsReady] = useState<boolean>(false)
    const [val, setVal] = useState<string | null>(null)
    const [ws, setWs] = useState<WebSocket | null>(null)
    const send = ws ? ws.send.bind(ws) : () => { };
    const connectToServer = () => {
        let url = ''
        if (isLocal) {
            if (subdomain) {
                url = `ws://localhost:8000/ws/${subdomain}`
            } else {
                url = `ws://localhost:8000/ws`
            }
        } else {
            if (subdomain) {
                url = `wss://whispershirt.com/ws/${subdomain}`
            } else {
                url = `wss://whispershirt.com/ws`
            }
        }
        const socket = new WebSocket(url)
        socket.onopen = () => setIsReady(true)
        socket.onclose = () => setIsReady(false)
        socket.onmessage = (event) => setVal(event.data)
        setWs(socket);
    }
    useEffect(() => {
        sessionRef.current = session;
    }, [session]);
    useEffect(() => {
        if (subdomain) {
            if (ws) {
                ws.close()
            }
            connectToServer()
        }
    }, [subdomain])
    useEffect(() => {
        let timeoutId: any;
        if (isReady) {
            if (session) {
                // If session exists, send access_token immediately
                const accessToken = session.access_token;
                send(JSON.stringify({ type: 'access_token', token: accessToken }));
            } else {
                // If session does not exist, wait 600ms and check again
                timeoutId = setTimeout(() => {
                    const currentSession = sessionRef.current;
                    if (currentSession) {
                        const accessToken = currentSession.access_token;
                        send(JSON.stringify({ type: 'access_token', token: accessToken }));
                    } else {
                        send(JSON.stringify({ type: 'anonymous' }));
                    }
                }, 600);
            }
        }
        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
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