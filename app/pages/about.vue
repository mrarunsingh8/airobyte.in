<script setup lang="ts">
// Drop your photo in public/about/ and set the path here, e.g. '/about/arun.jpg'.
// While empty, a placeholder is shown in its place.
const photo = '/about/arun-sketch.png'

const years = new Date().getFullYear() - 2014

const story = [{
  date: 'The night before',
  title: 'An interview, and a blank mind',
  description: 'I had an interview the next morning. I knew JavaScript. I used it every single day. But sitting there with my notes, I couldn\'t remember what I was supposed to revise. Closures? Hoisting? The event loop? Which came first, and what had I already forgotten?',
  icon: 'i-lucide-moon'
}, {
  date: 'The search',
  title: 'Twenty tabs and no map',
  description: 'I opened tutorials, old bookmarks, videos and blog posts. Each one started in a different place, skipped different things, and none of them showed the whole picture. I spent more time looking for what to study than actually studying.',
  icon: 'i-lucide-search'
}, {
  date: 'The realisation',
  title: 'It wasn\'t just me',
  description: 'When I talked to friends and to developers I had mentored, I heard the same thing again and again. Beginners didn\'t know where to start. Experienced people didn\'t know where to restart. Everyone was rebuilding the same roadmap from scratch.',
  icon: 'i-lucide-users'
}, {
  date: 'The idea',
  title: 'One place to learn and come back to',
  description: 'So I asked myself: what if there were one place with the whole roadmap, written simply, in order, with examples you can run? A place to learn from zero, and to return to whenever you need to brush up. For me, and for anyone in the same spot.',
  icon: 'i-lucide-lightbulb'
}, {
  date: 'Today',
  title: 'AiroByte',
  description: 'That idea became AiroByte. It started with JavaScript, one lesson at a time, and it keeps growing with every topic I wish I\'d had written down.',
  icon: 'i-lucide-rocket'
}]

const mission = [{
  title: 'Clear',
  description: 'Every topic explained in plain language, one idea at a time, with no jargon left unexplained.',
  icon: 'i-lucide-sparkles'
}, {
  title: 'Complete',
  description: 'The full roadmap, from the very first variable to the topics interviewers love to ask about.',
  icon: 'i-lucide-map'
}, {
  title: 'Always there',
  description: 'Built to be revisited. Come back next week, next month or next year, and pick up exactly where you need to.',
  icon: 'i-lucide-bookmark'
}]

const vision = [{
  title: 'No more scattered notes',
  description: 'Instead of hunting across bookmarks and videos, you open one place and see everything in order.',
  icon: 'i-lucide-folder-check'
}, {
  title: 'Confidence before every interview',
  description: 'You know what you know, you know what you have forgotten, and you know exactly where to refresh it.',
  icon: 'i-lucide-shield-check'
}, {
  title: 'More languages, same simplicity',
  description: 'JavaScript is only the beginning. Every future course will follow the same zero-to-hero path.',
  icon: 'i-lucide-layers'
}]

const unique = [{
  title: 'The whole roadmap, in order',
  description: 'Every course is a single path from the basics to advanced topics. You always see where you are, what came before and what comes next.',
  icon: 'i-lucide-route'
}, {
  title: 'Run the code on the page',
  description: 'Examples come with a built-in playground. Change a number, break something, press run and see what happens, without installing anything.',
  icon: 'i-lucide-square-terminal'
}, {
  title: 'Stories, not foo and bar',
  description: 'Concepts are taught through things you already understand: booking cinema seats, adding items to a cart, calculating exam results.',
  icon: 'i-lucide-ticket'
}, {
  title: 'Takeaways for fast revision',
  description: 'Every lesson ends with a short list of key points. Skim them before an interview and the whole topic comes back.',
  icon: 'i-lucide-list-checks'
}, {
  title: 'One idea per lesson',
  description: 'Lessons are short on purpose. You can finish one on a tea break and still feel like you moved forward.',
  icon: 'i-lucide-timer'
}, {
  title: 'Search across everything',
  description: 'Forgot where a topic lives? Search every lesson in every course from anywhere on the site.',
  icon: 'i-lucide-search'
}]

const reasons = [{
  title: 'It starts from zero',
  description: 'No assumptions about what you already know. If you have never written a line of code, the first lesson is written for you.',
  icon: 'i-lucide-footprints'
}, {
  title: 'It is built to be revisited',
  description: 'Most tutorials are read once and forgotten. AiroByte is meant to be your reference, the page you open again and again.',
  icon: 'i-lucide-repeat'
}, {
  title: 'It is written from real experience',
  description: 'The topics come from more than a decade of writing software, leading teams and sitting on both sides of the interview table.',
  icon: 'i-lucide-briefcase'
}, {
  title: 'It respects your time',
  description: 'No long introductions and no filler. Just what you need to understand the topic and move on.',
  icon: 'i-lucide-clock'
}]

