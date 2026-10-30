/**
 * A small bar chart. Each point may carry a second value, drawn stacked in
 * the alternate color.
 */
export default function BarChart({
  points,
  label,
  secondaryLabel,
  axis,
}: {
  points: { key: string; value: number; secondary?: number; title: string }[]
  label: string
  secondaryLabel?: string
  axis: [string, string]
}) {
  const max = Math.max(1, ...points.map((point) => point.value + (point.secondary ?? 0)))

  return (
    <div>
      <div className="chart" role="img" aria-label={label}>
        {points.map((point) => {
          const total = point.value + (point.secondary ?? 0)
          return (
            <div key={point.key} className="chart__col" title={point.title}>
              {total === 0 ? (
                <div className="chart__bar chart__bar--empty" style={{ height: 2 }} />
              ) : (
                <>
                  {!!point.secondary && (
                    <div
                      className="chart__bar chart__bar--alt"
                      style={{ height: `${(point.secondary / max) * 100}%` }}
                    />
                  )}
                  {!!point.value && (
                    <div
                      className="chart__bar"
                      style={{ height: `${(point.value / max) * 100}%` }}
                    />
                  )}
                </>
              )}
            </div>
          )
        })}
      </div>
      <div className="chart__axis">
        <span>{axis[0]}</span>
        <span>{axis[1]}</span>
      </div>
      {secondaryLabel && (
        <div className="legend" style={{ marginTop: 10 }}>
          <span className="legend__item">
            <span className="legend__swatch" /> {label}
          </span>
          <span className="legend__item">
            <span className="legend__swatch legend__swatch--alt" /> {secondaryLabel}
          </span>
        </div>
      )}
    </div>
  )
}
