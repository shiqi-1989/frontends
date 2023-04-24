<template>
    <div class="ChatGPT">
        <iframe id="gpt" :src="src" height="100%" width="100%"
                style="border: none;">

        </iframe>
    </div>

</template>

<script setup>
import {nextTick, onMounted, ref} from "vue";
import {ElLoading} from "element-plus";
import {myLoading} from "../../util/loadding.js"

const src = 'https://chat.wuguokai.cn/#/chat/1682327642298'


onMounted(() => {
    // const loading = ElLoading.service({
    //     lock: true,
    //     text: '加载中......',
    //     background: 'rgba(0, 0, 0, 0.7)',
    // })
    myLoading.show("客官: 静心、静心 ...");
    nextTick(() => {
        const iframe = document.getElementById('gpt')
        if (iframe.attachEvent) {
            // For IE browsers
            iframe.attachEvent('onload', function () {
                // iframe 加载完成
                // if (loading){loading.close()}
                myLoading.hide()
                console.log('iframe 加载完成');
            });
        } else {
            // For other browsers
            iframe.onload = function () {
                // iframe 加载完成
                // if (loading){loading.close()}
                myLoading.hide()
                console.log('iframe 加载完成');
            };
        }

    })

})

</script>

<style lang="less" scoped>
.ChatGPT {
    width: 100%;
    height: 100%;
    padding-top: 20px;
    box-sizing: border-box;
}
</style>