import { createContext, useState, useEffect } from 'react'

export type SubdomainContextType = {
    subdomain: string | null,
}

export const SubdomainContext = createContext<SubdomainContextType>({
    subdomain: null,
})

type SubdomainProviderProps = {
    children: React.ReactNode
}

export const SubdomainProvider = ({ children }: SubdomainProviderProps) => {
    const [subdomain, setSubdomain] = useState<string | null>(null)
    useEffect(() => {
        const onHashChange = () => {
            const subdomain = window.location.hostname.split('.')[0]
            if (subdomain === 'www' || subdomain === 'whispershirt') {
                // default subdomain for debug
                setSubdomain('mehmet')
            }else{
                setSubdomain(subdomain)
            }
        }
        onHashChange()
        window.addEventListener('hashchange', onHashChange)
        return () => {
            window.removeEventListener('hashchange', onHashChange)
        }
    }, [])
    return (
        <SubdomainContext.Provider value={{ subdomain }}>
            {children}
        </SubdomainContext.Provider>
    )
}