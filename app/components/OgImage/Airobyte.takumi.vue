<script setup lang="ts">
defineProps<{ title: string, description: string }>()
</script>

<template>
  <div style="display:flex;height:100%;width:100%;box-sizing:border-box;background:#07141d;color:#f8fafc;font-family:Arial,sans-serif;padding:68px">
    <div style="display:flex;flex-direction:column;justify-content:space-between;width:100%">
      <div style="font-size:34px;font-weight:700;color:#67e8f9">AiroByte</div>
      <div>
        <h1 style="font-size:64px;line-height:1.12;margin:0 0 26px;font-weight:700">
          {{ title }}
        </h1>
        <p style="font-size:30px;line-height:1.4;margin:0;color:#cbd5e1">
          {{ description }}
        </p>
      </div>
      <div style="font-size:24px;color:#94a3b8">
        Learn programming, one clear lesson at a time.
      </div>
    </div>
  </div>
</template>
