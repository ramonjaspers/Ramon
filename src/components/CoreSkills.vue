<script setup lang="ts">
import { profile } from '../data/profile'
import { formatYears } from '../utils/formatYears'
</script>

<template>
  <section id="skills">
    <h2>Core skills</h2>
    <div class="tech-skills">
      <ul class="cv-grid-list">
        <li v-for="skill in profile.skills" :key="skill.name">
          <strong>{{ skill.name }}</strong> —
          {{ formatYears(skill.years, true) }}
        </li>
      </ul>
    </div>
  </section>
</template>
