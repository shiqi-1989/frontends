<template>
    <el-tabs class="content">
        <el-tab-pane label="用例步骤">
            <el-row :gutter="20" style="height: 100%;">
                <el-col :span="6">
                    <el-card
                            :body-style="{ padding: '5px 10px 10px',height:'calc(100% - 50px)', boxSizing:'border-box', display:'flex',flexDirection:'column'}">
                        <template #header>
                            <div class="card-header">
                                <h3 style="color: #7f7f7f;">用例步骤</h3>
                                <el-button link type="danger" @click="cleanSteps">清空</el-button>
                            </div>
                        </template>
                        <el-scrollbar style="flex: 1;">
                            <el-empty v-if="historyData.length===0" description="description"
                                      style="height: 100%;overflow: hidden;"/>
                            <draggable v-else
                                       :list="historyData"
                                       animation="300"
                                       item-key="index"
                                       @end="onEnd"
                                       @start="onStart">
                                <template #item="{ element, index }">
                                    <div @click.stop>
                                        <li :key="index"
                                            :class="{active:element.id === currentId}"
                                            :tabIndex="index">
                                 <span style="overflow: hidden;white-space: nowrap;text-overflow: ellipsis;flex: 1;"
                                       @click="clickHistory(element.id)">
                                     {{ element.title || "新接口" }}
                                </span>
                                            <el-dropdown class="edit-history" @command="historyCommand">
                                <span class="el-dropdown-link">
                                  <el-icon>
                                    <MoreFilled/>
                                  </el-icon>
                                </span>
                                                <template #dropdown>
                                                    <el-dropdown-menu>
                                                        <el-dropdown-item
                                                                :command="{command:1, id:element.id, index:index}">
                                                            <Plus class="item-more"/>
                                                        </el-dropdown-item>
                                                        <el-dropdown-item
                                                                :command="{command:2, id:element.id, index:index}">
                                                            <Delete class="item-more"/>
                                                        </el-dropdown-item>
                                                    </el-dropdown-menu>
                                                </template>
                                            </el-dropdown>
                                        </li>
                                    </div>
                                </template>
                            </draggable>
                        </el-scrollbar>
                        <el-button style="width: 100%;"
                                   @click="openApisDialog">添加步骤
                        </el-button>
                    </el-card>
                </el-col>
                <el-col :span="18">
                    <el-card
                            :body-style="{ padding: '10px',height:'100%', boxSizing:'border-box',position:'relative'}">
                        <div id="configuration">
                            <el-tooltip content="cURL解析" placement="top" effect="customized">
                                <el-button circle icon="Link" color="#1bc014b0"
                                           @click="importApi"></el-button>
                            </el-tooltip>
                            <el-tooltip content="函数助手" placement="top" effect="customized">
                                <el-button circle icon="Notebook" color="#1bc014b0"
                                           @click="dialogFun=true"></el-button>
                            </el-tooltip>
                            <el-button circle icon="Refresh" style="margin: 0 5px 0 12px;" type="primary"
                                       @click="configList"></el-button>
                            <el-select v-model="apiEnv" clearable placeholder="请选择环境" @change="selectConfig">
                                <el-option
                                        v-for="item in configurationOptions"
                                        :key="item.id"
                                        :label="item.title"
                                        :value="item.id"
                                />
                            </el-select>
                            <el-button icon="Operation" style="border-radius: 0 4px 4px 0;"
                                       @click="dialogTableVisible = true"></el-button>
                        </div>
                        <el-tabs
                                v-model="editableTabsValue"
                                class="api-tabs"
                                editable
                                type="card"
                                @tab-click="handleClick"
                                @tab-remove="handleTabsDel"
                                @tab-add="handleTabsAdd"
                        >
                            <div v-if="editableTabs.length<1"
                                 style="display: flex;align-items: center;justify-content: center;height: 100%;">
                                <AddApiMode :func1="myHandleTabsEdit" :func2="importApi"/>
                            </div>
                            <el-tab-pane
                                    v-for="(item, index) in editableTabs"
                                    :key="item.name"
                                    :disabled="disabled"
                                    :name="item.name"
                            >
                                <template #label>
                                    <el-tooltip :content="item.title|| '新接口'" effect="light" placement="top">
                                <span v-show="!item.editLabel" @dblclick="labelClick(item)">{{
                                        item.title || "新接口"
                                    }}</span>
                                    </el-tooltip>
                                    <el-input v-show="item.editLabel" :id="item.name" v-model="item.title"
                                              class="title_box"
                                              clearable
                                              @blur="losing(item)"
                                              @keyup.enter.native="losing(item)"
                                    />
                                </template>
                                <div v-if="!item.method"
                                     style="display: flex;align-items: center;justify-content: center;height: 100%;">
                                    <AddApiMode :func1="myHandleTabsEdit" :func2="importApi"/>
                                </div>
                                <div v-else style="height: 100%;width: 100%;">
                                    <DebugPanel :from="3" :send-request="submitForm" :item="item"
                                                :storage-options="storageOptions"/>
                                </div>
                            </el-tab-pane>
                        </el-tabs>
                    </el-card>
                </el-col>
            </el-row>
        </el-tab-pane>
        <el-tab-pane label="用例报告">
            <div class="report-list-action">
                <span>已选 {{ reportSelection.length }} 项</span>
                <el-button link type="primary" @click="cleanReport()">移除</el-button>
                <el-button link type="primary" @click="reportList()">刷新</el-button>
            </div>
            <el-table
                    ref="reportTableRef"
                    :data="reportData"
                    style="width: 100%;height: calc(100vh - 180px);overflow: auto;"
                    @selection-change="reportSelectionChange"
            >
                <el-table-column type="selection" width="55"/>
                <el-table-column label="ID" prop="id" width="120"/>
                <el-table-column label="报告名称" prop="title"/>
                <el-table-column label="生成日期" prop="creat_time" width="230"/>
                <el-table-column label="生成人" prop="creator" width="150"/>
                <el-table-column label="操作" width="120">
                    <template #default="scope">
                        <div class="button-box2">
                            <el-tooltip content="查看报告" placement="top">
                                <el-button circle icon="Monitor" size="small" type="success"
                                           @click="viewReport(scope.row.url)"></el-button>
                            </el-tooltip>
                            <el-tooltip content="删除报告" placement="top">
                                <div style="display: flex;align-items: center;">
                                    <el-popconfirm
                                            title="您确定要删除该数据?"
                                            @confirm.prevent="cleanReport(scope.$index, scope.row.id)">
                                        <template #reference>
                                            <el-button circle icon="Delete" size="small"
                                                       type="danger"></el-button>
                                        </template>
                                    </el-popconfirm>
                                </div>
                            </el-tooltip>
                        </div>
                    </template>
                </el-table-column>
            </el-table>
        </el-tab-pane>
    </el-tabs>


    <!--配置弹窗-->
    <el-dialog v-model="dialogTableVisible"
               :before-close="envConfigurationClose"
               destroy-on-close
               title="配置中心"
               width="70%"
    >
        <div style="height: 60vh;">
            <Environment :configuration-close="envConfigurationClose"
                         :project="projectId"/>
        </div>
    </el-dialog>

    <!--接口选择窗 -->
    <el-dialog v-model="apiSelectionVisible"
               :before-close="apisearchClose"
               align-center
               destroy-on-close
               draggable
               title="添加步骤"
               width="50%"
    >
        <div class="apisearch">
            <el-input v-model="apisearchContent" clearable placeholder="选择接口" @input="searchApis"/>
            <el-table
                    ref="apisTableRef"
                    :data="apisData"
                    @selection-change="apisSelectionChange"
            >
                <el-table-column type="selection" width="55"/>
                <el-table-column label="ID" prop="id" width="180"/>
                <el-table-column label="title" prop="title"/>
            </el-table>
        </div>
        <template #footer>
          <span>
            <el-button @click="apisearchClose">取消</el-button>
            <el-button type="primary" @click="addSteps">确认</el-button>
          </span>
        </template>
    </el-dialog>

    <!--curl弹窗-->
    <el-dialog
            v-model="dialogCurl"
            title="cURL 解析"
            width="50%"
            destroy-on-close
            :before-close="curlClose"
    >
        <el-input
                v-model="curlText"
                :rows="10"
                type="textarea"
                placeholder="右键单击请求
