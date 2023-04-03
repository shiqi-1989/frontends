<template>
    <el-select v-model="value"
               clearable
               filterable
               placeholder="请选择函数"
               @change="changeFun"
               style="width: 100%;margin-bottom: 5px;">
        <el-option
            v-for="item in funList"
            :key="item.index"
            :label="item"
            :value="item"
        >
        </el-option>
    </el-select>
    <el-table
        :data="funTable"
        border
        height="calc(100%)"
        style="margin-bottom: 5px;"

    >
        <el-table-column label="参数名"
                         min-width="30%">
            <template #default="scope">
                <el-input v-model="scope.row.name" clearable spellcheck="false"/>
            </template>
        </el-table-column>
        <el-table-column label="参数值"
                         min-width="70%">
            <template #default="scope">
                <el-date-picker v-if="scope.row.type==='Time'"
                                v-model="scope.row.value"
                                type="datetime"
                                format="YYYY/MM/DD hh:mm:ss"
                                value-format="YYYY-MM-DD hh:mm:ss"
                                style="width: 100%;"
                                placeholder="Select date and time"
                />
                <el-select v-else-if="scope.row.type==='Select'" v-model="scope.row.value" class="m-2"
                           placeholder="Select">
                    <el-option
                        v-for="item in selectOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    />
                </el-select>
                <el-input v-else v-model="scope.row.value" clearable spellcheck="false"
                          :placeholder="scope.row.type"/>
            </template>
        </el-table-column>
    </el-table>
    <el-input
        v-model="funExpression"
        placeholder="表达式"
        style="margin-bottom: 5px;"
    >
        <template #prepend>
            表达式
        </template>
        <template #append>
            <el-button @click="generatedExp">生成</el-button>
        </template>
    </el-input>
    <span>函数结果</span>
    <el-input
        class="textarea"
        v-model="funResult"
        show-word-limit
        :rows="6"
        type="textarea"
    />
</template>

<script setup>
//函数助手
import {ref} from "vue";
import apis from "../../api/api.js";

const value = ref("")
const selectOptions = [
    {
        label: "s",
        value: "s"
    },
    {
        label: "ms",
        value: "ms"
    }
]
apis.funcList().then(({data}) => {
    console.log(data.data)
    funList.value = data.data
})

const funExpression = ref("")
const funList = ref([])
const funTable = ref([])
const funResult = ref("")
const changeFun = (val) => {
    console.log(val)
    funExpression.value = ""
    funResult.value = ""
    funTable.value = []
    apis.funcInfo({
        func: val
    }).then(({data}) => {
        funTable.value = data.data;
    })
}
//  生成表达式和结果
const generatedExp = () => {
    console.log(funTable.value)
    funResult.value = ""
    // let params = ""
    let params = []
    // funTable.value.forEach(item => {
    //     if (item.type === 'String') {
    //         params ? (params += item.value ? `, "${item.value}"` : "") : (params += item.value ? `"${item.value}"` : "");
    //
    //     } else {
    //         params ? params += `, ${item.value}` : params += `${item.value}`
    //     }
    // })
    funTable.value.forEach(item => {
        if (item?.type === 'String' || item.type === 'Time' || item?.type === 'Select') {
            params.push(`"${item?.value}"`)
            // params ? (params += item.value ? `, "${item.value}"` : "") : (params += item.value ? `"${item.value}"` : "");

        } else {
            params.push(`${item?.value}`)
            // params ? params += `, ${item.value}` : params += `${item.value}`
        }
    })
    console.log(params)
    console.log(params.join(", "))
    if (value.value) {
        funExpression.value = `\$\{${value.value}(${params})\}`
        apis.funcResult({
            func: `${value.value}(${params})`,
        }).then(({data}) => {
            console.log(data)
            funResult.value = data.data.toString()
        })
    } else {
        funExpression.value = "请选择函数！"
    }
}
//函数助手
</script>

<style lang="less" scoped>
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

.textarea {
    margin-bottom: 15px;

    :deep(.el-textarea__inner) {
        overflow-x: hidden;
    }
}
</style>