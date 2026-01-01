<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import { setupCursorGlow } from '../utils/cursor'
import { profile } from '../data/profile'
import IntroSection from '../components/IntroSection.vue'
import SectionCard from '../components/SectionCard.vue'
import WorkHistorySection from '../components/WorkHistorySection.vue'
import headShot from '../assets/headShot.png'

const backgroundPhrases = [
  'complexity is redundancy',
  'simplicity is brilliance',
  'elegance is efficiency',
  'clarity is power',
  'less is more',
  'craft is care',
  'precision is key',
  'focus is strength',
  'intentionality is quality',
]

const floatingTexts = Array.from({ length: 100 }).map((_, index) => ({
  id: index,
  text: backgroundPhrases[index % backgroundPhrases.length],
  style: {
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    fontSize: `${2 + Math.random() * 4}rem`,
    opacity: 0.03 + Math.random() * 0.05,
    animationDuration: `${40 + Math.random() * 60}s`,
    animationDelay: `-${Math.random() * 60}s`,
    '--drift-x': `${(Math.random() - 0.5) * 40}vw`,
    '--drift-y': `${(Math.random() - 0.5) * 40}vh`,
  },
}))

const maxYears = 8

const aboutParagraphs = profile.about.split('\n\n')

let cleanup: (() => void) | undefined

onMounted(() => {
  cleanup = setupCursorGlow()
})

onUnmounted(() => {
  cleanup?.()
})
</script>

<template>
  <div class="home-page">
    <nav class="navbar">
      <RouterLink to="/" class="nav-link">Home</RouterLink>
      <RouterLink to="/cv" class="nav-link">CV</RouterLink>
      <a
        href="https://github.com/ramonjaspers"
        target="_blank"
        rel="noopener noreferrer"
        class="nav-link"
      >
        GitHub
      </a>
    </nav>

    <div>
      <div class="background-text">
        <span
          v-for="item in floatingTexts"
          :key="item.id"
          class="moving"
          :style="item.style"
        >
          {{ item.text }}
        </span>
      </div>
    </div>

    <IntroSection />

    <SectionCard
      id="about"
      title="About Me"
      :image="headShot"
      image-alt="Ramon Jaspers"
      :highlights="[
        { label: 'Experience', value: '8+ Years' },
        { label: 'Current role', value: 'Lead Developer' },
        { label: 'Main focus', value: 'Scalable Solutions & Dev Exp' },
      ]"
    >
      <p v-for="(paragraph, i) in aboutParagraphs" :key="i">
        {{ paragraph }}
      </p>
    </SectionCard>

    <WorkHistorySection />

    <SectionCard title="Skills & Technologies">
      <p class="skills-intro">
        Technologies I've worked with professionally, measured by years of
        hands-on experience.
      </p>
      <div class="skills-grid">
        <div
          v-for="skill in profile.skills"
          :key="skill.name"
          class="skill-item"
        >
          <div class="skill-header">
            <span class="skill-name">{{ skill.name }}</span>
            <span class="skill-years">
              {{ skill.years }} {{ skill.years === 1 ? 'year' : 'years' }}
            </span>
          </div>
          <div class="skill-bar">
            <div
              class="skill-bar-fill"
              :style="{ width: `${(skill.years / maxYears) * 100}%` }"
            />
          </div>
        </div>
      </div>
      <p class="skills-footer">
        View more on
        <a
          href="https://github.com/ramonjaspers"
          target="_blank"
          rel="noopener noreferrer"
          class="github-link"
        >
          GitHub
        </a>
      </p>
    </SectionCard>

    <div class="cursor-glow"></div>
  </div>
</template>

<style src="./home.css"></style>
