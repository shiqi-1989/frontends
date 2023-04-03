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
                <!--<el-scrollbar v-else>-->
                <div v-else class="infinite-list-wrapper" style="overflow: auto;">
                    <ul v-infinite-scroll="loadApis" :infinite-scroll-disabled="apiDisabled">
                        <li v-for="(item, index) in historyData" :key="index" :class="{active:item.id === currentId}"
                            :tabIndex="index">
                            <span style="overflow: hidden;white-space: nowrap;text-overflow: ellipsis;flex: 1;"
                                  @click="clickHistory(item.id)">
                                <span
                                        :style="{color: $methodColor(item.method),fontWeight: 'bold',marginRight: '10px'}">
                                    {{ item.method }}
                                </span>
                                <!--<a>{{ item.path }}</a>-->
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
                <!--</el-scrollbar>-->
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
                    <el-tooltip content="cURL导入" placement="top" effect="customized">
                        <el-button circle icon="Document" color="#1bc014b0"
                                   @click="importApi"></el-button>
                    </el-tooltip>
                    <el-tooltip content="函数助手" placement="top" effect="customized">
                        <el-button circle icon="Notebook" color="#1bc014b0"
                                   @click="dialogFun=true"></el-button>
                    </el-tooltip>
                    <el-button circle icon="Refresh" style="margin: 0  5px 0 12px" type="primary"
                               @click="configList"></el-button>
                    <el-select v-model="apiEnv" clearable placeholder="请选择环境" @change="selectConfig">
                        <el-option
                                v-for="item in configurationOptions"
                                :key="item.id"
                                :label="item.title"
                                :value="item.id"
                        />
                    </el-select>
                    <el-button icon="Operation" style="border-radius: 0 4px 4px 0;"
                               @click="openEnv"></el-button>
                </div>
                <el-tabs
                        v-model="editableTabsValue"
                        class="api-tabs"
                        editable
                        type="card"
                        @tab-remove="handleTabsDel"
                        @tab-add="handleTabsAdd"
                        @tab-change="tabChange"
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
                            <el-tooltip :content="item.title|| '新接口'" effect="light" placement="top">
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
                            <!--方法 路径 区域-->
                            <div class="path-div">
                                <el-form ref="ruleFormRef" :model="item" style="width: 100%;">
                                    <el-form-item
                                            :rules=" {required: true, message: '如未配置环境请输入含 http / https 的完整 URL', trigger: 'blur'}"
                                            prop="url">
                                        <el-input
                                                v-model="item.url"
                                                :size="size"
                                                autocomplete="off"
                                                class="input-with-select"
                                                clearable
                                                placeholder='如未配置环境请输入含 http / https 的完整 URL'
                                                spellcheck="false"
                                        >
                                            <template #prepend>
                                                <el-select v-model="item.method"
                                                           :size="size"
                                                           :style="{'--el-text-color-regular': $methodColor(item.method)}"
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
                                <el-button :size="size" type="primary"
                                           @click="submitForm(ruleFormRef, index, item, 1)">发送
                                </el-button>
                                <el-button :size="size" type="success"
                                           @click="submitForm(ruleFormRef, index, item, 2)">保存
                                </el-button>
                            </div>
                            <!--整体参数区域  headers  body 等等-->
                            <div :class="box_layout? 'body-box':'body-box-row'">
                                <el-tabs id="tabs2" :class="[state?'body-off':'body-on']"
                                         class="tab2" model-value="Headers">
                                    <el-tab-pane label="Params">
                                        <el-table
                                                :cell-class-name="rowClassName"
                                                :data="item.queryData"
                                                border
                                                height="calc(100%)"
                                                @cell-click="(row, column)=>cellClick(row, column, 0,item.queryData, index)"

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
                                                    <el-input v-model="scope.row.value" clearable spellcheck="false"/>
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
                                                    <!--                        <el-button icon="Plus" link size="small" style="width: 100%"-->
                                                    <!--                                   @click="addRow(editableTabs[index].queryData)"/>-->
                                                    <el-dropdown class="addItem">
                                                    <span class="el-dropdown-link addItem">
                                                      <el-icon :size="size"><MoreFilled/></el-icon>
                                                    </span>
                                                        <template #dropdown>
                                                            <el-dropdown-menu>
                                                                <el-dropdown-item icon="Plus"
                                                                                  @click="addRow(editableTabs[index].queryData)">
                                                                    单行
                                                                </el-dropdown-item>
                                                                <el-dropdown-item
                                                                        icon="Document"
                                                                        @click="batchAdd(0, index, editableTabs[index].queryData)">
                                                                    批量
                                                                </el-dropdown-item>
                                                            </el-dropdown-menu>
                                                        </template>
                                                    </el-dropdown>
                                                </template>
                                                <template #default="scope">
                                                    <el-button icon="Close" link size="small" style="width: 100%"
                                                               @click.prevent="deleteRow(item.queryData,scope.$index)"/>
                                                </template>
                                            </el-table-column>
                                        </el-table>
                                    </el-tab-pane>
                                    <el-tab-pane label="Headers" name="Headers">
                                        <el-table
                                                :cell-class-name="rowClassName"
                                                :data="item.headersData"
                                                border
                                                height="calc(100%)"
                                                @cell-click="(row, column)=>cellClick(row, column, 1,item.headersData, index)"
                                        >
                                            <el-table-column label="参数名"
                                                             min-width="30%">
                                                <template #default="scope">
                                                    <el-select v-model="scope.row.name" allow-create clearable
                                                               filterable
                                                               placeholder="参数名" remote>
                                                        <el-option
                                                                v-for="item in headersOptions"
                                                                :key="item.value"
                                                                :label="item.label"
                                                                :value="item.value"
                                                        />
                                                    </el-select>
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
                                            <el-table-column style="text-align: center" width="50">
                                                <template #header>
                                                    <el-dropdown class="addItem">
                                                    <span class="el-dropdown-link addItem">
                                                      <el-icon :size="size"><MoreFilled/></el-icon>
                                                    </span>
                                                        <template #dropdown>
                                                            <el-dropdown-menu>
                                                                <el-dropdown-item
                                                                        icon="Plus"
                                                                        @click="addRow(editableTabs[index].headersData)">
                                                                    单行
                                                                </el-dropdown-item>
                                                                <el-dropdown-item
                                                                        icon="Document"
                                                                        @click="batchAdd(1, index, editableTabs[index].headersData)">
                                                                    批量
                                                                </el-dropdown-item>
                                                            </el-dropdown-menu>
                                                        </template>
                                                    </el-dropdown>

                                                </template>
                                                <template #default="scope">
                                                    <el-button icon="Close" link size="small" style="width: 100%"
                                                               @click.prevent="deleteRow(item.headersData,scope.$index)"/>
                                                </template>
                                            </el-table-column>
                                        </el-table>
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
                                                <el-table
                                                        :cell-class-name="rowClassName"
                                                        :data="item.formData"
                                                        border
                                                        height="calc(100%)"
                                                        @cell-click="(row, column)=>cellClick(row, column, 2, item.formData, index)"
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
                                                                       :on-remove="(uploadFile, uploadFiles)=>successRemove(uploadFile, uploadFiles, item)"
                                                                       :on-success="(uploadFile, uploadFiles)=>successUpload(uploadFile, uploadFiles, item)"
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
                                                            <el-dropdown class="addItem">
                                  <span class="el-dropdown-link addItem">
                                    <el-icon :size="size"><MoreFilled/></el-icon>
                                  </span>
                                                                <template #dropdown>
                                                                    <el-dropdown-menu>
                                                                        <el-dropdown-item
                                                                                icon="Plus"
                                                                                @click="addRow(editableTabs[index].formData)">
                                                                            单行
                                                                        </el-dropdown-item>
                                                                        <el-dropdown-item
                                                                                icon="Document"
                                                                                @click="batchAdd(2, index, editableTabs[index].formData)">
                                                                            批量
                                                                        </el-dropdown-item>
                                                                    </el-dropdown-menu>
                                                                </template>
                                                            </el-dropdown>
                                                        </template>
                                                        <template #default="scope">
                                                            <el-button icon="Close" link size="small"
                                                                       style="width: 100%"
                                                                       @click.prevent="deleteRow(item.formData,scope.$index)"/>
                                                        </template>
                                                    </el-table-column>
                                                </el-table>
                                            </el-tab-pane>
                                            <el-tab-pane label="x-www-form-urlencoded" name="x-www-form-urlencoded">
                                                <el-table
                                                        :cell-class-name="rowClassName"
                                                        :data="item.formUrlencodedData"
                                                        border
                                                        height="calc(100%)"
                                                        @cell-click="(row, column)=>cellClick(row, column, 3, item.formUrlencodedData, index)"
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
                                                                        v-for="item in formUrlencodedOptions"
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
                                                            <el-input v-model="scope.row.value" clearable
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
                                                            <el-dropdown class="addItem">
                                  <span class="el-dropdown-link addItem">
                                    <el-icon :size="size"><MoreFilled/></el-icon>
                                  </span>
                                                                <template #dropdown>
                                                                    <el-dropdown-menu>
                                                                        <el-dropdown-item
                                                                                icon="Plus"
                                                                                @click="addRow(editableTabs[index].formUrlencodedData)">
                                                                            单行
                                                                        </el-dropdown-item>
                                                                        <el-dropdown-item
                                                                                icon="Document"
                                                                                @click="batchAdd(3, index, editableTabs[index].formUrlencodedData)">
                                                                            批量
                                                                        </el-dropdown-item>
                                                                    </el-dropdown-menu>
                                                                </template>
                                                            </el-dropdown>
                                                        </template>
                                                        <template #default="scope">
                                                            <el-button icon="Close" link size="small"
                                                                       style="width: 100%"
                                                                       @click.prevent="deleteRow(item.formUrlencodedData,scope.$index)"/>
                                                        </template>
                                                    </el-table-column>
                                                </el-table>
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
                                                    <v-ace-editor
                                                            v-model:value="item.rawData.text"
                                                            :lang="item.rawData.type"
                                                            :options="aceConfig.options"
                                                            :readonly="aceConfig.readOnly"
                                                            :theme="aceConfig.theme"
                                                            style="height: 100%"
                                                            wrap>
                                                    </v-ace-editor>
                                                </div>

                                            </el-tab-pane>
                                            <el-tab-pane label="binary" name="binary">binary</el-tab-pane>
                                        </el-tabs>
                                    </el-tab-pane>
                                    <el-tab-pane label="Cookies">
                                        <el-table
                                                :cell-class-name="rowClassName"
                                                :data="item.cookies"
                                                border
                                                height="calc(100%)"
                                                @cell-click="(row, column)=>cellClick(row, column, 4,item.cookies, index)"

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
                                                    <el-input v-model="scope.row.value" clearable spellcheck="false"/>
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
                                                    <el-dropdown class="addItem">
                                                    <span class="el-dropdown-link addItem">
                                                      <el-icon :size="size"><MoreFilled/></el-icon>
                                                    </span>
                                                        <template #dropdown>
                                                            <el-dropdown-menu>
                                                                <el-dropdown-item icon="Plus"
                                                                                  @click="addRow(editableTabs[index].cookies)">
                                                                    单行
                                                                </el-dropdown-item>
                                                                <el-dropdown-item
                                                                        icon="Document"
                                                                        @click="batchAdd(4, index, editableTabs[index].cookies)">
                                                                    批量
                                                                </el-dropdown-item>
                                                            </el-dropdown-menu>
                                                        </template>
                                                    </el-dropdown>
                                                </template>
                                                <template #default="scope">
                                                    <el-button icon="Close" link size="small" style="width: 100%"
                                                               @click.prevent="deleteRow(item.cookies,scope.$index)"/>
                                                </template>
                                            </el-table-column>
                                        </el-table>
                                    </el-tab-pane>
                                    <el-tab-pane label="Auth">敬请期待</el-tab-pane>
                                    <el-tab-pane label="前置">
                                        <el-scrollbar class="postcondition-box">
                                            <!--<el-collapse accordion>
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
                                                                label-position="right"
                                                                label-width="120px"
                                                                style="width: 80%;"
                                                        >
                                                            <el-form-item v-if="item_son.type ===0"
                                                                          label="断言名称"
                                                            >
                                                                <el-input v-model="item_son.name"/>
                                                            </el-form-item>
                                                            <el-form-item v-if="item_son.type ===1"
                                                                          label="变量名称">
                                                                <el-input v-model="item_son.name"/>
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
                                                                            style="margin: 0 8px;align-items: center;display: flex;">
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
                                                                <div v-if="item_son.resMetaData===1"
                                                                     class="p-content-style">
                                                                    <el-input v-model="item_son.expression"
                                                                              placeholder="Json Path 表达式"
                                                                              style="flex: 1;"/>
                                                                    <span
                                                                            style="margin: 0 8px;align-items: center;display: flex;">
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
                                                                    <el-input v-model="item_son.continueExtract.separator"
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
                                                                        <el-select v-model="item_son.assert.expectedType"
                                                                                   placeholder="类型"
                                                                                   style="width: 80px;">
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

                                                        </el-form>
                                                    </div>
                                                </el-collapse-item>
                                            </el-collapse>-->
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
                                                                :rules="postConditionRules"
                                                                label-position="right"
                                                                label-width="120px"
                                                                style="width: 80%;"
                                                        >
                                                            <el-form-item v-if="item_son.type ===0"
                                                                          label="断言名称"
                                                            >
                                                                <el-input v-model="item_son.name"/>
                                                            </el-form-item>
                                                            <el-form-item v-if="item_son.type ===1"
                                                                          label="变量名称">
                                                                <el-input v-model="item_son.name"/>
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
                                                                <div v-if="item_son.resMetaData===1"
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
                                                            <el-form-item v-if="item_son.type ===1" label="保存变量到">
                                                                <el-select
                                                                        v-model="item_son.config"
                                                                        clearable
                                                                        placeholder="请选择环境"
                                                                        style="width: 100%;">
                                                                    <el-option
                                                                            v-for="item in storageOptions"
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
                                                    <Component :is="iconStr"></Component>
                                                </el-icon>
                                                返回结果
                                            </el-button>
                                        </el-tag>
                                        <el-tag v-if="item.response?.status" :type="statusTtype(item.response.status)"
                                                effect="dark">
                                            <Timer style="width: 1.5em; height: 1.5em; margin-right: 5px;"/>
                                            {{ dateFormat(item.response.startTime) }}
                                            <Sunny v-if="item.response.status<300"
                                                   class="results-icon"/>
                                            <Lightning v-else class="results-icon"/>
                                            Status
                                            {{ item.response.status }}
                                            <Odometer class="results-icon"/>
                                            {{ item.response.duration || '0' }}ms
                                        </el-tag>
                                    </div>

                                    <div v-if="state" class="response-Content">

                                        <div class="ace-style">
                                            <el-button icon="Menu" size="small"
                                                       @click="changeBoxlayout"></el-button>
                                            <v-ace-editor v-if="item.response?.status"
                                                          :lang="toStr(item.response?.data)[1]"
                                                          :options="aceConfig.options"
                                                          :readonly="true"
                                                          :theme="aceConfig.theme"
                                                          :value="toStr(item.response?.data)[0]"
                                                          style="height: 100%"
                                                          wrap>
                                            </v-ace-editor>
                                            <el-empty v-else :image-size="120" description="点击发送获取响应结果"
                                                      style="height: 100%;"/>
                                        </div>
                                        <div v-if="item.response?.postConditionResult?.length > 0"
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
                                                <span style="flex: 1;word-break: break-all;">{{ p.content }}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </el-tab-pane>
                </el-tabs>
            </el-card>
        </div>
    </el-row>

    <!--配置弹窗-->
    <el-dialog v-model="dialogTableVisible"
               :before-close="envConfigurationClose"
               destroy-on-close
               title="配置中心"
               width="70%"
    >
        <div style="height: 60vh;">
            <Environment :configuration-close="envConfigurationClose"
                         :project="proId" :default-active="apiEnv"/>
        </div>
    </el-dialog>
    <!--批量添加键值对 弹窗-->
    <el-dialog v-model="additemsVisible"
               align-center
               destroy-on-close
               title="批量编辑"
               width="40%"
               @close="eadditemsClose"
    >
        <div class="additemsVisible">
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
        <el-button @click="additemsVisible = false">取消</el-button>
        <el-button type="primary" @click="additems"
        >确定</el-button>
      </span>
        </template>
    </el-dialog>
    <!--curl弹窗-->
    <el-dialog
            v-model="dialogCurl"
            title="cURL 解析"
            width="50%"
            destroy-on-close
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
      width="50%"
  >
    <FunctionHelper/>
  </el-dialog>
