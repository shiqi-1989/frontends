<template>
    <div class="add-api" @click="func1">
        <div class="add-api-icon">
            <el-icon :size="28" color="#409EFC">
                <DocumentAdd/>
            </el-icon>
        </div>
        <h4 class="add-api-text">
            快捷接口</h4>
    </div>
    <div class="add-api" @click="func2">
        <div class="add-api-icon">
            <el-icon :size="28" color="#409EFC">
                <Link/>
            </el-icon>
        </div>
        <h4 class="add-api-text">
            cURL解析</h4>
    </div>
</template>

<script setup>
const props = defineProps({
    func1: {
        type: Function,
        required: false
    },
    func2: {
        type: Function,
        required: false
    }
})
</script>

<style lang="less" scoped>

.add-api {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 150px;
    width: 130px;
    box-sizing: border-box;
    border-radius: 5px;
    border-color: transparent;
    //margin-right: 20px;
    transition: .2s ease-in-out;

    .add-api-icon {
        width: 60px;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 30px;

        .el-icon {
            color: #a3a300;
        }
    }

    .add-api-text {
        color: #747419;
        width: 80px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        text-align: center;
        margin-top: 25px;
    }

    &:hover {
        cursor: pointer;
        transform: scale(1.1);
        border: 1px solid #a3a300;
        //background-color: #d8e8fa;
    }

    &:hover .add-api-text {
        //color: #409EFC;
    }

}
</style>