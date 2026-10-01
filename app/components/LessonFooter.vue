<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

const props = defineProps<{
  /** Public URL of the current lesson */
  lessonId: string
  /** [previous, next] as returned by queryCollectionItemSurroundings (paths already public) */
  surround?: (ContentNavigationItem | null)[] | null
}>()

const toast = useToast()
const { isCompleted, isFavourite, setCompleted, setFavourite, loaded } = useProgress()

const prev = computed(() => props.surround?.[0] ?? null)
const next = computed(() => props.surround?.[1] ?? null)

const completed = computed(() => isCompleted(props.lessonId))
const favourite = computed(() => isFavourite(props.lessonId))

async function toggleCompleted() {
  const value = !completed.value
  try {
    await setCompleted(props.lessonId, value)
    if (value) {
      toast.add({
        title: 'Lesson completed',
        description: next.value ? `Up next: ${next.value.title}` : 'You\'ve reached the end of this course.',
        icon: 'i-lucide-circle-check',
        color: 'success',
        actions: next.value ? [{ label: 'Next lesson', to: next.value.path, trailingIcon: 'i-lucide-arrow-right' }] : undefined
      })
    }
  } catch {
    toast.add({ title: 'Could not save your progress', color: 'error', icon: 'i-lucide-circle-alert' })
  }
}

async function toggleFavourite() {
  const value = !favourite.value
  try {
    await setFavourite(props.lessonId, value)
    toast.add({
      title: value ? 'Added to favourites' : 'Removed from favourites',
      icon: value ? 'i-lucide-heart' : 'i-lucide-heart-off'
    })
  } catch {
    toast.add({ title: 'Could not save your favourite', color: 'error', icon: 'i-lucide-circle-alert' })
  }
}
</script>

<template>
  <div class="mt-12 space-y-6">
    <USeparator />

    <!-- Actions for this lesson -->
    <div class="flex flex-col items-center justify-between gap-4 sm:flex-row">
      <UButton
        :label="completed ? 'Completed' : 'Mark as completed'"
        :icon="completed ? 'i-lucide-circle-check-big' : 'i-lucide-circle'"
        :color="completed ? 'success' : 'primary'"
        :variant="completed ? 'soft' : 'solid'"
        size="lg"
        :loading="!loaded"
        class="w-full justify-center sm:w-auto"
        @click="toggleCompleted"
      />

      <UTooltip :text="favourite ? 'Remove from favourites' : 'Save to favourites'">
        <UButton
          :label="favourite ? 'Favourite' : 'Add to favourites'"
          icon="i-lucide-heart"
          :color="favourite ? 'error' : 'neutral'"
          :variant="favourite ? 'soft' : 'outline'"
          size="lg"
          :aria-pressed="favourite"
          :disabled="!loaded"
          class="w-full justify-center sm:w-auto"
          @click="toggleFavourite"
        />
      </UTooltip>
    </div>

    <!-- Previous / next lesson -->
    <div class="grid gap-4 sm:grid-cols-2">
      <UPageCard
        v-if="prev"
        :to="prev.path"
        variant="outline"
        :ui="{ container: 'p-4 sm:p-5' }"
      >
        <div class="flex items-center gap-3">
          <UIcon name="i-lucide-arrow-left" class="size-5 shrink-0 text-muted" />
          <div class="min-w-0">
            <p class="text-xs text-muted">
              Previous lesson
            </p>
            <p class="truncate font-medium text-highlighted">
              {{ prev.title }}
            </p>
          </div>
        </div>
      </UPageCard>
      <span v-else class="hidden sm:block" />

      <UPageCard
        v-if="next"
        :to="next.path"
        variant="outline"
        :ui="{ container: 'p-4 sm:p-5' }"
      >
        <div class="flex items-center justify-end gap-3 text-right">
          <div class="min-w-0">
            <p class="text-xs text-muted">
              Next lesson
            </p>
            <p class="truncate font-medium text-highlighted">
              {{ next.title }}
            </p>
          </div>
          <UIcon name="i-lucide-arrow-right" class="size-5 shrink-0 text-primary" />
        </div>
      </UPageCard>
    </div>
  </div>
</template>
