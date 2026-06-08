import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'
import { USE_MOCK } from './services'
import './styles/index.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)

// 인증 복원은 마운트를 막지 않고 백그라운드로 — Render 무료 플랜 콜드스타트로
// me() 가 수십 초 걸려도 빈 화면 대신 UI 가 바로 뜨도록. 가드는 store.user 가
// 아니라 localStorage 토큰을 보므로 마운트 시점과 무관하게 안전하다.
const auth = useAuthStore()
if (USE_MOCK) {
  auth.loginAs('senior') // mock 데모: 시니어로 자동 로그인
} else {
  void auth.restore() // 저장된 토큰으로 프로필 복원(없으면 가드가 /login)
}

// 초기 라우트(지연 청크)가 준비된 뒤 마운트한다. 마운트 시점에 매칭 컴포넌트가
// 확정돼 있어야 <transition mode="out-in"> 의 첫 렌더가 빈 노드로 굳지 않는다.
// (이게 빠지면 라우트가 늦게 풀려도 enter 전환이 안 걸려 빈 화면이 남고
//  새로고침해야 보이는 버그가 생긴다.) isReady 는 로컬 청크만 기다리므로
// 백엔드 me() 와 달리 즉시 끝나 콜드스타트 빈 화면을 되살리지 않는다.
router.isReady().finally(() => app.mount('#app'))
