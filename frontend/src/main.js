import { createApp } from 'vue'
import App from './App.vue'
import '../src/assets/main.css'  
import router from './router'        // <-- add this

const app = createApp(App)
app.use(router)
app.mount('#app')