单击“复制”→ “复制为 cURL”
粘贴到输入框"
        />
        <template #footer>
      <span class="dialog-footer">
        <el-button @click="curlClose">取消</el-button>
        <el-button type="primary" @click="runCurl">
          确认
        </el-button>
      </span>
        </template>
    </el-dialog>
    <!--函数助手弹窗-->
    <el-dialog
            v-model="dialogFun"
            title="函数助手"
            width="38%"
    >
        <FunctionHelper/>
    </el-dialog>
</template>

<script setup>
import {nextTick, onMounted, ref} from 'vue'
import {ElMessage, ElMessageBox} from "element-plus";
import FunctionHelper from "../../components/FunctionHelper.vue";
import DebugPanel from "../subcomponent/DebugPanel.vue";
import AddApiMode from "../../components/AddApiMode.vue";
import apis from "../../../api/api";

import Environment from "../tools/Environment.vue"
import draggable from 'vuedraggable'
import {toJsonString} from "curlconverter";

const props = defineProps({
    caseId: {
        type: Number,
        required: true
    },
    projectId: {
        type: Number,
        required: false
    }
})
const emits = defineEmits(["getConfig",])


const currentId = ref()
const handleClick = (TabsPaneContext, Event) => {
    const item = editableTabs.value[TabsPaneContext.index]
    currentId.value = item.id
    apiEnv.value = item.api_env;
}
const historyData = ref([])
// 接口选择框
const apisTableRef = ref()
const apisSelection = ref()
const openApisDialog = () => {
    apiSelectionVisible.value = true
    const condition = {
        project__id: projectId
    }
    apis.apiList(condition)
            .then(({data}) => {
                const newObj = data.data.map(item => ({id: item.id, title: item.title}))
                apisData.value = newObj
                tableData.value = newObj
                historyData.value.forEach((row) => {
                    for (let i = 0; i < apisData.value.length; i++) {
                        if (row.id === apisData.value[i].id) {
                            nextTick(() => {
                                apisTableRef.value.toggleRowSelection(apisData.value[i], true)
                            })
                        }
                    }
                })
            })
}
const apiSelectionVisible = ref(false)
const apisearchContent = ref("")
const apisearchClose = () => {
    apisearchContent.value = ""
    apisData.value = null
    apiSelectionVisible.value = false
}
const apisSelectionChange = (val) => {
    apisSelection.value = val
}
const searchApis = (val) => {
    console.log(val)
    if (val) {
        apisData.value = tableData.value.filter(item => item.title.includes(val))
    } else {
        apisData.value = tableData.value
    }
}
// 确认添加步骤
const addSteps = () => {
    apisearchClose()
    console.log(apisSelection)
    historyData.value = apisSelection.value
    apis.editCase(props.caseId, {steps: historyData.value.map(item => (item.id))})
            .then(() => {
                ElMessage.success("添加成功！")
            })
}
const apisData = ref([])
const tableData = ref([
    {
        id: 1,
        title: "aaaa"
    },
    {
        id: 2,
        title: "bbbb"
    },
    {
        id: 2,
        title: "bbbb"
    },
    {
        id: 2,
        title: "bbbb"
    },
    {
        id: 2,
        title: "bbbb"
    },
    {
        id: 2,
        title: "bbbb"
    },
    {
        id: 2,
        title: "bbbb"
    },
    {
        id: 2,
        title: "bbbb"
    },
    {
        id: 2,
        title: "bbbb"
    },
    {
        id: 2,
        title: "bbbb"
    },
    {
        id: 2,
        title: "bbbb"
    },
    {
        id: 2,
        title: "bbbb"
    },

])

