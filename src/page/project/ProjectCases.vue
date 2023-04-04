<template>
    <div id="topToolbar">
        <el-form
                ref="queryConditionRef"
                :inline="true"
                :model="query.queryData">
            <el-form-item label="" prop="id">
                <el-input v-model="query.queryData.id" clearable placeholder="用例id"/>
            </el-form-item>
            <el-form-item label="" prop="title">
                <el-input v-model="query.queryData.title" clearable placeholder="用例名称"/>
            </el-form-item>
            <el-form-item label="" prop="creator__username">
                <el-input v-model="query.queryData.creator__username" clearable placeholder="创建者"/>
            </el-form-item>
            <el-form-item>
                <el-button icon="Search" type="" @click.prevent="search">查询</el-button>
                <el-button icon="Refresh" type="" @click.prevent="resetQuery">重置</el-button>
            </el-form-item>
            <el-form-item>
                <el-button type="success" @click="addCase">新增</el-button>
                <el-button type="danger" @click="batchRemove">删除</el-button>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="runCase(null, null, 0)">批量执行</el-button>
            </el-form-item>
        </el-form>
    </div>
    <el-table
            ref="multipleTableRef"
            :data="table.tableData"
            :max-height="tableHeight"
            :row-class-name="tableRowClassName"
            border
            style="width: 100%;"
            @selection-change="handleSelectionChange"
    >
        <el-table-column type="selection" width="55"/>
        <el-table-column v-for="(value, key, index) in table.tableLabel" :key="index" :label="value"
                         :min-width="c_width(index)"
        >
            <template #default="scope">
                <el-tag v-if="key==='creator'">{{ scope.row.creator }}</el-tag>
                <el-popover v-else-if="key==='project'" effect="light" placement="top" trigger="hover" width="auto">
                    <template #default>
                        <div v-show="scope.row.project">项目ID：{{ scope.row.project }}</div>
                    </template>
                    <template #reference>
                        <el-tag v-show="scope.row.project_name">{{ scope.row.project_name }}</el-tag>
                    </template>
                </el-popover>
                <span v-else-if="key==='method'" :style="{color: $methodColor(scope.row['method']),fontWeight: 'bold'}">
                    {{ scope.row[key] }}</span>
                <span v-else>{{ scope.row[key] }}</span>
            </template>
        </el-table-column>
        <el-table-column label="操作" width="125">
            <template #default="scope">
                <div class="button-box">
                    <el-tooltip content="执行用例" placement="top">
                        <el-button circle icon="VideoPlay" size="small" type="success"
                                   @click="runCase(scope.row.id, 0)"></el-button>
                    </el-tooltip>
                    <el-tooltip content="用例详情" placement="top">
                        <el-button circle icon="Operation" size="small" type="primary"
                                   @click="editEvent(scope.row.id, scope.row.title, scope.row.case_env)">
                        </el-button>
                    </el-tooltip>
                    <el-tooltip content="删除用例" placement="top">
                        <el-button circle size="small">
                            <el-popconfirm
                                    title="您确定要删除该数据?"
                                    @confirm.prevent="removeEvent(scope.$index, scope.row.id)">
                                <template #reference>
                                    <el-button circle icon="Delete" size="small" type="danger"></el-button>
                                </template>
                            </el-popconfirm>
                        </el-button>
                    </el-tooltip>
                </div>
            </template>
        </el-table-column>
    </el-table>
    <!--分页栏-->
    <div id="footToolbar">
        <el-pagination
                v-model:currentPage="table.currentPage"
                v-model:page-size="query.queryData.pageSize"
                :page-sizes="table.selectSize"
                :total="table.total"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
        />
    </div>
    <!--报告弹窗-->
    <el-dialog
            v-model="reportView"
            align-center
            destroy-on-close
            fullscreen
            width="80%"
    >
        <template #header="{ titleClass }">
            <h4 :class="titleClass">测试报告</h4>
        </template>
        <iframe id="mobsf" :src="html" style="width: 100%;height: calc(100vh - 83px);border: none;"/>
    </el-dialog>
    <!--调试弹窗-->
    <el-dialog
            v-model="caseDebug"
            :before-close="caseDebugClose"
            :show-close="false"
            align-center
            destroy-on-close
            fullscreen
            width="80%"
            @close="caseList"
    >
        <template #header="{ close, titleId, titleClass }">
            <div class="my-header">
                <el-form ref="ruleCaseRef" :model="caseInfo" style="width: 100%;">
                    <el-form-item
                            :rules=" {required: true, message: '用例名称不能为空！', trigger: 'blur'}"
                            prop="title"
                    >
                        <h3 v-show="!caseNameLabel" class="case-title" @dblclick="labelClick(titleId)">{{
                                caseInfo.title
                            }}</h3>
                        <el-input v-show="caseNameLabel" :id="titleId" v-model="caseInfo.title" :class="titleClass"
                                  autocomplete="off"
                                  clearable
                                  spellcheck="false"
                                  @blur="losing"
                                  @keyup.enter.native="losing"
                        />
                    </el-form-item>
                </el-form>
                <div id="configuration2">
                    <el-select v-model="caseInfo.env" clearable placeholder="请选Case择环境" @change="selectConfig">
                        <el-option
                                v-for="item in configurationOptions"
                                :key="item.id"
                                :label="item.title"
                                :value="item.id"
                        />
                    </el-select>
                </div>

                <div>
                    <el-tooltip content="执行用例" placement="left">
                        <el-button circle icon="VideoPlay" type="success" @click="runCase(caseInfo.id, 1)">
                        </el-button>
                    </el-tooltip>
                    <el-button circle icon="CircleCloseFilled" type="danger" @click="close">
                    </el-button>
                </div>

            </div>
        </template>
        <CaseDebug ref="CaseFun" :case-id="caseInfo.id" :project-id="projectId" @getConfig="getConfig"/>
    </el-dialog>

