<template>
    <el-row :gutter="20">
        <el-col v-for="(item,index) in messageData" :span="6">
            <el-card class="box-card">
                <template #header>
                    <div class="card-header">
                        <el-dropdown class="edit-icon" placement="bottom-end">
                                <span class="el-dropdown-link">
                                  <el-icon>
                                    <MoreFilled/>
                                  </el-icon>
                                </span>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item @click="editConfig(item)">
                                        编辑
                                    </el-dropdown-item>
                                    <el-dropdown-item @click="delConfig(index, item.id)">
                                        删除
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                        <el-avatar v-if="item.src"
                                   :src="item.src"
                        />
                        <el-avatar v-else src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"/>
                        <h3>{{ JSON.stringify(item.config) === '{}' ? `${item.name} (未配置)` : item.name }}</h3>
                    </div>
                </template>
                <el-input
                        style="margin-bottom: 5px;"
                        v-model="item.phone"
                        placeholder='输入手机号'
                        prefix-icon="PhoneFilled"
                >
                    <template #append>
                        <el-dropdown split-button type="primary" style="width: 52px"
                                     @click="messageSend('alpha', item, index)">测试
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item @click="messageSend('release',item, index)">正式
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                </el-input>
                <!--<el-input-->
                <!--        v-model="item.msg"-->
                <!--        :readonly="true"-->
                <!--        :rows="8"-->
                <!--        type="textarea"-->
                <!--/>-->
                <div style="padding: 10px;border: 1px solid #dcdfe6;border-radius: 4px;">
                    <div :id="index" v-html="item.msg" style="height: 150px;border-radius: 4px;overflow-y: auto;"/>
                </div>

                <el-button class="clear" size="small" type="danger" icon="Delete" circle @click="clear(item)"/>
            </el-card>
        </el-col>
    </el-row>

    <el-row>
        <el-col :span="24">
            <el-button type="success" style="width: 100%;" icon="Plus" @click="insertEvent"/>
        </el-col>
    </el-row>
    <!--    编辑/新增弹窗-->
    <el-dialog
            v-model="table.showEdit"
            :before-close="handleClose"
            :title="table.selectRow ? '编辑配置' : '新增配置'"
            width="45%"
    >
        <el-form
                ref="ruleFormRef"
                :model="table.formData"
                :rules="table.formRules"
                label-position="right"
                label-width="80px"
        >
            <el-form-item label="名称" prop="name">
                <el-input v-model="table.formData.name" maxlength="30"/>
            </el-form-item>
            <el-form-item label="logo" prop="src">
                <el-input v-model="table.formData.src" type="text"/>
            </el-form-item>
            <el-form-item label="配置" prop="config">
                <!--<el-input v-model="table.formData.config" type="textarea"/>-->
                <v-ace-editor
                        v-model:value="table.formData.config"
                        :lang="aceConfig.lang"
                        :options="aceConfig.options"
                        :readonly="aceConfig.readOnly"
                        :theme="aceConfig.theme"
                        style="height: 200px;width:100%; border-radius:4px;"
                        wrap>
                </v-ace-editor>
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
import {onMounted, ref, nextTick, reactive} from 'vue'
import apis from '../../../api/api'
import {VAceEditor} from 'vue3-ace-editor';
import 'ace-builds/src-noconflict/ext-language_tools.js'
import "ace-builds/src-noconflict/theme-sqlserver.js"
import "ace-builds/src-noconflict/mode-json5.js"
import {ElMessage} from "element-plus";



