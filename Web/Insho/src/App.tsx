import { Button } from "@/components/ui/button.tsx";
import Aurora from "@/components/Aurora.tsx";
import TextType from "@/components/TextType.tsx";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { getToken } from "@/service/api.ts";


interface option {
    route: string,
    description: string,
}

function App(){

    const options: option[] = [
        { route: "/login" , description: "Login" } ,
        { route: "/register" , description: "Registrieren" } ,
    ];

    const navigate = useNavigate();

    // On mount, if user is logged in, redirect to dashboard
    useEffect(() => {
        if (getToken()) {
            navigate({ to: "/dashboard" });
        }
    }, [navigate]);

    const showAurora = () => (
        <Aurora
            colorStops={["#264533", "#38E07A", "#52027a"]}
            blend={0.5}
            speed={0.5}
            amplitude={1}
        />
    );

    const showTextGroup = () => {
        return (
            <div className="flex flex-col items-center align-text-top gap-3 overflow-hidden">
                <div className="pb-4">
                <TextType
                    className="text-6xl text-[#38E07A]"
                    text={["インショ","Inshō", "Insho", "Essen & Trinken"]}
                    textColors={["#38E07A"]}
                    typingSpeed={75}
                    pauseDuration={1500}
                    deletingSpeed={500}
                    showCursor={true}
                    cursorCharacter="▌"
                />
                </div>
                <p className="text-2xl font-bold">👋Willkommen</p>
                <p className="text-xl font-bold">Verfolgen Sie Ihre tägliche Nahrungsaufnahme und -ausgabe mit
                    Leichtigkeit.</p>
            </div>
        )
    }

    const ShowButtonGroup = ( options: option[] ) => {
        if ( !options) return;
        return <>
            {
                options.map(( option , index ) => {
                    return (
                        <div key={index} className="felx">
                            <a href={option.route} aria-label={option.route} className="cursor-pointer">
                                {
                                            <Button
                                            className="flex rounded-full w-full bg-[#38E07A] text-black hover:bg-[#38E08B] text-2xl">
                                            {option.description}
                                            </Button>
                                        
                                }

                            </a>
                        </div>
                    )
                })
            }
        </>
    }

    return (
        <>
            {showAurora()}
        <div
            className=
                "relative isolate min-h-screen text-center grid grid-rows-[auto_0.25fr_auto] items-stretch justify-center bg-[#122117] text-white text-[calc(10px+2vmin)] px-4"
        >
            {showTextGroup()}
            <div
                className="mb-10 w-full max-w-sm mx-auto space-y-4"
            >
                {ShowButtonGroup(options)}
            </div>
        </div>
        </>
    );
}

export default App
