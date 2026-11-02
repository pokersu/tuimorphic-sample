import { Card, Text } from 'tuimorphic'
import type { JobStats } from '../lib/jenkins'

type StatKey = 'building' | 'success' | 'failure' | 'unstable' | 'other'

const ITEMS: { key: StatKey; label: string; color: string }[] = [
  { key: 'building', label: 'BUILDING', color: 'var(--theme-accent)' },
  { key: 'success', label: 'SUCCESS', color: 'var(--theme-success)' },
  { key: 'failure', label: 'FAILURE', color: 'var(--theme-error)' },
  { key: 'unstable', label: 'UNSTABLE', color: 'var(--theme-warning)' },
  { key: 'other', label: 'OTHER', color: 'var(--theme-text-muted)' },
]

export function StatsBar({ stats }: { stats: JobStats }) {
  return (
    <div className="stats-bar">
      <Card title="TOTAL" className="stat-card">
        <div className="stat-value">
          <Text size="xl" mono>
            {stats.total}
          </Text>
        </div>
      </Card>
      {ITEMS.map((item) => (
        <Card key={item.key} title={item.label} className="stat-card">
          <div className="stat-value" style={{ color: item.color }}>
            <Text size="xl" mono>
              {stats[item.key]}
            </Text>
          </div>
        </Card>
      ))}
    </div>
  )
}
