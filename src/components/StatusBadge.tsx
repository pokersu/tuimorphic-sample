import { Badge } from 'tuimorphic'
import { parseColor, statusLabel, statusVariant } from '../lib/jenkins'

export function StatusBadge({ color }: { color: string }) {
  const { status } = parseColor(color)
  return <Badge variant={statusVariant(status)}>{statusLabel(status)}</Badge>
}
