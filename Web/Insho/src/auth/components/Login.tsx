import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import * as React from "react";
import { login as apiLogin } from "@/service/api.ts";
import { LogIn } from "lucide-react";
import "../styleSheets/Login.css"

export function Login() {
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
            await navigate({ to: '/dashboard' })
        } catch (err: any) {
            setError(err.message || 'Login fehlgeschlagen')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="login-background">
            <h1>インショ</h1>
            <h2>Insho</h2>
            <div className="login-outer-container">
                <div className="login-inner-container">
                    <h3><LogIn/>Login</h3>
                    <form onSubmit={onSubmit} className="input-container">
                        <input
                            placeholder="Email"
                            type="email"
                            inputMode="email"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <input
                            placeholder="Passwort"
                            type="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        {error && <div className="error">{error}</div>}
                        <button
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? 'Bitte warten…' : 'Einloggen'}
                        </button>
                    </form>
                    <p>
                        Noch kein Account? <a href="/register">Registrieren</a>
                    </p>
                </div>
            </div>
        </div>
    )
}