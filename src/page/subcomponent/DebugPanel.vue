<template>
    <!--方法 路径 区域-->
    <div class="path-div">
        <el-form ref="ruleFormRef" :model="item" style="width: 100%;">
            <el-form-item
                    :rules=" {required: true, message: '如未配置环境请输入含 http / https 的完整 URL', trigger: 'blur'}"
                    prop="url">
                <el-input
                        v-model="item.url"
                        size="large"
                        autocomplete="off"
                        class="input-with-select"
                        clearable
                        placeholder='如未配置环境请输入含 http / https 的完整 URL'
                        spellcheck="false"
                >
                    <template #prepend>
                        <el-select v-model="item.method"
                                   size="large"
                                   :style="{'--el-text-color-regular': $methodColor(item.method)}"
                                   class="selectMethod"
                                   input-style="font-weight: 900 !important"
                                   placeholder="GET">
                            <el-option
                                    v-for="item in $selections()"
                                    :key="item.value"
                                    :label="item.label"
                                    :style="{'color': item.color,'font-weight': 'bold'}"
                                    :value="item.value"

                            />
                        </el-select>
                    </template>
                </el-input>
            </el-form-item>
        </el-form>
        <el-button size="large" type="primary"
                   @click="sendRequest(ruleFormRef, item, 1)">发送
        </el-button>

        <el-dropdown size="large" split-button type="primary"
                     @click="sendRequest(ruleFormRef, item, 2)">保存
            <template #dropdown>
                <el-dropdown-menu>
                    <el-dropdown-item @click="openSelPro(item, index)">保存到项目
                    </el-dropdown-item>
                </el-dropdown-menu>
            </template>
        </el-dropdown>
    </div>
    <!--整体参数区域  headers  body 等等-->
    <div :class="box_layout? 'body-box':'body-box-row'">
        <el-tabs id="tabs2" :class="[state?'body-off':'body-on']"
                 class="tab2" model-value="Headers">
            <el-tab-pane label="Params">
                <Params :param-data="item.queryData"
                        @getParams="(val)=>getParams(item, 'queryData', val)"></Params>
            </el-tab-pane>
            <el-tab-pane label="Headers" name="Headers">
                <Params :is-headers="true" :param-data="item.headersData"
                        @getParams="(val)=>getParams(item, 'headersData', val)"></Params>
            </el-tab-pane>
            <el-tab-pane label="Body">
                <el-tabs
                        v-model="item.bodyType"
                        class="tab3"
                >
                    <el-tab-pane label="none" name="none">
                        <el-empty :image-size="80" description="该请求没有请求体!"
                                  style="height: 100%;"/>
                    </el-tab-pane>
                    <el-tab-pane label="form-data" name="form-data">
                        <FormData :form-data="item.formData"/>
                    </el-tab-pane>
                    <el-tab-pane label="x-www-form-urlencoded" name="x-www-form-urlencoded">
                        <Params :param-data="item.formUrlencodedData"
                                @getParams="(val)=>getParams(item, 'formUrlencodedData', val)"></Params>
                    </el-tab-pane>
                    <el-tab-pane name="raw">
                        <template #label>
                            raw
                            <el-dropdown @command="handleCommand">
                                                <span v-show="item.bodyType==='raw'" class="el-dropdown-link">|
                                                    {{ item.rawData.type ? item.rawData.type : "json" }}
                                                </span>
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item v-for="it in typeItems"
                                                          :command="composeValue(it, item.rawData)">
                                            {{ it }}
                                        </el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </template>
                        <div style="height: 100%;position: relative">
                            <el-button v-show="item.rawData.type==='json'" size="small"
                                       style="position: absolute;top: 0;right: 13px;z-index: 100;opacity: .7;"
                                       type="primary"
                                       @click="proxy.$jsonFormat(item.rawData)"
                            >json格式化
                            </el-button>
                            <MyAce :raw-data="item.rawData"
                                   :read-only="false"></MyAce>
                        </div>

                    </el-tab-pane>
                    <el-tab-pane label="binary" name="binary">binary</el-tab-pane>
                </el-tabs>
            </el-tab-pane>
            <el-tab-pane label="Cookies">
                <Params :param-data="item.cookies"
                        @getParams="(val)=>getParams(item, 'cookies', val)"></Params>
            </el-tab-pane>
            <el-tab-pane label="Auth">敬请期待</el-tab-pane>
            <el-tab-pane label="前置">
                <el-scrollbar class="postcondition-box">
                    <div class="postcondition-add">
                        <el-dropdown @command="postConditionCommand">
                            <el-button disabled>
                                添加前置操作（敬请期待）
                            </el-button>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                            v-for="(item_drop, index_drop) in dropdownOptions"
                                            :command="{item_drop, data:item.postCondition}"
                                            :disabled="item_drop.divided">
                                        <el-icon :color="item_drop.color" :size="18">
                                            <component :is="item_drop.icon"></component>
                                        </el-icon>
                                        {{ item_drop.title }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </div>
                </el-scrollbar>
            </el-tab-pane>
            <el-tab-pane label="后置">
                <el-scrollbar class="postcondition-box">
                    <el-collapse accordion>
                        <el-collapse-item v-for=" (item_son, index_son) in item.postCondition"
                                          :name="index_son+1">
                            <template #title>
                                <el-icon :color="item_son.color" class="icon-style">
                                    <component :is="item_son.icon"></component>
                                </el-icon>
                                <span class="title-type">{{ item_son.title }}</span>
                                <div class="p-content-style">
                                    <span class="title-type">{{ item_son.name }}</span>
                                    <span class="content-style">{{
                                            sourceOptionsEcho(item_son.resMetaData)
                                        }} -> {{
                                            item_son.expression
                                        }}
                                                            <span
                                                                    v-if="item_son.continueExtract.is===1">{{
                                                                    '  分隔符:[' + item_son.continueExtract.separator + ']  索引:' + item_son.continueExtract.index + ' '
                                                                }} </span>
                                                            <span v-if="item_son.type===0"> {{
                                                                    assertOptionsEcho(item_son.assert.way)
                                                                }} {{ item_son.assert.expected }}</span>
                                                        </span>
                                </div>
                                <div style="padding: 0 10px;display: flex;align-items: center;"
                                     @click.stop>
                                    <el-switch
                                            v-model="item_son.postConditionSwitch"
                                            :active-value=1
                                            :inactive-value=0
                                            size="small"
                                    />
                                    <el-button icon="Delete" link style="margin-left: 10px;"
                                               type=""
                                               @click="delPostcond(item.postCondition,index_son)"/>
                                </div>
                            </template>
                            <div style="display: flex;justify-content: center;">
                                <el-form
                                        :model="item_son"
                                        :rules="postConditionRules"
                                        label-position="right"
                                        label-width="120px"
                                        style="width: 80%;"
                                >
                                    <el-form-item
                                            :label="getLabel(item_son.type)"
                                            prop="name"
                                    >
                                        <el-input clearable v-model="item_son.name"/>
                                    </el-form-item>
                                    <el-form-item label="源数据">
                                        <el-select v-model="item_son.resMetaData"
                                                   placeholder="Select"
                                                   style="width: 100%;">
                                            <el-option
                                                    v-for="item in sourceOptions"
                                                    :key="item.value"
                                                    :label="item.label"
                                                    :value="item.value"
                                            />
                                        </el-select>
                                    </el-form-item>
                                    <el-form-item label="提取表达式">
                                        <div v-if="item_son.resMetaData===0"
                                             class="p-content-style">
                                            <el-input v-model="item_son.expression"
                                                      placeholder="正则表达式"
                                                      style="flex: 1;"/>
                                            <span
                                                    style="margin: 0 8px;align-items: center;display: flex">
                                                                    索引
                                                                  <el-tooltip effect="light" placement="top">
                                                                    <template
                                                                            #content> 提取结果默认为数组，默认索引0 </template>
                                                                    <el-icon :size="15" color="#cfcfcf">
                                                                      <QuestionFilled/>
                                                                    </el-icon>
                                                                  </el-tooltip>
                                                                    :
                                                                </span>
                                            <el-input-number
                                                    v-model="item_son.expressionIndex"
                                                    :min="0"
                                                    controls-position="right"
                                                    style="width: 80px;"
                                            />
                                        </div>
                                        <div v-else-if="item_son.resMetaData===1"
                                             class="p-content-style">
                                            <el-input v-model="item_son.expression"
                                                      placeholder="Json Path 表达式"
                                                      style="flex: 1;"/>
                                            <span
                                                    style="margin: 0 8px;align-items: center;display: flex">
                                                                    继续提取
                                                                  <el-tooltip effect="light" placement="top">
                                                                    <template
                                                                            #content> 对提取结果进行深度提取，比如分割字符串继续提取 </template>
                                                                    <el-icon :size="15" color="#cfcfcf">
                                                                      <QuestionFilled/>
                                                                    </el-icon>
                                                                  </el-tooltip>
                                                                    :
                                                                </span>
                                            <el-switch
                                                    v-model="item_son.continueExtract.is"
                                                    :active-value=1
                                                    :inactive-value=0
                                                    size="small"
                                            />
                                        </div>
                                    </el-form-item>
                                    <el-form-item
                                            v-if="item_son.resMetaData===1&&item_son.continueExtract.is==1"
                                            label="继续提取">
                                        <div class="p-content-style">
                                            <el-input
                                                    v-model="item_son.continueExtract.separator"
                                                    placeholder="字符串分隔符号">
                                                <template #prepend>分隔符</template>
                                            </el-input>
                                            <el-input-number
                                                    v-model="item_son.continueExtract.index"
                                                    :min="0"
                                                    controls-position="right">
                                                <template #prepend>索引</template>
                                            </el-input-number>
                                        </div>

                                    </el-form-item>
                                    <el-form-item v-if="item_son.type===0" label="断言">
                                        <el-input
                                                v-model="item_son.assert.expected"
                                                class="input-with-select"
                                                placeholder="预期结果"
                                        >
                                            <template #prepend>
                                                <el-select v-model="item_son.assert.way"
                                                           placeholder="Select"
                                                           style="width: 100px">
                                                    <el-option
                                                            v-for="item in assertOptions"
                                                            :key="item.value"
                                                            :label="item.label"
                                                            :value="item.value"
                                                    />
                                                </el-select>
                                            </template>
                                            <template #append>
                                                <el-select
                                                        v-model="item_son.assert.expectedType"
                                                        placeholder="类型"
                                                        style="width: 80px">
                                                    <el-option
                                                            v-for="item in dataOptions"
                                                            :key="item.value"
                                                            :label="item.label"
                                                            :value="item.value"
                                                    />
                                                </el-select>
                                            </template>
                                        </el-input>
                                    </el-form-item>
                                    <el-form-item v-if="item_son.type ===1 && newOptions.length!==0"
                                                  label="保存变量到">
                                        <el-select
                                                v-model="item_son.config"
                                                clearable
                                                placeholder="请选择环境"
                                                style="width: 100%;">
                                            <el-option
                                                    v-for="item in newOptions"
                                                    :key="item.id"
                                                    :label="item.title"
                                                    :value="item.id"
                                            />
                                        </el-select>
                                    </el-form-item>
                                </el-form>
                            </div>
                        </el-collapse-item>
                    </el-collapse>
                    <div class="postcondition-add">
                        <el-dropdown @command="postConditionCommand">
                            <el-button>
                                添加后置操作
                            </el-button>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                            v-for="(item_drop, index_drop) in dropdownOptions"
                                            :command="{item_drop, data:item.postCondition}"
                                            :disabled="item_drop.divided">
                                        <el-icon :color="item_drop.color" :size="18">
                                            <component :is="item_drop.icon"></component>
                                        </el-icon>
                                        {{ item_drop.title }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </div>

                </el-scrollbar>
            </el-tab-pane>
        </el-tabs>
        <div id="responseDiv">
            <div class="btn-result">
                <el-tag>
                    <el-button link @click.prevent="resultDisplay">
                        <el-icon :class="[state?'icon-off':'icon-on']" class="el-icon--left">
                            <!--<ArrowDown/>-->
                            <Component :is="iconStr"></Component>
                        </el-icon>
                        返回结果
                    </el-button>
                </el-tag>
                <el-tag v-if="item?.response?.status" :type="statusTtype(item?.response.status)"
                        effect="dark">
                    <Timer style="width: 1.5em; height: 1.5em; margin-right: 5px;"/>
                    {{ dateFormat(item?.response.startTime) }}
                    <Sunny v-if="item?.response.status<300"
                           class="results-icon"/>
                    <Lightning v-else class="results-icon"/>
                    Status
                    {{ item?.response.status }}
                    <Odometer class="results-icon"/>
                    {{ item?.response.duration || '0' }}ms
                </el-tag>
            </div>
            <div v-if="state" class="response-Content">
                <el-button icon="Menu" size="small"
                           @click="changeBoxlayout"></el-button>
                <div class="ace-style">
                    <el-tabs model-value="first" id="requestDiv" type="border-card">
                        <el-tab-pane label="Response" name="first">
                            <div class="response-div">
                                <MyAce v-if="item?.response?.status"
                                       :raw-data="toStr(item.response.data)"
                                       :readonly="true"
                                >
                                </MyAce>
                                <el-empty v-else :image-size="120"
                                          description="点击发送获取响应结果"
                                          style="height: 100%;flex: 1;"/>
                                <div v-if="item?.response?.postConditionResult?.length > 0"
                                     class="Condition-show">
                                    <div v-for="(p, p_index) in item.response.postConditionResult"
                                         :style="{'background-color': getConditionColor(p.status)}"
                                         class="condition-style">
                                        <el-icon v-if="p.status"
                                                 style="background-color: #5cb85c;color: #ffffff;width: 16px; height: 16px;border-radius: 50%;">
                                            <Check/>
                                        </el-icon>
                                        <el-icon v-if="!p.status"
                                                 style="background-color: #e80b0b;color: #ffffff;width: 16px; height: 16px;border-radius: 50%;">
                                            <Close/>
                                        </el-icon>
                                        <span>{{ p.name }}</span>
                                        <span style="flex: 1;word-break: break-all;">{{
                                                p.content
                                            }}</span>
                                    </div>
                                </div>
                            </div>
                        </el-tab-pane>
                        <el-tab-pane label="Request" name="second">
                            <pre>{{ item?.response?.request }}</pre>
                        </el-tab-pane>
                    </el-tabs>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import {getCurrentInstance, reactive, ref, watch} from "vue";
import dayjs from "dayjs";
import Params from "./Params.vue";
import FormData from "./FormData.vue";
import MyAce from "./MyAce.vue";

const props = defineProps({
    item: Object,
    storageOptions: {
        type: Array,
        required: false,
        default: []
    },
    // index: Number,
    sendRequest: Function,
    openSelPro: Function

})
const newOptions = ref()
console.log(props.storageOptions)
const {proxy} = getCurrentInstance()
let tab2Content = ref(0);
let responseHeight = ref(0)
const ruleFormRef = ref()
const box_layout = ref(true)
const state = ref(true)
const iconStr = ref("ArrowDown")
const sourceOptions = [
    {
        label: 'Response Text',
        value: 0
    },
    {
        label: 'Response Json',
        value: 1
    }
]
const assertOptions = [
    {
        label: '等于',
        value: 0
    },
    {
        label: '不等于',
        value: 1
    },
    {
        label: '存在',
        value: 2
    },
    {
        label: '不存在',
        value: 3
    },
    {
        label: 'IN',
        value: 4
    },
    {
        label: 'NOT IN',
        value: 5
    },
    {
        label: 'None',
        value: 6
    },
    {
        label: '非None',
        value: 7
    },

]
const dataOptions = [
    {
        value: 'str',
        label: 'str',
    },
    {
        value: 'int',
        label: 'int',
    },
    {
        value: 'float',
        label: 'float',
    },
    {
        value: 'bool',
        label: 'bool',
    },
]
const sourceOptionsEcho = (val) => {
    let text = ''
    try {
        sourceOptions.forEach((item) => {
            if (item.value === val) {
                //  console.log(val)
                //  console.log(item.label)
                text = item.label
                throw Error();
            }
        })
    } catch (err) {
    }
    return text
}
const assertOptionsEcho = (val) => {
    let text = ''
    try {
        assertOptions.forEach((item) => {
            if (item.value === val) {
                //  console.log(val)
                //  console.log(item.label)
                text = item.label
                throw Error();
            }
        })
    } catch (err) {
    }
    return text
}
const getConditionColor = (val) => {
    if (val) {
        return '#dcf5f3'
    } else {
        return '#f7e7e5'
    }
}
const postConditionCommand = (command) => {
    //  console.log(command.data)
    command.data.push({
        //后置操作类型
        type: command.item_drop.type,
        title: command.item_drop.title,
        icon: command.item_drop.icon,
        color: command.item_drop.color,
        //后置操作名称
        name: "",
        //后置操作元数据类型
        resMetaData: 1,
        //后置操作是否启用
        postConditionSwitch: 1,
        //后置操作提取表达式
        expression: "",
        expressionIndex: 0,
        // 后置操作断言
        assert: {
            //断言方式
            way: 0,
            //断言预期结果
            expected: "",
            expectedType: "str"
        },
        continueExtract: {
            is: 0,
            separator: "",
            index: 0
        },
    })
    //  console.log(command.data)
}
const getLabel = (val) => {
    let name
    switch (val) {
        case 0:
            name = '断言名称'
            break;
        case 1:
            name = '变量名称'
            break;
        default:
            name = ""
    }
    return name
}
let storageOptions = ref([])
const postConditionRules = reactive({
    name: [
        {required: true, message: '请输入名称！', trigger: 'blur'},
    ],
    config: [
        {required: true, message: '请选择环境！', trigger: 'blur'},
    ]
})
const dropdownOptions = [
    {
        type: 0,
        title: '断言',
        icon: 'Stamp',
        color: '#fc4040',
        divided: false
    },
    {
        type: 1,
        title: '提取变量',
        icon: 'DataLine',
        color: '#ca731b',
        divided: false
    },
    {
        type: 2,
        title: '数据库操作',
        icon: 'Coin',
        color: '#36ed38',
        divided: true
    },
    {
        type: 3,
        title: '更多选择，敬请期待',
        icon: 'List',
        color: '#42e6cb',
        divided: true
    }
]
const delPostcond = (data, index) => {
    data.splice(index, 1);
}
const statusTtype = val => {
    const s = val.toString();
    if (s.charAt(0) === '2') {
        return "success"
    } else if (s.charAt(0) === '3') {
        return "warning"
    } else if (s.charAt(0) === '4' || s.charAt(0) === '5') {
        return "danger"
    } else {
        return ""
    }
}
const dateFormat = (val, format = "YYYY-MM-DD HH:mm:ss") => {
    if (!isNaN(val)) {
        val = parseInt(val);
    }
    return dayjs(val).format(format);
};
const toStr = (obj) => {
    if (typeof obj === 'object') {
        return {
            text: JSON.stringify(obj, null, 2),
            type: 'json5'
        }
    } else if (typeof obj !== 'undefined') {
        console.log()
        try {
            return {
                text: JSON.stringify(JSON.parse(obj), null, 2),
                type: 'json5'
            }
        } catch (e) {
            try {
                return {
                    text: proxy.$HTMLFormat(obj),
                    type: 'html'
                }
            } catch (e) {
                return {
                    text: obj,
                    type: 'text'
                }
            }
        }
    } else return {
        text: "",
        type: 'text'
    }
}

const getParams = (item, key, val) => {
    item[key] = val
}
const handleCommand = (command) => {
    command.val["type"] = command.command
}
const typeItems = [
    "text",
    "json",
    "xml",
    "html",
    "javascript",
]

const composeValue = (it, val) => {
    return {
        command: it,
        val
    }
}
const changeBoxlayout = () => {
    box_layout.value = !box_layout.value
    if (box_layout.value) {
        iconStr.value = "ArrowDown";
    } else {
        iconStr.value = "ArrowRight";
    }
}
const resultDisplay = () => {
    state.value = !state.value
    if (state.value) {
        tab2Content.value -= responseHeight.value
    } else {
        tab2Content.value += responseHeight.value
    }

}
watch(() => props.storageOptions, (newValue, oldValue) => {
    console.log('DebugPanel', newValue);
    newOptions.value = newValue
}, {immediate: true, deep: true})
</script>

<style lang="less" scoped>
.path-div {
    margin-bottom: 10px;
    width: 100%;
    display: flex;

    :deep(.el-form-item__error ) {
        left: 115px;
    }

    .el-form-item {
        margin-bottom: 0;
    }

    .input-with-select {
        background-color: var(--el-fill-color-blank);
        // width: 100%;
    }

    .el-button {
        margin: 0 10px;
        width: 80px;
    }

    .el-select {
        width: 115px;
        background-color: #ffffff;

        :deep(.el-input__inner) {
            --el-input-placeholder-color: rgb(44 179 152);
            font-weight: bold;
        }


    }

    .el-dropdown {

        :deep(.el-button-group) {
            display: flex;

            .el-button:first-child {
                width: 80px;
            }
        }
    }
}

.body-box {
    height: calc(100% - 50px);
    // padding-bottom: 10px;
    box-sizing: border-box;

    .body-off {
        height: 30%;
        transition: height 0.5s ease-out;
        // background-color: red;
    }

    .body-on {
        height: calc(100% - 40px);
        transition: height 0.5s ease-out;
        // background-color: red;
    }

    #responseDiv {
        height: 70%;
    }
}

.body-box-row {
    height: calc(100% - 50px);
    // padding-bottom: 10px;
    box-sizing: border-box;
    display: flex;

    .body-off {
        width: 48%;
        margin-right: 10px;
        transition: width 0.5s ease-out;
        // background-color: red;
    }

    .body-on {
        width: calc(100% - 101px);
        transition: width 0.5s ease-out;
        // background-color: red;
    }

    #responseDiv {
        flex: 1;
        overflow: hidden;

        .response-Content {
            flex-direction: column;

            .ace-style {
                height: 100%;
            }

            .response-div {
                flex-direction: column;
            }

            .Condition-show {
                margin-top: 5px;
                padding-top: 5px;
                border-top: 1px solid #d7d7d7;
                width: 100%;
                max-height: 30%;
                overflow: auto;

                .condition-style {
                    margin: 0 0 5px;
                }
            }
        }
    }
}

