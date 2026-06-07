import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'
import './styles/index.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)

// mock 데모: 시니어로 자동 로그인 (실연동 시 Supabase 세션으로 대체)
const auth = useAuthStore()
auth.loginAs('senior')

app.mount('#app')
