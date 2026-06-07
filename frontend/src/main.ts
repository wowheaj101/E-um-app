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

// 화면은 항상 즉시 마운트한다. 인증 복원은 마운트를 막지 않고 백그라운드로 —
// Render 무료 플랜 콜드스타트로 me() 가 수십 초 걸려도 빈 화면 대신 UI 가 바로 뜨도록.
// 가드는 store.user 가 아니라 localStorage 토큰을 보므로 마운트 시점과 무관하게 안전하다.
const auth = useAuthStore()
if (USE_MOCK) {
  auth.loginAs('senior') // mock 데모: 시니어로 자동 로그인
} else {
  void auth.restore() // 저장된 토큰으로 프로필 복원(없으면 가드가 /login)
}
app.mount('#app')
