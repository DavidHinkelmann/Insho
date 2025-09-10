// src/main.tsx
import { StrictMode, useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  useNavigate,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import './styles.css'
import reportWebVitals from './reportWebVitals.ts'

import App from './App.tsx'
import { login as apiLogin, register as apiRegister, me as apiMe, logout as apiLogout, type User } from '@/service/api'
import * as React from "react";
import { LogIn , NotebookPen } from "lucide-react";

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

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: Profile,
})

const routeTree = rootRoute.addChildren([indexRoute, loginRoute, registerRoute, profileRoute])

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

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await apiLogin(email, password)
      navigate({ to: '/profile' })
    } catch (err: any) {
      setError(err.message || 'Login fehlgeschlagen')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid grid-rows-[auto_1fr] items-start justify-center text-center text-white text-[calc(10px+2vmin)]">
      <div className="sticky top-0 z-10 w-full py-6 flex flex-col items-center bg-transparent">
        <h1 className="text-8xl font-bold text-[#38E07A]">インショ</h1>
        <h3 className="text-4xl font-bold">Insho</h3>
      </div>
      <div className="mt-6 w-full max-w-sm mx-auto self-center text-left">
        <h2 className="text-2xl font-semibold mb-4 items-center flex gap-2"><LogIn/>Login</h2>
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="flex flex-col gap-1">
            <input
              className="w-full rounded-md px-4 py-3 text-lg text-[#96C4A8] bg-[#264533] placeholder-[#96C4A8]/70 focus:outline-none focus:ring-2 focus:ring-[#38E07A]"
              placeholder="Email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <input
              className="w-full rounded-md px-4 py-3 text-lg text-[#96C4A8] bg-[#264533] placeholder-[#96C4A8]/70 focus:outline-none focus:ring-2 focus:ring-[#38E07A]"
              placeholder="Passwort"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="text-red-400 text-sm">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-md bg-[#38E07A] text-black hover:bg-[#38E07A] px-4 py-2 font-medium disabled:opacity-70"
          >
            {loading ? 'Bitte warten…' : 'Einloggen'}
          </button>
        </form>
        <p className="mt-3 text-center text-[#96C4A8]">
          Noch kein Account? <a className="underline" href="/register">Registrieren</a>
        </p>
      </div>
    </div>
  )
}

function Register() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      await apiRegister(email, password, name || undefined)
      setSuccess('Registrierung erfolgreich. Bitte einloggen.')
      setTimeout(() => navigate({ to: '/login' }), 800)
    } catch (err: any) {
      setError(err.message || 'Registrierung fehlgeschlagen')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid grid-rows-[auto_1fr] items-start justify-center text-center text-white text-[calc(10px+2vmin)]">
      <div className="sticky top-0 z-10 w-full py-6 flex flex-col items-center bg-transparent">
        <h1 className="text-8xl font-bold text-[#38E07A]">インショ</h1>
        <h3 className="text-4xl font-bold">Insho</h3>
      </div>
      <div className="mt-6 w-full max-w-sm mx-auto self-center text-left">
        <h2 className="text-2xl font-semibold mb-4 items-center flex gap-2"><NotebookPen/>Registrieren</h2>
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="flex flex-col gap-1">
            <input
              className="w-full rounded-md px-4 py-3 text-lg text-[#96C4A8] bg-[#264533] placeholder-[#96C4A8]/70 focus:outline-none focus:ring-2 focus:ring-[#38E07A]"
              placeholder="Name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <input
              className="w-full rounded-md px-4 py-3 text-lg text-[#96C4A8] bg-[#264533] placeholder-[#96C4A8]/70 focus:outline-none focus:ring-2 focus:ring-[#38E07A] "
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <input
              className="w-full rounded-md px-4 py-3 text-lg text-[#96C4A8] bg-[#264533] placeholder-[#96C4A8]/70 focus:outline-none focus:ring-2 focus:ring-[#38E07A]"
              type="password"
              autoComplete="new-password"
              placeholder="Passwort"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="text-red-400 text-sm">{error}</div>}
          {success && <div className="text-green-400 text-sm">{success}</div>}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-md bg-[#38E07A] text-black hover:bg-[#38E07A] px-4 py-2 font-medium disabled:opacity-70"
          >
            {loading ? 'Bitte warten…' : 'Account erstellen'}
          </button>
        </form>
        <p className="mt-3 text-center text-[#96C4A8]">
          Bereits registriert? <a className="underline" href="/login">Zum Login</a>
        </p>
      </div>
    </div>
  )
}

