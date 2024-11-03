import { createContext, useState, useEffect } from 'react'

export type SubdomainContextType = {
    subdomain: string | null,
    isLocal: boolean
}

export const SubdomainContext = createContext<SubdomainContextType>({
    subdomain: null,
    isLocal: false
})

type SubdomainProviderProps = {
    children: React.ReactNode
}

export const SubdomainProvider = ({ children }: SubdomainProviderProps) => {
    const [subdomain, setSubdomain] = useState<string | null>(null)
    const [isLocal, setIsLocal] = useState<boolean>(false)
    useEffect(() => {
        const onHashChange = () => {
            const subdomain = window.location.hostname.split('.')[0]
            if (subdomain === 'www' || subdomain === 'whispershirt' || subdomain === '127' || subdomain === 'localhost') {
                // default subdomain for debug
                //setSubdomain('mehmet')
                setSubdomain('')
            }else{
                setSubdomain(subdomain)
            }
            // if 'localhost' or '127.0.0.1 is in the URL, set isLocal to true
            const isItLocal = window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1')
            setIsLocal(isItLocal)
        }
        onHashChange()
        window.addEventListener('hashchange', onHashChange)
        return () => {
            window.removeEventListener('hashchange', onHashChange)
        }
    }, [])
    return (
        <SubdomainContext.Provider value={{ subdomain, isLocal }}>
            {children}
        </SubdomainContext.Provider>
    )
}