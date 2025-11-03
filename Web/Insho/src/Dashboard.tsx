import { useNavigate } from "@tanstack/react-router";
import { useEffect , useState } from "react";
import { me as apiMe , type User, getDashboard, setOnboarded } from "@/service/api.ts";
import { Onboarding, type OnboardingData } from "@/Onboarding.tsx";

export function Dashboard() {
    const navigate = useNavigate()
    const [user, setUser] = useState<User | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [showOnboarding, setShowOnboarding] = useState(false)

    useEffect(() => {
        let mounted = true
        ;(async () => {
            try {
                const u = await apiMe()
                if (mounted) setUser(u)
                // Check dashboard onboarding flag
                const d = await getDashboard()
                if (mounted) setShowOnboarding(!!d.show_onboarding)
            } catch (err: any) {
                setError(err.message || 'Nicht eingeloggt')
                navigate({ to: '/login' })
            }
        })()
        return () => { mounted = false }
    }, [navigate])

    const handleCompleted = async (_data: OnboardingData) => {
        try {
            await setOnboarded(true)
            // Refresh user and dashboard flag
            const u = await apiMe()
            setUser(u)
            setShowOnboarding(false)
        } catch (e) {
            console.error(e)
        }
    }

    if (error) return <div style={{ padding: 16 }}><p style={{ color: 'red' }}>{error}</p></div>
    if (!user) return <div style={{ padding: 16 }}>Lade Profil…</div>

    return (
        <div className="bg-[#1C3024] min-h-screen w-full">
            <div className="flex flex-row px-8 mx-auto justify-center">
                <h1 className="text-6xl font-bold text-[#38E07A]">インショ</h1>
            </div>
            <p className="text-xl text-white flex justify-center mt-4">
                Verfolgen Sie Ihre tägliche Nahrungsaufnahme und -ausgabe mit Leichtigkeit.
            </p>
            <button
                type="submit"
                className="mt-170 w-full rounded-full bg-[#38E07A] text-black hover:bg-[#38E07A] px-4 py-2 font-medium disabled:opacity-70"
            >
                Loslegen
            </button>

            <Onboarding
                open={showOnboarding}
                defaultName={user?.name ?? ''}
                onClose={() => setShowOnboarding(false)}
                onCompleted={handleCompleted}
            />
        </div>
    )
}