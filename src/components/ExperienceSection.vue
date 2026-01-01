<script setup lang="ts">
import { profile } from '../data/profile'
</script>

<template>
  <section id="experience">
    <h2>Experience</h2>
    <div>
      <article v-for="(job, index) in profile.experience" :key="index">
        <header>
          <h3>{{ job.role }}</h3>
          <p>
            <strong>{{ job.company }}</strong
            >, {{ job.location }} —
            <time>{{ job.period }}</time>
          </p>
        </header>
        <div class="experience-details">
          <p v-if="job.stack" class="tech-stack">
            <strong>Tech: {{ job.stack }}</strong>
          </p>
          <p class="story-text">
            {{ job.description }}
            <a
              v-if="job.url"
              :href="job.url"
              target="_blank"
              rel="noopener noreferrer"
              class="company-link"
            >
              {{ job.url.replace('https://', '').replace('www.', '') }}
            </a>
          </p>
        </div>
      </article>
    </div>
    <hr />
  </section>
</template>

<style src="./ExperienceSection.css"></style>