function Profile() {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [navbar, setNavbar] = useState(false);
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const u = await apiMe()
        if (mounted) setUser(u)
      } catch (err: any) {
        setError(err.message || 'Nicht eingeloggt')
        navigate({ to: '/login' })
      }
    })()
    return () => { mounted = false }
  }, [navigate])

  function onLogout() {
    apiLogout()
    navigate({ to: '/login' })
  }

  if (error) return <div style={{ padding: 16 }}><p style={{ color: 'red' }}>{error}</p></div>
  if (!user) return <div style={{ padding: 16 }}>Lade Profil…</div>
  //Anfang von dashboard

  return (
    <nav className="w-full bg-[#38E07A] shadow">
            <div className="justify-between px-4 mx-auto lg:max-w-7xl md:items-center md:flex md:px-8">
                <div>
                    <div className="flex items-center justify-between py-3 md:py-5 md:block">
                        <a href="javascript:void(0)">
                            <h2 className="text-2xl font-bold text-white">インショ</h2>
                        </a>
                        <div className="md:hidden">
                            <button
                                className="p-2 text-gray-700 rounded-md outline-none focus:border-gray-400 focus:border"
                                onClick={() => setNavbar(!navbar)}
                            >
                                {navbar ? (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="w-6 h-6 text-white"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                ) : (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="w-6 h-6 text-white"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M4 6h16M4 12h16M4 18h16"
                                        />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
                <div>
                    <div
                        className={`flex-1 justify-self-center pb-3 mt-8 md:block md:pb-0 md:mt-0 ${
                            navbar ? "block" : "hidden"
                        }`}
                    >
                        <ul className="items-center justify-center space-y-8 md:flex md:space-x-6 md:space-y-0">
                            <li className="text-white hover:text-indigo-200">
                                <a href="javascript:void(0)">Barcode-Scan</a>
                            </li>
                            <li className="text-white hover:text-indigo-200">
                                <a href="javascript:void(0)">Blog</a>
                            </li>
                            <li className="text-white hover:text-indigo-200">
                                <a href="javascript:void(0)">About US</a>
                            </li>
                            <li className="text-white hover:text-indigo-200">
                                <a href="javascript:void(0)">Contact US</a>
                            </li>
                        </ul>

                        <div className="mt-3 space-y-2 lg:hidden md:inline-block">
                    <a
                        href="javascript:void(0)"
                        className="inline-block w-full px-4 py-2 text-center text-white bg-gray-600 rounded-md shadow hover:bg-gray-800"
                    >
                        Sign in
                    </a>
                    <a
                        href="javascript:void(0)"
                        className="inline-block w-full px-4 py-2 text-center text-gray-800 bg-white rounded-md shadow hover:bg-gray-100"
                    >
                        {user.name}
                    </a>
                </div>
                    </div>
                </div>
                <div className="hidden space-x-2 md:inline-block">
                    <a
                        href="javascript:void(0)"
                        className="px-4 py-2 text-white bg-gray-600 rounded-md shadow hover:bg-gray-800"
                    >
                        Sign in
                    </a>
                    <a
                        href="javascript:void(0)"
                        className="px-4 py-2 text-gray-800 bg-white rounded-md shadow hover:bg-gray-100"
                    >
                        {user.name}
                    </a>
                </div>
            </div>
        </nav>
  )
}

reportWebVitals()
