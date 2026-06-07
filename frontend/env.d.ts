/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** mock 데이터 사용 여부. 'false'일 때만 실 백엔드 호출 */
  readonly VITE_USE_MOCK: string
  /** 백엔드 API base URL (예: http://localhost:8000/api/v1) */
  readonly VITE_API_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
  export default component
}
