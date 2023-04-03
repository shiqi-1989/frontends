<template>
    <div class="xmind_box">
        <iframe :src="src" height="100%" width="100%"
                style="border: none;">

        </iframe>
    </div>

</template>

<script setup>
import {ref} from "vue";
import apis from "../../../api/api";

const src = ref('')
apis.xmind2case()
        .then(({data}) => {
            src.value = data.data.url
        })

</script>

<style scoped>
.xmind_box {
    width: 100%;
    height: 100%;
    padding-top: 20px;
    box-sizing: border-box;
}
</style>