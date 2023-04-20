<template>
    <div v-else style="height: 100%;width: 100%;">
        <DebugPanel :open-sel-pro="openSelPro" :send-request="submitForm" :item="item"
                    :index="index"/>
    </div>
</template>

<script setup>
import DebugPanel from "./DebugPanel.vue"
import AddApiMode from "../../components/AddApiMode.vue";
import {nextTick, ref} from "vue";

const props = defineProps({
    openSelPro: Function,
    submitForm: Function
})
let tabIndex = 0
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
</script>

<style lang="less" scoped>

</style>