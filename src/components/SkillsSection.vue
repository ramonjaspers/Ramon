<script setup lang="ts">
import { profile } from '../data/profile'
</script>

<template>
  <section id="skills">
    <h2>Skills</h2>
    <div class="skills-grid">
      <div class="tech-skills">
        <h3>IT</h3>
        <ul>
          <li v-for="(skill, index) in profile.skills" :key="index">
            <strong>{{ skill.name }}</strong> — {{ skill.years }}
            {{ skill.years === 1 ? 'year' : 'years' }}
          </li>
        </ul>
      </div>
      <div class="languages">
        <h3>Languages</h3>
        <ul>
          <li v-for="(lang, index) in profile.languages" :key="index">
            <strong>{{ lang.name }}</strong> ({{ lang.level }})
          </li>
        </ul>
      </div>
      <div class="certificates">
        <h3>Certificates</h3>
        <ul>
          <li v-for="(cert, index) in profile.certificates" :key="index">
            <strong>{{ cert.name }}</strong> — {{ cert.year }}
          </li>
        </ul>
      </div>
    </div>
    <hr />
  </section>
</template>

<style src="./SkillsSection.css"></style>
