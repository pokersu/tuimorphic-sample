import type { JenkinsBuildResult, JenkinsJob } from '../types'
import type { JobDataSource } from './types'

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function cloneJob(job: JenkinsJob): JenkinsJob {
  return {
    ...job,
    lastBuild: job.lastBuild ? { ...job.lastBuild } : null,
  }
}

function makeInitialJobs(): JenkinsJob[] {
  const now = Date.now()
  const min = 60_000
  return [
    {
      name: 'backend-build',
      color: 'blue',
      url: '/job/backend-build/',
      lastBuild: {
        number: 128,
        result: 'SUCCESS',
        timestamp: now - 5 * min,
        duration: 124_000,
        building: false,
        url: '/job/backend-build/128/',
      },
    },
    {
      name: 'backend-test',
      color: 'blue_anime',
      url: '/job/backend-test/',
      lastBuild: {
        number: 96,
        timestamp: now - 40_000,
        duration: 0,
        building: true,
        url: '/job/backend-test/96/',
      },
    },
    {
      name: 'frontend-build',
      color: 'red',
      url: '/job/frontend-build/',
      lastBuild: {
        number: 73,
        result: 'FAILURE',
        timestamp: now - 12 * min,
        duration: 89_000,
        building: false,
        url: '/job/frontend-build/73/',
      },
    },
    {
      name: 'deploy-staging',
      color: 'yellow',
      url: '/job/deploy-staging/',
      lastBuild: {
        number: 41,
        result: 'UNSTABLE',
        timestamp: now - 60 * min,
        duration: 210_000,
        building: false,
        url: '/job/deploy-staging/41/',
      },
    },
    {
      name: 'deploy-prod',
      color: 'blue',
      url: '/job/deploy-prod/',
      lastBuild: {
        number: 17,
        result: 'SUCCESS',
        timestamp: now - 120 * min,
        duration: 305_000,
        building: false,
        url: '/job/deploy-prod/17/',
      },
    },
    {
      name: 'nightly-scan',
      color: 'aborted',
      url: '/job/nightly-scan/',
      lastBuild: {
        number: 52,
        result: 'ABORTED',
        timestamp: now - 180 * min,
        duration: 45_000,
        building: false,
        url: '/job/nightly-scan/52/',
      },
    },
    {
      name: 'docs-publish',
      color: 'disabled',
      url: '/job/docs-publish/',
      lastBuild: null,
    },
    {
      name: 'legacy-migration',
      color: 'notbuilt',
      url: '/job/legacy-migration/',
      lastBuild: null,
    },
  ]
}

function randomResult(): JenkinsBuildResult {
  const r = Math.random()
  if (r < 0.7) return 'SUCCESS'
  if (r < 0.9) return 'FAILURE'
  return 'UNSTABLE'
}

function colorForResult(result: JenkinsBuildResult): string {
  switch (result) {
    case 'SUCCESS':
      return 'blue'
    case 'FAILURE':
      return 'red'
    case 'UNSTABLE':
      return 'yellow'
    case 'ABORTED':
      return 'aborted'
    default:
      return 'grey'
  }
}

/**
 * Mock 数据源：模拟 Jenkins 的 job 列表，并在每次轮询时做少量随机演化，
 * 让 dashboard 看起来是"活"的（有 job 开始 / 完成构建）。
 */
export class MockJobSource implements JobDataSource {
  private jobs: JenkinsJob[]

  constructor() {
    this.jobs = makeInitialJobs()
  }

  async fetchJobs(): Promise<JenkinsJob[]> {
    await delay(250 + Math.random() * 500)
    this.evolve()
    return this.jobs.map(cloneJob)
  }

  private evolve(): void {
    const now = Date.now()
    const actionable = this.jobs.filter((j) => {
      const base = j.color.replace(/_anime$/, '')
      return base !== 'disabled' && base !== 'notbuilt'
    })
    if (actionable.length === 0) return

    // 1) 偶尔让一个空闲 job 开始新构建
    const idle = actionable.filter((j) => !j.color.endsWith('_anime'))
    if (idle.length > 0 && Math.random() < 0.35) {
      const job = idle[Math.floor(Math.random() * idle.length)]
      const next = (job.lastBuild?.number ?? 0) + 1
      job.color = `${job.color}_anime`
      job.lastBuild = {
        number: next,
        timestamp: now,
        duration: 0,
        building: true,
        url: `${job.url ?? ''}${next}/`,
      }
    }

    // 2) 偶尔让一个正在构建的 job 完成
    const building = this.jobs.filter((j) => j.color.endsWith('_anime'))
    if (building.length > 0 && Math.random() < 0.6) {
      const job = building[Math.floor(Math.random() * building.length)]
      const number = job.lastBuild?.number ?? 1
      const result = randomResult()
      const duration = 20_000 + Math.floor(Math.random() * 300_000)
      job.color = colorForResult(result)
      job.lastBuild = {
        number,
        result,
        duration,
        building: false,
        timestamp: now - duration,
        url: `${job.url ?? ''}${number}/`,
      }
    }
  }
}