</template>

<script setup>
import {nextTick, onMounted, onUnmounted, reactive, ref} from 'vue'
import {ElMessage, ElMessageBox} from 'element-plus'
import apis from '../../../api/api'
import {useRouter} from "vue-router";
import dayjs from "dayjs";
import CaseDebug from "../debug/CaseDebug.vue";

const router = useRouter()
const projectId = Number(router.currentRoute.value.query.id)
// console.log(`项目id params：${projectId}`)

const isAsync = ref(1)
const ruleFormRef = ref()
const queryConditionRef = ref()
const query = reactive({
    queryData: {
        id: '',
        title: '',
        creator__username: '',
        project__id: projectId,
        page: 1,
        pageSize: 20,
    }
})
const table = reactive({
    submitLoading: false,
    total: 0,
    selectSize: [5, 20, 50, 100, 200],
    currentPage: 1,
    tableData: [],
    tableLabel: {
        id: 'ID',
        title: '用例名称',
        creator: '创建者'
    },
    selectRow: null,
    showEdit: false,
    formData: {
        title: "新用例",
        info: "",
        project: projectId
    },
    formRules: {
        title: [
            {required: true, message: '请输入用例名称', trigger: 'blur'},
        ],
        info: [
            {required: false},
        ],
    }
})
const reportView = ref(false)
const html = ref("")
const tableHeight = ref()
const dateFormat = (val, format = "YYYY-MM-DD_HH-mm-ss") => {
    return dayjs(val).format(format);
};
const c_width = index => {
    let width = 0
    switch (index) {
        case 0:
            width = 5
            break
        case 1:
            width = 50
            break
        case 2:
            width = 5
            break
    }
    return width
}
const statusTtype = val => {
    let icon
    if (val) {
        const s = val.toString();
        if (s.charAt(0) === '2') {
            icon = "success";
        } else if (s.charAt(0) === '3') {
            icon = "warning";
        } else if (s.charAt(0) === '4' || s.charAt(0) === '5') {
            icon = "error";
        } else {
            icon = "info";
        }
    } else {
        icon = "info";
    }
    return icon
}

// 调试弹窗
const selectConfig = (val) => {
    apis.editCase(caseInfo.value.id, {case_env_id: val})
            .then(() => {
                ElMessage.success("切换环境成功！")
            })
            .catch((err) => {
                ElMessage.error(err)
            })
}

