import { WebsocketProvider } from './context/WebSocketContext'
import Page from './components/Page'


function App() {
  return (
    <>
      <WebsocketProvider>
        <Page />
      </WebsocketProvider>
    </>
  )
}

export default App
