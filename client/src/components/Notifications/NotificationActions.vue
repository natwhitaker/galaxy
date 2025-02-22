<script setup lang="ts">
import { library } from "@fortawesome/fontawesome-svg-core";
import { faHourglassHalf } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { BButton, BCol, BInputGroup, BRow } from "bootstrap-vue";
import { formatDistanceToNow, parseISO } from "date-fns";

import type { UserNotification } from "@/components/Notifications";
import { useNotificationsStore } from "@/stores/notificationsStore";

import AsyncButton from "@/components/Common/AsyncButton.vue";
import UtcDate from "@/components/UtcDate.vue";

library.add(faHourglassHalf);

interface Props {
    notification: UserNotification;
}

defineProps<Props>();

const notificationsStore = useNotificationsStore();

function getNotificationExpirationTitle(notification: UserNotification) {
    if (notification.expiration_time) {
        const expirationTime = parseISO(notification.expiration_time);
        return `This notification will be automatically deleted ${formatDistanceToNow(expirationTime, {
            addSuffix: true,
        })}`;
    } else {
        return "This notification will never be automatically deleted";
    }
}
</script>

<template>
    <BCol v-if="notification">
        <BRow align-h="end" align-v="center">
            <UtcDate class="mx-2" :date="notification.create_time" mode="elapsed" />
            <BInputGroup>
                <AsyncButton
                    v-if="!notification.seen_time"
                    id="mark-as-read-button"
                    title="Mark as read"
                    icon="check"
                    :action="() => notificationsStore.updateNotification(notification, { seen: true })" />
                <BButton
                    v-else-if="notification.expiration_time"
                    id="expiration-time-button"
                    v-b-tooltip.hover
                    variant="link"
                    :title="getNotificationExpirationTitle(notification)">
                    <FontAwesomeIcon icon="hourglass-half" />
                </BButton>
                <AsyncButton
                    id="delete-button"
                    icon="trash"
                    title="Delete"
                    :action="() => notificationsStore.updateNotification(notification, { deleted: true })" />
            </BInputGroup>
        </BRow>
    </BCol>
</template>
