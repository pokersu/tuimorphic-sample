import type { JenkinsJob, JenkinsJobsResponse } from '../types'
import type { JobDataSource } from './types'

export interface JenkinsSourceConfig {
  /** Jenkins 根地址，例如 https://jenkins.example.com */
  baseUrl: string
  /** 用户名（可选；Jenkins 开启匿名只读时可留空） */
  user?: string
  /** API token / 密码（可选） */
  token?: string
  /** 自定义 tree 查询（默认拉取 job 名称 / 颜色 / 最近构建） */
  tree?: string
}

const DEFAULT_TREE =
  'jobs[name,color,url,lastBuild[number,result,timestamp,duration,building]]'

/**
 * 真实 Jenkins 数据源（预留，未接入）。
 *
 * 注意：浏览器直连 Jenkins 的 `/api/json` 会受 CORS 限制，Jenkins 默认不返回
 * CORS 头。正式接入时二选一：
 *   1. 通过同源代理（Vite dev proxy 或反向代理）转发到 Jenkins；
 *   2. 在 Jenkins 侧开启 CORS（装 CORS 插件，或在反向代理加 CORS 头）。
 * 把 `baseUrl` 指到代理地址即可。
 */
export class JenkinsJobSource implements JobDataSource {
  constructor(private readonly config: JenkinsSourceConfig) {}

  async fetchJobs(): Promise<JenkinsJob[]> {
    const { baseUrl, user, token, tree } = this.config
    const params = new URLSearchParams({ tree: tree ?? DEFAULT_TREE })
    const url = `${baseUrl.replace(/\/+$/, '')}/api/json?${params.toString()}`

    const headers: Record<string, string> = { Accept: 'application/json' }
    if (user && token) {
      headers.Authorization = `Basic ${btoa(`${user}:${token}`)}`
    }

    const res = await fetch(url, { headers })
    if (!res.ok) {
      throw new Error(`Jenkins API 请求失败：HTTP ${res.status}`)
    }
    const data = (await res.json()) as JenkinsJobsResponse
    return data.jobs ?? []
  }
}
