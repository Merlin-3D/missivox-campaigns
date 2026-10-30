import Page from '~/components/page'
import { type ReactNode } from 'react'
import { SlidersHorizontal, Users } from 'lucide-react'
import NavLink, { type NavItem } from '~/components/nav_link'

const items: NavItem[] = [
  { label: 'Envoi et expéditeur', route: 'settings.edit', icon: SlidersHorizontal },
  { label: 'Équipe et sécurité', route: 'team.index', icon: Users },
]

/**
 * Nest it under the app layout from each settings page:
 * `Page.layout = [AppLayout, SettingsLayout]`
 */
export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <Page
      title="Réglages"
      description="Expéditeur par défaut, cadence d'envoi et accès de l'équipe."
    >
      <div className="sidebar-layout">
        <nav className="sidebar-layout__nav" aria-label="Réglages">
          {items.map(({ label, route, icon: Icon }) => (
            <NavLink key={label} route={route} exact className="sidebar-layout__item">
              {Icon && <Icon size={16} />}
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-layout__content">{children}</div>
      </div>
    </Page>
  )
}
