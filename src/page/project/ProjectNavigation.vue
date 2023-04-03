<template>
    <div class="project-nav-box">
        <div class="header">
            <el-page-header @back="onBack">
                <template #content>
                    <el-icon :size="24" style="vertical-align: middle;color: #79bbff;">
                        <FolderOpened/>
                    </el-icon>
                    <div class="proName">
                        {{
                            projectName
                        }}
                    </div>
                </template>
            </el-page-header>
            <el-menu
                    :default-active="activeIndex"
                    :ellipsis="false"
                    class="el-menu-demo"
                    mode="horizontal"
                    router
            >
                <el-menu-item :index="projectApis">
                    <span>api列表</span>
                </el-menu-item>
                <el-menu-item :index="projectCases">
                    <span>用例列表</span>
                </el-menu-item>

            </el-menu>
        </div>
        <div class="api-main">
            <router-view></router-view>
        </div>
    </div>
</template>
<script setup>
import {ref, watch} from 'vue'
import {useRouter} from "vue-router";

const router = useRouter()
let projectId = router.currentRoute.value.query?.id
let projectName = router.currentRoute.value.params?.title
if (projectName) {
    sessionStorage.setItem("projectName", projectName)
} else {
    projectName = sessionStorage.getItem("projectName")
}
// const projectApis = ref(`/ProjectManagement/ProjectApis?id=${projectId}`)
// const projectCases = ref(`/ProjectManagement/ProjectCases?id=${projectId}`)
// const projectApis = ref(`/ProjectManagement/${projectId}/ProjectApis`)
// const projectCases = ref(`/ProjectManagement/${projectId}/ProjectCases`)
const projectApis = ref(`/ProjectApis?id=${projectId}`)
const projectCases = ref(`/ProjectCases?id=${projectId}`)
const activeIndex = ref("")

// const handleSelect = (key, keyPath) => {
//     localStorage.setItem('project_detail_son_id', key)
// }
// onMounted(() => {
//     // activeIndex.value = localStorage.getItem('project_detail_son_id');
//
//     setTimeout(function () {
//         router.push(`/ProjectManagement/3/ProjectApis`)
//         router.go(0)
//     })
// })

watch(() => router.currentRoute.value.name, (newValue, oldValue) => {
    if (newValue === "ProjectCases") {
        activeIndex.value = projectCases.value
        // router.push(projectCases.value)
    } else {
        activeIndex.value = projectApis.value
        // router.push(projectApis.value)
    }
}, {immediate: true})

const onBack = () => {
    // router.go(-1);
    // router.push('/ProjectManagement/ProjectList');
    router.push('/ProjectList');
}
// const projectDetail = () => {
//     apis.projectDetail(projectId)
//             .then(({data}) => {
//                 projectName.value = data.data.title
//             })
// }
// projectDetail()
</script>
<style lang="less" scoped>
.project-nav-box {
    display: flex;
    flex-direction: column;

    .header {
        display: flex;
        align-items: center;
        height: 40px;
        flex-direction: row;
    }

    :deep(.el-page-header__breadcrumb) {
        margin-bottom: 0;
    }

    :deep(.el-menu--horizontal) {
        border-bottom: none;
    }

    :deep(.el-page-header__left) {
        margin-right: 20px;
    }

    :deep(.el-page-header__content) {
        display: flex;
        align-items: center;
    }

    .proName {
        font-weight: 600;
        color: #14C4BC;
        margin-left: 10px;
        height: 23px;
        line-height: 25px;
    }

    .el-menu {
        height: 100%;
        box-sizing: border-box;
    }

    .api-main {
        flex: 1;
    }
}

</style>