// 接口选择狂

const dialogFun = ref(false)
// 报告列表
const reportTableRef = ref()
const reportData = ref([
    {
        id: 0,
        title: "报告1",
        creat_time: "2022-09-04 15:21:03"
    }
])
const reportSelection = ref([])
const reportSelectionChange = (val) => {
    reportSelection.value = val
}
const reportList = () => {
    apis.reportList({case: props.caseId})
            .then(({data}) => {
                reportData.value = data.data
            })
}
reportList()
const cleanReport = (index = null, id = null) => {
    if (id) {
        apis.delReport(id)
                .then(({data}) => {
                    ElMessage.success('删除成功！');
                    reportData.value.splice(index, 1)
                })
    } else {
        const ids = reportSelection.value.map(item => (item.id))
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
                        apis.delReport(ids)
                                .then(({data}) => {
                                    ElMessage.success('移除成功！');
                                    reportData.value = reportData.value.filter(item => !data.data.map(item => (item.id)).includes(item.id))
                                })
                    })
                    .catch(() => {
                        ElMessage.info('取消删除！')
                    })

        } else {
            ElMessage.error('请至少选择一条数据！')
        }
    }
}
const viewReport = (url) => {
    window.open(url, "_blank");
}
// 报告列表


//拖拽开始的事件
const onStart = () => {
    console.log(historyData.value)
    console.log("开始拖拽");
};

