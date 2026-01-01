import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import './main.css'

import HomeView from './views/Home.vue'
import CVView from './views/CV.vue'

const router = createRouter({
  history: createWebHashHistory('/Ramon/'),
  routes: [
    { path: '/', component: HomeView },
    { path: '/cv', component: CVView },
  ],
})

const app = createApp(App)
app.use(router)
app.mount('#root')