.tab2 {
    display: flex;
    flex-direction: column;

    :deep(.el-tabs__header) {
        margin-bottom: 5px !important;
    }

    :deep(.el-tabs__content) {
        flex: 1;
    }

    .el-tab-pane {
        height: 100%;
    }
}

.tab3 {
    height: 100%;
    display: flex;
    flex-direction: column;

    :deep(.el-tabs__content) {
        flex: 1;
    }

    .el-dropdown {
        line-height: inherit;

        .el-dropdown-link {
            cursor: pointer;
            color: var(--el-color-primary);

        }
    }
}

.postcondition-box {
    .postcondition-add {
        display: flex;
        justify-content: center;
        align-items: center;
        margin: 30px 10px;

        :deep(.el-dropdown-menu__item) {
            width: 200px;
            box-sizing: border-box;
        }

        button {
            width: 200px;
        }

    }

    .title-type {
        width: 100px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        padding: 0 20px 0 5px;
        box-sizing: border-box;
        position: relative;

        &:after {
            content: "";
            position: absolute;
            width: 1px;
            height: 15px;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            background-color: var(--el-border-color);
        }
    }

    .icon-style {
        font-size: 20px;
        vertical-align: middle;
    }

    .content-style {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;

    }

    .p-content-style {
        display: flex;
        flex: 1;
        justify-content: flex-start;
        align-items: center;
        min-width: 0;
    }
}

