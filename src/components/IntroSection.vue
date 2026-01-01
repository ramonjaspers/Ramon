<script setup lang="ts">
import ParticlePortrait from './ParticlePortrait.vue'
import { profile } from '../data/profile'

const scrollToAbout = () => {
  const aboutSection = document.getElementById('about')
  if (aboutSection) {
    aboutSection.scrollIntoView({ behavior: 'smooth' })
  }
}
</script>

<template>
  <section class="intro">
    <div class="intro-content">
      <div class="intro-portrait">
        <ParticlePortrait />
      </div>

      <div class="intro-text">
        <p class="intro-greeting">Hi, my name is</p>
        <h1 class="intro-name">{{ profile.name }}</h1>
        <h2 class="intro-role">{{ profile.role }}</h2>
        <p class="intro-tagline">
          I am a software engineer specialized in web and mobile development who
          loves building scalable solutions & crafting developer experiences
          which last.
        </p>

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
