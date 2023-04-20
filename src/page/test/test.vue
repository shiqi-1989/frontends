<template>
    <h2>测试文件
        <el-button @click="get_params_data(Data[0])">父组件
        </el-button>
    </h2>
    <Params v-for="(item, index) in Data" ref="paramsRef" :query-data="item.queryData"
            @getParams="(val)=>getParams(item, val)"></Params>
</template>

<script setup>
import Params from "../subcomponent/Params.vue"
import {ref, reactive} from "vue";

const Data = reactive([{
            url: "12321321321",
            queryData: [
                {
                    "name": "Accept",
                    "index": 0,
                    "value": "application/json, text/plain, */*",
                    "selected": true
                },
                {
                    "name": "Accept-Language",
                    "index": 1,
                    "value": "zh-CN,zh;q=0.9",
                    "selected": true
                },
                {
                    "name": "Authorization",
                    "index": 2,
                    "value": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOlwvXC95dW55aW5nYXBpLWRldi5odWF0dS5jb21cL2FwaVwveXlcL3N5c19hdXRoXC92MVwvdG9rZW4iLCJpYXQiOjE2Nzk5ODUwODYsImV4cCI6MTY4MDI0NDI4NiwibmJmIjoxNjc5OTg1MDg2LCJqdGkiOiJnMkRyQXRxclNpd3RGeDQyIiwic3ViIjo1NTE1MiwicHJ2IjoiYzQxYTJlNjk0ZmQ4NjRiNWFhZDcwYjE5ZGJkNDdhZDRiZTI1MzNhNCJ9.PCqQRFaNCCjVnzjqHzJ07FdJDOvO6rXzwmNM-Fc5gy4",
                    "selected": true
                },
                {
                    "name": "Connection",
                    "index": 3,
                    "value": "keep-alive",
                    "selected": true
                },
                {
                    "name": "Origin",
                    "index": 4,
                    "value": "http://yunying-alpha.huatu.com",
                    "selected": true
                },
                {
                    "name": "User-Agent",
                    "index": 5,
                    "value": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36",
                    "selected": true
                }
            ]
        }]
)
const paramsRef = ref(null)
const getParams = (item, val) => {
    console.log(item)
    console.log(val)
    item.queryData = val
    console.log(Data)
}
const get_params_data = (item) => {
    console.log(Data)
}


</script>

<style scoped>

</style>