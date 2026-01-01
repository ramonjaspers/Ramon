<script setup lang="ts">
import { useSlots } from 'vue'

interface Highlight {
  label: string
  value: string
}

defineProps<{
  id?: string
  title: string
  highlights?: Highlight[]
  image?: string
  imageAlt?: string
}>()

const slots = useSlots()
const hasAvatarSlot = !!slots.avatar
</script>

<template>
  <section :id="id" class="section-card-container">
    <div class="section-card">
      <!-- Header with avatar slot -->
      <div v-if="hasAvatarSlot" class="section-card-header">
        <div class="section-card-avatar section-card-avatar--custom">
          <slot name="avatar" />
        </div>
        <h2>{{ title }}</h2>
      </div>

      <!-- Header with image prop -->
      <div v-else-if="image" class="section-card-header">
        <div class="section-card-avatar">
          <img :src="image" :alt="imageAlt || ''" />
        </div>
        <h2>{{ title }}</h2>
      </div>

      <!-- Title only -->
      <h2 v-else>{{ title }}</h2>

      <div class="section-content">
        <slot />
      </div>

      <div
        v-if="highlights && highlights.length > 0"
        class="section-highlights"
      >
        <div
          v-for="(item, index) in highlights"
          :key="index"
          class="section-highlight-item"
        >
          <h3>{{ item.label }}</h3>
          <p>{{ item.value }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style src="./SectionCard.css"></style>
