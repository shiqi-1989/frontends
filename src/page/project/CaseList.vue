<template>
    <div id="topToolbar">
        <div class="api-title">
            <h2>用例列表</h2>
            <el-button size="small" type="primary" @click="insertEvent">新增</el-button>
            <el-button size="small" type="danger" @click="batchRemove">删除</el-button>
        </div>
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
            <el-form-item label="" prop="project__id">
                <el-input v-model="query.queryData.project__id" clearable placeholder="项目id"/>
            </el-form-item>
            <el-form-item label="" prop="creator__username">
                <el-input v-model="query.queryData.creator__username" clearable placeholder="创建者"/>
            </el-form-item>
            <div class="table-toolbar">
                <el-button icon="Search" type="" @click.prevent="search">查询</el-button>
                <el-button icon="Refresh" type="" @click.prevent="resetQuery">重置</el-button>
                <el-button type="primary" @click="runCase(undefined, 0)">批量执行</el-button>
            </div>
            <!--<el-form-item>-->
            <!--    <el-button icon="Search" type="" @click.prevent="search">查询</el-button>-->
            <!--    <el-button icon="Refresh" type="" @click.prevent="resetQuery">重置</el-button>-->
            <!--    -->
            <!--</el-form-item>-->
        </el-form>
    </div>
    <el-table
            ref="multipleTableRef"
            :data="table.tableData"
            :max-height="tableHeight"
            :row-class-name="tableRowClassName"
            border
            style="width: 100%;"
            table-layout="auto"
            @selection-change="handleSelectionChange"
    >
        <el-table-column type="selection" width="55"/>
        <el-table-column v-for="(value, key, index) in table.tableLabel" :key="index" :label="value"
                         :min-width="c_width(index)">
            <template #default="scope">
                <el-tag v-if="key==='creator'">{{ scope.row.creator }}</el-tag>
                <el-popover v-else-if="key==='project'" effect="light" placement="top" trigger="hover" width="auto">
                    <template #default>
                        <div v-show="scope.row.project">项目ID：{{ scope.row.project }}</div>
                    </template>
                    <template #reference>
                        <el-tag v-show="scope.row.project_name" style="cursor: pointer;"
                                @click="toProDetail(scope.row.project, scope.row.project_name)">
                            {{ scope.row.project_name }}
                        </el-tag>
                    </template>
                </el-popover>
                <p v-else>{{ scope.row[key] }}</p>
            </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
            <template #default="scope">
                <div class="button-box">
                    <el-tooltip content="执行用例" placement="top" effect="customized">
                        <el-button circle icon="VideoPlay" size="small" type="success"
                                   @click="runCase(scope.row.id, 0)"></el-button>
                    </el-tooltip>
                    <el-tooltip content="用例详情" placement="top" effect="primary">
                        <el-button circle icon="EditPen" size="small" type="primary" @click="editEvent(scope.row)">
                        </el-button>
                    </el-tooltip>
                    <el-tooltip content="删除用例" placement="top" effect="error">
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
    <!--选择项目弹窗-->
    <el-dialog
            v-model="table.showEdit"
            :before-close="handleClose"
            title="新增用例"
            width="35%"
    >
        <el-form
                ref="ruleFormRef"
                :model="table.formData"
                :rules="table.formRules"
                label-position="right"
                label-width="80px"
        >
            <el-form-item label="用例名称" prop="title">
                <el-input v-model="table.formData.title" clearable maxlength="30"/>
            </el-form-item>
            <el-form-item label="所属项目" prop="project">
                <el-select v-model="table.formData.project"
                           clearable
                           filterable
                           placeholder="请选择项目"
                           style="width: 100%;">
                    <el-option
                            v-for="item in projectList"
                            :key="item.id"
                            :label="item.title"
                            :value="item.id"
                    >
                        <span style="float: left">{{ item.title }}</span>
                        <span style="float: right;color: var(--el-text-color-secondary);font-size: 13px;">{{
                                item.creator
                            }}</span>
                    </el-option>
                </el-select>
            </el-form-item>
        </el-form>
        <template #footer>
        <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="submitForm(ruleFormRef)">确认</el-button>
      </span>
        </template>
    </el-dialog>
    <!--调试弹窗-->
    <el-dialog
            v-model="table.caseDebug"
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
                <el-form ref="ruleCaseRef" :model="table.selectRow" style="width: 100%;">
                    <el-form-item
                            :rules=" {required: true, message: '用例名称不能为空！', trigger: 'blur'}"
                            prop="title"
                    >
                        <h3 v-show="!caseNameLabel" class="case-title" @dblclick="labelClick(titleId)">{{
                                table.selectRow.title
                            }}</h3>
                        <el-input v-show="caseNameLabel" :id="titleId" v-model="table.selectRow.title"
                                  :class="titleClass"
                                  autocomplete="off"
                                  clearable
                                  spellcheck="false"
                                  @blur="losing"
                                  @keyup.enter.native="losing"
                        />
                    </el-form-item>
                </el-form>
                <div id="configuration2">
                    <el-select v-model="table.selectRow.env" clearable placeholder="请选Case择环境"
                               @change="selectConfig">
                        <el-option
                                v-for="item in configurationOptions"
                                :key="item.id"
                                :label="item.title"
                                :value="item.id"
                        />
                    </el-select>
                </div>

                <div>
                    <el-tooltip content="执行用例" placement="top" effect="customized">
                        <el-button circle icon="VideoPlay" type="success" @click="runCase(table.selectRow.id, 1)">
                        </el-button>
                    </el-tooltip>
                    <el-button circle icon="CircleCloseFilled" type="danger" @click="close">
                    </el-button>
                </div>
            </div>
        </template>
        <CaseDebug ref="CaseFun" :case-id="table.selectRow.id" :project-id="table.selectRow.project"
                   @getConfig="getConfig"/>
    </el-dialog>
