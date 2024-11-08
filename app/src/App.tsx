import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { SubdomainProvider } from "./context/SubdomainContext";
import { WebSocketProvider } from "./context/WebSocketContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import About from "./pages/About";
import { SessionProvider } from "./context/SessionContext";
import { MicProvider } from "./context/MicContext";
import How from "./pages/How";

function App() {

  const router = createBrowserRouter([
    {
      path: "/", element: <Home />,
    },
    {
      path: "/login", element: <Login />,
    },
    {
      path: "/about", element: <About />,
    },
    {
      path: "/how", element: <How />,
    }
  ]);

  return (
    <>
      <SessionProvider>
        <SubdomainProvider>
          <WebSocketProvider>
            <MicProvider>
              <RouterProvider router={ router } />
            </MicProvider>
          </WebSocketProvider>
        </SubdomainProvider>
      </SessionProvider>
    </>
  )
}

export default App
