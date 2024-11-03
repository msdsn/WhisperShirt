import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
//import { SubdomainContext } from "@/context/SubdomainContext";
import { ArrowRight, PersonStanding } from "lucide-react"
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom"
import { motion } from 'framer-motion';
import { Model } from "@/components/Model";
import { SubdomainContext } from "@/context/SubdomainContext";
import { SessionContext } from "@/context/SessionContext";

export default function Subdomain() {
    const { session } = useContext(SessionContext);
    const { isLocal } = useContext(SubdomainContext);
    const [showCanvas, setShowCanvas] = useState(false);
    const headerRef = useRef<HTMLElement>(null);
    const footerRef = useRef<HTMLElement>(null);
    const innerH1Ref = useRef<HTMLHeadingElement>(null);
    const innerDivRef = useRef<HTMLDivElement>(null);
    const [canvasHeight, setCanvasHeight] = useState(0);

    const [userInput, setUserInput] = useState<string>('');
    const [sendInput, setSendInput] = useState<string>('');
    const [typingText, setTypingText] = useState<string>('')
    const [isModelWhispering, setIsModelWhispering] = useState(false);

    useEffect(() => {
        if (!isModelWhispering) {
            setTypingText('')
            return;
        }
        let i = 0
        if (!userInput) return setTypingText('')
        console.log(`text degisti...: ${userInput}`)
        //setTypingText(`${userInput.charAt(0)}`)
        const typingInterval = setInterval(() => {
            if (i < userInput.length) {
                console.log(userInput.charAt(i))
                setTypingText(prev => {
                    console.log(`
                        prev: ${prev}
                        userInput.charAt(i): ${userInput.charAt(i)}`)
                    return prev + userInput.charAt(i)
                })
                i++
            } else {
                clearInterval(typingInterval)
            }
        }, 50)
        return () => clearInterval(typingInterval)
    }, [userInput, isModelWhispering])

    useEffect(() => {
        console.log(`typingText: ${typingText}`)
    }, [typingText])

    const closeModelWhispering = () => {
        setIsModelWhispering(false);
        setUserInput('');
    }

    const handleSubmit = (e: any) => {
        e.preventDefault();
        setSendInput(userInput);
        setUserInput('');
    };
    const setModelResponse = (response: string) => {
        setUserInput(response);
        setIsModelWhispering(true);
    }



    // Show canvas after 0.3 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowCanvas(true);
        }, 300);
        return () => clearTimeout(timer);
    }, []);
    useEffect(() => {
        updateCanvasHeight();
        window.addEventListener('resize', updateCanvasHeight);
        return () => window.removeEventListener('resize', updateCanvasHeight);
    }, [headerRef, footerRef, innerH1Ref, innerDivRef]);

    const updateCanvasHeight = useCallback(() => {


        setTimeout(() => {
            if (!headerRef.current || !footerRef.current || !innerH1Ref.current || !innerDivRef.current) return;
            const windowHeight = window.innerHeight;
            console.log(`
            windowHeight: ${windowHeight}
            headerRef.current.clientHeight: ${headerRef.current.clientHeight}
            innerH1Ref.current.clientHeight: ${innerH1Ref.current.clientHeight}
            innerDivRef.current.clientHeight: ${innerDivRef.current.clientHeight}
            topDivBottom: ${headerRef.current.clientHeight + innerH1Ref.current.clientHeight + innerDivRef.current.clientHeight}
            footerHeight: ${footerRef.current.offsetHeight}
            `)
            const topDivBottom = headerRef.current.clientHeight + innerH1Ref.current.clientHeight + innerDivRef.current.clientHeight;
            const footerHeight = footerRef.current.offsetHeight;
            const availableHeight = windowHeight - topDivBottom - footerHeight;
            setCanvasHeight(availableHeight);
        }, 40);


    }, []);


    return (
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
            <header ref={ headerRef } className="flex items-center justify-between p-4 md:p-6">

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
                                <>
                                    <PersonStanding />
                                    { session.user.email?.split('@')[0] }
                                </>
                            </Button>
                        ) : (
                            <Button asChild>
                                <Link to="/login">Sign In</Link>
                            </Button>
                        )
                    }
                </div>
            </header>

            {/* Main Content */ }
            <main className="flex-1 flex flex-col items-center justify-center px-4">
                <div className="relative w-full max-w-2xl space-y-8 text-center">
                    <h1 ref={ innerH1Ref } id='dene' className="text-4xl md:text-5xl font-bold tracking-tight">
                        What can I help you ship?
                    </h1>
                    <div ref={ innerDivRef } className="!mt-0 !mb-0 py-10">
                        <motion.form
                            onSubmit={ handleSubmit }
                            initial={ { borderRadius: 6 } }
                            animate={ { borderRadius: 36 } }
                            transition={ { ease: "linear", duration: 3.5 } }

                            className="flex gap-2 p-1.5 border rounded-lg bg-background shadow-sm">
                            <Input
                                className="border-0 focus-visible:ring-0 rounded-[20px]"
                                placeholder="Ask v0 a question..."
                                disabled={ isModelWhispering }
                                isLarge={ isModelWhispering }
                                value={ isModelWhispering ? typingText : userInput }
                                onChange={ e => { setUserInput(e.target.value) } }
                                onFocus={ closeModelWhispering }
                                onClick={ closeModelWhispering }
                            />

                            {
                                !isModelWhispering && (
                                    <motion.div
                                        initial={ { marginRight: 0, borderRadius: 6 } }
                                        animate={ { marginRight: 10, borderRadius: 26 } }
                                        transition={ { ease: "linear", duration: 1 } }
                                        className="shrink-0"
                                    >
                                        <Button type="submit" size="sm" >
                                            <ArrowRight className="h-4 w-4" />
                                            <span className="sr-only">Send</span>
                                        </Button>
                                    </motion.div>
                                )
                            }


                        </motion.form>
                    </div>
                    {
                        showCanvas && (
                            <div style={
                                {
                                    height: canvasHeight,
                                    maxHeight: canvasHeight
                                }
                            }
                                className="w-full !mt-0 !mb-0"
                            >
                                <Model userInput={ sendInput } setModelResponse={ setModelResponse } setIsModelWhispering={ setIsModelWhispering } />
                            </div>

                        )
                    }
                </div >
            </main >

            {/* Footer */ }
            <footer ref={ footerRef } className="border-t" >
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
                    <Link to="/legacy" className="text-muted-foreground hover:text-foreground">
                        Legacy v0
                    </Link>
                    <span className="text-muted-foreground">|</span>
                    <Link to="/vercel" className="text-muted-foreground hover:text-foreground">
                        Vercel ↗
                    </Link>
                </div>
            </footer>
        </div >
    )
}