#requestDiv {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    border: none;
    display: flex;
    flex-direction: column;

    :deep(.el-tabs__content) {
        padding: 8px;
        //width: 100%;
        flex: 1;

    }

    .el-tab-pane {
        height: 100%;
        width: 100%

    }

    .response-div {
        height: 100%;
        display: flex;
    }

    pre {
        width: 100%;
        height: 100%;
        overflow-x: hidden;
        overflow-y: auto;
        //word-wrap: break-word;
        //word-break: break-all;
        //white-space:pre-wrap;
    }

    .condition-style {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        padding: 3px 10px;
        margin: 0 0 5px 5px;
        border-radius: 5px;

        span {
            margin-left: 10px;
            color: #838383;
            font-size: 12px;
        }
    }
}

.btn-result {
    height: 40px;
    box-sizing: border-box;
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid #e7e7e7;

    :deep(.el-tag__content) {
        display: inline-flex;
        align-items: center;
    }

    .icon-off {
        transition: all .5s;
    }

    .icon-on {
        transform: rotate(-180deg);
        transition: all .5s;
    }

}

.response-Content {
    position: relative;
    height: calc(100% - 45px);
    box-sizing: border-box;
    margin-top: 5px;
    border: 1px solid #e6eefb;
    display: flex;

    .ace-style {
        flex: 1;
        width: 100%;
    }

    .Condition-show {
        width: 30%;
        overflow: auto;
    }

    .el-button {
        // display: none;
        position: absolute;
        bottom: 10px;
        right: 13px;
        z-index: 100;
        opacity: .7;

    }

    &:hover .el-button {
        display: block;
    }
}

.results-icon {
    width: 1.5em;
    height: 1.5em;
    margin: 0 5px 0 8px;
}
</style>