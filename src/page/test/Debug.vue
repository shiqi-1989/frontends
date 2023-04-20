<template>
    <el-row style="height: 100%;padding-top: 20px;">
        <div :class="leftSpan?'leftOn':'leftOff'">
            <el-card
                    :body-style="{ padding: '5px 10px 20px',height:'calc(100% - 50px)', boxSizing:'border-box'}">
                <template #header>
                    <div class="card-header">
                        <h3>快捷请求</h3>
                    </div>
                </template>
                <el-empty v-if="historyData.length===0" description="description" style="height: 100%;"/>
                <div v-else class="infinite-list-wrapper" style="overflow: auto;">
                    <ul v-infinite-scroll="loadApis" :infinite-scroll-disabled="apiDisabled">
                        <li v-for="(item, index) in historyData" :key="index"
                            :class="{active:item.id === currentId}"
                            :tabIndex="index">
                            <span style="flex: 1;"
                                  @click="clickHistory(item.id)">
                                <span
                                        :style="{color: $methodColor(item.method),fontWeight: 'bold',marginRight: '10px'}">
                                    {{ item.method }}
                                </span>
                                    <a>{{ item.title || "新接口" }} - {{ urlCut(item.url) }}</a>
                                </span>
                            <el-dropdown class="edit-history" @command="historyCommand">
                                <span class="el-dropdown-link">
                                  <el-icon>
                                    <MoreFilled/>
                                  </el-icon>
                                </span>
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item @click="openSelPro(item, index)">
                                            <Plus class="item-more"/>
                                        </el-dropdown-item>
                                        <el-dropdown-item :command="{command:1, id:item.id, index:index}">
                                            <CopyDocument class="item-more"/>
                                        </el-dropdown-item>
                                        <el-dropdown-item :command="{command:2, id:item.id, index:index}">
                                            <Delete class="item-more"/>
                                        </el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </li>
                    </ul>
                    <p v-if="apiLoading">Loading...</p>
                    <p v-if="noMore">No more</p>
                </div>
            </el-card>
        </div>
        <div class="rightBox">
            <div class="up-expand" @click="changSpan">
                <el-icon>
                    <Component :is="myIcon"></Component>
                </el-icon>
            </div>
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
                        <AddApiMode :func1="handleTabsEditFFF" :func2="importApi"/>
                    </div>
                    <el-tab-pane
                            v-for="(item, index) in editableTabs"
                            :key="item.name"
                            :disabled="disabled"
                            :name="item.name"
                    >

                        <template #label>
                            <el-tooltip :content="item.title || '新接口'" effect="light" placement="top">
                                <span v-show="!item.editLabel" @dblclick="labelClick(item)">{{
                                        item.title || "新接口"
                                    }}</span>
                            </el-tooltip>
                            <el-input v-show="item.editLabel" :id="item.name" v-model="item.title" class="title_box"
                                      clearable
                                      @blur="losing(item)"
                                      @keyup.enter.native="losing(item)"
                            />
                        </template>
                        <div v-if="!item.method"
                             style="display: flex;align-items: center;justify-content: center;height: 100%;">
                            <AddApiMode :func1="handleTabsEditFFF" :func2="importApi"/>
                        </div>
                        <div v-else style="height: 100%;width: 100%;">
                            <DebugPanel :open-sel-pro="openSelPro" :send-request="submitForm" :item="item"
                                        :index="index"/>
                        </div>
                    </el-tab-pane>
                </el-tabs>
            </el-card>
        </div>
    </el-row>
    <!--选择项目弹窗-->
    <el-dialog
            v-model="table.showEdit"
            :before-close="handleClose"
            title="添加到项目"
            width="35%"
    >
        <el-form
                ref="addToProFormRef"
                :model="table.formData"
                :rules="table.formRules"
                label-position="right"
                label-width="80px"
        >
            <el-form-item label="接口名称" prop="title">
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
        <el-button type="primary" @click="addToPro(addToProFormRef)">确认</el-button>
      </span>
        </template>
    </el-dialog>
    <!--curl弹窗-->
    <el-dialog
            v-model="dialogCurl"
            title="cURL 解析"
            width="50%"
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
import {computed, getCurrentInstance, nextTick, onMounted, reactive, ref} from 'vue'
import {ElMessage} from "element-plus";
import FunctionHelper from "../../components/FunctionHelper.vue";
import apis from "../../../api/api";
import {useRouter} from "vue-router";
import {toJsonString} from "curlconverter";
import AddApiMode from "../../components/AddApiMode.vue";
import DebugPanel from "../subcomponent/DebugPanel.vue";

