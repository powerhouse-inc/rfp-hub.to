'use client'

import { openRenown, logout as renownLogout } from '@powerhousedao/reactor-browser'
import { LogIn, LogOut, Loader2, MoreVertical, User } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { ThemeToggle } from '../../theme-toggle'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu'
import ThemeIconLabel from './toogle-theme-label'

const btnSecondary =
  'bg-accent text-foreground hover:bg-muted inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all cursor-pointer'

function RenownButtonLoading() {
  return (
    <span className={btnSecondary}>
      <Loader2 className="h-4 w-4 animate-spin" />
      Loading
    </span>
  )
}

type AuthSnapshot =
  | { status: 'unauthorized' }
  | {
      status: 'authorized'
      displayName?: string
      displayAddress?: string
      profileId?: string
    }

function truncateAddress(address: string): string {
  if (address.length <= 13) return address
  return `${address.slice(0, 7)}...${address.slice(-5)}`
}

type RenownUser = {
  address?: string
  ens?: { name?: string }
  profile?: { username?: string; documentId?: string }
}

type RenownInstance = {
  user?: RenownUser | null
  status?: string
  on?: (event: 'user' | 'status', cb: () => void) => () => void
}

function readAuth(): AuthSnapshot {
  if (typeof window === 'undefined') return { status: 'unauthorized' }
  const renown = (window as unknown as { ph?: { renown?: RenownInstance } }).ph?.renown
  const user = renown?.user
  if (!user) return { status: 'unauthorized' }
  const ensName = user.ens?.name
  const address = user.address
  return {
    status: 'authorized',
    displayName: ensName ?? user.profile?.username,
    displayAddress: address ? truncateAddress(address) : undefined,
    profileId: user.profile?.documentId,
  }
}

/**
 * Reads Renown auth state via the SDK's underlying DOM events rather than
 * the `useRenownAuth` hook. `useRenownAuth` subscribes to the store via
 * `useSyncExternalStore`; the subscription races with `<Renown />` firing
 * its own `setRenown` during its render, triggering a React "Cannot update
 * RenownButtonInner while rendering Renown" warning. A plain `useState` +
 * `addEventListener` combination runs outside the reconciler.
 */
function useRenownAuthSafe(): AuthSnapshot {
  const [auth, setAuth] = useState<AuthSnapshot>(() => readAuth())
  useEffect(() => {
    const refresh = () => setAuth(readAuth())
    refresh()
    window.addEventListener('ph:renownUpdated', refresh)
    let detachUser: (() => void) | undefined
    let detachStatus: (() => void) | undefined
    const r = (window as unknown as { ph?: { renown?: RenownInstance } }).ph?.renown
    if (r?.on) {
      detachUser = r.on('user', refresh)
      detachStatus = r.on('status', refresh)
    }
    return () => {
      window.removeEventListener('ph:renownUpdated', refresh)
      detachUser?.()
      detachStatus?.()
    }
  }, [])
  return auth
}

/**
 * Gate that delays mounting `RenownButtonInner` until `window.ph.renown`
 * exists. The SDK only writes to that slot after `initRenown` finishes its
 * async build, so by the time we observe it, all the racy first-render
 * setState calls have already committed.
 */
function RenownButton() {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    let cancelled = false
    const tick = () => {
      if (cancelled) return
      const r = (window as unknown as { ph?: { renown?: unknown } }).ph?.renown
      if (r) {
        setReady(true)
        return
      }
      window.setTimeout(tick, 50)
    }
    tick()
    return () => {
      cancelled = true
    }
  }, [])
  if (!ready) return <RenownButtonLoading />
  return <RenownButtonInner />
}

function RenownButtonInner() {
  const auth = useRenownAuthSafe()

  if (auth.status === 'authorized') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className={btnSecondary}>
            <User className="h-4 w-4" />
            {auth.displayName ?? auth.displayAddress ?? 'Account'}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="bg-accent border-border/50 z-170 w-44 rounded-lg p-1.5"
        >
          <DropdownMenuItem
            onClick={() => {
              if (auth.profileId) openRenown(auth.profileId)
            }}
            className="cursor-pointer rounded-md px-3 py-2 text-sm font-medium"
          >
            <User className="h-4 w-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-border/50" />
          <DropdownMenuItem
            onClick={() => {
              void renownLogout()
            }}
            className="cursor-pointer rounded-md px-3 py-2 text-sm font-medium text-red-500 focus:text-red-500"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
  return (
    <button type="button" onClick={() => openRenown()} className={btnSecondary}>
      <LogIn className="h-4 w-4" />
      Log in
    </button>
  )
}

function NavbarRightSide() {
  const { theme, setTheme } = useTheme()

  const handleThemeToggle = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <>
      <div className="hidden items-center gap-3 md:flex">
        <ThemeToggle />
        <RenownButton />
      </div>

      <div className="flex items-center md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="text-foreground rounded-md focus:ring-2 focus:ring-offset-2 focus:outline-none"
            >
              <MoreVertical className="h-6 w-6" />
              <span className="sr-only">Open menu</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="z-160 w-56" align="end">
            <DropdownMenuItem className="p-0">
              <RenownButton />
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleThemeToggle} className="cursor-pointer">
              <ThemeIconLabel theme={theme} />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  )
}

export default NavbarRightSide
