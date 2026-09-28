<script setup lang="ts">
const route = useRoute()
const showMobileMenu = ref(true)
const items = computed(() => [
  {
    label: 'Home',
    to: '/',
    icon: 'i-lucide-home',
    active: route.path === '/'
  }, {
    label: 'Learn',
    icon: 'i-lucide-book-open',
    active: route.path.startsWith('/learn'),
    children: [
      {
        label: 'Javascript',
        description: 'Learn the fundamentals of JavaScript, the programming language of the web.',
        to: '/learn/javascript',
        icon: 'i-simple-icons-javascript',
        active: route.path === '/learn/javascript'
      } /* ,
      {
        label: 'Node JS',
        description: 'Learn the fundamentals of Node.js, the JavaScript runtime built on Chrome\'s V8 JavaScript engine.',
        to: '/learn/nodejs',
        icon: 'i-simple-icons-nodedotjs',
        active: route.path === '/learn/nodejs'
      } */
    ]
  }, {
    label: 'Playground',
    icon: 'i-lucide-square-terminal',
    to: '/playground',
    active: route.path.startsWith('/playground')
  }
])
watch(() => route.path, () => {
  showMobileMenu.value = false
})
</script>

<template>
  <UHeader>
    <template #left>
      <NuxtLink
        to="/"
        aria-label="ByteJS"
        class="flex items-center gap-2"
      >
        <AppLogo class="w-auto h-6 shrink-0" />
      </NuxtLink>
    </template>

    <UNavigationMenu
      :items="items"
      class="w-2xl"
    />

    <template #body>
      <UNavigationMenu :items="items" orientation="vertical" class="-mx-2.5" />
    </template>

    <template #right>
      <UColorModeButton />
    </template>
  </UHeader>
</template>