const aceConfig = reactive({
    lang: 'json5', //解析json
    theme: 'sqlserver', //主题
    readOnly: false, //是否只读
    minLines: 1,
    maxLines: 20,
    options: {
        autoScrollEditorIntoView: true,
        enableLiveAutocompletion: true,
        enableBasicAutocompletion: true,
        enableSnippets: true,
        tabSize: 2,
        useWorker: true,
        showPrintMargin: false,
        showLineNumbers: false,
        highlightActiveLine: true,
        fontSize: 14
    }
});
const ruleFormRef = ref()
const configStr = ref("")
const params = (val) => {
    let config = {}
    try {
        config = JSON.parse(val.config)
    } catch (e) {
    }
    return {
        name: val.name,
        src: val.src,
        config: config
    }
}
const table = reactive({
    selectRow: null,
    showEdit: false,
    formData: {
        name: "",
        src: "",
        config: ""
    },
    formRules: {
        name: [
            {required: true, message: '请输入名称', trigger: 'blur'},
        ],
        src: [
            {required: false},
        ],
        config: [
            {required: false},
        ]
    }
})
const resetForm = (formEl) => {
    if (!formEl) return
    formEl.value.resetFields()
}
const handleClose = () => {
    table.showEdit = false;
    resetForm(ruleFormRef)
    console.log(ruleFormRef.value)
}

const messageData = ref([])
const messageTools = () => {
    apis.messageToolsList()
            .then(({data}) => {
                console.log(data.data)
                messageData.value = data.data;
            })
}
onMounted(() => {
    messageTools()
})
const messageSend = (env, item, index) => {
    apis.messageSend({
        env: env,
        phone: item.phone,
        config: item.config[env]
    }).then(({data}) => {
        if (item.msg) {
            item.msg += `<br />${data.data.msg}`
        } else {
            item.msg = data.data.msg
        }
        nextTick(() => {
            // console.log(`${index}`)
            const message = document.getElementById(index);
            message.scrollTop = message.scrollHeight;
        })


    })
}
const insertEvent = () => {
    table.selectRow = null
    table.showEdit = true
    table.formData = {
        name: "",
        src: "",
        config: ""
    }
}
const editConfig = (item) => {
    table.showEdit = true
    table.selectRow = item
    table.formData = {
        name: item.name,
        src: item.src,
        config: JSON.stringify(item.config, null, 2)
    }
}
const clear = (item) => {
    item.msg = ""
}
const editMessage = (item, params) => {
    apis.messageEdit(item.id, params)
            .then(({data}) => {
                handleClose()
                Object.assign(item, data.data);
                ElMessage.success("更新成功！");
            })
}
const addMessage = (params) => {
    apis.messageAdd(params)
            .then(({data}) => {
                handleClose()
                messageData.value.push(data.data);
                ElMessage.success("新增成功！");
            })
}
const delConfig = (index, id)=>{
    apis.messageDel(id)
            .then(()=>{
                messageData.value.splice(index, 1)
                ElMessage.success("删除成功！")
            })
}
const submitForm = (formEl) => {
    if (!formEl) return
    formEl.validate((valid) => {
        if (valid) {
            if (table.selectRow) {
                // console.log(table.formData)
                editMessage(table.selectRow, params(table.formData));
            } else {
                // console.log(params(table.formData))
                addMessage(params(table.formData));
            }

        } else {
            return false
        }
    })
}


</script>

<style lang="less" scoped>

.el-col {
    margin-top: 20px;
}

.el-card {
    position: relative;
    //--el-card-padding: 10px;
    .clear {
        visibility: hidden;
        position: absolute;
        cursor: pointer;
        bottom: 25px;
        right: 28px;
    }

    .el-card__body:hover .clear {
        visibility: visible;
    }
}

:deep(.el-card__header) {
    background-color: #149898;

    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: relative;

        h3 {
            color: #fff;
        }

        .edit-icon {
            visibility: hidden;
            position: absolute;
            top: -16px;
            right: -18px;

            .el-dropdown-link {
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                padding: 5px;
                cursor: pointer;
                color: var(--el-color-primary);
            }

            .el-dropdown-link:hover {
                background-color: #e7e4e4;
            }
        }
    }

    &:hover {
        .edit-icon {
            visibility: visible;
        }
    }


}
</style>