<template>
    <div class="loader" v-if="msg?.show">
        <div class="scanner">
            <span>Loading...</span>
        </div>
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

<style scoped lang="less">

.loader {
    width: 100%;
    height: 100%;
    position: fixed;
    top: 0;
    left: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(40, 40, 40, 0.8);
    z-index: 999;
}
.scanner span {
  color: transparent;
  font-size: 1.4rem;
  position: relative;
  overflow: hidden;
}

.scanner span::before {
  content: "Loading...";
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  border-right: 4px solid #17FEFF;
  overflow: hidden;
  color: #17FEFF;
  animation: load91371 2s linear infinite;
}

@keyframes load91371 {
  0%, 10%, 100% {
    width: 0;
  }

  10%,20%,30%,40%,50%,60%,70%,80%,90%,100% {
    border-right-color: transparent;
  }

  11%,21%,31%,41%,51%,61%,71%,81%,91% {
    border-right-color: #17FEFF;
  }

  60%, 80% {
    width: 100%;
  }
}
</style>
