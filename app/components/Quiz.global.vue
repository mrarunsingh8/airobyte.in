<script setup lang="ts">
/**
 * End-of-lesson quiz. Questions and options are written in the page's markdown:
 *
 *   ::quiz{title="Quick Check"}
 *     ::quiz-question
 *     Which keyword declares a constant?
 *
 *     - [ ] var
 *     - [ ] let
 *     - [x] const
 *
 *     #explanation
 *     `const` creates a variable that can't be reassigned.
 *     ::
 *
 *     ::quiz-question
 *     Which of these are primitive types? (several `[x]` = multiple choice)
 *
 *     - [x] string
 *     - [x] number
 *     - [ ] object
 *     ::
 *   ::
 *
 * `[x]` marks a correct option. One `[x]` = single choice, more than one = multiple choice
 * (force it with ::quiz-question{type="multiple"} or {type="single"}).
 * Questions can contain any markdown: **bold**, `code`, code blocks, images.
 */
import type { QuizContext } from '~/types/quiz'

withDefaults(defineProps<{
  title?: string
  description?: string
}>(), {
  title: 'Quiz',
  description: 'Test what you learned in this lesson.'
})

const route = useRoute()
const STORAGE_KEY = `quiz-best:${route.path}`

const total = ref(0)
const started = ref(false)
const current = ref(0)
const attempt = ref(0)
const results = ref<(boolean | null)[]>([])

const finished = computed(() => started.value && current.value >= total.value)
const score = computed(() => results.value.filter(Boolean).length)
const percent = computed(() => total.value ? Math.round((score.value / total.value) * 100) : 0)

const best = ref<number | null>(null)
onMounted(() => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved !== null) best.value = Number(saved)
  } catch { /* storage unavailable */ }
})

provide<QuizContext>('quiz', {
  register: () => total.value++,
  current: readonly(current),
  started: readonly(started),
  attempt: readonly(attempt),
  total: readonly(total),
  answer(index: number, correct: boolean) {
    results.value[index] = correct
  },
  next() {
    current.value++
    if (current.value >= total.value) saveBest()
  }
})

function saveBest() {
  if (best.value === null || score.value > best.value) {
    best.value = score.value
    try {
      localStorage.setItem(STORAGE_KEY, String(score.value))
    } catch { /* storage unavailable */ }
  }
}

function start() {
  results.value = Array.from({ length: total.value }, () => null)
  current.value = 0
  attempt.value++
  started.value = true
}

const message = computed(() => {
  if (percent.value === 100) return { icon: 'i-lucide-trophy', text: 'Perfect score! You nailed it. 🎉' }
  if (percent.value >= 70) return { icon: 'i-lucide-party-popper', text: 'Great job! You understood this lesson well. 👏' }
  if (percent.value >= 40) return { icon: 'i-lucide-thumbs-up', text: 'Good effort! Review the lesson once more and try again. 💪' }
  return { icon: 'i-lucide-book-open', text: 'No worries. Re-read the lesson and give it another go. 📖' }
})
</script>

<template>
  <section class="not-prose my-8 overflow-hidden rounded-lg border border-muted bg-default" :aria-label="title">
    <!-- header -->
    <div class="flex items-center gap-3 border-b border-muted px-4 py-3">
      <span class="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <UIcon name="i-lucide-brain" class="size-5" />
      </span>
      <div class="min-w-0 flex-1">
        <p class="font-semibold text-highlighted">
          {{ title }}
        </p>
        <p class="truncate text-sm text-muted">
          {{ total }} {{ total === 1 ? 'question' : 'questions' }}
          <template v-if="best !== null && !started">
            · Best score: {{ best }}/{{ total }}
          </template>
        </p>
      </div>
      <span v-if="started && !finished" class="shrink-0 text-sm text-muted tabular-nums">
        {{ current + 1 }} / {{ total }}
      </span>
    </div>

    <!-- progress -->
    <div v-if="started" class="h-1 bg-elevated">
      <div
        class="h-full bg-primary transition-[width] duration-300 ease-out"
        :style="{ width: `${(Math.min(current, total) / Math.max(total, 1)) * 100}%` }"
      />
    </div>

    <!-- start screen -->
    <div v-if="!started" class="flex flex-col items-start gap-4 px-4 py-5 sm:flex-row sm:items-center">
      <p class="flex-1 text-sm text-default">
        {{ description }}
      </p>
      <UButton
        label="Start quiz"
        icon="i-lucide-play"
        :disabled="total === 0"
        @click="start"
      />
    </div>

    <!-- questions (each one shows itself when it is the current question) -->
    <div v-show="started && !finished">
      <slot />
    </div>

    <!-- results -->
    <div v-if="finished" class="px-4 py-6 text-center">
      <UIcon :name="message.icon" class="mx-auto size-10 text-primary" />
      <p class="mt-3 text-3xl font-bold text-highlighted tabular-nums">
        {{ score }} / {{ total }}
      </p>
      <p class="mt-1 text-sm text-muted">
        {{ percent }}% correct
      </p>
      <p class="mt-3 text-default">
        {{ message.text }}
      </p>

      <div class="mt-4 flex flex-wrap justify-center gap-1.5" aria-label="Your answers">
        <span
          v-for="(r, i) in results"
          :key="i"
          class="flex size-7 items-center justify-center rounded-full text-xs font-medium"
          :class="r ? 'bg-success/15 text-success' : 'bg-error/15 text-error'"
          :title="`Question ${i + 1}: ${r ? 'correct' : 'incorrect'}`"
        >
          {{ i + 1 }}
        </span>
      </div>

      <UButton
        label="Try again"
        icon="i-lucide-rotate-ccw"
        color="neutral"
        variant="outline"
        class="mt-5"
        @click="start"
      />
    </div>
  </section>
</template>
