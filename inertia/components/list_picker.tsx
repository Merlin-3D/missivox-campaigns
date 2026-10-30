import { Link } from '@adonisjs/inertia/react'
import { formatNumber } from '~/lib/format'

type PickerList = { id: number; name: string; subscribedCount?: number }

/**
 * Checkboxes to choose lists, with the number of subscribed contacts of
 * each list when known.
 */
export default function ListPicker({
  lists,
  value,
  onChange,
}: {
  lists: PickerList[]
  value: number[]
  onChange: (value: number[]) => void
}) {
  if (lists.length === 0) {
    return (
      <p className="field__hint">
        Aucune liste pour l’instant.{' '}
        <Link route="lists.index" className="il">
          Créer une liste
        </Link>
      </p>
    )
  }

  const toggle = (id: number) =>
    onChange(value.includes(id) ? value.filter((item) => item !== id) : [...value, id])

  return (
    <div className="list-picker">
      {lists.map((list) => (
        <label key={list.id} className="check">
          <input
            type="checkbox"
            checked={value.includes(list.id)}
            onChange={() => toggle(list.id)}
          />
          <span>{list.name}</span>
          {list.subscribedCount !== undefined && (
            <span className="list-picker__count">
              {formatNumber(list.subscribedCount)} inscrit{list.subscribedCount > 1 ? 's' : ''}
            </span>
          )}
        </label>
      ))}
    </div>
  )
}
