<script setup lang="ts">
import { ref } from 'vue'
import { profile } from '../data/profile'

const activeIndex = ref(0)

const activeJob = () => profile.experience[activeIndex.value]
</script>

<template>
  <section id="experience" class="work-history">
    <div class="work-history-container">
      <h2>Experience</h2>

      <div class="work-history-content">
        <div class="company-tabs">
          <button
            v-for="(job, index) in profile.experience"
            :key="index"
            class="company-tab"
            :class="{ 'company-tab--active': activeIndex === index }"
            @click="activeIndex = index"
          >
            {{ job.company }}
          </button>
        </div>

        <div class="job-details">
          <h3 class="job-role">
            {{ activeJob().role }}
            <span class="job-company">@ {{ activeJob().company }}</span>
          </h3>

          <p class="job-period">{{ activeJob().period }}</p>

          <p v-if="activeJob().stack" class="job-stack">
            <span class="stack-label">Tech:</span> {{ activeJob().stack }}
          </p>

          <p class="job-description">
            {{ activeJob().description }}
          </p>

          <a
            v-if="activeJob()?.url"
            :href="activeJob()?.url"
            target="_blank"
            rel="noopener noreferrer"
            class="job-link"
          >
            {{ activeJob()?.url?.replace('https://', '').replace('www.', '') }}
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

<style src="./WorkHistorySection.css"></style>
