// src/main.tsx
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import './styles.css'
import reportWebVitals from './reportWebVitals.ts'
import App from './App.tsx'
import { Onboarding } from "./Onboarding.tsx";
import { Dashboard } from "@/Dashboard.tsx";
import { Register } from "@/auth/components/Register.tsx";
import { Login } from "@/auth/components/Login.tsx";

// Define routes freshly on module eval; HMR dispose will clean previous instances
const rootRoute = createRootRoute({
  component: () => (
    <div className="bg-[#122117]">
      <Outlet />
      <TanStackRouterDevtools />
    </div>
  ),
  notFoundComponent: () => (
    <div style={{ padding: 16 }}>
      <h2>Seite nicht gefunden</h2>
      <p>Die angeforderte Seite konnte nicht gefunden werden.</p>
      <p>
        <a href="/" style={{ color: '#38E07A' }}>Zur Startseite</a>
      </p>
    </div>
  ),
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: App,
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: Login,
})

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: Register,
})

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: Dashboard,
})

const onBoardingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/onboarding',
  component: () => Onboarding,
})

const routeTree
    = rootRoute.addChildren([indexRoute, loginRoute, registerRoute, dashboardRoute, onBoardingRoute])

const router = createRouter({
  routeTree,
  context: {},
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
})

// TS module augmentation — keep as-is but export the same router type
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

/* --- mounting --- */
const rootElement = document.getElementById('app')
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  )
}

reportWebVitals()
