<script setup lang="ts">
import { profile } from '../data/profile'
</script>

<template>
  <section id="education">
    <h2>Education</h2>
    <div>
      <article v-for="(edu, index) in profile.education" :key="index">
        <header>
          <h3>{{ edu.school }}</h3>
          <p>
            <time>{{ edu.period }}</time>
          </p>
        </header>
        <p>{{ edu.degree }}</p>
      </article>
    </div>
  </section>
</template>

<style src="./EducationSection.css"></style>