</template>

<script setup>
import {computed, getCurrentInstance, nextTick, onMounted, reactive, ref, watch} from 'vue'
import {useStore} from "vuex";
import {ElMessage} from "element-plus";
import {VAceEditor} from 'vue3-ace-editor';
import FunctionHelper from "../../components/FunctionHelper.vue";
import dayjs from "dayjs";
// 如果要有代码提示，下面这句话必须引入!!!
import ace from 'ace-builds'
import 'ace-builds/src-noconflict/ext-language_tools.js'
import "ace-builds/src-noconflict/theme-sqlserver.js"
import "ace-builds/src-noconflict/mode-javascript.js"
import "ace-builds/src-noconflict/snippets/sql.js"
import "ace-builds/src-noconflict/mode-json5.js"
import "ace-builds/src-noconflict/mode-json.js"
import "ace-builds/src-noconflict/mode-text.js"
import "ace-builds/src-noconflict/mode-html.js"
import "ace-builds/src-noconflict/mode-xml.js"
import apis from "../../../api/api";
import {useRouter} from "vue-router";
import Environment from "../tools/Environment.vue"
import {toJsonString} from "curlconverter";
import AddApiMode from "../../components/AddApiMode.vue";

const {proxy} = getCurrentInstance()
const props = defineProps({
    apiId: {
        type: Number,
        required: false
    },
    projectId: {
        type: Number,
        required: false
    },
    options: {
        type: Number,
        required: false
    }
})
console.log(props)
const proId = ref(Number(`${props.projectId}`))
const dialogFun = ref(false)
const ruleFormRef = ref()
const router = useRouter()
const store = useStore()
const state = ref(true)
const iconStr = ref("ArrowDown")
const box_layout = ref(true)

