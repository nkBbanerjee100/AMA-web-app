'use client'
import { SessionProvider } from "next-auth/react"
export default function AuthProvider({
    children,
}: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            {/*  The React.ReactNode type indicates that the children prop can accept any valid React node, including JSX elements, strings, numbers, arrays, fragments, or even functions. */}
            {children}
        </SessionProvider>
    )
}