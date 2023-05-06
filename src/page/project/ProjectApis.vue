<template>
    <div id="topToolbar">
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
            <el-form-item label="" prop="creator__username">
                <el-input v-model="query.queryData.creator__username" clearable placeholder="创建者"/>
            </el-form-item>
            <el-form-item>
                <el-button icon="Search" type="" @click.prevent="search">查询</el-button>
                <el-button icon="Refresh" type="" @click.prevent="resetQuery">重置</el-button>
            </el-form-item>
            <el-form-item>
                <el-button type="success" @click="insertEvent">新增</el-button>
                <el-button type="danger" @click="batchRemove">删除</el-button>
            </el-form-item>
            <el-form-item>
                <el-switch
                        v-model="isAsync"
                        :active-value="1"
                        :inactive-value="0"
                        active-text="异步"
                        inactive-text="同步"
                        inline-prompt
                        style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949;margin-right: 10px;"
                        width="50px"
                />
                <!--<el-button type="primary" @click="showReportSet(1)">异步执行</el-button>-->
                <el-button type="primary" @click="playApis()">批量执行</el-button>
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
                         :min-width="c_width(index).width" :show-overflow-tooltip="c_width(index).show_tip"
        >
            <template #default="scope">
                <el-tag v-if="key==='creator'">
                    {{ scope.row.creator }}
                </el-tag>
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
        <el-table-column label="状态" width="60">
            <template #default="scope">
                <!--<el-tooltip :content="scope.row.response.status? scope.row.response.status.toString(): '未执行'"-->
                <!--            placement="top">-->
                <!--    <el-result :icon="statusTtype(scope.row.response.status)"/>-->
                <!--</el-tooltip>-->
                <el-tag :type="statusTtype(scope.row.status)">{{ scope.row.status || '000' }}</el-tag>
            </template>
        </el-table-column>
        <el-table-column label="操作" width="125">
            <template #default="scope">
                <div class="button-box">
                    <el-tooltip content="执行api" placement="top" effect="customized">
                        <el-button circle icon="VideoPlay" size="small" type="success"
                                   @click="playApis(scope.row.id, scope.row.title)"></el-button>
                    </el-tooltip>
                    <el-tooltip content="调试api" placement="top" effect="primary">
                        <el-button circle icon="Operation" size="small" type="primary"
                                   @click="editEvent(scope.row.id)">
                        </el-button>
                    </el-tooltip>
                    <el-tooltip content="删除api" placement="top" effect="error">
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
            v-model="dialogVisible"
            align-center
            destroy-on-close
            :title="testTitle"
            width="70%"
            class="my-info-dialog">
        <div class="pre-box-sty">
            <pre class="pre-sty">{{ preText }}</pre>
        </div>

        <!--        <iframe id="mobsf" :src="html"
        style="height: 68vh;width: 100%;border: none;"
        >
        </iframe>-->
    </el-dialog>
    <!--调试弹窗-->
    <el-dialog
            v-model="apiDebug"
            align-center
            destroy-on-close
            fullscreen
            title="接口调试"
            width="70%"
            @close="apiList"
    >
        <div class="content">
            <ApiDebug :api-id="apiId" :project-id="projectId"/>
        </div>
    </el-dialog>
</template>

<script setup>
import {onMounted, onUnmounted, reactive, ref} from 'vue'
import {ElMessage, ElMessageBox} from 'element-plus'
import apis from '../../../api/api'
import {useRouter} from "vue-router";
import dayjs from "dayjs";
import ApiDebug from "../debug/ApiDebug.vue";

