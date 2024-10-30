
import { createContext, useState, useEffect, useRef } from 'react'

export const WebsocketContext = createContext(false, null, () => {})
//                                            ready, value, send

// Make sure to put WebsocketProvider higher up in
// the component tree than any consumer.
export const WebsocketProvider = ({ children }) => {
  const [isReady, setIsReady] = useState(false)
  const [val, setVal] = useState(null)

  const ws = useRef(null)

  useEffect(() => {
    const socket = new WebSocket("ws://127.0.0.1:8000/ws")

    socket.onopen = () => setIsReady(true)
    socket.onclose = () => setIsReady(false)
    socket.onmessage = (event) => setVal(event.data)

    ws.current = socket

    return () => {
        console.log('...s')
        socket.close()
    }
  }, [])

  const ret = [isReady, val, ws.current?.send.bind(ws.current), ws.current]

  return (
    <WebsocketContext.Provider value={ret}>
      {children}
    </WebsocketContext.Provider>
  )
}