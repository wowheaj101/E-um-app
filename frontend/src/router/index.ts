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
  // TODO: /ocr, /helper, /legacy — 후속 화면
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
