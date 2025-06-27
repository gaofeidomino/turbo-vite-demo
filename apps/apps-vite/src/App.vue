<script setup>
import { useLoading } from '@gf/utils'
import HelloWorld from './components/HelloWorld.vue'
</script>

<template>
    <div v-loading="useLoading" class="h-screen box-border">
        <HelloWorld msg="Vite + Vue" class="text-center" />
    </div>
</template>
