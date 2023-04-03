<template>
    <div id="topToolbar">
        <div class="api-title">
            <h2>接口列表</h2>
            <el-button size="small" type="primary" @click="insertEvent">新增</el-button>
            <el-button size="small" type="danger" @click="batchRemove">删除</el-button>
        </div>
        <el-form
                ref="queryConditionRef"
                :inline="true"
                :model="query.queryData">
            <el-form-item label="" prop="id">
                <el-input v-model="query.queryData.id" clearable placeholder="接口id"/>
            </el-form-item>
            <el-form-item label="" prop="title">
                <el-input v-model="query.queryData.title" clearable placeholder="接口名称"/>
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
            </div>
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
                         :min-width="c_width(index)"
                         show-overflow-tooltip>
            <template #default="scope">
                <el-tag v-if="key==='creator'">{{ scope.row.creator }}</el-tag>
                <el-popover v-else-if="key==='project'" effect="light" placement="top" trigger="hover" width="auto">
                    <template #default>
                        <div v-show="scope.row.project">项目ID：{{ scope.row.project }}</div>
                    </template>
                    <template #reference>
                        <el-tag v-show="scope.row.project_name" style="cursor: pointer;"
                                @click="toProDetail(scope.row.project, scope.row.project_name)">{{
                                scope.row.project_name
                            }}
                        </el-tag>
                    </template>
                </el-popover>
                <p v-else>{{ scope.row[key] }}</p>
            </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
            <template #default="scope">
                <div class="button-box">
                    <el-button circle icon="EditPen" size="small" type="primary" @click="editEvent(scope.row)">
                    </el-button>
                    <el-popconfirm
                            title="您确定要删除该数据?"
                            @confirm.prevent="removeEvent(scope.$index, scope.row)">
                        <template #reference>
                            <el-button circle icon="Delete" size="small" type="danger">
                            </el-button>
                        </template>
                    </el-popconfirm>
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
            title="新增接口"
            width="35%"
    >
        <el-form
                ref="ruleFormRef"
                :model="table.formData"
                :rules="table.formRules"
                label-position="right"
                label-width="80px"
        >
            <!--<el-form-item label="接口名称" prop="title">-->
            <!--    <el-input v-model="table.formData.title" clearable maxlength="30"/>-->
            <!--</el-form-item>-->
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
            v-model="table.apiDebug"
            align-center
            destroy-on-close
            fullscreen
            title="接口调试"
            width="70%"
            @close="apiList"
    >
        <div class="content">
            <ApiDebug :api-id="table.selectRow.api" :options="1" :project-id="table.selectRow.project"/>
        </div>
    </el-dialog>
</template>

