<template>
    <div class="search-box">
        <el-input
                v-model="table.conditions"
                class="input-class"
                clearable
                placeholder="快捷搜索"
                size="large"
                suffix-icon="Search"
                @input="searchMethod"
        />
    </div>
    <div class="row2">
        <!--快捷方式列表-->
        <div v-for="(item, index) in table.searchList" v-show="table.searchList!==null" class="tag-box">
            <el-dropdown class="edit-icon" placement="bottom-end">
                                <span class="el-dropdown-link">
                                  <el-icon>
                                    <MoreFilled/>
                                  </el-icon>
                                </span>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item @click="editIcon(item, index)">
                            编辑
                        </el-dropdown-item>
                        <el-dropdown-item @click="delIcon(item.id, index)">
                            删除
                        </el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
            <div :style="{backgroundColor: item.color}" class="tag-box-icon" @click="open(item.link)">
                {{ item.title[0] ? item.title[0].toUpperCase() : '' }}
            </div>
            <span :style="{color: item.color}" class="tag-box-text">
                {{ item.title }}</span>
            <div :style="{background: `-webkit-linear-gradient(left, #fff -4%, ${item.color} 50%, #fff 100%)`}"
                 class="line-bottom"></div>
        </div>
        <div v-for="(item, index) in table.linkData" v-show="table.searchList === null" class="tag-box">
            <el-dropdown class="edit-icon" placement="bottom-end">
                                <span class="el-dropdown-link">
                                  <el-icon>
                                    <MoreFilled/>
                                  </el-icon>
                                </span>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item @click="editIcon(item)">
                            编辑
                        </el-dropdown-item>
                        <el-dropdown-item @click="delIcon(item.id, index)">
                            删除
                        </el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
            <div :style="{backgroundColor: item.color}" class="tag-box-icon" @click="open(item.link)">
                {{ item.title[0] ? item.title[0].toUpperCase() : '' }}
            </div>
            <span :style="{color: item.color}" class="tag-box-text">
                {{ item.title }}</span>
            <div :style="{background: `-webkit-linear-gradient(left, #fff -4%, ${item.color} 50%, #fff 100%)`}"
                 class="line-bottom"></div>
        </div>
        <!--添加按钮-->
        <div class="tag-box" @click="showWindow">
            <div class="tag-box-icon">
                <el-icon :size="30" color="#409EFC">
                    <Plus/>
                </el-icon>
            </div>
            <h4 class="tag-box-text">
                添加</h4>
        </div>
    </div>
    <!--添加快捷方式弹窗-->
    <el-dialog v-model="table.showEdit"
               :title="table.selectRow? '编辑快捷方式':'新增快捷方式'"
               destroy-on-close
               width="35%"
               @close="handleClose"
    >
        <el-form
                ref="ruleFormRef"
                :model="table.formData"
                :rules="table.formRules"
                label-position="right"
                label-width="100px"
                style="margin-right: 20px;"
        >
            <el-form-item label="名称" prop="title">
                <el-input v-model="table.formData.title" clearable maxlength="30"/>
            </el-form-item>
            <el-form-item label="链接" prop="link">
                <el-input v-model="table.formData.link" clearable/>
            </el-form-item>
            <el-form-item label="图标背景色" prop="color">
                <el-color-picker v-model="table.formData.color" :predefine="preDefineColors" show-alpha/>
            </el-form-item>
            <el-form-item label="私人/公共" prop="public">
                <el-radio-group v-model="table.formData.personal">
                    <el-radio label="1">私人</el-radio>
                    <el-radio label="2">公共</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item v-if="creator" label="创建者" prop="">
                {{ creator }}
            </el-form-item>
        </el-form>
        <template #footer>
        <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="submitForm(ruleFormRef)">确认</el-button>
      </span>
        </template>
    </el-dialog>
</template>

<script setup>

import {onMounted, reactive, ref, watch} from 'vue'
import apis from '../../../api/api'
import {ElMessage} from 'element-plus'

const userInfo = JSON.parse(localStorage.getItem('userInfo'));
const preDefineColors = ref([
    '#ff4500',
    '#ff8c00',
    '#ccbf79',
    '#6ba86b',
    '#00ced1',
    '#1e90ff',
    '#c71585',
    'rgba(255, 69, 0, 0.68)',
    'rgb(255, 120, 0)',
    'hsv(51, 100, 98)',
    'hsva(120, 40, 94, 0.5)',
    'hsl(181, 100%, 37%)',
    'hsla(209, 100%, 56%, 0.73)',
    '#c7158577',
])

