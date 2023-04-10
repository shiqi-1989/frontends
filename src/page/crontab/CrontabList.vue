<template>
    <div id="topToolbar">
        <div class="project-title">
            <h2>任务列表</h2>
            <el-button size="small" type="primary" @click="insertEvent">新增任务</el-button>
            <el-button size="small" type="danger" @click="batchRemove">删除任务</el-button>
        </div>
        <el-form
                ref="queryConditionRef"
                :inline="true"
                :model="query.queryData">
            <el-form-item label="" prop="id">
                <el-input v-model="query.queryData.id" placeholder="任务id"/>
            </el-form-item>
            <el-form-item label="" prop="name">
                <el-input v-model="query.queryData.name" placeholder="任务名称"/>
            </el-form-item>
            <el-form-item label="" prop="creator__username">
                <el-input v-model="query.queryData.creator__username" placeholder="创建者"/>
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
                <el-tag v-if="key==='creator'">{{ scope.row[key] }}</el-tag>
                <el-switch v-else-if="key==='job_state'" v-model="scope.row[key]" :active-value=1
                           :inactive-value=0
                           size="small"
                           style="margin-left: 0;"
                           @change="switchCrontab($event, scope.row)"/>
                <p v-else>{{ scope.row[key] }}</p>
            </template>
        </el-table-column>
        <el-table-column label="操作" width="125">
            <template #default="scope">
                <div class="button-box">
                    <el-tooltip content="编辑任务" placement="top" effect="primary">
                        <el-button circle icon="Operation" size="small" type="primary" @click="editEvent(scope.row)">
                        </el-button>
                    </el-tooltip>
                    <el-tooltip content="删除任务" placement="top" effect="error">
                        <el-button circle size="small">
                            <el-popconfirm
                                    title="您确定要删除该数据?"
                                    @confirm.prevent="removeEvent(scope.$index, scope.row)">
                                <template #reference>
                                    <el-button circle icon="Delete" size="small" type="danger">
                                    </el-button>
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
    <!--新增/编辑弹窗-->
    <el-dialog
            v-model="table.showEdit"
            :before-close="handleClose"
            :title="table.selectRow ? '编辑任务' : '新增任务'"
            width="60%"
    >
        <el-form
                ref="ruleFormRef"
                :model="table.formData"
                :rules="table.formRules"
                label-position="right"
                label-width="120px"
        >
            <el-form-item label="任务名称" prop="name">
                <el-input v-model="table.formData.name" maxlength="30"
                          placeholder="请输入任务名称"/>
            </el-form-item>
            <el-form-item label="任务描述" prop="desc">
                <el-input v-model="table.formData.desc" type="textarea"/>
            </el-form-item>
            <el-form-item label="任务作业" prop="func_type">
                <div style="display: flex;">
                    <el-select v-model="table.formData.func" class="func_type"
                               placeholder="请选择">
                        <el-option v-for="item in funcTypeOptions" :label="item.label" :value="item.value"/>
                    </el-select>
                    <el-input v-model="table.formData.args" placeholder="作业ID"/>
                    <!--<el-input v-model="table.formData.args" placeholder="作业参数(多个以','分割)"/>-->
                </div>

            </el-form-item>
            <el-form-item label="触发器" prop="func">
                <el-select v-model="table.formData.trigger" placeholder="请选择">
                    <el-option v-for="item in triggerOptions" :label="item.label" :value="item.value"/>
                </el-select>
            </el-form-item>
            <el-form-item label="触发器参数" prop="func">
                <el-input v-model="table.formData.trigger_condition"
                          :placeholder="triggerCondition(table.formData.trigger)"
                          type="textarea"/>
            </el-form-item>
            <el-form-item label="开关" prop="job_state">
                <el-switch v-model="table.formData.job_state" :active-value=1
                           :inactive-value=0
                           size="small"
                           style="margin-left: 0;"/>
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
        name: '',
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
        name: '任务',
        desc: '描述',
        creator: '创建者',
        job_state: '开关'
    },
    selectRow: null,
    showEdit: false,
    formData: {},
    formRules: {
        name: [
            {required: true, message: '请输入任务名称', trigger: 'blur'},
        ],
        desc: [
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
const crontabList = () => {
    apis.crontabList(query.queryData)
            .then(({data}) => {
                if (data.code === 200) {
                    console.log(data)
                    table.tableData = data.data.results
                    table.total = data.data.count
                } else {
                    ElMessage.error(data.msg)
                }
            })
}
crontabList();
const search = () => {
    query.queryData.page = 1
    table.currentPage = 1
    crontabList();
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
const switchCrontab = (val, row) => {
    // table.formData = row
    // editCrontab(row)
    apis.switchCrontab({id: row.id, job_state: row.job_state})
            .then(({data}) => {
                console.log(data)
            })
}
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
        case 4:
            width = 10
            break
    }
    return width
}

const triggerCondition = (val) => {
    if (val === 'date') {
        return '在指定时间执行一次作业\r\n{"run_date": "2009-11-06 16:30:05"}'
    }
    if (val === 'cron') {
        return '特定时间周期性触发\r\n在2019-03-30 00:00:00之前，每周一到周五的5:30(am)触发\r\n{"day_of_week": "mon-fri", "hour": 5, "minute": 30, "end_date": "2019-03-30"}'
    }
    if (val === 'interval') {
        return '固定间隔触发\r\n在 2019-03-29 14:00:01 ~ 2019-03-29 14:00:10 之间, 每隔两分钟执行一次\r\n{"minutes": 2, "start_date": "2019-03-29 14:00:01", "end_date": "2019-03-29 14:00:10"}'
    }

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
    crontabList();
}
// 切换页面 触发handleCurrentChange
const handleCurrentChange = (val) => {
    // console.log(`CurrentPage: ${val}`)
    query.queryData.page = val;
    crontabList();

}
//新增项目
const insertEvent = () => {
    table.formData = {
        name: "",
        desc: "",
        func: "",
        func_type: 1,
        args: "",
        trigger: "",
        trigger_condition: "",
        job_state: 1
    }
    table.selectRow = null
    table.showEdit = true
}
const triggerOptions = [
    {
        value: 'date',
        label: 'date',
    },
    {
        value: 'interval',
        label: 'interval',
    },
    {
        value: 'cron',
        label: 'cron',
    },
]
const funcTypeOptions = [
    {
        value: "run_api",
        label: '接口',
    },
    {
        value: "run_case",
        label: '用例',
    },

]
// 编辑定时任务
const editEvent = (row) => {
    table.formData = row
    table.showEdit = true
    table.selectRow = row
}
// 进入项目下api列表
const intoEvent = (id) => {
    console.log("跳转项目详情页")
    // router.push(`/project/${row.id}`)
    router.push({path: "/ProjectManagement/ProjectDetail", query: {id: id}})
}
//删除事件
const removeEvent = (index, row) => {
    delCrontab(index, row.id);
}
// 删除接口
const delCrontab = (index, id) => {
    apis.delCrontab(id)
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
                    apis.delCrontab(ids).then(({data}) => {
                        if (data.code === 200) {
                            ElMessage.success('删除成功！');
                            multipleTableRef.value.clearSelection()
                            table.tableData = table.tableData.filter(item => !ids.includes(item.id))
                            // crontabList();
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
const addCrontab = () => {
    apis.addCrontab(table.formData)
            .then(({data}) => {
                if (data.code === 200) {
                    table.showEdit = false;
                    resetForm(ruleFormRef)
                    table.tableData.unshift(data.data)
                    // crontabList();
                    ElMessage.success("新增成功！")
                } else {
                    ElMessage.error(data.msg)
                }
            })
}
//编辑项目接口
const editCrontab = (row) => {
    // console.log(table.formData)
    apis.editCrontab(row.id, table.formData)
            .then(({data}) => {
                if (data.code === 200) {
                    table.showEdit = false;
                    resetForm(ruleFormRef)
                    console.log(table.formData);
                    Object.assign(row, data.data);
                    ElMessage.success("保存成功！");
                } else {
                    ElMessage.error(data.msg);
                }
            })
}
// 重置查询表单
const resetQuery = () => {
    resetForm(queryConditionRef)
    table.currentPage = 1
    crontabList();

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
                editCrontab(table.selectRow);
            } else {
                addCrontab();
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

//
//.disabledInput {
//    pointer-events: none;
//}
//
//.disabledInput2 {
//    pointer-events: auto;
//}

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

.func_type {
    :deep( .el-input__wrapper) {
        height: 26px;
    }
}
</style>