<script setup>
import {onMounted, onUnmounted, reactive, ref} from 'vue'
import {ElMessage, ElMessageBox} from 'element-plus'
import apis from '../../../api/api'
import ApiDebug from "../debug/ApiDebug.vue";
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
    apiDebug: false,
    submitLoading: false,
    total: 0,
    selectSize: [5, 20, 50, 100, 200],
    currentPage: 1,
    tableData: [],
    tableLabel: {
        id: 'ID',
        title: '接口',
        project: '项目',
        url: 'url',
        creator: '创建者'
    },
    selectRow: {
        api: null,
        project: null,
        title: ""
    },
    showEdit: false,
    formData: {
        // title: "",
        project: null,
    },
    formRules: {
        // title: [
        //     {required: true, message: '请输入接口名称', trigger: 'blur'},
        // ],
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
// 获取项目列表
const apiList = () => {
    apis.apiList(query.queryData)
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
apiList();
const search = () => {
    query.queryData.page = 1
    table.currentPage = 1
    apiList();
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
const toProDetail = (id, title) => {
    router.push({
        name: 'ProjectApis',
        params: {
            title: title,
        },
        path: `/ProjectApis`,
        query: {
            id: id
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
            width = 30
            break
        case 2:
            width = 20
            break
        case 3:
            width = 50
            break
        case 4:
            width = 10
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
    apiList();
}
// 切换页面 触发handleCurrentChange
const handleCurrentChange = (val) => {
    // console.log(`CurrentPage: ${val}`)
    query.queryData.page = val;
    apiList();

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
    //  console.log(row)
    table.selectRow.api = row.id
    table.selectRow.project = row.project
    table.apiDebug = true;
}
//删除事件
const removeEvent = (index, row) => {
    delApi(index, row.id);
}
// 删除接口
const delApi = (index, id) => {
    apis.delApi(id)
            .then(() => {
                table.tableData.splice(index, 1)
                ElMessage.success("删除成功！")
            })
}
//批量删除项目
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
                    apis.delApi(ids).then(({data}) => {
                        if (data.code === 200) {
                            ElMessage.success('删除成功！');
                            multipleTableRef.value.clearSelection()
                            table.tableData = table.tableData.filter(item => !ids.includes(item.id))
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

// 创建项目接口
const addPro = () => {
    apis.addProject(table.formData)
            .then(({data}) => {
                if (data.code === 200) {
                    table.showEdit = false;
                    resetForm(ruleFormRef)
                    table.tableData.unshift(data.data)
                    // apiList();
                    ElMessage.success("新增成功！")
                    //  console.log(data.data.id)
                    const config_default = [
                        {
                            hosts: [],
                            params: [],
                            project: data.data.id,
                            title: "全局变量",
                            type: "0",
                            variables: []
                        },
                        {
                            hosts: [{name: "default", value: "http://127.0.0.1", selected: true}],
                            params: [],
                            project: data.data.id,
                            title: "测试环境",
                            type: "2",
                            variables: []
                        },
                        {
                            hosts: [{name: "default", value: "http://127.0.0.1", selected: true}],
                            params: [],
                            project: data.data.id,
                            title: "正式环境",
                            type: "2",
                            variables: []
                        },

                    ]
                    apis.addConfig(config_default[0])
                            .then(() => {
                                apis.addConfig(config_default[1])
                                        .then(() => {
                                            apis.addConfig(config_default[2])
                                        })
                            })

                    // config_default.forEach(config => {
                    //     apis.addConfig(config)
                    //         .then(({data}) => {
                    //             ElMessage.success(data.msg)
                    //         })
                    // })

                } else {
                    ElMessage.error(data.msg)
                }
            })
}
//编辑项目接口
const editPro = (row) => {
    apis.editProject(row.id, table.formData)
            .then(({data}) => {
                if (data.code === 200) {
                    table.showEdit = false;
                    resetForm(ruleFormRef)
                    Object.assign(row, table.formData);
                    ElMessage.success("保存成功！");

                }
            })
}
// 重置查询表单
const resetQuery = () => {
    // console.log(table.currentPage)
    resetForm(queryConditionRef)
    table.currentPage = 1
    apiList();

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
            // table.selectRow.title = table.formData.title
            handleClose()
            table.selectRow.api = undefined
            table.apiDebug = true
            // const obj = {
            //     title: table.selectRow.title,
            //     project: table.selectRow.project,
            //     method: "GET",
            //     url: "",
            //     bodyType: "none",
            //     queryData: [],
            //     headersData: [],
            //     cookies: [],
            //     formData: [],
            //     formUrlencodedData: [],
            //     rawData: {
            //         type: "text",
            //         text: ""
            //     },
            //     postCondition: [],
            //     response: {}
            // }
            // apis.addApi(obj)
            //         .then(({data}) => {
            //             table.selectRow.api = data.data.id
            //             table.apiDebug = true
            //         })
            //         .catch((err) => {
            //             ElMessage.error(err)
            //         })

        } else {
            return false
        }
    })
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

    .el-tooltip > p {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
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

.content {
    height: calc(100vh - 75px);
}
</style>