const ruleFormRef = ref()
const table = reactive({
    showEdit: false,
    selectRow: null,
    conditions: "",
    formData: {
        title: "",
        link: "",
        color: "rgba(255, 69, 0, 0.68)",
        personal: "2"
    },
    formRules: {
        title: [
            {required: true, message: '请输入名称', trigger: 'blur'},
        ],
        link: [
            {required: true, message: "请输入链接", trigger: 'blur'},
        ],
    },
    linkData: [],
    searchList: null,
    searchIndex: null
})
// 添加按钮
const showWindow = () => {
    table.selectRow = null;
    table.formData = {
        title: "",
        link: "",
        color: "rgba(255, 69, 0, 0.68)",
        personal: "2"
    }
    creator.value = null
    table.showEdit = true
}

const handleClose = () => {
    table.showEdit = false;
    resetForm(ruleFormRef)
}

const tagList = () => {
    apis.tagList()
            .then(({data}) => {
                table.linkData = data.data
            })

}
const isUser = (name) => name === userInfo.username;
const editTag = (row) => {
    apis.editTag(row.id, table.formData)
            .then(({data}) => {
                if (data.code === 200) {
                    console.log(table.searchIndex)
                    if (table.searchIndex !== null && (row.title !== table.formData.title)) {
                        table.searchList.splice(table.searchIndex, 1)
                    }
                    handleClose()
                    console.log(table)
                    Object.assign(row, data.data);
                    ElMessage.success("保存成功！");
                }
            })
}
const addTag = () => {
    apis.addTag(table.formData)
            .then(({data}) => {
                ElMessage.success(data.detail)
                table.linkData.unshift(data.data)
                handleClose()
            })
            .catch((err) => {
                ElMessage.error(err)
            })

}
//重置表单
const resetForm = (formEl) => {
    if (!formEl) return
    formEl.value.resetFields()
}
const creator = ref()
const editIcon = (row, index = null) => {
    table.searchIndex = index
    table.showEdit = true
    table.selectRow = row
    table.formData = {
        title: row.title,
        link: row.link,
        color: row.color,
        personal: row.personal
    }
    creator.value = row.creator
}
const delIcon = (id, index) => {
    apis.delTag(id)
            .then(() => {
                if (table.searchList) {
                    table.searchList.splice(index, 1)
                }
                table.linkData.splice(index, 1)
                ElMessage.success("移除成功！")
            })
            .catch((err) => {
                ElMessage.error(err)
            })
}
const submitForm = (formEl) => {
    if (!formEl) return
    formEl.validate((valid) => {
        if (valid) {
            if (table.selectRow) {
                editTag(table.selectRow);
            } else {
                addTag();
            }
        } else {
            return false
        }
    })
}


const searchMethod = (query) => {
    setTimeout(() => {
        console.log(query)

        if (query !== "") {
            table.searchList = table.linkData.filter((item) => {
                return item.title.toLowerCase().includes(query.toLowerCase())
            })
            console.log(table.searchList.length)
        } else {
            console.log(table)
            table.searchList = null
        }
    }, 300)
}
const searchMethod2 = (query) => {
    if (!query) {
        table.searchList = table.linkData
    }

}
const open = (link) => {
    setTimeout(function () {
        const win = window.open("", "_blank");
        win.location = link
    });
}

onMounted(() => {
    tagList()
})

</script>


<style lang="less" scoped>

.search-box {
    float: top;
    width: 100%;
    display: flex;
    justify-content: center;

    .input-class {
        --el-border-radius-base: 30px;
        --el-component-size-large: 60px;
        font-size: 22px;
        border-radius: var(--el-border-radius-base);
        box-shadow: 0 1px 10px 3px rgb(86 160 199 / 62%);
        position: fixed;
        top: 80px;
        width: 50%;
        z-index: 1;

        :deep(.el-input__wrapper) {
            padding: 1px 25px;
        }

        :deep(.el-input__clear) {
            order: -1;
        }

        :deep(.el-input__icon) {
            font-size: 35px;
        }
    }
}

.row2 {
    margin-top: 90px;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
}

.tag-box {
    cursor: pointer;
    display: flex;
    width: 180px;
    height: 180px;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-radius: 20px;
    position: relative;


    .edit-icon {
        visibility: hidden;
        position: absolute;
        top: 4px;
        right: 4px;

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

    .tag-box-icon {
        height: 90px;
        width: 90px;
        //border-radius: 50%;
        border-radius: 20px;
        background-color: #adabab;
        font-size: 40px;
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .tag-box-text {
        font-size: 14px;
        color: #5b5b5b;
        width: 100px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        text-align: center;
        margin-top: 16px;
        padding: 0;
    }

    .line-bottom {
        position: absolute;
        bottom: 0;
        width: 0;
        transition: width 0.3s;
        height: 1px;
        background: -webkit-linear-gradient(left, #fff -4%, #2473fb 50%, #fff 100%)
    }

    &:hover {
        .edit-icon {
            visibility: visible;
        }

        .line-bottom {
            width: 70%;
        }
    }
}

.search-tag-box {
    border-radius: 25px;
}

@media screen and (max-width: 1920px) {

}

</style>