//拖拽结束的事件
const onEnd = () => {
    console.log("结束拖拽");
    console.log(historyData.value)
    console.log(historyData.value.map(item => (item.id)))
    apis.editCase(props.caseId, {steps: historyData.value.map(item => (item.id))})
            .then(() => {
                ElMessage.success("更新排序成功！")
            })

};

const projectId = props.projectId


console.log(`projectId: ${projectId}`)


const disabled = ref(false)
const losing = (item) => {
    item.editLabel = false
    disabled.value = false
}


//curl
const dialogCurl = ref(false)
const curlText = ref('')
const curlClose = () => {
    curlText.value = "";
    dialogCurl.value = false;
}
const runCurl = () => {
    let key;
    try {
        var json_text = toJsonString(curlText.value)
    } catch (e) {
        ElMessage.warning("请检查cURL有效性！")
        return
    }
    const obj_add = {
        id: null,
        editLabel: false,
        title: '新接口',
        name: null,
        project: projectId,
        method: "GET",
        url: "",
        bodyType: "none",
        queryData: [],
        headersData: [],
        cookies: [],
        formData: [],
        formUrlencodedData: [],
        rawData: {
            type: "json",
            text: ""
        },
        postCondition: [],
        response: {}
    }
    const json_obj = JSON.parse(json_text)
    obj_add.url = json_obj.url;
    obj_add.method = json_obj.method.toUpperCase();
    const headers = json_obj?.headers ?? {};
    const ContentType = headers['Content-Type'] ?? undefined
    const queries = json_obj.queries ?? {};
    const datas = json_obj?.data ?? {};
    for (key in headers) {
        obj_add.headersData.push({
            name: key,
            value: headers[key],
            selected: true
        })
    }
    for (key in queries) {
        obj_add.queryData.push({
            name: key,
            value: queries[key],
            selected: true
        })
    }
    // Content-Type: application/json
    if (ContentType?.startsWith('application/json')) {
        obj_add.bodyType = 'raw'
        obj_add.rawData.type = 'json';
        obj_add.rawData.text = JSON.stringify(datas);
    } else if (ContentType?.startsWith('multipart')) {
        obj_add.bodyType = 'form-data'
    } else {
        obj_add.bodyType = 'x-www-form-urlencoded'
        for (key in datas) {
            obj_add.formUrlencodedData.push({
                name: key,
                value: datas[key],
                selected: true,
                type: typeof datas[key]
            })
        }
    }
    if (editableTabs.value.length > 0) {
        console.log(111111)
        editableTabs.value.forEach((tab, index) => {
            if (tab.name == editableTabsValue.value) {
                obj_add.name = tab.name
                obj_add.id = tab.id
                obj_add.title = tab.title
                editableTabs.value[index] = obj_add
                console.log(2222)
                console.log(tab)
            }
        })
        console.log(editableTabs.value)
    } else {
        console.log(obj_add)
        handleTabsAdd(obj_add)
    }

    curlClose()
}
const importApi = () => {
    dialogCurl.value = true;
}

