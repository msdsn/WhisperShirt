import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { SubdomainProvider } from "./context/SubdomainContext";
import { WebSocketProvider } from "./context/WebSocketContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import { SessionProvider } from "./context/SessionContext";

function App() {

  const router = createBrowserRouter([
    {
      path: "/", element: <Home />,
    },
    {
      path: "/login", element: <Login />,
    }
  ]);

  return (
    <>
      <SessionProvider>
        <SubdomainProvider>
          <WebSocketProvider>
            <RouterProvider router={ router } />
          </WebSocketProvider>
        </SubdomainProvider>
      </SessionProvider>
    </>
  )
}

export default App
