<script setup lang="ts">
useSeoMeta({
  title: 'JS / TS Playground',
  description: 'Write and run JavaScript right in your browser.'
})
</script>

<template>
  <UContainer>
    <UPageHeader
      title="Playground"
      description="Write and run JavaScript right in your browser. Your code is saved automatically."
    />
    <UPageBody>
      <ClientOnly>
        <JsPlayground full height-class="lg:h-[calc(100vh-18rem)]" />
        <template #fallback>
          <div class="h-96 animate-pulse rounded-xl bg-elevated" />
        </template>
      </ClientOnly>
    </UPageBody>
  </UContainer>
</template>
