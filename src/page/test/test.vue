<template>
    <div :class="{ dark: isDark }">
        <h1>{{ msg }}</h1>
        <el-button type="primary">Primary</el-button>
        <h1>Dark Mode Demo</h1>
        <p>Current mode: {{ isDark ? 'Dark' : 'Light' }}</p>
        <button @click="toggleTheme">Toggle Theme</button>
    </div>
</template>
<script setup>
import {ref} from 'vue'
import {useDark} from '../../util/useDark'

defineProps({
    msg: String
})

const dark = useDark()

const isDark = ref(dark.isDark)
const toggleTheme = () => {
    dark.toggle()
}
const count = ref(0)
</script>
<style>
.dark {
    background-color: #333;
    /* red */
    color: #fff;
}
</style>