const getParams = (item, key, val) => {
    item[key] = val
}
const ruleFormRef = ref()
const router = useRouter()
const myIcon = ref('CaretLeft')
const leftSpan = ref(true)
const {proxy} = getCurrentInstance()
const state = ref(true)
// 函数助手
const dialogFun = ref(false)
//函数助手

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
        handleTabsEdit(obj_add, 'add')
    }

    curlClose()
}

const size = ref("large")
const disabled = ref(false)
const losing = (item) => {
    item.editLabel = false
    disabled.value = false
    // apis.editApi(item.id, {title: item.title})
    //         .then(({data}) => {
    //             ElMessage.success(data.msg)
    //             // apiPage.value = 2
    //             // apiList();
    //             for (const index in historyData.value) {
    //                 if (historyData.value[index].id === data.data.id) {
    //                     historyData.value[index].title = data.data.title
    //                     break
    //                 }
    //             }
    //         })
}

const table = reactive({
    showEdit: false,
    showIndex: null,
    formData: {},
    formRules: {
        title: [
            {required: true, message: '请输入接口名称', trigger: 'blur'},
        ],
        project: [
            {required: true, message: "请选择项目", trigger: 'blur'},
        ],
    }
})


const changSpan = () => {
    leftSpan.value = !leftSpan.value;
    if (leftSpan.value) {
        // rightSpan.value = 18
        myIcon.value = 'CaretLeft'
    } else {
        // rightSpan.value = 24
        myIcon.value = 'CaretRight'
    }
}

const currentId = ref()
const handleClick = (TabsPaneContext, Event) => {
    currentId.value = editableTabs.value[TabsPaneContext.index].id
}
// 截取url path
const urlCut = (url) => {
    try {
        const start = url.split("//")[1].indexOf("/");
        //stop省略，截取从start开始到结尾的所有字符
        return url.split("//")[1].substring(start)
    } catch (e) {
        return url
    }

}


// tab数据
let tabIndex = 0
const editableTabsValue = ref()
const editableTabs = ref([])
const handleTabsEdit = (obj_add) => {
    const newTabName = `${++tabIndex}`
    obj_add.name = newTabName;
    editableTabs.value.push(obj_add)
    editableTabsValue.value = newTabName
    // if (action === 'add') {
    //     const newTabName = `${++tabIndex}`
    //     obj_add.name = newTabName;
    //     editableTabs.value.push(obj_add)
    //     editableTabsValue.value = newTabName
    //     apis.addApi(obj_add)
    //             .then(({data}) => {
    //                 obj_add.id = data.data.id
    //                 ElMessage.success(data.msg)
    //                 //  console.log(data)
    //                 historyData.value.unshift(data.data)
    //                 editableTabs.value.push(obj_add)
    //                 editableTabsValue.value = newTabName
    //             })
    //             .catch(() => {
    //             })
    //
    //
    // } else if (action === 'remove') {
    //     const tabs = editableTabs.value
    //     let activeName = editableTabsValue.value
    //     if (activeName === targetName) {
    //         tabs.forEach((tab, index) => {
    //             if (tab.name === targetName) {
    //                 const nextTab = tabs[index + 1] || tabs[index - 1]
    //                 if (nextTab) {
    //                     activeName = nextTab.name
    //                 }
    //             }
    //         })
    //     }
    //
    //     editableTabsValue.value = activeName
    //     editableTabs.value = tabs.filter((tab) => tab.name !== targetName)
    // }
}
const handleTabsEditFFF = () => {
    const obj = {
        id: null,
        editLabel: false,
        title: '新接口',
        name: null,
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
                    // 更新当前id
                    currentId.value = nextTab.id
                } else {
                    currentId.value = null
                }
            }
        })
    }

    editableTabsValue.value = activeName
    editableTabs.value = tabs.filter((tab) => tab.name !== targetName)
}
const handleTabsAdd = () => {
    const newTabName = `${++tabIndex}`
    const obj = {
        id: null,
        editLabel: false,
        title: '新接口',
        name: newTabName,
        method: null
    }
    editableTabs.value.push(obj)
    editableTabsValue.value = newTabName
}
const importApi = () => {
    dialogCurl.value = true;
    // ElMessage.success("敬请期待！")
    // handleTabsEdit(undefined, 'add')
    // setTimeout(function () {
    //     const win = window.open("", "_blank");
    //     win.location = "https://curlconverter.com/python/"
    // });
}
const labelClick = (item) => {
    item.editLabel = true
    disabled.value = true
    nextTick(() => {
        document.getElementById(`${item.name}`).focus()
    })
}
const historyData = ref([])
const apiLoading = ref(false)
const noMore = computed(() => historyData.value.length >= apiCount.value)
const apiPage = ref(1)
const apiCount = ref(0)
const apiDisabled = computed(() => apiLoading.value || noMore.value)
const loadApis = () => {
    apiLoading.value = true
    const condition = {
        page: apiPage.value,
        pageSize: 20
    }
    apis.tempApiList(condition)
            .then(({data}) => {
                //  console.log(data)
                apiPage.value += 1
                apiCount.value = data.count
                historyData.value.push(...data.results)
                apiLoading.value = false
            })

}
loadApis()