//curl


// 配置选项
const apiEnv = ref()
let configurationOptions = ref([])
let storageOptions = ref([])
const configList = () => {
    apis.configList({
        project__id: props.projectId
    })
            .then(({data}) => {
                storageOptions.value = data.data
                configurationOptions.value = data.data.slice(1);
                emits('getConfig', configurationOptions.value)
            })
}
const envConfigurationClose = (done) => {
    configList();
    dialogTableVisible.value = false
    // ElMessageBox.confirm('确定关闭窗口吗?')
    //         .then(() => {
    //             dialogTableVisible.value = false
    //         })
    //         .catch(() => {
    //             // catch error
    //         })
}
configList()


const selectConfig = (val) => {
    editableTabs.value.forEach((tab, index) => {
        if (tab.name === editableTabsValue.value) {
            if (val === '') {
                tab.api_env = null
            } else {
                tab.api_env = val
            }
            console.log(tab)
            apis.editApi(tab.id, tab)
                    .then(() => {
                        ElMessage.success("切换环境成功！")
                    })
                    .catch((err) => {
                        ElMessage.error(err)
                    })
        }
    })
}


// 环境变量配置弹窗
const dialogTableVisible = ref(false)


let tabIndex = 1
const editableTabsValue = ref('1')
const editableTabs = ref([])


const myHandleTabsEdit = () => {
    const obj = {
        id: null,
        editLabel: false,
        title: '新接口',
        name: null,
        project: projectId,
        method: "GET",
        url: "",
        bodyType: "none",
        queryData: [],
        headersData: [],
        cookies: [],
        formData: [],
        formUrlencodedData: [],
        rawData: {
            type: "json",
            text: ""
        },
        postCondition: []
    }
    if (editableTabs.value.length === 0) {
        const newTabName = `${++tabIndex}`
        obj.name = newTabName;
        editableTabs.value.push(obj)
        editableTabsValue.value = newTabName
    } else {
        editableTabs.value.forEach((tab, index) => {
            if (tab.name == editableTabsValue.value) {
                obj.name = tab.name
                editableTabs.value[index] = obj
            }
        })
        console.log(editableTabs.value)
    }
}
const handleTabsDel = (targetName) => {
    const tabs = editableTabs.value
    let activeName = editableTabsValue.value
    if (activeName === targetName) {
        tabs.forEach((tab, index) => {
            if (tab.name === targetName) {
                const nextTab = tabs[index + 1] || tabs[index - 1]
                if (nextTab) {
                    activeName = nextTab.name
                    currentId.value = nextTab.id
                    apiEnv.value = nextTab.api_env
                } else {
                    currentId.value = null
                    apiEnv.value = null;
                }
            }
        })
    }

    editableTabsValue.value = activeName
    editableTabs.value = tabs.filter((tab) => tab.name !== targetName)
}
const handleTabsAdd = (obj = null) => {
    const newTabName = `${++tabIndex}`
    if (obj) {
        obj.name = newTabName;
    } else {
        obj = {
            id: null,
            editLabel: false,
            title: '新接口',
            name: newTabName,
            method: null
        }
    }
    editableTabs.value.push(obj)
    editableTabsValue.value = newTabName
    currentId.value = null
    apiEnv.value = null
}


const labelClick = (item) => {
    item.editLabel = true
    disabled.value = true
    nextTick(() => {
        document.getElementById(`${item.name}`).focus()
    })
}


