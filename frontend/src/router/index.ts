import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
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

export default router
