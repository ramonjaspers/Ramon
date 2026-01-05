<script setup lang="ts">
import { RouterLink } from 'vue-router'

const navItems = [
  { label: 'About', target: 'about' },
  { label: 'About', target: 'about' },
  { label: 'Experience', target: 'experience' },
  { label: 'Skills', target: 'skills' },
  { label: 'Education', target: 'education' },
]

const scrollToSection = (id: string) => {
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}
</script>

<template>
  <header class="app-header">
    <nav class="nav-main">
      <RouterLink to="/">Home</RouterLink>
      <a href="https://github.com/ramonjaspers" class="nav-github"> GitHub </a>
    </nav>
    <nav class="nav-section">
      <ul>
        <li v-for="item in navItems" :key="item.label">
          <a
            :href="`#${item.target}`"
            @click.prevent="scrollToSection(item.target)"
          >
            {{ item.label }}
          </a>
        </li>
      </ul>
    </nav>
  </header>
</template>

<style src="./AppHeader.css"></style>
