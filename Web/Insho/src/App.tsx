import { Button } from "@/components/ui/button.tsx";
import Aurora from "@/components/Aurora.tsx";


interface option {
    route: string,
    description: string,
}

function App(){

    const options: option[] = [
        { route: "/login" , description: "Login" } ,
        { route: "/register" , description: "Registrieren" } ,
        { route: "/profile" , description: "Profil" } ,
    ]

    const showAurora = () => (
        <Aurora
            colorStops={["#264533", "#38E07A", "#52027a"]}
            blend={0.5}
            speed={0.5}
            amplitude={1}
        />
    );

    const header = () => {
        return (
            <div className="flex flex-col items-center align-text-top gap-2">
                <h1 className="text-4xl font-bold text-[#38E07A]">インショ</h1>
                <h3 className="text-xl font-bold">Insho</h3>
                <p className="text-2xl font-bold">👋Willkommen</p>
                <p className="text-xl font-bold">Verfolgen Sie Ihre tägliche Nahrungsaufnahme und -ausgabe mit
                    Leichtigkeit.</p>
            </div>
        )
    }

    const buttonGroup = ( options: option[] ) => {
        if ( !options) return;
        return <>
            {
                options.map(( option , index ) => {
                    return (
                        <div key={index} className="felx">
                            <a href={option.route} aria-label={option.route} className="cursor-pointer">
                                {
                                    option.route !== "/profile" ?
                                        (
                                            <Button
                                            className="flex w-full bg-[#38E07A] text-black hover:bg-[#38E08B] text-2xl py-6">
                                            {option.description}
                                            </Button>
                                        ):
                                        (
                                            <Button
                                                className="flex w-full bg-gray-600 text-white text-2xl py-6 hover:bg-gray-750">
                                                {option.description}
                                            </Button>
                                        )
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
                "relative isolate min-h-screen text-center grid grid-rows-[auto_0.5fr_auto] items-stretch justify-center bg-[#122117] text-white text-[calc(10px+2vmin)] px-4"
        >
            {header()}
            <div
                className="mb-10 w-full max-w-sm mx-auto space-y-5"
            >
                {buttonGroup(options)}
            </div>
        </div>
        </>
    );
}

export default App
