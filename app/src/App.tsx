import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { SubdomainProvider } from "./context/SubdomainContext";
import { WebSocketProvider } from "./context/WebSocketContext";
import Layout from "./components/Layout";

function App() {

  const router = createBrowserRouter([
    {
      element: <Layout />,
      children: [
        {
          path: "/", element: <div>Home</div>
        },
      ],
    },
  ]);

  return (
    <>
      <SubdomainProvider>
        <WebSocketProvider>
          <RouterProvider router={router} />
        </WebSocketProvider>
      </SubdomainProvider>
    </>
  )
}

export default App
