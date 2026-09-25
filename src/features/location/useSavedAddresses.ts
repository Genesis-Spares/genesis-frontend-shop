'use client'

import { useCallback, useEffect, useState } from 'react'
import { addressesApi, type SavedAddress } from '@/lib/api'
import { useAuth } from '@/features/auth/AuthContext'
import { getToken } from '@/features/auth/token'

/** The signed-in shopper's saved delivery addresses (default first). `null` while loading. */
export function useSavedAddresses() {
    const { user, ready } = useAuth()
    const [loaded, setLoaded] = useState<{ user: unknown; list: SavedAddress[] } | null>(null)
    const [version, setVersion] = useState(0)

    useEffect(() => {
        const token = getToken()
        if (!user || !token) return
        let live = true
        addressesApi.list(token)
            .then((list) => live && setLoaded({ user, list }))
            .catch(() => live && setLoaded({ user, list: [] }))
        return () => { live = false }
    }, [user, version])

    const reload = useCallback(() => setVersion((v) => v + 1), [])
    // null until we know who is signed in and their list has loaded
    const addresses = !ready ? null : !user ? [] : loaded?.user === user ? loaded.list : null
    return { addresses, reload }
}