const addApiTab = (id) => {
    apis.apiDetail(id)
            .then(({data}) => {
                const newTabName = `${++tabIndex}`
                data.data['editLabel'] = false
                data.data['name'] = newTabName
                editableTabs.value.push(data.data)
                editableTabsValue.value = newTabName
            })
}

const clickHistory = (id) => {
    //  console.log(typeof id)
    if (id) {
        currentId.value = id
        if (editableTabs.value.length === 0) {
            addApiTab(id)
        } else {
            const exist = ref(false)
            for (var i = 0; i < editableTabs.value.length; i++) {
                //  console.log(editableTabs.value[i].id)
                if (editableTabs.value[i].id === id) {
                    editableTabsValue.value = editableTabs.value[i].name
                    exist.value = true
                    return
                }
            }
            //  console.log("没有匹配id")
            if (!exist.value) {
                //  console.log("不存在 新建并赋值")
                addApiTab(id)
            }
        }

    } else {
        handleTabsEdit(undefined, 'add');
    }
}


onMounted(() => {
    // ace.config.set('basePath', '/node_modules/ace-builds/src-noconflict');
    // nextTick(() => {
    //     tab2Content.value = document.getElementById('tabs2').clientHeight - 50;
    //     responseHeight.value = document.getElementById('responseDiv').clientHeight - 30;
    // })
    // window.onresize = () => {
    //     tab2Content.value = document.getElementById('tabs2').clientHeight - 50;
    //     responseHeight.value = document.getElementById('responseDiv').clientHeight - 30;
    // }
    const idEl = document.getElementById('configuration')
    idEl.nextElementSibling.firstElementChild.style.width = `calc(100% - ${idEl.offsetWidth}px - 13px)`;
})
// 获取项目列表
const projectList = ref([])
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
const historyCommand = (command) => {
    //  console.log(command)
    if (command.command === 2) {
        // 删除
        apis.delApi(command.id)
                .then(() => {
                    historyData.value.splice(command.index, 1)
                    apiCount.value -= 1
                    ElMessage.success("删除成功！")
                    const targetName = editableTabs.value.filter((tab) => tab.id === command.id)[0]?.name;
                    handleTabsEdit(targetName, "remove");
                })
    }
    if (command.command === 1) {
        //复制
        apis.copyApi({id: command.id})
                .then(({data}) => {
                    //  console.log(historyData.value)
                    historyData.value.unshift(data.data)
                    ElMessage.success("复制成功！")
                })
    }
}
const addToProFormRef = ref()
const openSelPro = (item, index) => {
    // 添加到项目 选择项目弹窗
    table.formData = item
    table.showIndex = index
    table.showEdit = true
    proList()
}

