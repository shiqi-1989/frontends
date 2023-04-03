<template>
    <header>
        <div class="l-content">
            <el-icon :class="[store.state.isCollapse?'icon-b':'icon-a']" :size="28" @click="handleMenu">
                <Expand/>
            </el-icon>
            <el-breadcrumb separator="/">
                <el-breadcrumb-item v-for="(item, index) in breadcrumbs"
                                    :to="index!==(breadcrumbs.length-1)?item.path:''">{{
                        item.meta.title
                    }}
                </el-breadcrumb-item>
            </el-breadcrumb>
        </div>

        <div class="r-content">
            <em style="margin-right: 10px;">欢迎： {{ userInfo.username || '未登录' }}</em>
            <el-dropdown :teleported="false" size="mini" trigger="click" @command="handleCommand">
                <span>
                   <img :src="userImg" alt=""/>
                </span>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item command="1">个人中心</el-dropdown-item>
                        <el-dropdown-item command="2">退出</el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </div>
    </header>
</template>

<script setup>
import {ref, watch} from "vue";
import {useStore} from 'vuex'
import {useRouter} from "vue-router"; // 引入useStore 方法
const store = useStore()  // 该方法用于返回store 实例
const userInfo = ref(JSON.parse(localStorage.getItem('userInfo')))
const userImg = new URL(`/avatars.png`, import.meta.url).href;
const router = useRouter()
const handleCommand = (command) => {
    switch (command) {
        case '1':
            console.log("个人中心");
            router.push({
                path: "/userInfo"
            });
            break;
        case '2':
            console.log("退出登录");
            localStorage.clear();
            router.push({name: 'login'});

    }
}

function handleMenu() {
    store.commit('collapseMenu')
}

const breadcrumbs = ref([])
watch(() => router.currentRoute.value.path, (newValue, oldValue) => {
    // console.log('watch', newValue);
    breadcrumbs.value = router.currentRoute.value.matched
}, {immediate: true})
</script>

<style lang="less" scoped>
header {
    display: flex;
    height: 100%;
    justify-content: space-between;
    align-items: center;
    color: #646d76;
}

.l-content {
    display: inline-flex;
    align-items: center;
    cursor: pointer;

    .icon-b {
        transition: all .6s;
    }

    .icon-a {
        transform: rotate(-180deg);
        transition: all .6s;
    }

}

.r-content {
    display: inline-flex;
    align-items: center;
    justify-content: center;

    img {
        cursor: pointer;
        width: 45px;
        height: 45px;
        object-fit: cover;
        border-radius: 50%;
    }
}

.el-breadcrumb {
    margin-left: 10px;

}
</style>