</template>

<script setup>
import {nextTick, onMounted, onUnmounted, reactive, ref} from 'vue'
import {ElMessage, ElMessageBox} from 'element-plus'
import apis from '../../../api/api'
import CaseDebug from "../debug/CaseDebug.vue";
import {useRouter} from "vue-router";

const router = useRouter()
const ruleFormRef = ref()
const queryConditionRef = ref()
const query = reactive({
    queryData: {
        id: '',
        title: '',
        project__id: '',
        creator__username: '',
        page: 1,
        pageSize: 20,
    }
})
const projectList = ref([])
const table = reactive({
    caseDebug: false,
    submitLoading: false,
    total: 0,
    selectSize: [5, 20, 50, 100, 200],
    currentPage: 1,
    tableData: [],
    tableLabel: {
        id: 'ID',
        title: '用例',
        project: '项目',
        creator: '创建者'
    },
    selectRow: {
        id: null,
        project: null,
        title: "",
        env: null
    },
    showEdit: false,
    formData: {
        title: "",
        project: null
    },
    formRules: {
        title: [
            {required: true, message: '请输入接口名称', trigger: 'blur'},
        ],
        project: [
            {required: true, message: "请选择项目", trigger: 'blur'},
        ],
    }
})
const tableHeight = ref()
// 将index放到row数据中
const tableRowClassName = ({row, rowIndex}) => {
    row.index = rowIndex;
}
//调试的用例执行环境
const selectConfig = (val) => {
    apis.editCase(table.selectRow.id, {case_env_id: val})
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
const toProDetail = (id, title) => {
    router.push({
        name: 'ProjectApis',
        params: {
            title: title,
        },
        path: '/ProjectApis',
        query: {
            id: id
        }
    })
}

// 获取项目列表
const caseList = () => {
    apis.caseList(query.queryData)
            .then(({data}) => {
                if (data.code === 200) {
                    //  console.log(data)
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
// 获取项目列表
const proList = () => {
    apis.projectList()
            .then(({data}) => {
                if (data.code === 200) {
                    //  console.log(data)
                    projectList.value = data.data
                } else {
                    ElMessage.error(data.msg)
                }
            })
}

// 页面加载自动请求
onMounted(() => {
    const topToolbar = document.getElementById('topToolbar').offsetHeight
    const footToolbar = document.getElementById('footToolbar').offsetHeight
    tableHeight.value = document.documentElement.clientHeight - topToolbar - footToolbar - 57 - 40;
    // // 监听浏览器的高度变化
    window.onresize = () => {
        return (() => {
            const topToolbar = document.getElementById('topToolbar').offsetHeight
            const footToolbar = document.getElementById('footToolbar').offsetHeight
            tableHeight.value = document.documentElement.clientHeight - topToolbar - footToolbar - 57 - 40;
        })()
    }

})
// 页面关闭自动请求
onUnmounted(() => {
    window.onresize = null;
})
const c_width = index => {
    let width = 0
    switch (index) {
        case 0:
            width = 8
            break
        case 1:
            width = 50
            break
        case 2:
            width = 15
            break
        case 3:
            width = 8
            break
    }
    return width
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
    // console.log(`CurrentPage: ${val}`)
    query.queryData.page = val;
    caseList();

}

const insertEvent = () => {
    proList()
    table.showEdit = true
}

// 新建接口弹窗关闭
const handleClose = () => {
    resetForm(ruleFormRef)
    table.showEdit = false;
}
const editEvent = (row) => {
    table.selectRow.id = row.id
    table.selectRow.title = row.title
    table.selectRow.project = row.project
    table.selectRow.env = row.case_env
    table.caseDebug = true;
}
//删除事件
const removeEvent = (index, id) => {
    delCase(index, id);
}
// 删除case
const delCase = (index, id) => {
    apis.delCase(id)
            .then(() => {
                table.tableData.splice(index, 1)
                ElMessage.success("删除成功！")
            })
}
//批量删除case
const batchRemove = () => {
    const ids = multipleSelection.value.map(item => item.id)
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
                            table.tableData = table.tableData.filter(item => !ids.includes(item.id))
                            // caseList();
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
    // console.log(table.currentPage)
    resetForm(queryConditionRef)
    table.currentPage = 1
    caseList();

}
//重置新建|编辑表单
const resetForm = (formEl) => {
    if (!formEl) return
    formEl.value.resetFields()
}
//新增编辑保存时 表单验证
const submitForm = (formEl) => {
    if (!formEl) return
    formEl.validate((valid) => {
                if (valid) {
                    table.selectRow.project = table.formData.project
                    table.selectRow.title = table.formData.title
                    handleClose()
                    apis.addCase(table.selectRow)
                            .then(({data}) => {
                                //  console.log(data)
                                if (data.code === 200) {
                                    // table.tableData.unshift(data.data)
                                    ElMessage.success("新增成功！")
                                    table.selectRow.id = data.data.id
                                    table.caseDebug = true
                                } else {
                                    throw new Error(data.msg)
                                }
                            })
                            .catch((err) => {
                                ElMessage.error(err)
                            })
                } else {
                    return false
                }
            }
    )
}
// case 调试弹窗 相关
const losing = () => {
    if (!ruleCaseRef) return
    ruleCaseRef.value.validate((valid) => {
        if (valid) {
            caseNameLabel.value = false
            apis.editCase(table.selectRow.id, {title: table.selectRow.title})
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
const labelClick = (titleId) => {
    caseNameLabel.value = true
    nextTick(() => {
        document.getElementById(titleId).focus()
    })
}
const caseNameLabel = ref(false)
const caseDebugClose = (done) => {
    caseNameLabel.value = false
    done()
}
// 用例标题
const ruleCaseRef = ref()


// 调试页面执行大用例
const CaseFun = ref(null)
const runCase = (caseId = null, option) => {
    // console.log("执行大用例")
    if (caseId) {
        apis.runCase({
            caseId: caseId
        })
                .then(({data}) => {
                    //  console.log(data)
                    if (data.code === 200) {
                        ElMessage.success(data.msg)
                    } else {
                        ElMessage.error(data?.msg)
                    }
                    if (data.data.report) {
                        // html.value = data.data.report
                        // console.log(html.value)
                        // reportView.value = true
                        // window.open(data.data.report, "_blank");
                        setTimeout(function () {
                            const win = window.open("", "_blank");
                            win.location = data.data.report
                        });
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
                    //  console.log(data)
                    ElMessage.success("执行完毕！")
                })
                .catch((err) => {
                    ElMessage.error(err)
                })
    }


}
</script>

<style lang="less" scoped>
#topToolbar {
    box-sizing: border-box;
    border: 1px solid #e9e9e9;
    border-radius: 5px;
    padding: 15px 10px 0 10px;
    margin: 10px 0;
}

.api-title {
    height: auto;
    display: flex;
    align-items: center;
    color: #14C4BC;
    margin-bottom: 10px;

    h2 {
        margin-right: 20px;
    }
}

.el-pagination {
    background-color: #ffffff;
    padding: 15px 0 0;
    justify-content: center;
    --el-pagination-bg-color: none;

    .el-pagination button:disabled {
        background-color: transparent;
    }
}

.el-input {
    height: 28px;
}

.table-toolbar {
    display: inline-flex;
    align-items: center;
    vertical-align: middle;
    color: #606266;
    margin-bottom: 18px;


    button {
        width: auto;
        height: 28px;
        line-height: 28px;
        font-size: 14px;
        font-weight: 400;
    }
}

.el-table {
    :deep(.el-table__body) {
        td:first-child {
            border-left: var(--el-table-border);
        }
    }

    .el-tag {
        border: none;
        background-color: transparent;
        padding: 0;
    }

    .button-box {
        display: flex;
        justify-content: flex-start;
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

.button-box {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .el-button {
        margin-left: 0px;
    }
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