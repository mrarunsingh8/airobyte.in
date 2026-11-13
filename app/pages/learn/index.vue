<script setup lang="ts">
import { findPageChildren } from '@nuxt/content/utils'

// Every folder under content/learn/ becomes a course card — nothing hardcoded
const { data } = await useAsyncData('courses', () => queryCollectionNavigation('learn', ['description']))
const courses = computed(() => findPageChildren(data.value ?? [], '/learn').map(course => ({
  path: course.path,
  title: course.title,
  description: course.description as string | undefined,
  icon: course.icon as string | undefined
})))

usePageSeo('/learn', {
  title: 'Programming Courses for Beginners',
  description: 'Browse AiroByte programming courses and start learning with structured, beginner-friendly lessons and practical browser-based examples.'
})
</script>

<template>
  <UContainer>
    <UPageHeader
      title="Courses"
      description="Pick a course to start learning."
    />

    <UPageBody>
      <UPageGrid>
        <UPageCard
          v-for="course in courses"
          :key="course.path"
          :title="course.title"
          :description="course.description"
          :icon="course.icon"
          :to="course.path"
        />
      </UPageGrid>
    </UPageBody>
  </UContainer>
</template>
