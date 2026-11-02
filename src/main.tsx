import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'tuimorphic/styles.css'
import './index.css'
import App from './App'

// 暗色主题 + 绿色强调色（可选 tint-blue / tint-red / tint-yellow 等）
document.body.className = 'theme-dark tint-green'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
