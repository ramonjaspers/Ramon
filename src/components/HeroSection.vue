<script setup lang="ts">
import { profile } from '../data/profile'
</script>

<template>
  <section id="about">
    <div class="contact-info">
      <div>
        <h1>{{ profile.name }}</h1>
        <p class="role-headline">{{ profile.role }} · {{ profile.location }}</p>
      </div>
      <div class="contact-details">
        <p>
          <a :href="`mailto:${profile.email}`">{{ profile.email }}</a>
        </p>
        <p>
          <a :href="`tel:${profile.phone}`">{{ profile.phone }}</a>
        </p>
        <nav>
          <a
            :href="profile.socials.linkedin"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>
          {{ ' | ' }}
          <a
            :href="profile.socials.github"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </nav>
      </div>
    </div>
    <div class="about-text">
      <p>{{ profile.about }}</p>
    </div>
  </section>
</template>
