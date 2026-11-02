import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
} from 'tuimorphic'
import type { JenkinsJob } from '../types'
import { formatDuration, formatRelativeTime, parseColor } from '../lib/jenkins'
import { StatusBadge } from './StatusBadge'

export function JobTable({ jobs }: { jobs: JenkinsJob[] }) {
  if (jobs.length === 0) {
    return <Text variant="muted">NO JOBS FOUND</Text>
  }
  return (
    <Table bordered striped size="compact">
      <TableHeader>
        <TableRow>
          <TableHead>JOB</TableHead>
          <TableHead align="center">STATUS</TableHead>
          <TableHead align="right">BUILD</TableHead>
          <TableHead align="center">RESULT</TableHead>
          <TableHead align="right">DURATION</TableHead>
          <TableHead align="right">LAST RUN</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {jobs.map((job) => (
          <JobRow key={job.name} job={job} />
        ))}
      </TableBody>
    </Table>
  )
}

function JobRow({ job }: { job: JenkinsJob }) {
  const { building } = parseColor(job.color)
  const build = job.lastBuild
  return (
    <TableRow>
      <TableCell truncate>{job.name}</TableCell>
      <TableCell align="center">
        <StatusBadge color={job.color} />
      </TableCell>
      <TableCell align="right" numeric>
        {build ? `#${build.number}` : '—'}
      </TableCell>
      <TableCell align="center">
        {building ? (
          <Text variant="muted">RUNNING…</Text>
        ) : (
          <Text mono>{build?.result ?? '—'}</Text>
        )}
      </TableCell>
      <TableCell align="right" numeric>
        {formatDuration(build?.duration)}
      </TableCell>
      <TableCell align="right" numeric>
        {formatRelativeTime(build?.timestamp)}
      </TableCell>
    </TableRow>
  )
}
