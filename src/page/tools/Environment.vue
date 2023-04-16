<template>
    <div style="height: 100%; display: flex;">
        <!--左侧栏-->
        <div class="left-box">
            <el-scrollbar>
                <el-menu
                        :default-active="`${defaultActive}`"
                >
                    <!--@select="click_item"-->
                    <span class="classify-set">全局</span>
                    <el-menu-item :index="`${globalOptions.id}`"
                                  @click="getConfigDetail(globalOptions.id)">
                        <div>
                            <el-icon>
                                <Histogram/>
                            </el-icon>
                            <span id="env-name">{{ globalOptions.title }}</span>
                        </div>
                    </el-menu-item>
                    <div class="classify-set">环境</div>
                    <el-menu-item v-for="(item, index) in envOptions" :index="`${item.id}`"
                                  @click="getConfigDetail(item.id)">
                        <div>
                            <el-icon>
                                <Guide/>
                            </el-icon>
                            <span>{{ item.title }}</span>
                        </div>
                        <el-dropdown class="edit-history">
                                <span class="el-dropdown-link">
                                  <el-icon>
                                    <MoreFilled/>
                                  </el-icon>
                                </span>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item icon="CopyDocument" @click="copyEnv(item.id)">复制
                                    </el-dropdown-item>
                                    <el-dropdown-item icon="Delete" @click="delEnv(index, item.id)">删除
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </el-menu-item>
                </el-menu>
            </el-scrollbar>
            <el-button icon="Plus" style="width: 100%;order: 1;" @click="addEnv">新增环境</el-button>
        </div>
        <!--右侧栏-->
        <div style="height: 100%;flex: 1;overflow: hidden;padding-left: 20px;position: relative;">
            <!--<GlobalVariable :configurationClose="configurationClose"/>-->
            <div class="right-title">{{ detailData.title }}</div>
            <div
                    style="display: flex;justify-content: flex-end;position: absolute; bottom: 0;right: 0;z-index: 999;">
                <el-button @click="closeVariable">关闭</el-button>
                <el-button type="primary" @click="submitForm(envNameRef)">保存</el-button>
            </div>
            <div style="height: calc(100% - 85px); padding-bottom: 10px;border-bottom: 1px solid #dcdfe6;overflow-y: auto;box-sizing: border-box;">
                <el-scrollbar style="padding-right: 10px;">
                    <div v-if="detailData.type === '2'" style="margin-bottom: 10px;">
                        <el-form
                                ref="envNameRef"
                                :model="detailData"
                                :size="formSize"
                                class="demo-ruleForm"
                                label-width="auto"
                                status-icon
                        >
                            <el-form-item
                                    :rules="{
                                  required: true,
                                  message: '请输入环境名称',
                                  trigger: 'blur',
                                }"
                                    label="环境名称"
                                    prop="title"
                            >
                                <el-input v-model="detailData.title" clearable placeholder="输入环境名称"/>
                            </el-form-item>
                        </el-form>
                        <div style="margin-bottom: 10px;">服务（前置URL）:</div>
                        <el-table ref="hostTableRef"
                                  :cell-class-name="rowClassName"
                                  :data="detailData.hosts"
                                  border
                        >
                            <el-table-column label="服务名"
                                             min-width="30%"
                                             width="180px">
                                <template #default="scope">
                                    <!--<el-input v-model="scope.row.name" clearable spellcheck="false" disabled/>-->
                                    <span class="host-default">{{
                                            scope.row.name
                                        }}</span>
                                </template>
                            </el-table-column>
                            <el-table-column label="前置URL"
                                             min-width="70%">
                                <template #default="scope">
                                    <el-input v-model="scope.row.value" clearable spellcheck="false"/>
                                </template>
                            </el-table-column>
                            <el-table-column label="开关" width="55">
                                <template #default="scope">
                                    <el-switch v-model="scope.row.selected" size="small"
                                               style="margin-left: 12px;"/>
                                </template>
                            </el-table-column>
                            <!--<el-table-column style="text-align: center;" width="50">-->
                            <!--    <template #header>-->
                            <!--        <el-button icon="Plus" link size="small" style="width: 100%;"-->
                            <!--                   @click="addRow(detailData.hosts, hostTableRef)"/>-->
                            <!--    </template>-->
                            <!--    <template #default="scope">-->
                            <!--        <el-button icon="Close" link size="small" style="width: 100%;"-->
                            <!--                   @click.prevent="deleteRow(detailData.hosts, scope.$index)"/>-->
                            <!--    </template>-->
                            <!--</el-table-column>-->
                        </el-table>
                        <div style="margin-top: 10px;">环境变量 :</div>
                    </div>
                    <el-table ref="variableTableRef"
                              :cell-class-name="rowClassName"
                              :data="detailData.variables"
                              border
                              @cell-click="(row, column)=>cellClick(row, column, detailData.variables, variableTableRef)"

                    >
                        <el-table-column label="变量名"
                                         min-width="30%"
                                         width="180px">
                            <template #default="scope">
                                <el-input v-model="scope.row.name" clearable spellcheck="false"/>
                            </template>
                        </el-table-column>
                        <el-table-column label="变量值"
                                         min-width="calc(70% - 55px)">
                            <template #default="scope">
                                <el-input v-model="scope.row.value" clearable spellcheck="false"/>
                            </template>
                        </el-table-column>
                        <el-table-column label="开关" width="55">
                            <template #default="scope">
                                <el-switch v-model="scope.row.selected" size="small"
                                           style="margin-left: 12px;"/>
                            </template>
                        </el-table-column>
                        <el-table-column style="text-align: center;" width="55">
                            <template #header>
                                <el-button icon="Plus" link size="small" style="width: 100%;"
                                           @click="addRow(detailData.variables, variableTableRef)"/>
                            </template>
                            <template #default="scope">
                                <el-button icon="Close" link size="small" style="width: 100%;"
                                           @click.prevent="deleteRow(detailData.variables,scope.$index)"/>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-scrollbar>
            </div>
        </div>
    </div>
