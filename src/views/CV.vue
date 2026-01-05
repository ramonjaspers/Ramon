<script setup lang="ts">
import AppLayout from '../components/AppLayout.vue'
import AppHeader from '../components/AppHeader.vue'
import HeroSection from '../components/HeroSection.vue'
import ExperienceSection from '../components/ExperienceSection.vue'
import CertificateSection from '../components/CertificateSection.vue'
import EducationSection from '../components/EducationSection.vue'
import CoreSkills from '../components/CoreSkills.vue'
</script>

<template>
  <AppLayout>
    <AppHeader />
    <HeroSection />
    <CoreSkills />
    <ExperienceSection />
    <CertificateSection />
    <EducationSection />
  </AppLayout>
</template>
