import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Alert,
  BarLoader,
  Button,
  Card,
  Heading,
  SidebarLayout,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Text,
  Toggle,
} from 'tuimorphic'
import type { JenkinsJob } from './types'
import type { JobDataSource } from './datasources/types'
import { MockJobSource } from './datasources/mock'
import { computeStats } from './lib/jenkins'
import { JobTable } from './components/JobTable'
import { StatsBar } from './components/StatsBar'
import { SidePanel } from './components/SidePanel'

/** 这里换成 JenkinsJobSource 即可接真实 Jenkins（见 datasources/jenkins.ts） */
const source: JobDataSource = new MockJobSource()
const REFRESH_MS = 5000

type Section = 'jenkins' | 'dag' | 'agents' | 'k8s'

const SECTIONS: { value: Section; label: string }[] = [
  { value: 'jenkins', label: 'JENKINS' },
  { value: 'dag', label: 'DAG' },
  { value: 'agents', label: 'AGENTS' },
  { value: 'k8s', label: 'K8S' },
]

/** 尚未接入数据源的板块占位内容 */
function Placeholder({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <Card title={title}>
      <div className="placeholder">
        <Text variant="muted">{description}</Text>
        <Text variant="caption" mono>
          NO DATA SOURCE CONFIGURED
        </Text>
      </div>
    </Card>
  )
}

export default function App() {
  const [jobs, setJobs] = useState<JenkinsJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [section, setSection] = useState<string | null>('jenkins')

  const refresh = useCallback(async () => {
    try {
      const data = await source.fetchJobs()
      setJobs(data)
      setLastUpdated(new Date())
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  useEffect(() => {
    if (!autoRefresh) return
    const id = window.setInterval(() => void refresh(), REFRESH_MS)
    return () => window.clearInterval(id)
  }, [autoRefresh, refresh])

  const stats = useMemo(() => computeStats(jobs), [jobs])

  return (
    <div className="app">
      <SidebarLayout
        side="right"
        sidebar={
          <SidePanel section={section} jobs={jobs} lastUpdated={lastUpdated} />
        }
        defaultSidebarWidth={280}
        minSidebarWidth={220}
        maxSidebarWidth={440}
        collapsible
        showHandle
      >
        <div className="app-main">
          <header className="app-header">
            <Heading level={1} decorated transform="uppercase">
              CICD Observer
            </Heading>
            <div className="app-controls">
              <Toggle
                checked={autoRefresh}
                onCheckedChange={setAutoRefresh}
                label="AUTO-REFRESH"
              />
              <Button
                variant="secondary"
                disabled={loading}
                onClick={() => void refresh()}
              >
                REFRESH
              </Button>
            </div>
          </header>

          {error ? (
            <Alert
              variant="error"
              title="ERROR"
              dismissible
              onDismiss={() => setError(null)}
            >
              {error}
            </Alert>
          ) : null}

          <Tabs
            value={section}
            onValueChange={(v) =>
              setSection(typeof v === 'string' ? v : 'jenkins')
            }
          >
            <TabsList>
              {SECTIONS.map((s) => (
                <TabsTrigger key={s.value} value={s.value}>
                  {s.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="jenkins">
              <div className="section-body">
                <StatsBar stats={stats} />
                <Card title="JOBS">
                  {loading && jobs.length === 0 ? (
                    <div className="loading">
                      <BarLoader />
                      <Text variant="muted">LOADING JOBS…</Text>
                    </div>
                  ) : (
                    <JobTable jobs={jobs} />
                  )}
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="dag">
              <Placeholder
                title="DAG"
                description="DAG / 流水线面板尚未接入数据源。"
              />
            </TabsContent>

            <TabsContent value="agents">
              <Placeholder
                title="AGENTS"
                description="Agents 面板尚未接入数据源。"
              />
            </TabsContent>

            <TabsContent value="k8s">
              <Placeholder
                title="K8S"
                description="Kubernetes 资源面板尚未接入数据源。"
              />
            </TabsContent>
          </Tabs>

          <footer className="app-footer">
            <Text variant="caption" mono>
              LAST UPDATE{' '}
              {lastUpdated ? lastUpdated.toLocaleTimeString() : '—'} · POLL{' '}
              {REFRESH_MS / 1000}s
            </Text>
          </footer>
        </div>
      </SidebarLayout>
    </div>
  )
}
