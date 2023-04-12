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

const src = ref('https://chatgpt.letsearches.com/')


onMounted(() => {
    const loading = ElLoading.service({
        lock: true,
        text: '加载中......',
        background: 'rgba(0, 0, 0, 0.7)',
    })
    nextTick(() => {
        const iframe = document.getElementById('gpt')
        // if (!/*@cc_on!@*/0) { //if not IE
        //     iframe.onload = function () {
        //         // alert("Local iframe is now loaded1.");
        //             loading.close()
        //     };
        // } else {
        //     iframe.onreadystatechange = function () {
        //         if (iframe.readyState == "complete") {
        //             // alert("Local iframe is now loaded2.");
        //                 loading.close()
        //         }
        //     };
        // }
        if (iframe.attachEvent) {
            // For IE browsers
            iframe.attachEvent('onload', function () {
                // iframe 加载完成
                if (loading){loading.close()}
                console.log('iframe 加载完成');
            });
        } else {
            // For other browsers
            iframe.onload = function () {
                // iframe 加载完成
                if (loading){loading.close()}
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