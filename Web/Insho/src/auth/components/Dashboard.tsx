import { useNavigate } from "@tanstack/react-router";
import { useEffect , useState } from "react";
import { me as apiMe , type User } from "@/service/api.ts";
import TextType from "@/components/TextType.tsx";

export function Dashboard() {
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

    if (error) return <div style={{ padding: 16 }}><p style={{ color: 'red' }}>{error}</p></div>
    if (!user) return <div style={{ padding: 16 }}>Lade Profil…</div>

    return (
        <div className="bg-[#264533] min-h-screen w-full">
            <div className="flex flex-row px-4 mx-auto lg:max-w-7xl md:items-center md:flex md:px-8">
                <a className="flex justify-items-start" href="javascript:void(0)">
                    <h2 className="text-2xl font-bold text-white">インショ</h2>
                </a>
                <TextType
                    className="flex justify-center text-4xl text-[#38E07A]"
                    text={[`👋 Willkommen, ${user.name || '—'}`]}
                    typingSpeed={75}
                    pauseDuration={1500}
                    showCursor={true}
                    textColors={["#38E07A"]}
                    cursorCharacter="▌"
                    loop={false}
                />
            </div>
            <nav className="w-full fixed bottom-0">

            </nav>
        </div>
    )
}