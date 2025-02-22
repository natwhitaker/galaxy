<template>
    <div>
        <LoadingSpan v-if="loading" :message="loadingMessage" />
        <Multiselect
            v-if="items"
            v-model="selectedItem"
            deselect-label="Can't remove this value"
            track-by="id"
            label="text"
            :options="items"
            :searchable="true"
            :allow-empty="false"
            @select="onSelectItem" />
    </div>
</template>

<script>
import LoadingSpan from "components/LoadingSpan";
import Multiselect from "vue-multiselect";

/** A simple item selector that allows searching/filtering of the available items.
 * The items must have {id, text} properties. The `id` will be used for selection
 * and the `text` for displaying the item in the selector.
 *
 * This component is meant to be used in combination with a Provider with the
 * `items` and the `loading` status.
 *
 * The selected value will be available through the `update:selected-item` event.
 */
export default {
    components: {
        Multiselect,
        LoadingSpan,
    },
    props: {
        /** Indicates if the available items are still loading.
         * While this is true a spinner with a loading message will
         * be displayed instead.
         */
        loading: {
            type: Boolean,
            required: false,
        },
        /** The name of the items. It will be displayed in the loading message. */
        collectionName: {
            type: String,
            required: false,
            default: "items",
        },
        /** The items that can be selected. */
        items: {
            type: Array,
            required: false,
            default: null,
        },
        /** The initially selected item. */
        currentItemId: {
            type: String,
            required: true,
        },
    },
    data() {
        return {
            selectedItem: {},
        };
    },
    computed: {
        /** @return {String} */
        loadingMessage() {
            return `Loading ${this.collectionName}...`;
        },
    },
    watch: {
        items: function () {
            this.selectedItem = this.items.find((item) => item.id == this.currentItemId);
        },
    },
    methods: {
        onSelectItem(item) {
            this.$emit("update:selected-item", item);
        },
    },
};
</script>
