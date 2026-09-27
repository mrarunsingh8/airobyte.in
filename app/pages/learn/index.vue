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

useSeoMeta({
  title: 'Courses',
  description: 'All courses available on the platform.'
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
