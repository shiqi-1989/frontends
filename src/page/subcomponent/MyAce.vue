<template>
    <v-ace-editor
            v-model:value="rawData.text"
            :lang="rawData.type"
            :options="aceConfig.options"
            :readonly="readOnly"
            :theme="aceConfig.theme"
            style="height: 100%;flex: 1;"
            wrap>
    </v-ace-editor>
</template>

<script setup>
import {VAceEditor} from 'vue3-ace-editor';
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
import {reactive} from "vue";

const props = defineProps({
    rawData: Object,
    readOnly: {
        type: Boolean,
        required: false,
        default: false
    },
})
ace.config.set('basePath', '/node_modules/ace-builds/src-noconflict');

const aceConfig = reactive({
    lang: props.lang, //解析json
    theme: 'sqlserver', //主题
    readOnly: props.readOnly, //是否只读
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

</script>

<style lang="less" scoped>
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
</style>