// 发送请求
const sendRequest = (obj) => {
    if (obj.url === "") {
        ElMessage.error("如未配置环境请输入含 http / https 的完整 URL")
        return
    }
    // 发送按钮loading
    for (const item of obj.formData) {
        if (item.name !== '') {
            if (item.type === 'file' && item.fileList.length > 0) {
                for (let i = 0; i < item.fileList.length; i++) {
                    item.fileList[i].raw = {
                        type: item.fileList[i].raw.type
                    }
                }
            }
        }
    }
    obj.response = {};
    apis.apiSend(obj)
            .then(res => {
                obj.response = res.data
            })
            .catch(err => {
                obj.response = err.response.data
            })

}
// 保存请求
const saveRequest = (obj) => {
    console.log(obj)
    const apiId = obj.id
    for (const item of obj.formData) {
        if (item.name !== '') {
            if (item.type === 'file' && item.fileList.length > 0) {
                for (var i = 0; i < item.fileList.length; i++) {
                    item.fileList[i].raw = {
                        type: item.fileList[i].raw.type
                    }
                }

            }
        }
    }
    const newObj = JSON.parse(JSON.stringify(obj))
    newObj.response = {
        status: obj.response.status,
        startTime: obj.response.startTime,
        duration: obj.response.duration,
    }
    if (newObj.rawData.type === 'json') {
        try {
            newObj.rawData.text = JSON.stringify(JSON.parse(newObj.rawData.text))
        } catch (e) {
        }
    }
    if (apiId) {
        // 更新api
        //  console.log("更新")
        apis.editApi(apiId, newObj)
                .then(({data}) => {
                    ElMessage.success(data.detail)
                    // apiPage.value = 2
                    // apiList();
                    for (const index in historyData.value) {
                        if (historyData.value[index].id === data.data.id) {
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
        apis.addApi(newObj)
                .then(({data}) => {
                    obj.id = data.data.id
                    ElMessage.success("新增成功")
                    //  console.log(data)
                    historyData.value.unshift(data.data)
                })
    }


}
const submitForm = async (formEl, item, num) => {
    console.log(1111111111111)
    console.log(formEl)
    if (!formEl) return
    await formEl.validate((valid, fields) => {
        if (valid) {
            Object.keys(item).forEach(key => {
                if (Array.isArray(item[key])) {
                    item[key] = item[key].filter((tab) => tab.name !== "")
                }
            })
            //  console.log('submit!')
            if (num === 1) {
                sendRequest(item)
            } else if (num === 2) {
                saveRequest(item)
            }
        } else {
            //  console.log('error submit!', fields)
        }
    })
}

const handleClose = () => {
    resetForm(addToProFormRef)
    table.showIndex = null;
    table.showEdit = false;
}
//重置新建
const resetForm = (formEl) => {
    if (!formEl) return
    formEl.value.resetFields()
}
const addToPro = (formEl) => {
    if (!formEl) return
    formEl.validate((valid) => {
        if (valid) {
            apis.editApi(table.formData.id, table.formData)
                    .then(({data}) => {
                        handleTabsDel(editableTabsValue.value)
                        try {
                            historyData.value.forEach((item, index) => {
                                if (item.id === table.formData.id) {
                                    historyData.value.splice(index, 1);
                                    throw new Error()
                                }
                            })
                        } catch (e) {
                        }
                        apiCount.value -= 1
                        ElMessage.success('添加到项目成功！')
                        handleClose()
                    })

        } else {
            return false
        }
    })
}
</script>

<style lang="less" scoped>
.leftOn {
    width: 25%;
    height: 100%;
    margin-right: 20px;
    opacity: 1;
    transition: 0.5s ease-out;
}

.leftOff {
    height: 100%;
    width: 0%;
    margin-right: 0px;
    opacity: 0;
    transition: 0.5s ease-out;
}

.rightBox {
    height: 100%;
    flex: 1;
    position: relative;
    z-index: 0;
    min-width: calc(75% - 20px);
}

.el-card {
    --el-card-padding: 0 10px;
    height: 100%;

    .card-header {
        padding: 0 10px;
        height: 50px;
        display: flex;
        justify-content: space-between;
        align-items: center;

        h3 {
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
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

    /*    li:focus {
            background-color: #409eff;
            color: #fff;
            font-weight: 700;
        }*/

    .edit-history {
        display: flex;
        align-items: center;

        .el-dropdown-link {
            display: flex;
            visibility: hidden;
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
        height: 100%;
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

.active {
    background-color: #409eff !important;
    color: #fff;
    font-weight: 700;
}


//修改 添加tab按钮的位置 让其紧随 每个item后面
:deep(.el-tabs--card>.el-tabs__header ) {
    //width: calc(100% - 240px);
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


.infinite-list-wrapper {
    height: 100%;

    span {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }

    p {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        text-align: center;
    }
}


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
    :deep(.el-input__wrapper) {
        width: auto;
        border-radius: 0;
    }
}

</style>
