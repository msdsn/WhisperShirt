
import { useContext, useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
    LockIcon,
    ArrowLeftIcon,
    KeyIcon
} from 'lucide-react'
import { supabase } from '@/lib/utils'

import { useNavigate } from 'react-router-dom'
import { SubdomainContext } from '@/context/SubdomainContext'
import { SessionContext } from '@/context/SessionContext'

export default function Login() {
    const { session } = useContext(SessionContext)
    const { isLocal, subdomain } = useContext(SubdomainContext)
    const [inputSubdomain, setInputSubdomain] = useState('')
    const [code, setCode] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate()

    async function signInWithEmail(email_: string, password_: string) {
        try {
            await supabase.auth.signInWithPassword({
                email: email_,
                password: password_,
            })
        } catch (error) {
            console.log("hata var=>")
            console.log(error)
        }
    }
    useEffect(() => {
        if (session) {
            const user = session.user
            const user_subdomain = user?.email?.split('@')[0]
            if (user_subdomain === subdomain) {
                navigate('/')
            } else {
                if (isLocal) {
                    window.location.href = `http://${user_subdomain}.localhost:8000`
                } else {
                    window.location.href = `https://${user_subdomain}.whispershirt.com`
                }
            }
        }
    }, [session])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (code.length !== 6) {
            setError('Kod 6 haneli olmalıdır.')
        } else {
            setError('')
            // Burada giriş kodunu doğrulama işlemi yapılabilir
            fetch('/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    code,
                    subdomain: inputSubdomain
                })
            }).then(res => {
                if (res.ok) {
                    return res.json()
                }
                setError('There was an error. Please try again later.')
                throw new Error('There was an error.')
            }).then(data => {
                console.log("data=>")
                console.log(data)
                console.log("-----------")
                if (data.type === 'error') {
                    console.log(data.message)
                    setError(data.message)
                }
                else if (data.type === 'exist') {
                    signInWithEmail(data.email, data.password)
                }
                else {
                    // Başarılı kullanici olusturma işlemi
                    console.log('Kullanici olusturuldu.')
                    // use navigate
                    data.email && data.password && signInWithEmail(data.email, data.password)
                }
            }).catch(err => {
                console.error(err)
                setError('Bir hata oluştu. Lütfen daha sonra tekrar deneyin.')
            })
        }
    }


    const handleGoBack = () => {
        // Ana sayfaya yönlendirme işlemi burada yapılabilir
        console.log('Ana sayfaya dön')
        // use navigate
        navigate('/')
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <Card className="w-full max-w-md relative">
                <Button
                    variant="ghost"
                    className="absolute left-4 top-4 p-0 w-8 h-8"
                    onClick={ handleGoBack }
                    aria-label="Ana sayfaya dön"
                >
                    <ArrowLeftIcon className="h-4 w-4" />
                </Button>
                <CardHeader className="space-y-1 pt-14">
                    <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
                    <CardDescription className="text-center">
                        You can login with the code sent to you.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={ handleSubmit }>

                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="domain">Your Name</Label>
                                <div className="relative">
                                    <Input className="pl-10" id="domain" type="text" value={ inputSubdomain } onChange={ (e) => setInputSubdomain(e.target.value) } />
                                    <KeyIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={ 20 } />
                                </div>
                                { inputSubdomain && (<><p className="text-sm">Your domain will be:</p><p className="text-sm text-blue-500">{ inputSubdomain }.whispershirt.com</p></>) }
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="code">
                                    Code
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="code"
                                        placeholder="6 digit code"
                                        type="text"
                                        value={ code }
                                        onChange={ (e) => setCode(e.target.value) }
                                        maxLength={ 6 }
                                        className="pl-10"
                                    />
                                    <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={ 20 } />
                                </div>
                            </div>
                            { error && <p className="text-sm text-red-500">{ error }</p> }
                        </div>

                    </form>
                </CardContent>
                <CardFooter>
                    <div className='flex flex-col gap-3 w-full'>
                        <Button className="w-full" onClick={ handleSubmit }>
                            Login
                        </Button>
                    </div>

                </CardFooter>
            </Card>
        </div>
    )
}