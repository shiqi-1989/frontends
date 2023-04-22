<template>
    <el-dialog v-model="show"
               align-center
               title="批量编辑"
               width="40%"
               @close="additemsClose"
    >
        <div class="addVisible">
            <div class="addItem" style="justify-content: flex-start">
                <el-radio-group v-model="radio1" size="small" style="flex-shrink: 0;" @change="getKeyValue">
                    <el-radio-button label="1">Json格式</el-radio-button>
                    <el-radio-button label=":">冒号模式</el-radio-button>
                    <el-radio-button :label="a">制表符模式</el-radio-button>
                    <el-radio-button label=" ">空格模式</el-radio-button>
                </el-radio-group>
                <pre
                        style="margin-left: 20px;color: #999999;overflow: hidden;white-space: nowrap;text-overflow: ellipsis;pointer-events: none;">（注：多条数据以换行分割）</pre>
            </div>
            <el-input v-model="textareavalue"
                      :placeholder="placeholderText"
                      resize="none"
                      type="textarea"
            />
        </div>
        <template #footer>
      <span class="dialog-footer">
        <el-button @click="additemsClose">取消</el-button>
        <el-button type="primary" @click="additems"
        >确定</el-button>
      </span>
        </template>
    </el-dialog>
</template>

<script setup>
import {onMounted, ref} from "vue";
import {ElMessage} from "element-plus";

const props = defineProps({
    batchData: Object,
})
const emits = defineEmits(["getData",])
const a = '\t'
const radio1 = ref("1")
const placeholderText = ref("")
const textareavalue = ref("")
const additemsClose = () => {
    textareavalue.value = ""
    radio1.value = "1";
    show.value = false;
}
const show = ref(false)
const getKeyValue = (label) => {
    console.log(label)
    let newObj
    let text
    if (label === '1') {
        let d_Obj = {}
        props.batchData.forEach((item) => {
            if (item.name !== "") {
                d_Obj[item.name] = item.value
            }
        })
        if (Object.keys(d_Obj).length > 0) {
            newObj = JSON.stringify(d_Obj, null, 2)
        }
        text = '{"key": "value"}'
    } else {
        newObj = props.batchData.map(item => {
            if (item.name !== "") {
                return (`${item.name}${label}${item.value}`)
            }
        }).join('\n')
        text = `key${label}value`
        console.log(text)
    }
    textareavalue.value = newObj
    placeholderText.value = text
}
const additems = () => {
    const data = formattingData(textareavalue.value)
    console.log(data)
    emits('getData', data);
    additemsClose()
    //  console.log(editableTabs.value)
}

const formattingData = (data) => {
    let obj_list = []
    if (data) {
        if (radio1.value === "1") {
            // data = data.trim().replace(/"/g, '\\"').replace(/'/g, '"');
            // console.log(data)
            try {
                const Json_data = JSON.parse(data);
                for (var key in Json_data) {
                    obj_list.push({
                        name: key,
                        value: Json_data[key],
                        selected: true
                    })
                }
            } catch {
                ElMessage.error("Json格式异常！");
                throw new Error("Json格式异常！");
            }
        } else {
            obj_list = data.trim().split(/\n/).map(item => ({
                name: item.split(radio1.value)[0],
                value: item.split(radio1.value).slice(1,).join(radio1.value).trim(),
                selected: true
            }))
        }
    }
    return obj_list
}
onMounted(() => {
})

defineExpose({
    show,
    getKeyValue
})
</script>

<style lang="less" scoped>
.addVisible {
    height: 30vh;
    display: flex;
    flex-direction: column;

    .addItem {
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-wrap: nowrap;

    }

    .el-textarea {
        flex: 1;
        margin-top: 10px;
        display: flex;
    }
}
</style>