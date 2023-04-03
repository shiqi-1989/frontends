<template>
  <router-view/>
</template>
<script setup>
import {nextTick, provide, ref} from "vue";

const isRouterActive = ref(true)
provide('reload', () => {
  isRouterActive.value = false
  nextTick(() => {
    isRouterActive.value = true
  })
})
</script>
<style>
#app {
  height: 100%;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /*text-align: center;*/
  color: #2c3e50;
  /*margin-top: 60px;*/
}
</style>
