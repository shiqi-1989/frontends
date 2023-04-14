<template>
    <div class="loading-container" v-if="msg?.show">
        <!-- 使用Vue3的内置指令v-if来控制加载动画的显示和隐藏 -->
        <div class="loading">
            <span v-for="i in 7"></span>
        </div>
        <!-- 可以在加载动画中添加一些文本，提示用户正在加载中 -->
        <div class="loading-text">{{ msg?.text }}</div>
    </div>
</template>

<script setup>
const props = defineProps({
    msg: {
        type: Object,
        required: false,
        default: false
    }
})
</script>
<style src="../assets/css/pageLoading.css" scoped/>
<style scoped lang="less">
.loading-container {
    width: 100%;
    height: 100%;
    position: fixed;
    top: 0;
    left: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: rgba(40, 40, 40, 0.8);
    z-index: 999;
}

.loading {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    justify-content: space-between;
    width: 4.5em;
}

span {
    width: 0.3em;
    height: 1.3em;
    background-color: #3cefff;
}

.loading-text {
    margin-top: 20px;
    //margin-left: 10px;
    font-size: 14px;
    color: #57c5ff;
}

span:nth-of-type(1) {
    animation: grow 1s -0.9s ease-in-out infinite;
}

span:nth-of-type(2) {
    animation: grow 1s -0.75s ease-in-out infinite;
}

span:nth-of-type(3) {
    animation: grow 1s -0.6s ease-in-out infinite;
}

span:nth-of-type(4) {
    animation: grow 1s -0.45s ease-in-out infinite;
}

span:nth-of-type(5) {
    animation: grow 1s -0.3s ease-in-out infinite;
}

span:nth-of-type(6) {
    animation: grow 1s -0.15s ease-in-out infinite;
}

span:nth-of-type(7) {
    animation: grow 1s ease-in-out infinite;
}


@keyframes grow {
    0%,
    100% {
        transform: scaleY(1);
    }

    50% {
        transform: scaleY(2);
    }
}
</style>