</template>

<script setup>
import {nextTick, onMounted, ref} from 'vue'
import {ElMessage, ElMessageBox} from "element-plus";
import apis from "../../../api/api";


const props = defineProps({
    configurationClose: {
        type: Function,
        required: true
    },
    project: {
        type: Number,
        required: true
    },
    defaultActive: {
        type: Number,
        required: false,
    }

})

const formSize = ref("default")
const dialogTableVisible = ref(false)
const defaultActive = ref(props.defaultActive)
const envNameRef = ref()
const hostTableRef = ref()
const variableTableRef = ref()
const variableSelection = ref([])
const hostSelection = ref([])
const globalOptions = ref({})
const envOptions = ref([])
const detailData = ref({
    type: '0',
    title: "全局变量",
    hosts: [],
    variables: []
},)


const rowClassName = ({row, column, rowIndex, columnIndex}) => {
    row.index = rowIndex
    column.index = columnIndex
}
// 删除header行
const deleteRow = (val, index) => {
    val.splice(index, 1)
}
// 添加行
const addRow = (val, ref) => {
    const row = {
        name: '',
        value: '',
        selected: true
    }
    val.push(row)
    ref.toggleRowSelection(row);
}
// 选择后改变selected属性
const toggleSelection = (rows, ref) => {
    nextTick(() => {
        if (rows) {
            ref.value?.clearSelection()
            rows.forEach(row => {
                if (row.selected) {
                    ref.value?.toggleRowSelection(row, true);
                }
            })
        }
    })

}
const cellClick = (row, column, data, ref) => {
    if (row.index === data.length - 1 && column.label) {
        addRow(data, ref)
    }
}
const closeVariable = () => {
    props.configurationClose()
    // detailData.value = {
    //     type: '0',
    //     title: "全局变量",
    //     hosts: [],
    //     variables: []
    // }
}
const saveVariable = () => {
    const obj = detailData.value
    Object.keys(obj).forEach(key => {
        if (Array.isArray(obj[key])) {
            obj[key] = obj[key].filter((tab) => tab.name !== "")
        }
    })
    if (obj?.id) {
        apis.editConfig(obj.id, obj)
                .then(({data}) => {
                    console.log(data)
                    ElMessage.success(data.detail)
                })
    } else {
        apis.addConfig(obj)
                .then(({data}) => {
                    ElMessage.success(data.detail)
                    // envOptions.value.unshift({
                    //     id: data.data.id,
                    //     type: data.data.type,
                    //     title: data.data.title,
                    // })
                    envOptions.value.push({
                        id: data.data.id,
                        type: data.data.type,
                        title: data.data.title,
                    })
                    defaultActive.value = data.data.id
                })
    }
}

