<script setup lang="ts">
const { navigation, title, basePath } = useCourse()
</script>

<template>
  <div>
    <AppHeader />
    <UContainer>
      <UPage>
        <template #left>
          <UPageAside>
            <template #top>
              <NuxtLink
                :to="basePath"
                class="font-semibold text-highlighted"
              >
                {{ title }}
              </NuxtLink>
            </template>

            <UContentNavigation
              highlight
              :navigation="navigation"
            />
          </UPageAside>
        </template>

        <slot />
      </UPage>
    </UContainer>
    <AppFooter />
  </div>
</template>
