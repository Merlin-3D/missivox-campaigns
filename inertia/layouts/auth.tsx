import { type ReactNode } from 'react'
import { LogoMark } from '~/components/logo'
import Postmark from '~/components/postmark'
import FlashToasts from '~/components/flash_toasts'
import ThemeToggle from '~/components/theme_toggle'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="auth">
        <div className="auth__form-col">
          <span className="brand">
            <LogoMark />
            <span className="brand__name">Missivox</span>
          </span>
          <div className="auth__form-wrap">{children}</div>
        </div>

        <aside className="auth__aside">
          <div className="auth__aside-top">
            <ThemeToggle />
          </div>

          <div className="auth__letter">
            <Postmark ring="Envoyée par Missivox" date="Aujourd'hui" size={96} />
            <p>
              Bonjour Camille,
              <br />
              <br />
              Nos nouveautés de la saison sont arrivées. Comme vous êtes cliente depuis longtemps,
              vous les découvrez avant tout le monde.
            </p>
          </div>

          <p className="auth__note">
            Écrivez à vos clients, choisissez qui reçoit quoi, et suivez qui a lu et cliqué.
          </p>
        </aside>
      </div>
      <FlashToasts />
    </>
  )
}
