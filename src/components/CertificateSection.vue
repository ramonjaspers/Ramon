<script setup lang="ts">
import { profile } from '../data/profile'
</script>

<template>
  <section id="certificates">
    <div class="certificates">
      <h2>Certificates</h2>
      <ul class="cv-grid-list">
        <li v-for="(cert, index) in profile.certificates" :key="index">
          <strong>{{ cert.name }}</strong> — {{ cert.year }}
        </li>
      </ul>
    </div>
  </section>
</template>
