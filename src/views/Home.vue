<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { profile } from '../data/profile'
import AmbientField from '../components/AmbientField.vue'
import IntroSection from '../components/IntroSection.vue'
import PortfolioTerminal from '../components/PortfolioTerminal.vue'
import SectionCard from '../components/SectionCard.vue'
import WorkHistorySection from '../components/WorkHistorySection.vue'
import { formatYears } from '../utils/formatYears'
import headShot from '../assets/headShot.png'

const maxSkillYears = Math.max(...profile.skills.map((skill) => skill.years))

const aboutParagraphs = profile.about.split('\n\n')
</script>

<template>
  <div class="home-page">
    <AmbientField />
    <nav class="navbar">
      <RouterLink to="/" class="nav-brand">
        Ramon Jaspers<span>.</span>
      </RouterLink>
      <div class="nav-links">
        <RouterLink to="/cv" class="nav-link">CV</RouterLink>
        <a
          href="https://github.com/ramonjaspers"
          target="_blank"
          rel="noopener noreferrer"
          class="nav-link"
        >
          GitHub
        </a>
        <a :href="`mailto:${profile.email}`" class="nav-contact">Contact</a>
        <PortfolioTerminal />
      </div>
    </nav>

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
              {{ formatYears(skill.years) }}
            </span>
          </div>
          <div class="skill-bar">
            <div
              class="skill-bar-fill"
              :style="{ width: `${(skill.years / maxSkillYears) * 100}%` }"
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
  </div>
</template>

<style src="./home.css"></style>
