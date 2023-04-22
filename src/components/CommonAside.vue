<template>
    <el-scrollbar style="background-color: #545c64">
        <el-menu
                :collapse="store.state.isCollapse"
                :default-active="ac_index"
                active-text-color="#ffd04b"
                background-color="#545c64"
                class="el-menu-vertical-demo"
                @select="Select"
        >
            <el-menu-item class="log_content">
                <el-icon>
                    <img :src="logoImg" alt="头像跑了👻"/>
                </el-icon>
                <template #title>
                    <div>API管理平台</div>
                </template>
            </el-menu-item>
            <template v-for="(item, index) in menuData" :key="index">
                <!--一级菜单-->
                <el-menu-item v-if="item.subClass.length === 0" :index="item.index">
                    <el-icon :size="size">
                        <Component :is="item.icon"></Component>
                    </el-icon>
                    <template #title>{{ item.title }}</template>
                </el-menu-item>
                <!--二级三级菜单-->
                <el-sub-menu v-if="item.subClass.length > 0" :index="item.index" popper-class="popperO">
                    <template #title>
                        <el-icon :size="size">
                            <Component :is="item.icon"></Component>
                        </el-icon>
                        <span>{{ item.title }}</span>
                    </template>
                    <div v-for="(itemSon, indexSon) in item.subClass" :key="indexSon">
                        <el-menu-item :index="itemSon.index">{{ itemSon.title }}</el-menu-item>
                    </div>
                </el-sub-menu>
            </template>
        </el-menu>
    </el-scrollbar>
</template>

<script setup>
import {onMounted, ref, watch} from 'vue'
import {useRouter} from "vue-router";

import {useStore} from 'vuex' // 引入useStore 方法
const store = useStore()  // 该方法用于返回store 实例
// 侧边栏展示
const logoImg = new URL(`/favicon.ico`, import.meta.url).href;
//菜单激活回调
const ac_index = ref('')
const router = useRouter()
const size = ref(24)

const menuData = [
    {
        index: "Navigation",
        icon: 'House',
        title: '快捷方式',
        subClass: []  // 二级菜单
    },
    {
        index: "2",
        icon: 'Menu',
        title: '项目管理',
        subClass: [
            {
                index: "ProjectList",
                title: '项目列表',
            },
            {
                index: "ApiList",
                title: '接口列表',
            },
            {
                index: "CaseList",
                title: '用例列表',
            },

        ]
    },
    {
        index: "debug",
        // icon: 'Connection',
        icon: 'Lightning',
        title: '接口调试',
        subClass: []
    },
    {
        index: "crontab",
        icon: 'AlarmClock',
        title: '定时任务',
        subClass: []  // 耳机菜单
    },
    {
        index: "tools",
        icon: 'Setting',
        title: '工具模块',
        subClass: [
            // {
            //     index: "AndroidTools",
            //     title: '安卓工具',
            // },
            // {
            //     index: "JsonTools",
            //     title: 'Json工具',
            // },
            {
                index: "Xmind2case",
                title: 'Xmind2case',
            }, {
                index: "ChatGPT",
                title: 'Chat GPT',
            },
            {
                index: "Message",
                title: 'Message',
            }
        ]
    },
    {
        index: "userInfo",
        icon: 'User',
        title: '个人中心',
        subClass: []
    },
    {
        index: "",
        icon: 'QuestionFilled',
        title: '帮助中心',
        subClass: []
    },
    {
        index: "testInfo",
        icon: 'Promotion',
        title: '测试模块',
        subClass: []
    },
]

function Select(index, path) {
    router.push({
        name: index
    })
}

window.addEventListener("beforeunload", () => {
    sessionStorage.setItem("store", JSON.stringify(store.state))
})
if (sessionStorage.getItem('store')) {
    store.replaceState(Object.assign({}, JSON.parse(sessionStorage.getItem("store"))))
}

onMounted(() => {
    if (sessionStorage.getItem('menu_id')) {
        ac_index.value = sessionStorage.getItem('menu_id');
    } else {
        ac_index.value = 'Navigation';
    }
})
watch(() => router.currentRoute.value.name, (newValue, oldValue) => {
    if (newValue === "ProjectApis" || newValue === "ProjectCases") {
        ac_index.value = "ProjectList"
        sessionStorage.setItem('menu_id', "ProjectList")
    } else {
        menuData.forEach((item) => {
            if (item.index === newValue) {
                ac_index.value = newValue
                sessionStorage.setItem('menu_id', newValue)
            } else if (item.subClass.length > 0) {
                item.subClass.forEach((son) => {
                    if (son.index === newValue) {
                        ac_index.value = newValue
                        sessionStorage.setItem('menu_id', newValue)
                    }
                })
            }
        })
    }
}, {immediate: true})
</script>

<style lang="less" scoped>
.el-menu-vertical-demo {
    border-right: none;
    --el-menu-text-color: #ffffff;

    &:not(.el-menu--collapse) {
        width: 200px;
    }
}

.log_content {
    pointer-events: none;
    display: flex;
    align-items: center;

    img {
        height: 45px;
        object-fit: cover;
        border-radius: 50%;
    }

    div {
        font-weight: 700;
        font-size: 20px;
        margin-left: 15px;
    }
}
</style>
<style lang="less">
// 无法穿透修改el-popper ;解决方案： 自定义一个样式，popper-class='popperO'，样式写在一对新style标签中，无需添加scoped，也不需要deep穿透；
.popperO {
    .el-menu-item {
        --el-menu-active-color: #ffd04b;
        --el-menu-text-color: #ffffff;
    }
}
</style>