import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
//import { SubdomainContext } from "@/context/SubdomainContext";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom"
import { motion } from 'framer-motion';
import { Model } from "@/components/Model";
import { SubdomainContext } from "@/context/SubdomainContext";
import { model } from "@/components/Model";

export default function How() {
    const { isLocal } = useContext(SubdomainContext);
    const [showCanvas, setShowCanvas] = useState(false);
    const headerRef = useRef<HTMLElement>(null);
    const footerRef = useRef<HTMLElement>(null);
    const innerH1Ref = useRef<HTMLHeadingElement>(null);
    const innerDivRef = useRef<HTMLDivElement>(null);
    const [canvasHeight, setCanvasHeight] = useState(0);


    const [text, setText] = useState<string>('');
    const audios = Array.from({ length: 9 }, (_, i) => `/how${i + 1}.mp3`);
    const texts = [
        `Hi, I'm talking shirt.`,
        `Yes, I can talk.`,
        `And you can train me.`,
        `When you get me, your friends and family can talk to me.`,
        `For example, you can tell me that if you talk to my brother, say hi to him.`,
        `And if I talk to your brother, I'll say hi.`,
        `Or if you talk to my friend with the red hair, you can tell him to flip me off.`,
        `I'll subtly ask the people I talk to about their hair color and their closeness to you.`,
        `And if the person has red hair, I might snap at them.`,
        `So you will be able to ask people if they want to talk to me in my t-shirt.`,
    ]
    const [typingText, setTypingText] = useState<string>('');
    const [animationState, setAnimationState] = useState<number | null>(null);
    const [explanationStarted, setExplanationStarted] = useState(false);

    useEffect(() => {
        const checkIsModelHasBeenSet = setInterval(() => {
            if (model) {
                clearInterval(checkIsModelHasBeenSet);
                setAnimationState(1);
            }
        }, 100);
        return () => clearInterval(checkIsModelHasBeenSet);
    }, []);

    useEffect(() => {
        console.log(`animationState-->: ${animationState}`)
        if (animationState && explanationStarted) {
            // convert to base64
            fetch(audios[animationState - 1])
                .then(response => response.blob())
                .then(blob => {
                    const reader = new FileReader();
                    reader.readAsDataURL(blob);
                    reader.onloadend = function () {
                        const base64data = reader.result;
                        setText(texts[animationState - 1]);
                        model.speak(
                            base64data,
                            {
                                onFinish: () => {
                                    console.log(`bittiiiii`)
                                    setTimeout(() => {
                                        setAnimationState(prev => (prev === 9 ? null : (prev ? prev + 1 : 0 )));
                                    }, 200);
                                },
                            }
                        )
                    }
                });
        }
    }, [animationState, explanationStarted]);

    useEffect(() => {
        let i = 0;
        if (!text) return 
        setTypingText('');
        setTypingText(`${text.charAt(0)}`)
        const typingInterval = setInterval(() => {
            if (i < text.length) {
                setTypingText(prev => {
                    return prev + text.charAt(i)
                })
                i++
            } else {
                clearInterval(typingInterval)
            }
        }, 50)
        return () => clearInterval(typingInterval)
    }, [text])
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
                    <Button asChild>
                        <Link to="/buy">Buy a shirt</Link>
                    </Button>
                </div>
            </header>

            {/* Main Content */ }
            <main className="flex-1 flex flex-col items-center justify-center px-4">
                <div className="relative w-full max-w-2xl space-y-8 text-center">
                    <h1 ref={ innerH1Ref } id='dene' className="text-4xl md:text-5xl font-bold tracking-tight">
                        How does a Shirt Talk?
                    </h1>
                    <div ref={ innerDivRef } className="!mt-0 !mb-0 py-10">
                        {
                            explanationStarted ? (
                                <motion.form
                                    onSubmit={ (e) => { e.preventDefault() } }
                                    initial={ { borderRadius: 6 } }
                                    animate={ { borderRadius: 36 } }
                                    transition={ { ease: "linear", duration: 3.5 } }
                                    className="flex gap-2 p-1.5 border rounded-lg bg-background shadow-sm">
                                    <Input
                                        className="border-0 focus-visible:ring-0 rounded-[20px]"
                                        placeholder="Ask v0 a question..."
                                        disabled={ true }
                                        isLarge={ true }
                                        value={ typingText }
                                    />
                                </motion.form>
                            ) : (
                                <Button onClick={ () => setExplanationStarted(true) }>Start explanation</Button>
                            )
                        }

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
                                <Model userInput={ '' } setModelResponse={ (response) => { console.log(response) } } setIsModelWhispering={ () => { } } startThinking={ () => { } } />
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