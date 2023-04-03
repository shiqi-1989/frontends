<template>
    <div id="topToolbar">
        <div class="project-title">
            <h2>项目列表</h2>
            <el-button size="small" type="primary" @click="insertEvent">新增项目</el-button>
            <el-button size="small" type="danger" @click="batchRemove">删除项目</el-button>
        </div>
        <el-form
                ref="queryConditionRef"
                :inline="true"
                :model="query.queryData">
            <el-form-item label="" prop="id">
                <el-input v-model="query.queryData.id" clearable placeholder="项目id"/>
            </el-form-item>
            <el-form-item label="" prop="title">
                <el-input v-model="query.queryData.title" clearable placeholder="项目名称"/>
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
                         :min-width="c_width(index)">
            <template #default="scope">
                <el-tag v-if="key==='creator'">{{ scope.row.creator }}</el-tag>
                <p v-else>{{ scope.row[key] }}</p>
            </template>
        </el-table-column>
        <el-table-column label="操作" width="125">
            <template #default="scope">
                <div class="button-box">
                    <el-button circle icon="Expand" size="small" type="success"
                               @click="intoEvent(scope.row.id, scope.row.title)">
                    </el-button>
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
    <el-dialog
            v-model="table.showEdit"
            :before-close="handleClose"
            :title="table.selectRow ? '编辑项目' : '新增项目'"
            width="30%"
    >
        <el-form
                ref="ruleFormRef"
                :model="table.formData"
                :rules="table.formRules"
                label-position="right"
                label-width="80px"
        >
            <el-form-item label="项目名称" prop="title">
                <el-input v-model="table.formData.title" maxlength="30"/>
            </el-form-item>
            <el-form-item label="项目描述" prop="info">
                <el-input v-model="table.formData.info" type="textarea"/>
            </el-form-item>
        </el-form>
        <template #footer>
        <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
            <!--<el-button type="primary" @click="creatProVisible = false">确认</el-button>-->
        <el-button type="primary" @click="submitForm(ruleFormRef)">确认</el-button>
      </span>
        </template>
    </el-dialog>
</template>
<script setup>
import {onMounted, onUnmounted, reactive, ref} from 'vue'
import {ElMessage, ElMessageBox} from 'element-plus'
import apis from '../../../api/api'
import {useRouter} from "vue-router";

const router = useRouter()
const ruleFormRef = ref()
const queryConditionRef = ref()
const query = reactive({
    queryData: {
        id: '',
        title: '',
        creator__username: '',
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
        title: '项目',
        info: '描述',
        creator: '创建者'
    },
    selectRow: null,
    showEdit: false,
    formData: {
        title: "",
        info: "",
    },
    formRules: {
        title: [
            {required: true, message: '请输入项目名称', trigger: 'blur'},
        ],
        info: [
            {required: false},
        ],
    }
})
const tableHeight = ref()
// 将index放到row数据中
const tableRowClassName = ({row, rowIndex}) => {
    row.index = rowIndex;
}
// 获取项目列表
const proList = () => {
    apis.projectList(query.queryData)
            .then(({data}) => {
                if (data.code === 200) {
                    table.tableData = data.data.results
                    table.total = data.data.count
                } else {
                    ElMessage.error(data.msg)
                }
            })
}
proList();
const search = () => {
    query.queryData.page = 1
    table.currentPage = 1
    proList();
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
            width = 10
            break
        case 1:
            width = 35
            break
        case 2:
            width = 50
            break
        case 3:
            width = 15
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
    proList();
}
// 切换页面 触发handleCurrentChange
const handleCurrentChange = (val) => {
    query.queryData.page = val;
    proList();

}
//新增项目
const insertEvent = () => {
    table.selectRow = null
    table.showEdit = true
    table.formData = {
        title: "",
        info: ""
    }
}
// 编辑项目
const editEvent = (row) => {
    table.showEdit = true
    table.selectRow = row
    table.formData = {
        title: row.title,
        info: row.info
    }
}
// 进入项目下api列表
const intoEvent = (id, title) => {
    console.log("跳转项目详情页")
    // router.push(`/ProjectManagement/ProjectDetail/${row.id}`)
    // router.push({path: "/ProjectManagement/ProjectDetail", query: {id: id}})
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
//删除事件
const removeEvent = (index, row) => {
    delProject(index, row.id);
}
// 删除接口
const delProject = (index, id) => {
    apis.delProject(id)
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
                    apis.delProject(ids).then(({data}) => {
                        if (data.code === 200) {
                            ElMessage.success('删除成功！');
                            multipleTableRef.value.clearSelection()
                            table.tableData = table.tableData.filter(item => !ids.includes(item.id))
                            // proList();
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
// 新建|编辑项目弹窗关闭
const handleClose = () => {
    table.showEdit = false;
    resetForm(ruleFormRef)
}
// 创建项目接口
const addPro = () => {
    apis.addProject(table.formData)
            .then(({data}) => {
                if (data.code === 200) {
                    table.showEdit = false;
                    resetForm(ruleFormRef)
                    table.tableData.unshift(data.data)
                    // proList();
                    ElMessage.success("新增成功！")
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
                    handleClose()
                    Object.assign(row, data.data);
                    ElMessage.success("保存成功！");

                }
            })
}
// 重置查询表单
const resetQuery = () => {
    resetForm(queryConditionRef)
    table.currentPage = 1
    proList();

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
            if (table.selectRow) {
                editPro(table.selectRow);
            } else {
                addPro();
            }

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

.project-title {
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
</style>