import type { JenkinsJob } from '../types'

/**
 * 数据源抽象：UI 只依赖这个接口。
 * 现在用 MockJobSource 提供假数据，之后接 Jenkins 时换成 JenkinsJobSource 即可。
 */
export interface JobDataSource {
  /** 拉取所有 job 的当前状态 */
  fetchJobs(): Promise<JenkinsJob[]>
}