let configurationOptions = ref([])
const getConfig = (val) => {
    configurationOptions.value = val
}


const ruleCaseRef = ref()
const caseDebug = ref(false)
const caseNameLabel = ref(false)
const caseIndex = ref()
const caseInfo = ref({
    id: "",
    title: "",
    env: null
})

// 将index放到row数据中
const tableRowClassName = ({row, rowIndex}) => {
    row.index = rowIndex;
}
// 获取case列表
const caseList = () => {
    apis.caseList(query.queryData)
            .then(({data}) => {
                if (data.code === 200) {
                    table.tableData = data.data.results
                    table.total = data.data.count
                } else {
                    ElMessage.error(data.msg)
                }
            })
}
caseList();
const search = () => {
    query.queryData.page = 1
    table.currentPage = 1
    caseList();
}
// 选项内容
const multipleTableRef = ref()
const multipleSelection = ref([])
// 选中row 存储row
const handleSelectionChange = (val) => {
    // console.log(val)
    multipleSelection.value = val;
}
//改变pageSize触发 handleSizeChange
const handleSizeChange = (val) => {
    // console.log(`${val} items per page`)
    query.queryData.pageSize = val
    // console.log(query.queryData)
    caseList();
}
// 切换页面 触发handleCurrentChange
const handleCurrentChange = (val) => {
    query.queryData.page = val;
    caseList();

}
//新增case
const addCase = () => {
    apis.addCase(table.formData)
            .then(({data}) => {
                console.log(data)
                if (data.code === 200) {
                    table.tableData.unshift(data.data)
                    ElMessage.success("新增成功！")
                } else {
                    throw new Error(data.msg)
                }
            })
            .catch((err) => {
                ElMessage.error(err)
            })
}
// 编辑case
const editEvent = (id, title, env) => {
    caseDebug.value = true
    caseInfo.value.id = id
    caseInfo.value.title = title
    caseInfo.value.env = env
}
const losing = () => {
    if (!ruleCaseRef) return
    ruleCaseRef.value.validate((valid) => {
        if (valid) {
            console.log(1111111111111)
            caseNameLabel.value = false
            apis.editCase(caseInfo.value.id, caseInfo.value)
                    .then(({data}) => {
                        if (data.code === 200) {
                            ElMessage.success(data.msg)
                        } else {
                            throw new Error(data.msg)
                        }
                    })
                    .catch((err) => {
                        ElMessage.error(err)
                    })
        } else {
            console.log('error submit!')
            return false
        }
    })
}

const caseDebugClose = (done) => {
    caseNameLabel.value = false
    done()
}
const labelClick = (titleId) => {
    caseNameLabel.value = true
    nextTick(() => {
        document.getElementById(titleId).focus()
    })
}
//删除case
const removeEvent = (index, id) => {
    apis.delCase(id)
            .then(() => {
                table.tableData.splice(index, 1)
                console.log(table.tableData``)
                ElMessage.success("删除成功！")
            })
}
//批量删除case
const batchRemove = () => {
    const ids = multipleSelection.value.map(item => (item.id))
    if (ids.length !== 0) {
        ElMessageBox.confirm(
                '数据删除后不可恢复，确定删除吗?',
                '注意',
                {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                }
        )
                .then(() => {
                    apis.delCase(ids).then(({data}) => {
                        if (data.code === 200) {
                            ElMessage.success('删除成功！');
                            multipleTableRef.value.clearSelection()
                            table.tableData = table.tableData.filter(item => !data.data.map(item => (item.id)).includes(item.id))
                            // apiList();
                        }
                    })
                })
                .catch(() => {
                    ElMessage.info('取消删除！')
                })

    } else {
        ElMessage.error('请至少选择一条数据！')
    }
}


// 重置查询表单
const resetQuery = () => {
    resetForm(queryConditionRef)
    table.currentPage = 1
    caseList();
}
//重置新建|编辑表单
const resetForm = (formEl) => {
    if (!formEl) return
    formEl.value.resetFields()
}

// 调试页面执行大用例

