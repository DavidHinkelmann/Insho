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
import { login as apiLogin, register as apiRegister, me as apiMe, logout as apiLogout, type User } from './lib/api'
import * as React from "react";

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
    <div style={{ margin: '40px auto', padding: 16 }} className="text-white text-[calc(10px+2vmin)]">
      <h2>Login</h2>
      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%' }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Passwort</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%' }} />
        </div>
        {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
        <button type="submit" disabled={loading}>{loading ? 'Bitte warten…' : 'Einloggen'}</button>
      </form>
      <p style={{ marginTop: 12 }}>
        Noch kein Account? <a href="/register">Registrieren</a>
      </p>
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
    <div
        style={{ maxWidth: 360, margin: '40px auto', padding: 16 }} className="text-white text-[calc(10px+2vmin)]">
      <h2>Registrieren</h2>
      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>Name (optional)</label>
          <input value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%' }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%' }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Passwort</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%' }} />
        </div>
        {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
        {success && <div style={{ color: 'green', marginBottom: 12 }}>{success}</div>}
        <button type="submit" disabled={loading}>{loading ? 'Bitte warten…' : 'Account erstellen'}</button>
      </form>
      <p style={{ marginTop: 12 }}>
        Bereits registriert? <a href="/login">Zum Login</a>
      </p>
    </div>
  )
}

function Profile() {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState<string | null>(null)

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

  return (
    <div style={{ padding: 16 }}>
      <h2>Profil</h2>
      <div><b>Email:</b> {user.email}</div>
      <div><b>Name:</b> {user.name || '—'}</div>
      <div><b>User-ID:</b> {user.id}</div>
      <button onClick={onLogout} style={{ marginTop: 12 }}>Logout</button>
    </div>
  )
}

reportWebVitals()
