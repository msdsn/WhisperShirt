import React, { createContext, useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/utils";


export type SessionContextType = {
    session: Session | null,
    setSession: (session: Session) => void
}

const SessionContext = createContext<SessionContextType>({
    session: null,
    setSession: () => { }
})

type SessionProviderProps = {
    children: React.ReactNode
}

export const SessionProvider = ({ children }: SessionProviderProps) => {
    const [session, setSession] = useState<Session | null>(null)
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
        })

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
        })

        return () => subscription.unsubscribe()
    }, [])
    return (
        <SessionContext.Provider value={ { session, setSession } }>
            { children }
        </SessionContext.Provider>
    )
}