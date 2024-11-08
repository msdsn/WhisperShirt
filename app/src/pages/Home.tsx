import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SubdomainContext } from "@/context/SubdomainContext";
import { ArrowRight, PersonStanding } from "lucide-react"
import { useContext, useState, } from "react";
import { Link, useNavigate } from "react-router-dom"
import Subdomain from "./Subdomain";
import { SessionContext } from "@/context/SessionContext";

export default function Home() {
    const { session } = useContext(SessionContext);
    const { subdomain, isLocal } = useContext(SubdomainContext);
    const navigate = useNavigate()

    const [username, setUsername] = useState<string>('');

    // Handle form submission
    const handleSubmit = (e: any) => {
        e.preventDefault();
        if (isLocal) {
            window.location.href = `http://${username}.localhost:8000`;

        } else {
            window.location.href = `https://${username}.whispershirt.com`;
        }
    };
    return (
        <>
            {
                (subdomain !== '' && subdomain !== null) ? (
                    <Subdomain />
                ) : (
                    <div className="min-h-screen flex flex-col">
                        {/* Background Pattern */ }
                        <div className="fixed inset-0 -z-10">
                            <img
                                src="/ws.png"
                                alt="Background pattern"
                                className="object-contain pointer-events-none translate-y-32 p-2 md:p-36 md:translate-y-0"
                            />
                        </div>

                        {/* Header */ }
                        <header className="flex items-center justify-between p-4 md:p-6">
                            {
                                isLocal ? (
                                    <a href="http://localhost:8000" className="text-xl font-bold">
                                        ws
                                    </a>
                                ) : (
                                    <a href="https://whispershirt.com" className="text-xl font-bold">
                                        ws
                                    </a>
                                )
                            }
                            <div className="flex items-center gap-4">
                                {
                                    (session && session.user) ? (
                                        <Button variant="ghost" asChild>
                                            <a href={isLocal?`http://${session.user.email?.split('@')[0]}.localhost:8000`:`https://${session.user.email?.split('@')[0]}.whispershirt.com`}>
                                                <PersonStanding />
                                                { session.user.email?.split('@')[0] }
                                            </a>
                                        </Button>
                                    ) : (
                                        <Button variant="ghost" asChild>
                                            <Link to="/login">Sign In</Link>
                                        </Button>
                                    )
                                }
                                <Button asChild>
                                    <Link to="/shop">Buy a Shirt</Link>
                                </Button>
                            </div>
                        </header>

                        {/* Main Content */ }
                        <main className="flex-1 flex flex-col items-center justify-center px-4">
                            <div className="w-full max-w-2xl space-y-8 text-center">
                                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                                    Who's Shirt you want to talk?
                                </h1>

                                <div className="relative">
                                    <form
                                        onSubmit={ handleSubmit }
                                        className="flex gap-2 p-1.5 border rounded-lg bg-background shadow-sm">
                                        <Input
                                            className="border-0 focus-visible:ring-0"
                                            placeholder="Enter username..."
                                            value={ username }
                                            onChange={ (e) => setUsername(e.target.value) }
                                        />
                                        <Button type="submit" size="sm" className="shrink-0">
                                            <ArrowRight className="h-4 w-4" />
                                            <span className="sr-only">Search</span>
                                        </Button>
                                    </form>
                                </div>

                                <div className="flex flex-wrap justify-center gap-2">
                                    <Button variant="secondary" size="sm" onClick={()=>navigate('/about')}>
                                        What is Whisper Shirts? ↗
                                    </Button>
                                    <Button variant="secondary" size="sm" onClick={()=>navigate("/how")}>
                                        How does a Shirt Talk (Whisper)? ↗
                                    </Button>
                                    <Button variant="secondary" size="sm">
                                        How can i order a Whisper Shirt ↗
                                    </Button>
                                </div>
                            </div>
                        </main>

                        {/* Footer */ }
                        <footer className="border-t">
                            <div className="mx-auto max-w-7xl px-4 py-4 flex flex-wrap justify-center gap-x-2 text-xs">
                                <Link to="/pricing" className="text-muted-foreground hover:text-foreground">
                                    Pricing
                                </Link>
                                <span className="text-muted-foreground">|</span>
                                <Link to="/enterprise" className="text-muted-foreground hover:text-foreground">
                                    Enterprise
                                </Link>
                                <span className="text-muted-foreground">|</span>
                                <Link to="/faq" className="text-muted-foreground hover:text-foreground">
                                    FAQ
                                </Link>
                                <span className="text-muted-foreground">|</span>
                                <Link to="/legal" className="text-muted-foreground hover:text-foreground">
                                    Legal
                                </Link>
                                <span className="text-muted-foreground">|</span>
                                <Link to="/privacy" className="text-muted-foreground hover:text-foreground">
                                    Privacy
                                </Link>
                                <span className="text-muted-foreground">|</span>
                                <Link to="/" className="text-muted-foreground hover:text-foreground">
                                    Ws ↗
                                </Link>
                            </div>
                        </footer>
                    </div>
                )
            }
        </>
    )
}