const addApiTab = (id) => {
    apis.apiDetail(id)
            .then(({data}) => {
                const newTabName = `${++tabIndex}`
                data.data['editLabel'] = false
                data.data['name'] = newTabName
                apiEnv.value = data.data.api_env;
                editableTabs.value.push(data.data)
                editableTabsValue.value = newTabName
            })
}
const clickHistory = (id) => {
    console.log(typeof id)
    if (id) {
        currentId.value = id
        const exist = ref(false)
        for (let i = 0; i < editableTabs.value.length; i++) {
            if (editableTabs.value[i].id === id) {
                editableTabsValue.value = editableTabs.value[i].name
                apiEnv.value = editableTabs.value[i].api_env;
                exist.value = true
                return
            }
        }
        console.log("没有匹配id")
        if (!exist.value) {
            console.log("不存在 新建并赋值")
            addApiTab(id)
        }
    }
}

const stepList = () => {
    apis.stepList(props.caseId)
            .then(({data}) => {
                if (data.code === 200) {
                    historyData.value = data.data
                } else {
                    ElMessage.error(data.msg)
                }
            })
}
stepList()
onMounted(() => {
    nextTick(() => {
        const idEl = document.getElementById('configuration')
        idEl.nextElementSibling.firstElementChild.style.width = `calc(100% - ${idEl.offsetWidth}px - 13px)`;
    })
})

// 删除用例步骤
const delStep = (data, delId) => {
    apis.editCase(props.caseId, {steps: data.map(item => (item.id))})
            .then(() => {
                ElMessage.success("删除成功！")
                historyData.value = data
                const targetName = editableTabs.value.filter((tab) => tab.id === delId)[0]?.name;
                handleTabsDel(targetName);
            })
}

const cleanSteps = () => {
    delStep([])
}
const historyCommand = (command) => {
    if (command.command === 2) {
        // 删除
        const data = JSON.parse(JSON.stringify(historyData.value));
        data.splice(command.index, 1)
        delStep(data, command.id)
    }
}


// 发送请求
const sendRequest = (obj) => {
    if (obj.url === "") {
        ElMessage.error("如未配置环境请输入含 http / https 的完整 URL")
        return
    }
    obj.response = {};
    apis.apiSend(obj)
            .then(res => {
                obj.status = res.data.status
                obj['response'] = res.data
                console.log(obj.response)
            })
            .catch(err => {
                obj.status = err.response.data.status
                obj['response'] = err.response.data
            })

}
// 保存请求
const saveRequest = (obj) => {
    const apiId = obj.id
    for (const item of obj.formData) {
        if (item.name !== '') {
            if (item.type === 'file' && item.fileList.length > 0) {
                for (var i = 0; i < item.fileList.length; i++) {
                    item.fileList[i].raw = {
                        uid: item.fileList[i].raw.uid,
                        type: item.fileList[i].raw.type
                    }
                }
            }

        }

    }
    const newObj = JSON.parse(JSON.stringify(obj))
    delete newObj.response
    if (newObj.rawData.type === 'json') {
        try {
            newObj.rawData.text = JSON.stringify(JSON.parse(newObj.rawData.text))
        } catch (e) {
        }
    }
    if (apiId) {
        // 更新api
        console.log("更新")
        apis.editApi(apiId, obj)
                .then(({data}) => {
                    ElMessage.success(data.detail)
                    // apiList();
                    for (const index in historyData.value) {
                        if (historyData.value[index].id === apiId) {
                            historyData.value[index].title = data.data.title
                            historyData.value[index].url = data.data.url
                            historyData.value[index].method = data.data.method
                            break
                        }
                    }
                })
    } else {
        // 新增api
        //  console.log("新增")
        apis.addApi(obj)
                .then(({data}) => {
                    obj.id = data.data.id
                    ElMessage.success("新增成功")
                    const steps = JSON.parse(JSON.stringify(historyData.value)).map(item => (item.id));
                    steps.push(data.data.id)
                    apis.editCase(props.caseId, {steps: steps})
                            .then(() => {
                                console.log(data.detail)
                                currentId.value = data.data.id
                                historyData.value.push({
                                    id: data.data.id,
                                    title: data.data.title
                                })
                            })
                })
    }
}
const submitForm = async (formEl, item, num) => {
    if (!formEl) return
    await formEl.validate((valid, fields) => {
        if (valid) {
            //  console.log('submit!')
            if (num === 1) {
                sendRequest(item)
            } else if (num === 2) {
                saveRequest(item)
            }
        } else {
            console.log('error submit!', fields)
        }
    })
}


