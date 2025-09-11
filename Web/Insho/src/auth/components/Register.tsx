import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import * as React from "react";
import { register as apiRegister } from "@/service/api.ts";
import { NotebookPen } from "lucide-react";

export function Register() {
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
                        className="mt-2 w-full rounded-full bg-[#38E07A] text-black hover:bg-[#38E07A] px-4 py-2 font-medium disabled:opacity-70"
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