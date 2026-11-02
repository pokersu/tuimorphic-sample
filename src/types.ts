/**
 * Jenkins 数据模型 —— 与 Jenkins 原生 JSON API 的字段保持一致，
 * 之后把 mock 换成真实 Jenkins 数据源时，UI 层无需改动。
 */

/** Jenkins 构建结果（对应 lastBuild.result） */
export type JenkinsBuildResult =
  | 'SUCCESS'
  | 'FAILURE'
  | 'UNSTABLE'
  | 'ABORTED'
  | 'NOT_BUILT'

/** 一次构建 */
export interface JenkinsBuild {
  /** 构建编号 */
  number: number
  /** 构建结果；进行中时通常为空 */
  result?: JenkinsBuildResult
  /** 开始时间（毫秒 epoch） */
  timestamp?: number
  /** 已用时长（毫秒） */
  duration?: number
  /** 是否正在构建 */
  building?: boolean
  /** 构建详情页 URL */
  url?: string
}

/** 一个 Jenkins job（项目） */
export interface JenkinsJob {
  /** job 名称 */
  name: string
  /** Jenkins 状态颜色：blue/red/yellow/aborted/disabled/notbuilt/grey，加 "_anime" 后缀表示正在构建 */
  color: string
  /** job 页面 URL */
  url?: string
  /** 最近一次构建（可能为空） */
  lastBuild?: JenkinsBuild | null
}

/** Jenkins `/api/json` 的 jobs 列表响应 */
export interface JenkinsJobsResponse {
  jobs: JenkinsJob[]
}
