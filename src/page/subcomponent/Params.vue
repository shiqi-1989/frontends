<template>
    <el-table
            :cell-class-name="rowClassName"
            :data="paramData"
            border
            height="calc(100%)"
            @cell-click="(row, column)=>cellClick(row, column, 0,paramData)"

    >
        <el-table-column label="参数名"
                         min-width="30%">
            <template #default="scope">
                <el-select v-if="isHeaders" v-model="scope.row.name" allow-create clearable
                           filterable
                           placeholder="参数名" remote>
                    <el-option
                            v-for="item in headersOptions"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                    />
                </el-select>
                <el-input v-else v-model="scope.row.name" clearable spellcheck="false"/>
            </template>
        </el-table-column>
        <el-table-column label="参数值"
                         min-width="70%">
            <template #default="scope">
                <el-input v-model="scope.row.value" clearable spellcheck="false"/>
            </template>
        </el-table-column>
        <el-table-column label="开关" width="60">
            <template #default="scope">
                <el-switch v-model="scope.row.selected" size="small"
                           style="margin-left: 12px;"/>
            </template>
        </el-table-column>
        <el-table-column style="text-align: center" width="45">
            <template #header>
                <!--                        <el-button icon="Plus" link size="small" style="width: 100%"-->
                <!--                                   @click="addRow(editableTabs[index].queryData)"/>-->
                <el-dropdown class="addItem">
                                                    <span class="el-dropdown-link addItem">
                                                      <el-icon :size="size"><MoreFilled/></el-icon>
                                                    </span>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item icon="Plus"
                                              @click="addRow(paramData)">
                                单行
                            </el-dropdown-item>
                            <el-dropdown-item
                                    icon="Document"
                                    @click="batchAdd">
                                批量
                            </el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </template>
            <template #default="scope">
                <el-button icon="Close" link size="small" style="width: 100%"
                           @click.prevent="deleteRow(paramData,scope.$index)"/>
            </template>
        </el-table-column>
    </el-table>
    <BatchAdd ref="batchAddRef" :batch-data="paramData" @getData="getData"></BatchAdd>


</template>

<script setup>
import BatchAdd from "./BatchAdd.vue"
import {ref} from "vue";

const props = defineProps({
    paramData: Object,
    isHeaders: Boolean
})
const emits = defineEmits(["getParams",])
const batchAddRef = ref(null)
const size = ref("large")
const headersOptions = [
    {
        value: 'Accept',
        label: 'Accept',
    },
    {
        value: 'Accept-charset',
        label: 'Accept-charset',
    },
    {
        value: 'Accept-Encoding',
        label: 'Accept-Encoding',
    },
    {
        value: 'Cookie',
        label: 'Cookie',
    },
    {
        value: 'Content-Length',
        label: 'Content-Length',
    },
    {
        value: 'Content-Type',
        label: 'Content-Type',
    },
    {
        value: 'Connection',
        label: 'Connection',
    },
    {
        value: 'Date',
        label: 'Date',
    },
    {
        value: 'Referer',
        label: 'Referer',
    },
    {
        value: 'User-Agent',
        label: 'User-Agent',
    },
    {
        value: 'Host',
        label: 'Host',
    },
]

const rowClassName = ({row, column, rowIndex, columnIndex}) => {
    row.index = rowIndex
    column.index = columnIndex
}
const cellClick = (row, column, num, data) => {
    if (row.index === data.length - 1 && column.label) {
        if (num === 2) {
            addRowType(data)
        } else {
            addRow(data)
        }
    }
}
const addRow = (val) => {
    val.push({
        name: '',
        value: null,
        selected: true
    })
}

const deleteRow = (val, index) => {
    val.splice(index, 1)
}
const batchAdd = () => {
    batchAddRef.value.show = true;
    batchAddRef.value.getKeyValue('1');
}

const getData = (val) => {
    console.log(val)
    emits('getParams', val);
}
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