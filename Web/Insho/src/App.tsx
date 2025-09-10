import { Button } from "@/components/ui/button.tsx";

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

    const header = () => {
        return (
            <div className="flex flex-col items-center align-text-top">
                <h1 className="text-4xl font-bold">インショ</h1>
                <h3 className="text-3xl font-bold">Insho</h3>
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
                            <a href={option.route} aria-label={option.route}>
                                <Button
                                    className="flex w-full bg-[#38E07A] text-black hover:bg-[#38E07A]">
                                    {option.description}
                                </Button>
                            </a>
                        </div>
                    )
                })
            }
        </>
    }

    return (
        <div
            className="text-center grid grid-rows-2 items-center justify-center bg-[#122117] text-white text-[calc(10px+2vmin)]" style={{ gridTemplateRows: 'auto 1fr' }}>
            {header()}
            <div
                className="mt-6 flex-row w-full"
            >
                {buttonGroup(options)}
            </div>
        </div>
    );
}

export default App
