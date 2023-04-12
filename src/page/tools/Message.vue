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
                                    <el-dropdown-item @click="editIcon(item)">
                                        编辑
                                    </el-dropdown-item>
                                    <el-dropdown-item @click="delIcon(item.id, index)">
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
                <el-input
                        v-model="item.msg"
                        :readonly="true"
                        :rows="8"
                        type="textarea"
                />
                <!--<div style="padding: 10px;border: 1px solid #dcdfe6;border-radius: 4px;">-->
                <!--    <div :id="index" v-html="item.msg" style="height: 150px;border-radius: 4px;overflow-y: auto;"/>-->
                <!--</div>-->

                <el-button class="clear" size="small" type="danger" icon="Delete" circle @click="clear(item)"/>
            </el-card>
        </el-col>
    </el-row>
</template>

<script setup>
import {onMounted, ref} from 'vue'
import apis from '../../../api/api'


const phone1 = ref("")
const textarea1 = ref("")

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
        hosts: item.config[env]
    }).then(({data}) => {
        if (item.msg) {
            item.msg += `\n${data.data.msg}`
        } else {
            item.msg = data.data.msg
        }
        // console.log(`${index}`)
        // const message = document.getElementById(index);
        // message.scrollTop = message.scrollHeight;
    })
}

const clear = (item) => {
    item.msg = ""
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