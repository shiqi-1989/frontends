<template>
    <el-row :gutter="20" class="home">
        <el-col :span="8">
            <!--用户信息展示-->
            <el-card shadow="always">
                <div class="user">
                    <img :src="userImg" alt="">
                    <div class="userinfo">
                        <p class="name">{{ userInfo.username }}</p>
                        <!--<p class="access">超级管理员</p>-->
                    </div>
                </div>
                <el-divider/>
                <div class="login-info">
                    <p>登录时间：<span>{{ userInfo.login_time }}</span></p>
                    <p>登录地点：<span>{{ getAddrInfo.city }}</span></p>
                    <p>通信地址：<span>{{ getAddrInfo.addr }}</span></p>
                    <p>外网地址：<span>{{ getAddrInfo.network }}</span></p>
                </div>
            </el-card>
            <!--表格数据展示-->
            <el-card style="margin-top: 20px">
                <el-table :data="tableData" height="406">
                    <el-table-column v-for="(value, key) in tableLabel" :key="key" :label="value" :prop="key"/>
                </el-table>
            </el-card>
        </el-col>
        <el-col :span="16">
            <div class="num">
                <el-card v-for="item in countData" :key="item.name" :body-style="{display:'flex',padding:0}">
                    <el-icon :style="{background:item.color}" class="icon">
                        <component :is="item.icon"></component>
                    </el-icon>
                    <div class="detail">
                        <p class="num">{{ item.value }}</p>
                        <p class="text">{{ item.name }}</p>
                    </div>
                </el-card>
            </div>
            <!--折线图-->
            <el-card style="height: 280px;">
            </el-card>
            <div class="graph">
                <!--柱状体-->
                <el-card style="height: 260px;"></el-card>
                <!--饼状图-->
                <el-card style="height: 260px;"></el-card>
            </div>
        </el-col>
    </el-row>
</template>
<script setup>

const userImg = new URL(`/avatars.png`, import.meta.url).href;


const getAddrInfo = JSON.parse(sessionStorage.getItem('cityInfo'));
const userInfo = JSON.parse(localStorage.getItem('userInfo'));
const tableLabel = {
    date: "Date_shi",
    name: "Name_shi",
    address: "Address_shi",
}
const tableData = [
    {
        date: '2016-05-03',
        name: 'Tom',
        address: 'No. 189, Grove St, Los Angeles',
    },
    {
        date: '2016-05-02',
        name: 'Tom',
        address: 'No. 189, Grove St, Los Angeles',
    },
    {
        date: '2016-05-04',
        name: 'Tom',
        address: 'No. 189, Grove St, Los Angeles',
    },
    {
        date: '2016-05-01',
        name: 'Tom',
        address: 'No. 189, Grove St, Los Angeles',
    },
    {
        date: '2016-05-08',
        name: 'Tom',
        address: 'No. 189, Grove St, Los Angeles',
    },
    {
        date: '2016-05-06',
        name: 'Tom',
        address: 'No. 189, Grove St, Los Angeles',
    },
    {
        date: '2016-05-07',
        name: 'Tom',
        address: 'No. 189, Grove St, Los Angeles',
    },
]
const countData = [
    {
        name: "本日新增",
        value: 2,
        icon: "UploadFilled",
        color: "#17b5ba"
    },
    {
        name: "今日成功",
        value: 2,
        icon: "CircleCheckFilled",
        color: "#098a16"
    },
    {
        name: "今日失败",
        value: 2,
        icon: "CircleCloseFilled",
        color: "#f17035"
    },
    {
        name: "本月新增",
        value: 2,
        icon: "UploadFilled",
        color: "#17b5ba"
    },
    {
        name: "本月成功",
        value: 2,
        icon: "CircleCheckFilled",
        color: "#098a16"
    },
    {
        name: "本月失败",
        value: 2,
        icon: "CircleCloseFilled",
        color: "#f17035"
    },

]
</script>
<style lang="less" scoped>
</style>