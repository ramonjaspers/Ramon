<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import ParticlePortrait from './ParticlePortrait.vue'
import { profile } from '../data/profile'

const typedName = ref('')
let typingDelay: number | undefined
let typingInterval: number | undefined

const scrollToAbout = () => {
  const aboutSection = document.getElementById('about')
  if (aboutSection) {
    aboutSection.scrollIntoView({ behavior: 'smooth' })
  }
}

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    typedName.value = profile.name
    return
  }

  typingDelay = window.setTimeout(() => {
    let characterIndex = 0
    typingInterval = window.setInterval(() => {
      characterIndex += 1
      typedName.value = profile.name.slice(0, characterIndex)

      if (
        characterIndex >= profile.name.length &&
        typingInterval !== undefined
      ) {
        window.clearInterval(typingInterval)
      }
    }, 90)
  }, 320)
})

onUnmounted(() => {
  if (typingDelay !== undefined) window.clearTimeout(typingDelay)
  if (typingInterval !== undefined) window.clearInterval(typingInterval)
})
</script>

<template>
  <section class="intro">
    <div class="intro-content">
      <div
        class="intro-portrait"
        role="img"
        aria-label="Particle portrait of Ramon Jaspers"
      >
        <div class="portrait-toolbar" aria-hidden="true">
          <span class="portrait-dots"><i></i><i></i><i></i></span>
          <span>portrait.tiff</span>
          <span class="portrait-index">01</span>
        </div>
        <ParticlePortrait />
      </div>

      <div class="intro-text">
        <p class="intro-greeting">
          <span>~/ramon-jaspers</span> <b>$</b> whoami
        </p>
        <h1 class="intro-name" :aria-label="profile.name">
          <span aria-hidden="true">{{ typedName }}</span>
          <span class="intro-caret" aria-hidden="true"></span>
        </h1>
        <h2 class="intro-role">{{ profile.role }}</h2>
        <p class="intro-tagline">
          A software engineer specialized in web and mobile development who
          loves building scalable solutions & crafting developer experiences
          which last.
        </p>

        <ul class="intro-stack" aria-label="Core technologies">
          <li>React</li>
          <li>TypeScript</li>
          <li>React Native</li>
          <li>DX</li>
        </ul>

        <div class="intro-actions">
          <a
            :href="`mailto:${profile.email}`"
            class="intro-btn intro-btn--primary"
          >
            Say hi! 👋
          </a>
          <button class="intro-btn intro-btn--secondary" @click="scrollToAbout">
            About me
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style src="./IntroSection.css"></style>
