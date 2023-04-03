<template>
    <el-button @click="showdiv">哈哈哈</el-button>
    <div class="box">

    </div>
</template>

<script setup>
import {ref} from 'vue'

const show = ref(false)
const showdiv = () => {
    if (!show.value) {
        document.querySelector('.box').classList.add('active')
    } else {
        document.querySelector('.box').classList.remove('active')
    }
    show.value = !show.value
}
</script>

<style lang="less" scoped>
.box {
    margin: 0 auto;
    width: 80%;
    height: 20px;
    display: block;
    line-height: 100px;
    background: #de1111;
    border: 1px solid #444;
    text-align: center;
    opacity: 0;
    animation: FadeOut 1s ease-in-out;
}

.box.active {
    display: block;
    opacity: 1;
    animation: FadeIn 1s ease-in-out;
}

@keyframes FadeIn {
    0% {
        opacity: 0;
        transform: translate(-80%, 0)
    }
    100% {
        opacity: 1;
        transform: translate(0, 0)

    }
}

@keyframes FadeOut {
    0% {
        opacity: 1;
        transform: translate(0, 0)

    }
    99% {
        opacity: 0;
    }
    100% {
        opacity: 0;
        transform: translate(-80%, 0)
    }
}

</style>
