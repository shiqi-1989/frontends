<template>
    <el-container style="height: 100%;">
        <!--侧边栏-->
        <el-aside width="auto">
            <CommonAside></CommonAside>
        </el-aside>
        <el-container>
            <el-header style="height: 56px;">
                <CommonHeader></CommonHeader>
            </el-header>
            <el-main>
                <router-view></router-view>
            </el-main>
        </el-container>
    </el-container>
</template>
<script setup>
import CommonAside from '../../components/CommonAside.vue'
import CommonHeader from '../../components/CommonHeader.vue'</script>
<style lang="less" scoped>
.el-header {
    // background-color: #333;
    position: relative;
    border-bottom: 1px solid #d8d8d8;
}

.el-main {
    position: relative;
    // padding: 0 20px;
    padding-top: 0;
}
</style>