import { type ReactNode } from 'react'
import { type LucideIcon } from 'lucide-react'

export default function EmptyState({
  icon: Icon,
  title,
  children,
  action,
}: {
  icon: LucideIcon
  title: string
  children?: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="empty">
      <div className="empty__mark">
        <Icon size={22} />
      </div>
      <h2>{title}</h2>
      {children && <p>{children}</p>}
      {action && <div style={{ marginTop: 6 }}>{action}</div>}
    </div>
  )
}
