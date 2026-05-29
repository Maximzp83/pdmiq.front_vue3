<template>
	<div>
		<VueElementLoadingWrapper
			:isLoading="itemLoading || equipmentLoading"
			:isSaving="itemSaving || sensorSaving"
			:itemsName="itemsName.one"
		/>

		<div class="view-wrapper item-page-wrapper">
			<div class="mcontainer">
				<div class="view-content-card card">
					<div v-if="loadContent && equipmentData" class="form-wrapper card-content">
						<component
							:is="componentFile"
							v-if="componentFile"
							ref="itemFormRef"
							:itemData="itemData"
							:equipmentData="equipmentData"
							:itemsName="itemsName"
							@submit="handleSubmitForm"
							@onCancel="handleCloseButton"
						/>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, defineAsyncComponent, ref, shallowRef, watch } from 'vue';
import { useRoute } from 'vue-router';

import { api_request } from '@/api/request_provider';
import { SENSOR_TYPES, NCD_REQUEST_STATUSES } from '@/constants/global';
import { ENTITIES } from '@/config/entities';
import { Lang } from '@/localization';
import { useItemPage } from '@/composables/mixins/useItemPage';
import { useNavigation } from '@/composables/mixins/useNavigation';
import { useNotify } from '@/composables/useNotify';
import { useAuthStore } from '@/stores/AuthStore';
import { useGlobalStore } from '@/stores/GlobalStore';

import VueElementLoadingWrapper from '@/components/common/VueElementLoadingWrapper.vue';

const { tt } = Lang;

defineOptions({
	name: 'SensorPage',
});

const route = useRoute();
const authStore = useAuthStore();
const globalStore = useGlobalStore();
const { changeRoute } = useNavigation();
const { Notify } = useNotify();

const itemFormRef = ref(null);
const equipmentData = shallowRef({});
const equipmentLoading = ref(false);
const sensorSaving = ref(false);

const itemsName = computed(() => ({
	one: tt('Sensor'),
	mult: tt('Sensors'),
	instanceName: 'sensors',
}));

const componentFile = computed(() => {
	const queryType = route.query?.type;
	const sensorType = itemData.value?.type || queryType;

	if (+sensorType === SENSOR_TYPES.NCD || sensorType === 'ncd') {
		return defineAsyncComponent(() => import('./sensorForm/ItemFormNCD.vue'));
	}

	if (+sensorType === SENSOR_TYPES.ULTRA_SOUND || sensorType === 'ultra_sound') {
		return defineAsyncComponent(() => import('./sensorForm/ItemFormUltraSound.vue'));
	}

	return defineAsyncComponent(() => import('./sensorForm/ItemForm.vue'));
});

const fetchEquipment = (id) => {
	if (!id) {
		equipmentData.value = {};
		return Promise.resolve({});
	}

	equipmentLoading.value = true;
	return api_request
		.get(`/equipments/${id}`, { notNotify: true })
		.then(({ value }) => {
			equipmentData.value = value || {};
			return value;
		})
		.finally(() => {
			equipmentLoading.value = false;
		});
};

const {
	itemData,
	itemLoading,
	itemSaving,
	loadContent,
	handleSubmitForm: submitByPage,
	handleCloseButton,
} = useItemPage({
	entityKey: 'Sensors',
	itemFormRef,
	itemsName,
	goToListAfterSave: true,
	successFetchItemCallback: (sensor) => {
		fetchEquipment(sensor?.equipment_id);
	},
	localPageTitle: (sensor) => {
		if (sensor?.id) return `${tt('Sensor')} ${sensor.id}`;
		return `${tt('New')} ${tt('Sensor')}`;
	},
});

const toggleMainPreloader = (open, text = '') => {
	globalStore.set_value('mainPreloader', !!open);
	globalStore.set_value(
		'overlay',
		open
			? {
					text,
					textStyle: { fontSize: '25px' },
				}
			: {},
	);
};

const handleNcdSocketResponse = (response = {}, settings = {}) =>
	new Promise((resolve, reject) => {
		const { data, type } = response;
		const { successMessage, failMessage, sensorId } = settings;

		if (type !== 'ncd.command' || sensorId !== data?.sensor_id) return;

		if (data.status === NCD_REQUEST_STATUSES.SUCCESS) {
			Notify({
				type: 'success',
				title: tt('Success'),
				message: successMessage || tt('phrases.sensor_created_successfully'),
			});
			resolve();
		}

		if (data.status === NCD_REQUEST_STATUSES.FAIL) {
			Notify({
				type: 'warning',
				title: tt('Fail'),
				message: failMessage || tt('phrases.error_check_controller_connectivity'),
				duration: 0,
			});
			reject();
		}
	});

const handleSubmitForm = (data) => {
	if (data?.enableWebSocket) {
		const { payload, isNCDSDT, successMessage, failMessage } = data;
		const initialArchieveStatus = payload?.formData?.is_archived;

		sensorSaving.value = true;
		api_request('/sensors', {
			data: payload.formData,
			itemName: 'Sensor',
			notNotify: true,
		})
			.then((answer) => {
				const savedSensor = answer?.value || answer?.data?.data || {};
				if (isNCDSDT && initialArchieveStatus === savedSensor.is_archived) {
					changeRoute({ path: ENTITIES.Sensors.routeBase });
					return;
				}

				toggleMainPreloader(true, `${tt('Working')}...`);
				const socket = new WebSocket(`${window.location.origin.replace(/^http/, 'ws')}/ws/user.${authStore.authUser?.uuid}`);
				socket.onmessage = (event) => {
					handleNcdSocketResponse(JSON.parse(event.data), {
						sensorId: savedSensor.id,
						successMessage,
						failMessage,
					})
						.then(() => {
							socket.close();
							changeRoute({ path: ENTITIES.Sensors.routeBase });
						})
						.finally(() => toggleMainPreloader(false));
				};
				socket.onerror = () => {
					toggleMainPreloader(false);
					Notify({
						type: 'warning',
						title: tt('Fail'),
						message: tt('phrases.web_socket_error'),
						duration: 0,
					});
					socket.close();
				};
			})
			.finally(() => {
				sensorSaving.value = false;
			});
		return;
	}

	submitByPage(data?.payload?.formData || data);
};

watch(
	() => route.params.id,
	(id) => {
		if (id === 'new') {
			fetchEquipment(route.query?.equipmentId);
		}
	},
	{ immediate: true },
);
</script>
