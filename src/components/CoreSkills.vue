<script setup lang="ts">
import { profile } from '../data/profile'
</script>

<template>
  <section id="skills">
    <h2>Core skills</h2>
    <div class="tech-skills">
      <ul class="cv-grid-list">
        <li v-for="(skill, index) in profile.skills" :key="index">
          <strong>{{ skill.name }}</strong> — {{ skill.years }}
          {{ skill.years === 1 ? 'yr' : 'yrs' }}
        </li>
      </ul>
    </div>
  </section>
</template>
