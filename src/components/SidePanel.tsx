import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Badge,
  Text,
} from 'tuimorphic'
import type { JenkinsJob } from '../types'
import type { JobStatus } from '../lib/jenkins'
import { formatRelativeTime, statusLabel, statusVariant } from '../lib/jenkins'

const LEGEND: { status: JobStatus; desc: string }[] = [
  { status: 'success', desc: '构建成功' },
  { status: 'failure', desc: '构建失败' },
  { status: 'unstable', desc: '不稳定（测试未通过）' },
  { status: 'aborted', desc: '已中止' },
  { status: 'disabled', desc: '已禁用' },
  { status: 'notbuilt', desc: '从未构建' },
]

const SECTION_LABEL: Record<string, string> = {
  dag: 'DAG',
  agents: 'AGENTS',
  k8s: 'K8S',
}

export function SidePanel({
  section,
  jobs,
  lastUpdated,
}: {
  section: string | null
  jobs: JenkinsJob[]
  lastUpdated: Date | null
}) {
  if (section !== 'jenkins') {
    const label = SECTION_LABEL[section ?? ''] ?? 'SECTION'
    return (
      <div className="side-panel">
        <Accordion type="single" defaultValue={['info']}>
          <AccordionItem value="info">
            <AccordionTrigger>ABOUT</AccordionTrigger>
            <AccordionContent>
              <Text variant="muted">
                {label} 面板尚未接入数据源，暂无详情可展示。
              </Text>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    )
  }

  const recent = [...jobs]
    .filter((j) => j.lastBuild?.timestamp != null)
    .sort(
      (a, b) =>
        (b.lastBuild?.timestamp ?? 0) - (a.lastBuild?.timestamp ?? 0),
    )
    .slice(0, 6)

  return (
    <div className="side-panel">
      <Accordion type="multiple" defaultValue={['legend', 'activity']}>
        <AccordionItem value="legend">
          <AccordionTrigger>LEGEND</AccordionTrigger>
          <AccordionContent>
            {LEGEND.map((item) => (
              <div key={item.status} className="legend-row">
                <Badge variant={statusVariant(item.status)}>
                  {statusLabel(item.status)}
                </Badge>
                <Text variant="muted">{item.desc}</Text>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="activity">
          <AccordionTrigger>RECENT ACTIVITY</AccordionTrigger>
          <AccordionContent>
            {recent.length === 0 ? (
              <Text variant="muted">NO ACTIVITY</Text>
            ) : (
              recent.map((job) => (
                <div key={job.name} className="activity-row">
                  <Text truncate>{job.name}</Text>
                  <Text variant="muted">
                    {formatRelativeTime(job.lastBuild?.timestamp)}
                  </Text>
                </div>
              ))
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="source">
          <AccordionTrigger>DATA SOURCE</AccordionTrigger>
          <AccordionContent>
            <div className="source-row">
              <Text variant="muted">SOURCE</Text>
              <Text mono>MOCK</Text>
            </div>
            <div className="source-row">
              <Text variant="muted">POLL</Text>
              <Text mono>5s</Text>
            </div>
            <div className="source-row">
              <Text variant="muted">LAST UPDATE</Text>
              <Text mono>
                {lastUpdated ? lastUpdated.toLocaleTimeString() : '—'}
              </Text>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
