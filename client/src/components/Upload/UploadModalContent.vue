<template>
    <BTabs v-if="ready">
        <BTab v-if="showRegular" id="regular" title="Regular" button-id="tab-title-link-regular">
            <Default
                ref="regular"
                :details="details"
                :lazy-load-max="50"
                :multiple="multiple"
                :has-callback="hasCallback"
                :selectable="selectable"
                v-on="$listeners" />
        </BTab>
        <BTab v-if="showComposite" id="composite" title="Composite" button-id="tab-title-link-composite">
            <Composite :details="details" :has-callback="hasCallback" :selectable="selectable" v-on="$listeners" />
        </BTab>
        <BTab v-if="showCollection" id="collection" title="Collection" button-id="tab-title-link-collection">
            <Collection :details="details" :has-callback="hasCallback" :selectable="selectable" v-on="$listeners" />
        </BTab>
        <BTab v-if="showRules" id="rule-based" title="Rule-based" button-id="tab-title-link-rule-based">
            <RulesInput :details="details" :has-callback="hasCallback" :selectable="selectable" v-on="$listeners" />
        </BTab>
    </BTabs>
    <div v-else>
        <LoadingSpan message="Loading required information from Galaxy server." />
    </div>
</template>

<script>
import Backbone from "backbone";
import { BTab, BTabs } from "bootstrap-vue";
import { getDatatypesMapper } from "components/Datatypes";
import LoadingSpan from "components/LoadingSpan";
import {
    AUTO_EXTENSION,
    DEFAULT_DBKEY,
    DEFAULT_EXTENSION,
    getUploadDatatypes,
    getUploadDbKeys,
} from "components/Upload/utils";

import Collection from "./Collection";
import Composite from "./Composite";
import Default from "./Default";
import { uploadModelsToPayload } from "./helpers";
import RulesInput from "./RulesInput";

export default {
    components: {
        Collection,
        Composite,
        Default,
        RulesInput,
        LoadingSpan,
        BTabs,
        BTab,
    },
    props: {
        currentHistoryId: { type: String, required: true },
        currentUserId: { type: String, default: "" },
        uploadPath: { type: String, required: true },
        chunkUploadSize: { type: Number, default: 1024 },
        fileSourcesConfigured: { type: Boolean, default: false },
        ftpUploadSite: { type: String, default: "" },
        defaultDbKey: { type: String, default: DEFAULT_DBKEY },
        defaultExtension: { type: String, default: DEFAULT_EXTENSION },
        datatypesDisableAuto: { type: Boolean, default: false },
        formats: { type: Array, default: null },
        multiple: {
            // Restrict the forms to a single dataset upload if false
            type: Boolean,
            default: true,
        },
        hasCallback: {
            // Return uploads when done if supplied.
            type: Boolean,
            default: false,
        },
        selectable: { type: Boolean, default: false },
        auto: {
            type: Object,
            default: () => AUTO_EXTENSION,
        },
    },
    data: function () {
        return {
            listGenomes: [],
            listExtensions: [],
            genomesSet: false,
            extensionsSet: false,
            datatypesMapper: null,
            datatypesMapperReady: true,
        };
    },
    computed: {
        historyAvailable() {
            return Boolean(this.currentHistoryId);
        },
        ready() {
            return this.genomesSet && this.extensionsSet && this.historyAvailable && this.datatypesMapperReady;
        },
        unrestricted() {
            return this.formats === null && this.multiple;
        },
        effectiveExtensions() {
            if (this.formats === null || !this.datatypesMapperReady) {
                return this.listExtensions;
            }
            const effectiveExtensions = [];
            this.listExtensions.forEach((extension) => {
                if (extension && extension.id == "auto") {
                    effectiveExtensions.push(extension);
                } else if (this.datatypesMapper.isSubTypeOfAny(extension.id, this.formats)) {
                    effectiveExtensions.push(extension);
                }
            });
            return effectiveExtensions;
        },
        formatRestricted() {
            return this.formats !== null;
        },
        showComposite() {
            if (!this.formatRestricted) {
                return true;
            }
            return this.effectiveExtensions.some((extension) => !!extension.composite_files);
        },
        showRegular() {
            if (!this.formatRestricted) {
                return true;
            }
            return this.effectiveExtensions.some((extension) => !extension.composite_files);
        },
        showCollection() {
            if (this.unrestricted) {
                return true;
            }
            return false;
        },
        showRules() {
            if (this.unrestricted) {
                return true;
            }
            return this.multiple;
        },
        currentFtp() {
            return this.currentUserId && this.ftpUploadSite;
        },
        details() {
            return {
                effectiveExtensions: this.effectiveExtensions,
                listGenomes: this.listGenomes,
                currentFtp: this.currentFtp,
                fileSourcesConfigured: this.fileSourcesConfigured,
                defaultExtension: this.defaultExtension,
                defaultDbKey: this.defaultDbKey,
                uploadPath: this.uploadPath,
                model: this.model,
                chunkUploadSize: this.chunkUploadSize,
                history_id: this.currentHistoryId,
            };
        },
    },
    created() {
        this.model = new Backbone.Model({
            label: "Load Data",
            percentage: 0,
            status: "",
            onunload: function () {},
            onclick: function () {},
        });

        this.model.on("change", (model) => {
            const { changed } = model;
            for (const [field, val] of Object.entries(changed)) {
                this.eventHub.$emit(`upload:${field}`, val);
            }
        });

        this.loadExtensions();
        this.loadGenomes();

        if (this.formats !== null) {
            this.datatypesMapperReady = false;
            getDatatypesMapper().then((datatypesMapper) => {
                this.datatypesMapper = datatypesMapper;
                this.datatypesMapperReady = true;
            });
        } else {
            this.datatypesMapperReady = true;
        }
    },
    beforeDestroy() {
        const modelUnload = this.model.get("onunload");
        modelUnload();
    },
    mounted() {
        this.id = String(this._uid);
    },
    methods: {
        /**
         * Package API data from array of backbone models
         * @param{Array} items - Upload items/rows filtered from a collection
         */
        toData: function (items, history_id, composite = false) {
            return uploadModelsToPayload(items, history_id, composite);
        },
        immediateUpload: function (files) {
            this.$refs.regular?.addFiles(files);
        },
        loadExtensions: async function () {
            this.listExtensions = await getUploadDatatypes(this.datatypesDisableAuto, this.auto);
            this.extensionsSet = true;
        },
        loadGenomes: async function () {
            this.listGenomes = await getUploadDbKeys(this.defaultDbKey);
            this.genomesSet = true;
        },
    },
};
</script>
