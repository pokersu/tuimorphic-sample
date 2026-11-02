import type { JenkinsJob } from '../types'

/** 归一化后的 job 状态 */
export type JobStatus =
  | 'building'
  | 'success'
  | 'failure'
  | 'unstable'
  | 'aborted'
  | 'disabled'
  | 'notbuilt'
  | 'unknown'

export interface ParsedJob {
  status: JobStatus
  building: boolean
}

/** 把 Jenkins 的 color 字段解析成结构化状态 */
export function parseColor(color: string): ParsedJob {
  const building = color.endsWith('_anime')
  const base = building ? color.slice(0, -'_anime'.length) : color
  switch (base) {
    case 'blue':
      return { status: 'success', building }
    case 'red':
      return { status: 'failure', building }
    case 'yellow':
      return { status: 'unstable', building }
    case 'aborted':
      return { status: 'aborted', building }
    case 'disabled':
      return { status: 'disabled', building }
    case 'notbuilt':
    case 'grey':
    case 'gray':
      return { status: 'notbuilt', building }
    default:
      return { status: 'unknown', building }
  }
}

/** 状态对应的展示文本 */
export function statusLabel(status: JobStatus): string {
  switch (status) {
    case 'building':
      return 'BUILDING'
    case 'success':
      return 'SUCCESS'
    case 'failure':
      return 'FAILURE'
    case 'unstable':
      return 'UNSTABLE'
    case 'aborted':
      return 'ABORTED'
    case 'disabled':
      return 'DISABLED'
    case 'notbuilt':
      return 'NOT BUILT'
    default:
      return 'UNKNOWN'
  }
}

/** 状态对应的 Badge variant */
export function statusVariant(
  status: JobStatus,
): 'default' | 'success' | 'warning' | 'error' | 'info' {
  switch (status) {
    case 'success':
      return 'success'
    case 'failure':
      return 'error'
    case 'unstable':
    case 'aborted':
      return 'warning'
    case 'building':
      return 'info'
    default:
      return 'default'
  }
}

/** 时长格式化：123456 ms -> "2m 3s" */
export function formatDuration(ms?: number): string {
  if (ms == null || Number.isNaN(ms)) return '—'
  const totalSeconds = Math.floor(ms / 1000)
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

/** 相对时间格式化：timestamp -> "刚刚" / "5 分钟前" / "2 小时前" / "3 天前" */
export function formatRelativeTime(timestamp?: number, now = Date.now()): string {
  if (timestamp == null) return '—'
  const diff = now - timestamp
  const s = Math.floor(diff / 1000)
  if (s < 5) return '刚刚'
  if (s < 60) return `${s} 秒前`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m} 分钟前`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} 小时前`
  const d = Math.floor(h / 24)
  return `${d} 天前`
}

/** 概览统计 */
export interface JobStats {
  total: number
  building: number
  success: number
  failure: number
  unstable: number
  other: number
}

export function computeStats(jobs: JenkinsJob[]): JobStats {
  const stats: JobStats = {
    total: jobs.length,
    building: 0,
    success: 0,
    failure: 0,
    unstable: 0,
    other: 0,
  }
  for (const job of jobs) {
    const { status } = parseColor(job.color)
    switch (status) {
      case 'building':
        stats.building += 1
        break
      case 'success':
        stats.success += 1
        break
      case 'failure':
        stats.failure += 1
        break
      case 'unstable':
        stats.unstable += 1
        break
      default:
        stats.other += 1
        break
    }
  }
  return stats
}