const dialogCurl = ref(false)
const curlText = ref('')
const curlClose = () => {
    curlText.value = "";
    dialogCurl.value = false;
}
const runCurl = () => {
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
        project: proId.value,
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
    for (var key in headers) {
        obj_add.headersData.push({
            name: key,
            value: headers[key],
            selected: true
        })
    }
    for (var key in queries) {
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
        for (var key in datas) {
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
        handleTabsEdit(obj_add)
    }

    curlClose()
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

const changeBoxlayout = () => {
    box_layout.value = !box_layout.value
    if (box_layout.value) {
        iconStr.value = "ArrowDown";
    } else {
        iconStr.value = "ArrowRight";
    }
}
const loading1 = ref(false)
const loading2 = ref(false)
const size = ref("large")
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

// 伸开收起按钮
const myIcon = ref('CaretLeft')
const leftSpan = ref(true)
const rightSpan = ref(18)
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
// 伸开收起按钮


// 配置选项
const apiEnv = ref()
let configurationOptions = ref([])
let storageOptions = ref([])
const postConditionRules = reactive({
    name: [
        {required: true, message: '请输出名称！', trigger: 'blur'},
    ],
    config: [
        {required: true, message: '请选择环境！', trigger: 'blur'},
    ]
})

const configList = () => {
    if (proId.value) {
        apis.configList({
            project__id: proId.value,
        })
                .then(({data}) => {
                    storageOptions.value = data.data
                    configurationOptions.value = data.data.slice(1);
                })
    } else {
        configurationOptions.value = [];
    }
}
const envConfigurationClose = (done) => {
    configList();
    dialogTableVisible.value = false
    // ElMessageBox.confirm('确定关闭窗口吗?')
    //         .then(() => {
    //             dialogTableVisible.value = false
    //         })
    //         .catch(() => {
    //             // catch error
    //         })
}


const selectConfig = (val) => {
    editableTabs.value.forEach((tab, index) => {
        if (tab.name === editableTabsValue.value) {
            if (val === '') {
                tab.api_env = null
            } else {
                tab.api_env = val
            }
            console.log(tab)
            if (tab.id) {
                apis.editApi(tab.id, tab)
                        .then(() => {
                            ElMessage.success("切换环境成功！")
                        })
                        .catch((err) => {
                            ElMessage.error(err)
                        })
            }
        }
    })
}
const tabChange = (name) => {
    console.log(`tab切换：${name}`)
    editableTabs.value.forEach((tab, index) => {
        if (tab.name === editableTabsValue.value) {
            apiEnv.value = tab.api_env
            proId.value = tab.project
        }
    })
}

const openEnv = () => {
    if (proId.value) {
        dialogTableVisible.value = true
    } else {
        ElMessage.error("当前接口未绑定项目，无法配置环境！")
    }
}
// json输入框相关配置ß
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
const handleCommand = (command) => {
    command.val["type"] = command.command
}
ace.config.set('basePath', '/node_modules/ace-builds/src-noconflict');
const aceConfig = reactive({
    lang: '', //解析json
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

//json格式化
// const jsonFormat = (val) => {
//     try {
//         console.log(val.text)
//         const jsonObj = JSON.parse(val.text)
//         val.text = JSON.stringify(jsonObj, null, 4)
//     } catch (e) {
//         ElMessage.error("json格式异常！")
//     }
//
// }

const toStr = (obj) => {
    if (typeof obj === 'object') {
        return [JSON.stringify(obj, null, aceConfig.options.tabSize), "json5"]
    } else if (typeof obj !== 'undefined') {
        try {
            return [JSON.stringify(JSON.parse(obj), null, aceConfig.options.tabSize), 'json5']

        } catch (e) {
            try {
                return [proxy.$HTMLFormat(obj), "html"]
            } catch (e) {
                return [obj, "text"]
            }
        }
    } else return ["", "text"]
}
// json输入框相关配置


/* 公用方法 */
const a = ref('\t')
const placeholderText = ref("")
const additemsVisible = ref(false)
const radio1 = ref('1')
const textareavalue = ref("")
const batchIndex = ref()
const batchOption = ref()
const batchData = ref()
const eadditemsClose = () => {
    textareavalue.value = ""
}
const batchAdd = (option, index, data) => {
    console.log("批量操作")
    batchIndex.value = index
    batchOption.value = option
    batchData.value = data
    radio1.value = '1'
    getKeyValue('1')
    additemsVisible.value = true;
}

const getKeyValue = (label) => {
    let newObj
    let text
    if (label === '1') {
        let d_Obj = {}
        batchData.value.forEach((item) => {
            if (item.name !== "") {
                d_Obj[item.name] = item.value
            }
        })
        if (Object.keys(d_Obj).length > 0) {
            newObj = JSON.stringify(d_Obj, null, 2)
        }
        text = "{key: value}"
    } else {
        newObj = batchData.value.map(item => {
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
    //  console.log("adadadadadadaddadad")
    const data = formattingData(textareavalue.value)
    switch (batchOption.value) {
        case 0:
            editableTabs.value[batchIndex.value].queryData = data
            break
        case 1:
            editableTabs.value[batchIndex.value].headersData = data
            break
        case 2:
            editableTabs.value[batchIndex.value].formData = data
            break
        case 3:
            editableTabs.value[batchIndex.value].formUrlencodedData = data
            break
        case 4:
            editableTabs.value[batchIndex.value].cookies = data
            break
    }
    additemsVisible.value = false;
    //  console.log(editableTabs.value)
}
const cellClick = (row, column, num, data, index) => {
    if (row.index === data.length - 1 && column.label) {
        addRow(data)
    }
}
// 获取当前激活区域api id
const currentId = computed(() => {
    let currentId
    try {
        editableTabs.value.forEach(tab => {
            if (tab.name === editableTabsValue.value) {
                currentId = tab.id
                throw new Error()
            }
        })
    } catch (e) {

    }
    return currentId
})
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
const rowClassName = ({row, column, rowIndex, columnIndex}) => {
    row.index = rowIndex
    column.index = columnIndex
}
// 添加删/除行
const addRow = (val) => {
    val.push({
        name: '',
        value: '',
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
    api: ""
})
const beforeRemove = (uploadFile, uploadFiles) => {
    console.log(uploadFile)
    apis.delFile(uploadFile.response.data.id)
}

const beforeUpload = (uploadFile, uploadFiles) => {
    fileName.value.name = uploadFile.name
    fileName.value.api = currentId
}

const successRemove = (uploadFile, uploadFiles, obj) => {
    saveRequest(obj)
}
const successUpload = (uploadFile, uploadFiles, obj) => {
    saveRequest(obj)
}
/* 公用方法 */

// 后置操作选项
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

const postConditionCommand = (command) => {
    console.log(command.data)
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
    console.log(command.data)
}
const delPostcond = (data, index) => {
    data.splice(index, 1);
}
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
const sourceOptionsEcho = (val) => {
    let text = ''
    try {
        sourceOptions.forEach((item) => {
            if (item.value === val) {
                console.log(val)
                console.log(item.label)
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
                console.log(val)
                console.log(item.label)
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


// 环境变量配置弹窗
const dialogTableVisible = ref(false)

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
const formOptions = [
    {
        value: 'string',
        label: 'string',
    },
    {
        value: 'inter',
        label: 'inter',
    },
    {
        value: 'float',
        label: 'float',
    },
    {
        value: 'bool',
        label: 'bool',
    },
    {
        value: 'file',
        label: 'file',
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
const formUrlencodedOptions = [
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
    }
]

// tab数据
let tabIndex = 0
const editableTabsValue = ref()
const editableTabs = ref([
    // {
    //     id: null,
    //     editLabel: false,
    //     title: '新接口',
    //     name: "1",
    //     project: projectId,
    //     method: "GET",
    //     url: "",
    //     bodyType: "none",
    //     queryData: [],
    //     headersData: [],
    //     cookies: [],
    //     formData: [],
    //     formUrlencodedData: [],
    //     rawData: {
    //         type: "text",
    //         text: ""
    //     },
    //     postCondition: [],
    //     response: {
    //         data: {
    //             postConditionResult: []
    //         },
    //
    //     }
    // }
])
const handleTabsEdit = (obj_add) => {
    const newTabName = `${++tabIndex}`
    obj_add.name = newTabName;
    editableTabs.value.push(obj_add)
    editableTabsValue.value = newTabName
    // if (action === 'add') {
    //     const newTabName = `${++tabIndex}`
    //     const obj = {
    //         id: null,
    //         editLabel: false,
    //         title: '新接口',
    //         name: newTabName,
    //         project: proId.value,
    //         method: "GET",
    //         url: "",
    //         bodyType: "none",
    //         queryData: [],
    //         headersData: [],
    //         cookies: [],
    //         formData: [],
    //         formUrlencodedData: [],
    //         rawData: {
    //             type: "json",
    //             text: ""
    //         },
    //         postCondition: [],
    //         response: {}
    //     }
    //     editableTabs.value.push(obj)
    //     editableTabsValue.value = newTabName
    //     // apis.addApi(obj_add)
    //     //         .then(({data}) => {
    //     //             obj_add.id = data.data.id
    //     //             ElMessage.success(data.msg)
    //     //             console.log(data)
    //     //             historyData.value.unshift(data.data)
    //     //             editableTabs.value.push(obj_add)
    //     //             editableTabsValue.value = newTabName
    //     //         })
    //     //         .catch(() => {
    //     //             loading2.value = false
    //     //         })
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
    //                 } else {
    //                     apiEnv.value = null;
    //                     if (props.options === 1) {
    //                         proId.value = null;
    //                     }
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
        project: proId.value,
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
                } else {
                    apiEnv.value = null;
                    if (props.options === 1) {
                        proId.value = null;
                    }
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
        project: proId.value,
        method: null
    }
    editableTabs.value.push(obj)
    editableTabsValue.value = newTabName
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
    let projectId = props.projectId
    if (props.options === 1) {
        projectId = null
    }
    const condition = {
        project__id: projectId,
        page: apiPage.value,
        pageSize: 20
    }
    apis.apiList(condition)
            .then(({data}) => {
                apiPage.value += 1
                apiCount.value = data.data.count
                historyData.value.push(...data.data.results)
                apiLoading.value = false
            })

}
loadApis()

const start_pp = async () => {
    await loadApis()
    clickHistory(props.apiId)
}
// start_pp()
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
    console.log(typeof id)
    if (id) {
        if (editableTabs.value.length === 0) {
            addApiTab(id)
        } else {
            const exist = ref(false)
            for (var i = 0; i < editableTabs.value.length; i++) {
                console.log(editableTabs.value[i].id)
                if (editableTabs.value[i].id === id) {
                    editableTabsValue.value = editableTabs.value[i].name
                    exist.value = true
                    return
                }
            }
            console.log("没有匹配id")
            if (!exist.value) {
                console.log("不存在 新建并赋值")
                addApiTab(id)
            }
        }
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
let tab2Content = ref(0);
let responseHeight = ref(0)
clickHistory(props.apiId)

// const apiList = () => {
//   const condition = {
//     project: projectId,
//     page: 1,
//     pageSize: 20
//   }
//   apis.apiList(condition)
//       .then(({data}) => {
//         if (data.code === 200) {
//           historyData.value = data.data.results
//         } else {
//           ElMessage.error(data.msg)
//         }
//       })
// }

onMounted(() => {
    nextTick(() => {
        const idEl = document.getElementById('configuration')
        idEl.nextElementSibling.firstElementChild.style.width = `calc(100% - ${idEl.offsetWidth}px - 13px)`;
        //     tab2Content.value = document.getElementById('tabs2').clientHeight - 50;
        //     responseHeight.value = document.getElementById('responseDiv').clientHeight - 30;
    })
    // window.onresize = () => {
    //     tab2Content.value = document.getElementById('tabs2').clientHeight - 50;
    //     responseHeight.value = document.getElementById('responseDiv').clientHeight - 30;
    // }
    watch(() => proId.value, (newValue, oldValue) => {
        console.log('watch-debugPro-project', newValue);
        configList()
    }, {immediate: true})
})

const historyCommand = (command) => {
    console.log(command)
    if (command.command === 2) {
        // 删除
        apis.delApi(command.id)
                .then(() => {
                    historyData.value.splice(command.index, 1)
                    apiCount.value -= 1
                    ElMessage.success("删除成功！")
                    const targetName = editableTabs.value.filter((tab) => tab.id === command.id)[0]?.name;
                    // handleTabsEdit(targetName, "remove");
                    handleTabsDel(targetName);
                })
    }
    if (command.command === 1) {
        //复制
        apis.copyApi({id: command.id})
                .then(({data}) => {
                    console.log(historyData.value)
                    historyData.value.unshift(data.data)
                    ElMessage.success("复制成功！")
                })
    }
}

const dateFormat = (val, format = "YYYY-MM-DD HH:mm:ss") => {
    if (!isNaN(val)) {
        val = parseInt(val);
    }
    return dayjs(val).format(format);
};


// 发送请求
const sendRequest = (obj) => {
    if (obj.url === "") {
        ElMessage.error("如未配置环境请输入含 http / https 的完整 URL")
        return
    }
    // 发送按钮loading
    // loading1.value = true
    obj.response = {};
    apis.apiSend(obj)
            .then(res => {
                obj.response = res.data
                console.log(obj.response)
                // loading1.value = false
            })
            .catch(err => {
                obj.response = err.response.data
                // loading1.value = false
            })

}
// 保存请求
const saveRequest = (obj) => {
    const apiId = obj.id
    for (const item of obj.formData) {
        if (item.name !== '') {
            if (item.type === 'file' && item.fileList.length > 0) {
                for (var i = 0; i < item.fileList.length; i++) {
                    item.fileList[i].raw = {
                        uid: item.fileList[i].raw.uid,
                        type: item.fileList[i].raw.type
                    }
                }
            }
        }
    }
    const newObj = JSON.parse(JSON.stringify(obj))
    delete newObj.response.data
    delete newObj.response.postConditionResult
    if (newObj.rawData.type === 'json') {
        try {
            newObj.rawData.text = JSON.stringify(JSON.parse(newObj.rawData.text))
        } catch (e) {
        }
    }
    // console.log(newObj)

    if (apiId) {
        // 更新api
        console.log("更新")
        apis.editApi(apiId, newObj)
                .then(({data}) => {
                    ElMessage.success(data.msg)
                    // apiPage.value = 2
                    // apiList();
                    for (const index in historyData.value) {
                        if (historyData.value[index].id === apiId) {
                            historyData.value[index].title = data.data.title
                            historyData.value[index].url = data.data.url
                            historyData.value[index].method = data.data.method
                            break
                        }
                    }
                })
    } else {
        // 新增api
        console.log("新增")
        apis.addApi(newObj)
                .then(({data}) => {
                    obj.id = data.data.id
                    ElMessage.success(data.msg)
                    console.log(data)
                    historyData.value.unshift(data.data)
                    loading2.value = false
                })
                .catch(() => {
                    loading2.value = false
                })
    }


}
const submitForm = async (formEl, index, item, num) => {

    if (!formEl) return
    await formEl[index].validate((valid, fields) => {
        if (valid) {
            console.log('submit!')
            Object.keys(item).forEach(key => {
                if (Array.isArray(item[key])) {
                    item[key] = item[key].filter((tab) => tab.name !== "")
                }
            })
            if (num === 1) {
                sendRequest(item)
            } else if (num === 2) {
                saveRequest(item)
            }
        } else {
            console.log('error submit!', fields)
        }
    })
}

const formattingData = (data) => {
    let obj_list = []
    if (data) {
        if (radio1.value === "1") {
            // data = data.trim().replace(/"/g, '\\"').replace(/'/g, '"');
            const Json_data = JSON.parse(data);
            for (var key in Json_data) {
                obj_list.push({
                    name: key,
                    value: Json_data[key],
                    selected: true,
                    fileList: [],
                    type: 'string',
                })
            }
        } else {
            obj_list = data.trim().split(/\n/).map(item => ({
                name: item.split(radio1.value)[0],
                value: item.split(radio1.value).slice(1,).join(radio1.value).trim(),
                selected: true,
                fileList: [],
                type: 'string',
            }))
        }
    }
    return obj_list
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
        margin-left: 12px;
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
        width: 50%;
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

            .Condition-show {
                margin-top: 10px;
                width: 100%;
                max-height: 30%;
                overflow: auto;
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

.btn-result {
    height: 40px;
    box-sizing: border-box;
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #e7e7e7;

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

.content-on {
    height: 60%;
}

.content-off {
    height: 30px;
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


:deep(.ace_gutter) {
    // background-color: #929292;
    background-color: transparent;
}

:deep(.ace_gutter-active-line) {
    background-color: #ffbf53;
}

:deep(.ace_marker-layer .ace_active-line) {
    background: transparent;
    border: 1px solid #d7d7d7;
    box-sizing: border-box;
}

:deep(.el-upload) {
    --el-upload-dragger-padding-horizontal: 0;
    --el-upload-dragger-padding-vertical: 10px;
}

.el-upload__text {
    text-align: left;
}

:deep(.el-upload-list) {
    margin: 0;
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
    .el-select {
        width: 150px;
    }

    :deep(.el-input__wrapper) {
        width: auto;
        border-radius: 0;
    }
}


//修改 添加tab按钮的位置 让其紧随 每个item后面
:deep(.el-tabs--card>.el-tabs__header ) {
    //width: calc(100% - @configuration_width - 10px);
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

:deep(.el-tabs--card>.el-tabs__header .el-tabs__item) {
    // border-left-color: transparent;
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

.input-w-2 {
    width: 50px;

}

.condition-style {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding: 3px 10px;
    margin: 5px;
    border-radius: 5px;

    span {
        margin-left: 10px;
        color: #838383;
        font-size: 12px;
    }
}

.results-icon {
    width: 1.5em;
    height: 1.5em;
    margin: 0 5px 0 8px;
}

.infinite-list-wrapper {
    height: 100%;

    p {
        display: flex;
        justify-content: center;
        align-items: center;
    }
;
}

.addItem {
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: nowrap;

}

.additemsVisible {
    height: 30vh;
    display: flex;
    flex-direction: column;

    .el-textarea {
        flex: 1;
        margin-top: 10px;
        display: flex;
    }
}

</style>
