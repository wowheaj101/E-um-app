import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { USE_MOCK } from '@/services'
import { TOKEN_KEY } from '@/services/config'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { title: '로그인', public: true },
  },
  {
    path: '/signup',
    name: 'signup',
    component: () => import('@/views/SignupView.vue'),
    meta: { title: '회원가입', public: true },
  },
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
    meta: { title: '홈' },
  },
  {
    path: '/assets',
    name: 'assets',
    component: () => import('@/views/AssetListView.vue'),
    meta: { title: '내 자산' },
  },
  {
    path: '/voice',
    name: 'voice',
    component: () => import('@/views/VoiceInputView.vue'),
    meta: { title: '음성으로 추가' },
  },
  {
    path: '/ocr',
    name: 'ocr',
    component: () => import('@/views/OcrInputView.vue'),
    meta: { title: '사진으로 추가' },
  },
  {
    path: '/helper',
    name: 'helper',
    component: () => import('@/views/HelperDashboardView.vue'),
    meta: { title: '가족에게 보이는 화면' },
  },
  {
    path: '/legacy',
    name: 'legacy',
    component: () => import('@/views/LegacyNoteView.vue'),
    meta: { title: '디지털 유산' },
  },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

// 인증 가드 — real 모드에서만 적용(mock 은 로그인 없이 둘러보기).
router.beforeEach((to) => {
  if (USE_MOCK || to.meta.public) return true
  if (!localStorage.getItem(TOKEN_KEY)) {
    return to.fullPath === '/'
      ? { name: 'login' }
      : { name: 'login', query: { redirect: to.fullPath } }
  }
  return true
})

// 재배포 후 브라우저에 남은 옛 index.html 이 사라진 lazy 청크를 import 하려다
// 실패하면(= 빈 화면) 자동으로 한 번 새로고침해 최신 빌드를 받는다.
// 같은 경로에서 한 번만 시도해 무한 새로고침을 방지한다.
const CHUNK_RELOAD_KEY = 'eum_chunk_reloaded'
router.onError((error, to) => {
  const message = error instanceof Error ? error.message : String(error)
  const isChunkError =
    /dynamically imported module|Importing a module script failed|ChunkLoadError|Failed to fetch/i.test(
      message,
    )
  if (!isChunkError) return
  const target = to?.fullPath || window.location.pathname
  if (sessionStorage.getItem(CHUNK_RELOAD_KEY) === target) return // 이미 한 번 시도함
  sessionStorage.setItem(CHUNK_RELOAD_KEY, target)
  window.location.assign(target)
})
router.afterEach((to) => {
  // 정상 진입에 성공하면 플래그 해제 → 다음 배포 때 다시 새로고침할 수 있게.
  if (sessionStorage.getItem(CHUNK_RELOAD_KEY) === to.fullPath) {
    sessionStorage.removeItem(CHUNK_RELOAD_KEY)
  }
})

export default router