const CaseFun = ref(null)
const runCase = (caseId = null, option) => {
    console.log("执行大用例")
    if (caseId) {
        apis.runCase({
            caseId: caseId
        })
                .then(({data}) => {
                    console.log(data)
                    if (data.code === 200) {
                        ElMessage.success(data.msg)
                    } else {
                        ElMessage.error(data.msg)
                    }
                    if (data.data.report) {
                        // window.open(data.data.report, "_blank");
                        // var a = document.createElement('a');
                        // a.setAttribute('href', data.data.report);
                        // a.setAttribute('style', 'display:none');
                        // a.setAttribute('target', '_blank');
                        // document.body.appendChild(a);
                        // a.click();
                        // a.parentNode.removeChild(a);
                        setTimeout(() => {
                            const win = window.open(data.data.report, "_blank");
                        }, 1000);
                    }
                    if (option === 1) {
                        nextTick(() => {
                            CaseFun.value.reportList()
                        })
                    }
                })
                .catch((err) => {
                    ElMessage.error(err)
                })
    } else {
        apis.runCase({
            caseId: multipleSelection.value.map(item => item.id)
        })
                .then(({data}) => {
                    console.log(data)
                    ElMessage.success("执行完毕！")
                })
                .catch((err) => {
                    ElMessage.error(err)
                })
    }


}
// 页面加载自动请求
onMounted(() => {
    const topToolbar = document.getElementById('topToolbar').offsetHeight
    const footToolbar = document.getElementById('footToolbar').offsetHeight
    tableHeight.value = document.documentElement.clientHeight - topToolbar - footToolbar - 56 - 40 - 50;
    // // 监听浏览器的高度变化
    window.onresize = () => {
        return (() => {
            const topToolbar = document.getElementById('topToolbar').offsetHeight
            const footToolbar = document.getElementById('footToolbar').offsetHeight
            tableHeight.value = document.documentElement.clientHeight - topToolbar - footToolbar - 56 - 40 - 50;
        })()
    }

})
// 页面关闭自动请求
onUnmounted(() => {
    window.onresize = null;
})

</script>

<style lang="less" scoped>
#topToolbar {
    box-sizing: border-box;
    border: 1px solid #e9e9e9;
    border-radius: 5px;
    padding: 18px 10px 0 10px;
    margin: 10px 0;
}

.el-pagination {
    background-color: #ffffff;
    padding: 15px 0 0;
    justify-content: flex-end;
    --el-pagination-bg-color: none;

    .el-pagination button:disabled {
        background-color: transparent;
    }
}

.el-input {
    height: 28px;
}

.el-table {
    .el-tag {
        border: none;
        background-color: transparent;
        padding: 0;
    }
}

.el-page-header {
    border: 1px solid red;
    line-height: 30px;
    height: 30px;
    font-weight: 700;
}

.button-box {
    display: flex;
    align-items: center;
    justify-content: flex-start;
}

.button-box2 {
    display: flex;
    align-items: center;

    .el-button {
        margin-right: 12px
    }

    &:last-child {
        margin-right: 0px;
    }
}

.el-result {
    padding: 0;
    --el-result-icon-font-size: 26px;

    :deep(.el-result__icon) {
        display: flex;
        align-items: center;
    }
}

.report-setting {
    :deep(.el-form-item__label) {
        width: 140px;
    }

    .el-input {
        width: 300px;
    }
}

.case-title {
    color: #7b7b7b;
}

.content {

    :deep(.el-tabs__header) {
        margin: 0 0 10px;

        .el-tabs__nav-scroll {
            padding-left: 12px;
        }
    }

    .el-tab-pane {
        height: calc(100vh - 83px - 50px);
    }

    .report-list-action {
        height: 40px;
        padding: 0 12px;
        display: flex;
        align-items: center;

        button {
            margin-left: 20px;
        }

    }
}

.my-header {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;

    .el-form {
        flex: 1;

        .el-form-item {
            margin-bottom: 0;
        }

        .el-input {
            width: 100%;
            height: 100%;
            margin-right: 15px;
        }

        span {
            width: 100%;
            margin-right: 15px;
        }
    }


}

#configuration2 {
    width: 150px;
    margin-right: 15px;
    //background-color: red;
    :deep(.el-input__wrapper) {
        width: auto;
        border-radius: 0;
    }
}

</style>