const router = useRouter()
console.log(router.currentRoute.value)
const projectId = router.currentRoute.value.query.id
console.log(`项目id params：${projectId}`)
// console.log(`项目id params：${typeof projectId}`)
// console.log(router.currentRoute.value)

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
        title: '接口',
        method: 'method',
        url: 'url',
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
const dialogVisible = ref(false)
const html = ref("")
const tableHeight = ref()
const dateFormat = (val, format = "YYYY-MM-DD_HH-mm-ss") => {
    return dayjs(val).format(format);
};
const c_width = index => {
    let width = 0
    let show_tip = true
    switch (index) {
        case 0:
            width = 5
            break
        case 1:
            width = 15
            break
        case 2:
            width = 8
            break
        case 3:
            width = 50
            break
        case 4:
            width = 10
            show_tip = false
            break
    }
    return {
        width,
        show_tip
    }
}
const statusTtype = val => {
    let icon
    if (val) {
        const s = val.toString();
        if (s.charAt(0) === '2') {
            icon = "success";
        } else if (s.charAt(0) === '3') {
            icon = "";
        } else if (s.charAt(0) === '4') {
            icon = "warning";
        } else if (s.charAt(0) === '5') {
            icon = "danger";
        } else {
            icon = "info";
        }
    } else {
        icon = "info";
    }
    return icon
}
// 报告配置弹窗
const testTitle = ref()
const preText = ref()
// 调试弹窗
const apiDebug = ref(false)
const apiId = ref()

// 将index放到row数据中
const tableRowClassName = ({row, rowIndex}) => {
    row.index = rowIndex;
}
// 获取接口列表
const apiList = () => {
    apis.apiList(query.queryData)
            .then(({data}) => {
                if (data.code === 200) {
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
    query.queryData.page = val;
    apiList();

}
//新增api
const insertEvent = () => {
    // router.push(`/project/${projectId}/api/add`)
    apiId.value = null
    apiDebug.value = true
    // const obj = {
    //     title: '新接口',
    //     project: projectId,
    //     method: "GET",
    //     url: "",
    //     bodyType: "none",
    //     queryData: [],
    //     headersData: [],
    //     cookies: [],
    //     formData: [],
    //     formUrlencodedData: [],
    //     rawData: {
    //         type: "json",
    //         text: ""
    //     },
    //     postCondition: [],
    //     response: {}
    // }
    // apis.addApi(obj)
    //         .then(({data}) => {
    //             ElMessage.success(data.msg)
    //             apiId.value = data.data.id
    //             apiDebug.value = true
    //             console.log(data)
    //         })
    //         .catch(() => {
    //             ElMessage.error(data.msg)
    //         })

}
// 编辑api
const editEvent = (id) => {
    // router.push(`/project/${projectId}/api/${id}`)
    apiDebug.value = true
    apiId.value = id
}
// 删除api接口
const delApi = (index, id) => {
    apis.delApi(id)
            .then(() => {
                table.tableData.splice(index, 1)
                ElMessage.success("删除成功！")
            })
}
//删除api
const removeEvent = (index, id) => {
    delApi(index, id);
}
//批量删除项目
const batchRemove = () => {
    const ids = multipleSelection.value.map(item => item.id)
    //  console.log(ids)
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
// 批量执行api
const showReportSet = () => {
    //  console.log(new Date())
    reportForm.value.name = `${dateFormat(new Date())}`
    //  console.log(isAsync.value)
    reportForm.value['async'] = isAsync.value
    reportSetVisible.value = true
}
const playApis = (id = null, title = null) => {
    let ids;
    if (id) {
        ids = [id]
    } else {
        ids = multipleSelection.value.map(item => item.id)
    }
    if (ids.length === 0) return ElMessage.error('请至少选择一条数据！');
    apis.apisSend({ids: ids, project: projectId, async: isAsync.value})
            .then(({data}) => {
                ElMessage.success("执行完毕！")
                if (id) {
                    testTitle.value = title;
                    preText.value = data.data.pre_text;
                    console.log(preText.value)
                    dialogVisible.value = true;
                }
                apiList();
            })
}
// 创建项目接口
const addPro = () => {
    apis.addProject(table.formData)
            .then(({data}) => {
                if (data.code === 200) {
                    table.showEdit = false;
                    resetForm(ruleFormRef)
                    apiList();
                    ElMessage.success("新增成功！")

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

.el-result {
    padding: 0;
    --el-result-icon-font-size: 24px;

    :deep(.el-result__icon) {
        display: flex;
        align-items: center;
    }
}

.pre-box-sty {
    padding: 10px;
    box-sizing: border-box;
}

.pre-sty {
    height: 100%;
    max-height: 68vh;
    background-color: #eef2f7;
    padding: 10px;
    border-radius: 5px;
    text-align: left;
    color: #404856;
    overflow-y: auto;
    box-sizing: border-box;
    word-wrap: break-word;
    white-space: pre-wrap;
}

.content {
    height: calc(100vh - 75px);
}
</style>