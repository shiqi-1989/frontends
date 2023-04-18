<template>
    <el-table
            :cell-class-name="rowClassName"
            :data="formData"
            border
            height="calc(100%)"
            @cell-click="(row, column)=>cellClick(row, column,formData)"
    >
        <el-table-column label="参数名"
                         min-width="25%">
            <template #default="scope">
                <el-input v-model="scope.row.name" clearable
                          spellcheck="false"/>
            </template>
        </el-table-column>
        <el-table-column label="类型"
                         min-width="20%">
            <template #default="scope">
                <el-select v-model="scope.row.type" placeholder="Select">
                    <el-option
                            v-for="item in formOptions"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                    />
                </el-select>
            </template>
        </el-table-column>
        <el-table-column label="参数值"
                         min-width="55%">
            <template #default="scope">
                <el-upload v-if="scope.row.type ==='file'"
                           v-model:file-list="scope.row.fileList"
                           :action="action"
                           :before-remove="beforeRemove"
                           :before-upload="beforeUpload"
                           :data="fileName"
                           :limit="1"
                           :on-remove="(uploadFile, uploadFiles)=>successRemove(uploadFile, uploadFiles)"
                           :on-success="(uploadFile, uploadFiles)=>successUpload(uploadFile, uploadFiles)"
                           drag
                           multiple
                >
                    <div class="el-upload__text">
                        Drop file here or <em>click to upload</em>
                    </div>
                    <template #tip>
                    </template>
                </el-upload>
                <el-input v-else v-model="scope.row.value" clearable
                          spellcheck="false"/>
            </template>
        </el-table-column>
        <el-table-column label="开关" width="60">
            <template #default="scope">
                <el-switch v-model="scope.row.selected" size="small"
                           style="margin-left: 12px;"/>
            </template>
        </el-table-column>
        <el-table-column style="text-align: center" width="50">
            <template #header>
                <el-button icon="Plus" link size="small" style="width: 100%"
                           @click="addRowType(formData)"/>
            </template>
            <template #default="scope">
                <el-button icon="Close" link size="small"
                           style="width: 100%"
                           @click.prevent="deleteRow(formData,scope.$index)"/>
            </template>
        </el-table-column>
    </el-table>

</template>

<script setup>
import {ref} from "vue";
import apis from "../../api/api.js";

const props = defineProps({
    formData: Object,
    currentId: Number,
    saveRequest: Function
})
const emits = defineEmits(["getParams",])
const formOptions = [
    {
        value: 'string',
        label: 'string',
    },
    {
        value: 'integer',
        label: 'integer',
    },
    {
        value: 'number',
        label: 'number',
    },
    {
        value: 'object',
        label: 'object',
    },
    {
        value: 'boolean',
        label: 'boolean',
    },
    {
        value: 'file',
        label: 'file',
    },
]

const size = ref("large")
const rowClassName = ({row, column, rowIndex, columnIndex}) => {
    row.index = rowIndex
    column.index = columnIndex
}
const cellClick = (row, column, data) => {
    if (row.index === data.length - 1 && column.label) {
        addRowType(data)
    }
}
const addRowType = (val) => {
    val.push({
        name: '',
        value: null,
        fileList: [],
        type: 'string',
        selected: true
    })
}

const deleteRow = (val, index) => {
    val.splice(index, 1)
}

// 文件列表更新
const action = apis.uploadFile()
const fileName = ref({
    name: "",
    api: null
})
const beforeRemove = (uploadFile, uploadFiles) => {
    //  console.log(uploadFile)
    apis.delFile(uploadFile.response.data.id)
}

const beforeUpload = (uploadFile, uploadFiles) => {
    fileName.value.name = uploadFile.name
    fileName.value.api = props.currentId
}

const successRemove = (uploadFile, uploadFiles) => {
    props.saveRequest(obj)
}
const successUpload = (uploadFile, uploadFiles) => {
    props.saveRequest(obj)
}

// 上传文件这里，保存钱走本地读取文件  上传；保存后将文件上传到django服务，方便用例直接从服务获取图片，防止上传接口失败
</script>

<style lang="less" scoped>
.addItem {
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: nowrap;

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
</style>