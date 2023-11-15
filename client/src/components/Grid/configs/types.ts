import type Router from "vue-router";

import Filtering from "@/utils/filtering";

interface Action {
    title: string;
    icon?: string;
    handler: (router: Router) => void;
}

export type FieldArray = Array<FieldKey | FieldOperations>;

interface FieldKey {
    key: string;
    disabled?: boolean;
    type: string;
    handler?: FieldKeyHandler;
}

// TODO: Apply strict literals
// type FieldType = "date" | "operations" | "sharing" | "tags" | "text" | undefined;

interface OperationHandlerMessage {
    message: string;
    status: string;
}

type OperationHandlerReturn = Promise<OperationHandlerMessage> | void;

/**
 * Exported Type declarations
 */
export interface Config {
    actions?: Array<Action>;
    fields: FieldArray;
    filtering: Filtering<any>;
    getData: (offset: number, limit: number, search: string, sort_by: string, sort_desc: boolean) => Promise<any>;
    plural: string;
    sortBy: string;
    sortKeys: Array<string>;
    sortDesc: boolean;
    title: string;
}

export interface FieldOperations {
    key: string;
    title: string;
    condition?: (data: RowData) => boolean;
    operations: Array<Operation>;
    width?: number;
}

export type FieldKeyHandler = (data: RowData) => void;

export type RowData = Record<string, unknown>;

export interface Operation {
    title: string;
    icon: any;
    condition?: (data: RowData) => boolean;
    handler: (data: RowData, router: Router) => OperationHandlerReturn;
}
