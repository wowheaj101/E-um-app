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

export default router
