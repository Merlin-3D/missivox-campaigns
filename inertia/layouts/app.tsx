import Logo from '~/components/logo'
import { type ReactNode } from 'react'
import { usePage } from '@inertiajs/react'
import { Form } from '@adonisjs/inertia/react'
import FlashToasts from '~/components/flash_toasts'
import ThemeToggle from '~/components/theme_toggle'
import NavLink, { type NavItem } from '~/components/nav_link'
import {
  LayoutDashboard,
  LayoutTemplate,
  ListChecks,
  LogOut,
  Send,
  Settings,
  Users,
} from 'lucide-react'

const nav: NavItem[] = [
  { label: 'Tableau de bord', route: 'dashboard', icon: LayoutDashboard },
  { label: 'Campagnes', route: 'campaigns.index', icon: Send },
  { label: 'Contacts', route: 'contacts.index', icon: Users },
  { label: 'Listes', route: 'lists.index', icon: ListChecks },
  { label: 'Modèles', route: 'templates.index', icon: LayoutTemplate },
]

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user } = usePage().props

  return (
    <>
      <div className="airmail" />
      <header className="topbar">
        <div className="topbar__inner">
          <Logo />
          <nav className="topbar__nav" aria-label="Navigation principale">
            {nav.map(({ label, route, icon: Icon }) => (
              <NavLink key={label} route={route} className="topbar__link">
                {Icon && <Icon size={16} />}
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="topbar__right">
            <NavLink route="settings.edit" className="iconbtn">
              <Settings size={17} />
              <span className="sr-only">Réglages</span>
            </NavLink>
            <ThemeToggle />
            {user && (
              <span className="topbar__user" title={user.fullName ?? user.email}>
                {user.initials}
              </span>
            )}
            <Form route="session.destroy">
              <button type="submit" className="iconbtn" title="Se déconnecter">
                <LogOut size={17} />
                <span className="sr-only">Se déconnecter</span>
              </button>
            </Form>
          </div>
        </div>
      </header>

      <main className="app-main">{children}</main>
      <FlashToasts />
    </>
  )
}
