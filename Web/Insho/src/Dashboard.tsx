import { useNavigate } from "@tanstack/react-router";
import { useEffect , useState } from "react";
import { me as apiMe , type User, getDashboard, setOnboarded } from "@/service/api.ts";
import { Onboarding, type OnboardingData } from "@/Onboarding.tsx";
import "./auth/styleSheets/Dashboard.css"

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

    const toScanPage=()=>{
        console.log("Hallo Welt")
        navigate({to: '/login'})
    }

    if (error) return <div style={{ padding: 16 }}><p style={{ color: 'red' }}>{error}</p></div>
    if (!user) return <div style={{ padding: 16 }}>Lade Profil…</div>

    return (
        <div className="dashboard-background">
            <h1>インショ</h1>
            <h2>
                Verfolgen Sie Ihre tägliche Nahrungsaufnahme und -ausgabe mit Leichtigkeit.
            </h2>
            <div className="outer-button-container">
                <div className="inner-button-container">
                <button onClick={()=>toScanPage()}>
                    Zur Charge Coupled Device Funktion
                </button>
                <button>
                    Niederschreibung der Essensverhältnisse
                </button>
                </div>
            </div>
            <Onboarding
                open={showOnboarding}
                defaultName={user?.name ?? ''}
                onClose={() => setShowOnboarding(false)}
                onCompleted={handleCompleted}
            />
        </div>
    )
}