defineExpose({
    reportList,
    configurationOptions
})
</script>

<style lang="less" scoped>

.el-col {
    height: 100%;
    //box-sizing: border-box;

    .el-card {
        --el-card-padding: 0 10px;
        height: 100%;
        box-sizing: border-box;

        .card-header {
            padding: 0 10px;
            height: 50px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
    }

    li {
        font-size: 14px;
        cursor: pointer;
        height: 30px;
        line-height: 30px;
        padding: 0 5px;
        margin-bottom: 2px;
        box-sizing: border-box;
        border-radius: 5px;
        display: flex;
        justify-content: space-between;
    }

    li:hover {
        background-color: #656565;
        color: #fff;
    }

    li:hover .el-dropdown-link {
        visibility: visible;
    }

    //li:focus {
    //    background-color: #409eff;
    //    color: #fff;
    //    font-weight: 700;
    //}

    .edit-history {
        display: flex;
        align-items: center;

        .el-dropdown-link {
            visibility: hidden;
            display: flex;
            border-radius: 50%;
            padding: 3px;
            cursor: pointer;
            color: #1d4c7ecc;
            align-items: center;
        }

        .el-dropdown-link:hover {
            background-color: rgba(227, 221, 221, 0.85);
        }

    }


}

// 快捷请求记录编辑下拉框图标按钮的大小
.item-more {
    width: 13px;
}


.api-tabs {
    height: 100%;
    display: flex;
    flex-direction: column;

    :deep(.el-tabs__content) {
        flex: 1;
    }

    .el-tab-pane {
        height: 100% !important;
    }

    .el-table {
        :deep(.el-table__inner-wrapper) {
            height: 100% !important;
            box-sizing: border-box;
            display: block;
        }

        :deep( .el-table__body-wrapper) {
            td {
                padding: 0;

                &:first-child {
                    border-left: var(--el-table-border);
                }

                .cell {
                    padding: 0;
                }
            }

            height: calc(100% - 34px) !important; // 表格高度减去表头的高度
            flex: 1;
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
}


.title_box {
    width: auto;
    --el-input-hover-border: none;
    --el-input-hover-border-color: none;
    --el-input-focus-border: none;
    --el-input-focus-border-color: none;
    --el-input-border-color: none;
    --el-input-border-radius: 0;

    :deep(.el-input__wrapper) {
        padding: 0;
    }
}


.active {
    background-color: #409eff !important;
    color: #fff;
    font-weight: 700;
}


//@configuration_width: 280px;
#configuration {
    position: absolute;
    border-bottom: 1px solid #e4e7ed;
    top: 10px;
    right: 10px;
    width: auto;
    height: 40px;
    display: flex;
    align-items: center;
    //background-color: red;
    .el-select {
        width: 150px;
    }

    :deep(.el-input__wrapper) {
        width: auto;
        border-radius: 0;
    }
}


//修改 添加tab按钮的位置 让其紧随 每个item后面
:deep(.el-tabs--card>.el-tabs__header ) {
    //width: calc(100% - @configuration_width - 10px);
    display: flex;
    justify-content: flex-start;
    padding-right: 15px;

    .el-tabs__new-tab {
        order: 1;
    }

    //修改header栏的border
    .el-tabs__nav {
        border-top-color: transparent;
        border-left-color: transparent;
        // border-color: transparent;
        border-radius: 0;
    }

}


.apisearch {
    height: 60vh;
    display: flex;
    flex-direction: column;

    .el-table {
        flex: 1;
    }
}


.content {

    :deep(.el-tabs__header) {
        margin: 0 0 10px;
    }

    .el-tab-pane {
        height: calc(100vh - 83px - 50px);
    }

    .report-list-action {
        height: 40px;
        padding: 0 12px;
        display: flex;
        flex-direction: row;
        align-items: center;

        button {
            margin-left: 20px;
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
}
</style>