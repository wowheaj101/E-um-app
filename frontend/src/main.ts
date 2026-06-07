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

const auth = useAuthStore()
if (USE_MOCK) {
  // mock 데모: 시니어로 자동 로그인 후 즉시 마운트
  auth.loginAs('senior')
  app.mount('#app')
} else {
  // real: 저장된 토큰으로 프로필 복원한 뒤 마운트(없으면 가드가 /login)
  auth.restore().finally(() => app.mount('#app'))
}