const helps = [{
  label: 'Just starting out',
  icon: 'i-lucide-sprout',
  slot: 'beginner' as const
}, {
  label: 'Preparing for an interview',
  icon: 'i-lucide-target',
  slot: 'interview' as const
}, {
  label: 'Already a developer',
  icon: 'i-lucide-code-xml',
  slot: 'developer' as const
}]

useSeoMeta({
  title: 'About',
  description: 'Meet Arun Kumar and find out why he built AiroByte: one place to learn programming from zero and brush up on every topic before an interview.'
})
</script>

<template>
  <div>
    <!-- About me -->
    <div class="relative overflow-hidden">
      <div
        aria-hidden="true"
        class="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_50%_50%_at_75%_20%,var(--ui-color-primary-500)_0%,transparent_70%)] opacity-15 dark:opacity-20"
      />

      <UContainer class="py-16 sm:py-24">
        <div class="grid items-center gap-12 lg:grid-cols-[1fr_340px] lg:gap-16">
          <div class="order-2 lg:order-1">
            <p class="text-lg tracking-wider text-primary">
              About
            </p>
            <h1 class="mt-4 text-4xl font-bold tracking-tight text-highlighted sm:text-5xl lg:text-6xl">
              Hi, I'm Arun Kumar.
            </h1>
            <div class="mt-6 space-y-4 text-lg leading-relaxed text-muted">
              <p>
                I'm a full-stack developer who has been writing software for more than {{ years }} years. I started out building small websites and slowly worked my way into designing and running large web applications in the cloud. Today I also lead a team of developers.
              </p>
              <p>
                Over the years I have worked with many people who were just getting started, and I have been that beginner myself. I know how it feels to stare at code that makes no sense, and how good it feels when it finally clicks. That's why I like explaining things simply, with examples from everyday life.
              </p>
              <p>
                When I'm not at work, I'm usually writing lessons for AiroByte.
              </p>
            </div>

            <UButton
              to="https://www.linkedin.com/in/arunkumarsde/"
              target="_blank"
              rel="noopener"
              label="Connect on LinkedIn"
              icon="i-simple-icons-linkedin"
              color="neutral"
              variant="outline"
              size="lg"
              class="mt-8"
            />
          </div>

          <!-- Photo -->
          <div class="order-1 mx-auto w-56 sm:w-72 lg:order-2 lg:w-full">
            <div class="relative">
              <div aria-hidden="true" class="absolute -inset-4 -z-10 rotate-3 rounded-3xl bg-primary/20 blur-2xl" />
              <div aria-hidden="true" class="absolute inset-0 translate-x-3 translate-y-3 rounded-2xl border-2 border-primary/40" />
              <div class="relative aspect-4/5 overflow-hidden rounded-2xl border border-default bg-elevated">
                <NuxtImg
                  v-if="photo"
                  :src="photo"
                  alt="Portrait of Arun Kumar"
                  class="size-full object-cover"
                  width="680"
                  height="850"
                />
                <div
                  v-else
                  class="flex size-full flex-col items-center justify-center gap-3 bg-[repeating-linear-gradient(45deg,transparent,transparent_12px,var(--ui-border)_12px,var(--ui-border)_13px)] text-dimmed"
                >
                  <UIcon name="i-lucide-image-plus" class="size-12" />
                  <span class="text-sm font-medium">Arun Kumar</span>
                  <!-- <span class="font-mono text-xs">4:5 · public/about/</span> -->
                  <span class="font-mono text-xs">SDE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </UContainer>
    </div>

    <!-- The story -->
    <UPageSection
      headline="The story"
      title="It started with a forgotten roadmap"
      description="Every time I prepared for an interview, I got stuck. I had forgotten the roadmap, and I couldn't remember which topics to brush up on. Here's how that frustration turned into AiroByte."
      orientation="horizontal"
      :ui="{ container: 'lg:items-start' }"
    >
      <UTimeline
        :items="story"
        :default-value="story.length - 1"
        size="lg"
        :ui="{ title: 'text-base', description: 'text-base leading-relaxed' }"
      />
    </UPageSection>

    <USeparator />

    <!-- Mission -->
    <UPageSection
      headline="Mission"
      title="One clear place to learn, and to come back to"
      description="My mission is to give every learner a single place to learn programming from zero, and a place to return to whenever they need to brush up, whether that's tomorrow or three years from now."
      orientation="horizontal"
    >
      <div class="space-y-8">
        <UPageFeature
          v-for="item in mission"
          :key="item.title"
          v-bind="item"
          orientation="horizontal"
          :ui="{ title: 'text-base', description: 'text-base' }"
        />
      </div>
    </UPageSection>

    <!-- Vision -->
    <UPageSection
      headline="Vision"
      title="Nobody walks into an interview unsure of what they know"
      description="I picture a day when the whole roadmap is always one click away. When revising means opening one page, not twenty tabs. When a beginner and a senior developer can both open the same course and each find exactly what they need."
      orientation="horizontal"
      reverse
    >
      <div class="space-y-8">
        <UPageFeature
          v-for="item in vision"
          :key="item.title"
          v-bind="item"
          orientation="horizontal"
          :ui="{ title: 'text-base', description: 'text-base' }"
        />
      </div>
    </UPageSection>

    <USeparator />

    <!-- What's unique -->
    <UPageSection
      headline="What's unique here"
      title="Built for learning, designed for revising"
      description="Most tutorials are written to be read once. AiroByte is written to be read, run, and read again."
      :features="unique"
    />

    <USeparator />

    <!-- Why choose -->
    <UPageSection
      headline="Why choose AiroByte"
      title="Because learning should feel like progress, not a search"
      description="There are thousands of places to learn programming. This is why I think AiroByte deserves a spot in your bookmarks."
      orientation="horizontal"
      :features="reasons"
    >
      <UPageFeature
        title="&quot;I wanted the resource I wished I had the night before my interview.&quot;"
        description="Arun Kumar, founder of AiroByte"
        icon="i-lucide-quote"
        :ui="{ title: 'text-xl sm:text-2xl leading-snug', description: 'mt-2' }"
      />
    </UPageSection>

    <USeparator />

    <!-- How it helps -->
    <UPageSection
      headline="How it helps"
      title="Wherever you are on the journey"
      description="AiroByte works differently depending on where you're starting from. Pick the one that sounds like you."
    >
      <UTabs :items="helps" variant="link" class="w-full" :ui="{ list: 'justify-center', content: 'pt-8' }">
        <template #beginner>
          <div class="grid gap-10 lg:grid-cols-2">
            <p class="text-lg leading-relaxed text-muted">
              You've heard that coding is a good skill to have, but every tutorial seems to start in the middle. On AiroByte you begin at the very first lesson, <span class="text-highlighted">What is JavaScript?</span>, and move forward one small step at a time. Each lesson builds on the last, so by the time you reach loops, arrays and objects they feel like the natural next step, not a wall.
            </p>
            <div class="space-y-6">
              <UPageFeature title="Follow the path in order" description="The sidebar shows every module, so you always know what's next." icon="i-lucide-list-ordered" orientation="horizontal" />
              <UPageFeature title="Try every example yourself" description="Run and edit the code right in the lesson until it makes sense." icon="i-lucide-play" orientation="horizontal" />
              <UPageFeature title="Check what stuck" description="Read the key takeaways at the end before moving on." icon="i-lucide-check-check" orientation="horizontal" />
            </div>
          </div>
        </template>

        <template #interview>
          <div class="grid gap-10 lg:grid-cols-2">
            <p class="text-lg leading-relaxed text-muted">
              You know this stuff, or you used to. The interview is in a few days and you need to bring it all back quickly. Open the roadmap, see every topic on one screen, and jump straight to the ones that feel rusty. Skim the takeaways, run the examples, and walk in knowing exactly what you know.
            </p>
            <div class="space-y-6">
              <UPageFeature title="Scan the full roadmap" description="Spot the gaps in minutes instead of hours." icon="i-lucide-map" orientation="horizontal" />
              <UPageFeature title="Revise with takeaways" description="Short summaries built for last-minute revision." icon="i-lucide-list-checks" orientation="horizontal" />
              <UPageFeature title="Search any topic" description="Find hoisting, closures or switch statements instantly." icon="i-lucide-search" orientation="horizontal" />
            </div>
          </div>
        </template>

        <template #developer>
          <div class="grid gap-10 lg:grid-cols-2">
            <p class="text-lg leading-relaxed text-muted">
              You write code every day, but there are topics you skipped years ago and quietly work around. AiroByte is a good place to finally understand them properly, or to double-check a concept before you explain it to someone on your team. Short lessons mean you can fill a gap in the time it takes to drink a cup of tea.
            </p>
            <div class="space-y-6">
              <UPageFeature title="Fill the old gaps" description="Revisit the fundamentals without starting over." icon="i-lucide-puzzle" orientation="horizontal" />
              <UPageFeature title="Share with your team" description="Send a lesson link to a junior who's stuck on the same thing." icon="i-lucide-share-2" orientation="horizontal" />
              <UPageFeature title="Stay sharp" description="Keep the basics fresh as new courses are added." icon="i-lucide-trending-up" orientation="horizontal" />
            </div>
          </div>
        </template>
      </UTabs>
    </UPageSection>

    <!-- CTA -->
    <UPageSection>
      <UPageCTA
        title="Whether you're starting out or brushing up, I'm glad you're here"
        description="Open the JavaScript course from lesson one, or jump straight to the topic you need today."
        variant="subtle"
        :links="[
          { label: 'Start the JavaScript course', to: '/learn/javascript', trailingIcon: 'i-lucide-arrow-right', size: 'xl' as const },
          { label: 'Browse all courses', to: '/learn', icon: 'i-lucide-library', color: 'neutral' as const, variant: 'outline' as const, size: 'xl' as const }
        ]"
      />
    </UPageSection>
  </div>
</template>
