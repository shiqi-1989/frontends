<template>
    <div class="ChatGPT">
        <iframe :src="src" height="100%" width="100%"
                style="border: none;">

        </iframe>
    </div>

</template>

<script setup>
import {nextTick, onMounted, ref} from "vue";

const src = ref('https://gpttalk.live')
</script>

<style lang="less" scoped>
.ChatGPT {
    width: 100%;
    height: 100%;
    padding-top: 20px;
    box-sizing: border-box;
}
</style>