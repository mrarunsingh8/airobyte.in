<script setup lang="ts">
/**
 * One question inside ::quiz. See Quiz.global.vue for the markdown format.
 * The question text is everything before the checklist; the checklist items are the options;
 * `[x]` marks correct options; the optional #explanation slot is shown after answering.
 */
import { Fragment, h, type VNode } from 'vue'
import type { QuizContext } from '~/types/quiz'

const props = defineProps<{
  /** Override auto-detection: one [x] = single, several [x] = multiple */
  type?: 'single' | 'multiple'
}>()

const slots = useSlots()
const quiz = inject<QuizContext | null>('quiz', null)
const index = quiz ? quiz.register() : 0

const selected = ref<number[]>([])
const checked = ref(false)

// Reset when the quiz is started again
watch(() => quiz?.attempt.value, () => {
  selected.value = []
  checked.value = false
})

const isActive = computed(() => !quiz || (quiz.started.value && quiz.current.value === index))
const isLast = computed(() => !quiz || index === quiz.total.value - 1)

/* ---------- read the markdown slot ---------- */
interface Option { content: VNode[], correct: boolean }

function childrenOf(v: VNode): VNode[] {
  const c = v?.children as unknown
  if (Array.isArray(c)) return c as VNode[]
  const slot = c && typeof c === 'object' ? (c as { default?: () => VNode[] }).default : undefined
  return typeof slot === 'function' ? (slot() ?? []) : []
}
const isTaskList = (v: VNode) => /\bcontains-task-list\b/.test(String((v?.props as Record<string, unknown> | null)?.class ?? ''))
const isCheckbox = (v: VNode) => v?.type === 'input'

/** Must be called during render (reading slots outside render makes Vue warn) */
function parse(): { prompt: VNode[], options: Option[] } {
  const nodes = (slots.default?.() ?? []).flatMap(v => (v.type === Fragment ? childrenOf(v) : [v]))
  const listIndex = nodes.findIndex(isTaskList)
  if (listIndex === -1) return { prompt: nodes, options: [] }

  const options = childrenOf(nodes[listIndex]!)
    .filter(li => childrenOf(li).some(isCheckbox))
    .map((li) => {
      const kids = childrenOf(li)
      const box = kids.find(isCheckbox)!
      const p = (box.props ?? {}) as Record<string, unknown>
      return { content: kids.filter(k => !isCheckbox(k)), correct: 'checked' in p && p.checked !== false }
    })
  return { prompt: nodes.filter((_, i) => i !== listIndex), options }
}

/* ---------- answering ---------- */
let correctSet: number[] = []
let multiple = false // set while rendering the options

function toggle(i: number) {
  if (checked.value) return
  if (multiple) {
    selected.value = selected.value.includes(i) ? selected.value.filter(x => x !== i) : [...selected.value, i]
  } else {
    selected.value = [i]
  }
}

const isCorrect = () =>
  selected.value.length === correctSet.length && correctSet.every(i => selected.value.includes(i))

function check() {
  if (!selected.value.length) return
  checked.value = true
  quiz?.answer(index, isCorrect())
}

function next() {
  quiz?.next()
}

function optionState(i: number, option: Option) {
  const isSelected = selected.value.includes(i)
  if (!checked.value) return isSelected ? 'selected' : 'idle'
  if (option.correct) return 'correct'
  return isSelected ? 'wrong' : 'idle'
}

const optionClass = {
  idle: 'border-muted hover:border-accented hover:bg-elevated/50',
  selected: 'border-primary bg-primary/10',
  correct: 'border-success bg-success/10',
  wrong: 'border-error bg-error/10'
} as const

const letter = (i: number) => String.fromCharCode(65 + i)
const markClass = {
  idle: 'border-accented text-muted',
  selected: 'border-primary bg-primary text-inverted',
  correct: 'border-success bg-success text-inverted',
  wrong: 'border-error bg-error text-inverted'
} as const

