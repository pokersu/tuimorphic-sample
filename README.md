# CICD Observer

用 [tuimorphic](https://github.com/douglance/tuimorphic)（终端美学 React 组件库）搭建的 CI/CD job 状态观察面板。当前使用 **mock 数据**，已预留 Jenkins 接入。

## 运行

```bash
npm install
npm run dev      # 开发服务器 http://localhost:5173
npm run build    # 类型检查 + 生产构建
npm run preview  # 预览构建产物
```

## 架构

- `src/types.ts` —— Jenkins 数据模型（与 Jenkins 原生 `/api/json` 字段保持一致）
- `src/datasources/types.ts` —— 数据源抽象接口 `JobDataSource`
- `src/datasources/mock.ts` —— mock 数据源（模拟 job 开始/完成构建的动态演化）
- `src/datasources/jenkins.ts` —— 真实 Jenkins 数据源（已写好，未接入）
- `src/lib/jenkins.ts` —— `color` 解析、状态文案、时长/时间格式化、统计
- `src/components/` —— 状态徽章、统计栏、job 表格
- `src/App.tsx` —— 主界面 + 5 秒轮询

## 接入 Jenkins

1. 在 `src/App.tsx` 里把数据源换成 Jenkins：

   ```ts
   import { JenkinsJobSource } from './datasources/jenkins'

   const source: JobDataSource = new JenkinsJobSource({
     baseUrl: 'http://your-jenkins.example.com',
     user: 'username',   // 可选
     token: 'api-token', // 可选
   })
   ```

2. 浏览器直连 Jenkins 的 `/api/json` 会受 CORS 限制，二选一：

   - 走同源代理（Vite dev proxy 或反向代理），把 `baseUrl` 指到代理地址；
   - 在 Jenkins 侧开启 CORS（CORS 插件，或在反向代理加 CORS 头）。

## 状态语义

Jenkins 的 `color` 字段 → 展示状态：

- `blue` / `blue_anime` → SUCCESS / 构建中
- `red` → FAILURE
- `yellow` → UNSTABLE
- `aborted` → ABORTED
- `disabled` / `notbuilt` → DISABLED / NOT BUILT
- 带 `_anime` 后缀 → 正在构建
