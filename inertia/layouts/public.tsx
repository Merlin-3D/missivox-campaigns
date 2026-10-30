import { type ReactNode } from 'react'
import FlashToasts from '~/components/flash_toasts'

/**
 * Pages opened by email recipients: no navigation, no account.
 */
export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="public">{children}</div>
      <FlashToasts />
    </>
  )
}
