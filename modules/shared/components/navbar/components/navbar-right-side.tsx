'use client'

import { useRenownAuth } from '@powerhousedao/reactor-browser'
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

/**
 * Gate that delays mounting `RenownButtonInner` (which subscribes to the
 * Renown store via `useRenownAuth`) until after the first client render.
 * Subscribing inside the same commit pass that `<Renown />` fires its
 * internal `setRenown(null)` side effect triggers a React "setState during
 * another component's render" warning AND can mis-seat the post-redirect
 * `?user=` login attempt (the user ends up having to log in twice).
 *
 * Critically, the inner component is only *rendered* after the gate flips,
 * so the hook is never called during the racy first commit.
 */
function RenownButton() {
  const [mounted, setMounted] = useState(false)
  // Defer subscribing until after `<Renown />`’s `useRenownInit` has finished the
  // current turn (avoids React 19 "Cannot update … RenownButtonInner … while
  // rendering … Renown" when Renown and navbar were siblings).
  useEffect(() => {
    let t2 = 0
    const t1 = window.requestAnimationFrame(() => {
      t2 = window.requestAnimationFrame(() => setMounted(true))
    })
    return () => {
      window.cancelAnimationFrame(t1)
      window.cancelAnimationFrame(t2)
    }
  }, [])
  if (!mounted) return <RenownButtonLoading />
  return <RenownButtonInner />
}

function RenownButtonInner() {
  const auth = useRenownAuth()

  if (auth.status === 'loading' || auth.status === 'checking') {
    return <RenownButtonLoading />
  }
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
            onClick={auth.openProfile}
            className="cursor-pointer rounded-md px-3 py-2 text-sm font-medium"
          >
            <User className="h-4 w-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-border/50" />
          <DropdownMenuItem
            onClick={() => {
              void auth.logout()
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
    <button type="button" onClick={auth.login} className={btnSecondary}>
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