/* ---------- question + options (a render function, so the slot is read during render) ---------- */
const UBadge = resolveComponent('UBadge')
const UIcon = resolveComponent('UIcon')
const codeStyle = '[&_code]:rounded [&_code]:bg-elevated [&_code]:px-1 [&_code]:font-mono [&_code]:text-[0.85em]'

const QuestionBody = () => {
  const { prompt, options } = parse()
  correctSet = options.flatMap((o, i) => (o.correct ? [i] : []))
  multiple = props.type ? props.type === 'multiple' : correctSet.length > 1

  return h('div', [
    h('div', { class: 'mb-3 flex flex-wrap items-center gap-2' }, [
      h(UBadge, {
        label: multiple ? 'Multiple choice' : 'Single choice',
        icon: multiple ? 'i-lucide-list-checks' : 'i-lucide-circle-dot',
        color: 'neutral',
        variant: 'soft',
        size: 'sm'
      }),
      multiple ? h('span', { class: 'text-xs text-muted' }, 'Select all that apply') : null
    ]),
    h('div', { class: `quiz-prompt font-medium text-highlighted ${codeStyle}` }, prompt),
    h('div', { 'class': 'mt-4 grid gap-2', 'role': multiple ? 'group' : 'radiogroup', 'aria-label': 'Options' }, options.map((option, i) => {
      const state = optionState(i, option)
      const mark = state === 'correct'
        ? h(UIcon, { name: 'i-lucide-check', class: 'size-3.5' })
        : state === 'wrong'
          ? h(UIcon, { name: 'i-lucide-x', class: 'size-3.5' })
          : letter(i)
      return h('button', {
        'type': 'button',
        'role': multiple ? 'checkbox' : 'radio',
        'aria-checked': selected.value.includes(i),
        'disabled': checked.value,
        'class': ['flex w-full items-start gap-3 rounded-md border px-3 py-2.5 text-left text-sm transition-colors disabled:cursor-default', optionClass[state]],
        'onClick': () => toggle(i)
      }, [
        h('span', { class: ['mt-0.5 flex size-5 shrink-0 items-center justify-center border text-[11px] font-semibold', multiple ? 'rounded' : 'rounded-full', markClass[state]] }, mark),
        h('span', { class: `min-w-0 flex-1 text-default ${codeStyle}` }, option.content)
      ])
    }))
  ])
}
</script>

<template>
  <!-- render-time parsing keeps Vue happy about slot access -->
  <div v-if="isActive" class="px-4 py-5">
    <QuestionBody />

    <!-- feedback -->
    <div
      v-if="checked"
      class="mt-4 rounded-md border px-3 py-2.5 text-sm"
      :class="isCorrect() ? 'border-success/40 bg-success/10' : 'border-error/40 bg-error/10'"
      role="status"
    >
      <p class="flex items-center gap-1.5 font-semibold" :class="isCorrect() ? 'text-success' : 'text-error'">
        <UIcon :name="isCorrect() ? 'i-lucide-circle-check' : 'i-lucide-circle-x'" class="size-4" />
        {{ isCorrect() ? 'Correct!' : (multiple ? 'Not quite. The correct answers are highlighted.' : 'Not quite. The correct answer is highlighted.') }}
      </p>
      <div
        v-if="slots.explanation"
        class="mt-1.5 text-default [&_code]:rounded [&_code]:bg-elevated [&_code]:px-1 [&_code]:font-mono [&_code]:text-[0.85em] [&_p]:my-1"
      >
        <slot name="explanation" />
      </div>
    </div>

    <!-- actions -->
    <div class="mt-4 flex justify-end">
      <UButton
        v-if="!checked"
        label="Check answer"
        :disabled="!selected.length"
        @click="check"
      />
      <UButton
        v-else
        :label="isLast ? 'See results' : 'Next question'"
        :trailing-icon="isLast ? 'i-lucide-flag' : 'i-lucide-arrow-right'"
        @click="next"
      />
    </div>
  </div>
</template>
