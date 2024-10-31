
import { createContext, useState, useEffect, useRef } from 'react'

export const WebsocketContext = createContext(false, null, () => {})
//                                            ready, value, send

// Make sure to put WebsocketProvider higher up in
// the component tree than any consumer.
export const WebsocketProvider = ({ children }) => {
  const [isReady, setIsReady] = useState(false)
  const [val, setVal] = useState(null)

  const [ws, setWs] = useState(null);

  useEffect(() => {
    const socket = new WebSocket("ws://127.0.0.1:8000/ws")

    socket.onopen = () => setIsReady(true)
    socket.onclose = () => setIsReady(false)
    socket.onmessage = (event) => setVal(event.data)
    // socket.addEventListener('message', (event) => {
    //     //console.log('Message from server ', event.data);
    // });
    

    setWs(socket);

    return () => {
        console.log('...s')
        socket.close()
    }
  }, [])
  const send = ws ? ws.send.bind(ws) : () => {};
  const ret = [isReady, val, send, ws]

  return (
    <WebsocketContext.Provider value={ret}>
      {children}
    </WebsocketContext.Provider>
  )
}