const configurationClose = () => {
    ElMessageBox.confirm('确定关闭窗口吗?')
            .then(() => {
                // done()
                dialogTableVisible.value = false
                resetForm(envNameRef)
                detailData.value = {
                    type: '0',
                    title: "全局变量",
                    hosts: [],
                    variables: []
                }
            })
            .catch(() => {
                // catch error
            })
}
// defineExpose({
//     configurationClose
// })
const addEnv = () => {
    detailData.value = {
        type: '2',
        title: "新建环境",
        project: props.project,
        hosts: [{name: "default", value: "http://127.0.0.1", selected: true}],
        variables: [],
        params: []
    }
}
const delEnv = (index, id) => {
    apis.delConfig(id)
            .then(() => {
                if (id === detailData.value.id) {
                    detailData.value = {
                        type: '2',
                        title: "新建环境",
                        hosts: [],
                        variables: []
                    }
                }
                envOptions.value.splice(index, 1)
            })
}
const copyEnv = (index) => {
    envOptions.value.splice(index, 1)
}
const configList = async () => {
    const params = {
        project__id: props.project
    }
    await apis.configList(params)
            .then(({data}) => {
                globalOptions.value = data.data.splice(0, 1)[0]
                envOptions.value = data.data
            })

}
const getConfigDetail = (id) => {
    apis.configDetail(id)
            .then(({data}) => {
                detailData.value = data.data
                toggleSelection(detailData.value.hosts, hostTableRef)
                toggleSelection(detailData.value.variables, variableTableRef)
            })
}

const click_item = (index) => {
    console.log(index)
    getConfigDetail(index)
}
const submitForm = async (formEl) => {
    if (formEl) {
        await formEl.validate((valid, fields) => {
            if (valid) {
                saveVariable()
            } else {
            }
        })
    } else {
        saveVariable()
    }
}

const resetForm = (formEl) => {
    if (!formEl) return
    formEl.value.resetFields()
}


onMounted(() => {
    nextTick(async () => {
        await configList();
        defaultActive.value ??= globalOptions.value.id
        getConfigDetail(defaultActive.value)
    })
})
</script>

<style lang="less" scoped>

.left-box {
    width: 250px;
    height: 100%;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    padding: 0 20px 0 10px;
    border-right: 1px solid var(--el-border-color);
}

.classify-set {
    height: 35px;
    line-height: 35px;
    font-size: 16px;
}

.el-menu {
    border: none;
    overflow: auto;

    .el-menu-item {
        cursor: pointer;
        height: 30px;
        line-height: 30px;
        padding-left: 10px !important;
        padding-right: 5px;
        margin-bottom: 2px;
        border-radius: 5px;
        font-size: 14px;

        div:first-child {
            flex: 1;
            display: flex;
            align-items: center;
            min-width: 0;

            span {
                margin-left: 5px;
                flex: 1;
                overflow: hidden;
                text-overflow: ellipsis;
            }

        }

        & [class^=el-icon] {
            margin-right: 0;
            --el-menu-icon-width: auto;
        }

        &:hover {
            background-color: #79bbff;
            color: #fff;
        }


        &:hover .el-dropdown-link {
            display: flex;
        }

        &.is-active {
            background-color: #409eff;
            color: #fff;
        }
    }

}

.el-dropdown-link {
    display: none;
    border-radius: 50%;
    padding: 2px;
    cursor: pointer;
    color: var(--el-color-primary);
    align-items: center;
}

.el-dropdown-link:hover {
    background-color: rgba(227, 221, 221, 0.85);
}

.el-table {
    :deep(.el-table__inner-wrapper) {
        height: 100% !important;
        box-sizing: border-box;
        display: block;
    }

    :deep( .el-table__body-wrapper) {
        height: calc(100% - 34px) !important; // 表格高度减去表头的高度
        flex: 1;

        td {
            padding: 0;

            &:first-child {
                border-left: var(--el-table-border);
            }

            .cell {
                padding: 0;
            }
        }
    }

    :deep(.el-scrollbar__wrap) {
        height: 100% !important;
    }

    :deep(.el-input) {
        --el-input-hover-border: #16DaD1;
        --el-input-hover-border-color: #16DaD1;
        --el-input-focus-border: #16DaD1;
        --el-input-focus-border-color: #16DaD1;
        --el-input-border-color: none;
        --el-input-border-radius: 0;
    }

    .el-select {
        width: 100%;
        --el-select-border-color-hover: #16DaD1;
        --el-select-input-focus-border-color: #16DaD1;
    }

    :deep(.el-table__header-wrapper) {
        th {
            padding: 5px 0;

            .cell {
                padding: 0 12px;
            }
        }
    }
}

.right-title {
    font-size: 16px;
    height: 30px;
    margin-bottom: 10px;
    border-bottom: 1px solid var(--el-border-color);
    box-sizing: border-box;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.host-default {
    border: none;
    background-color: transparent;
    color: #409eff;
    font-size: 15px;
    margin-left: 11px;
}

</style>