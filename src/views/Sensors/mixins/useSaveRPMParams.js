import { ElMessage } from 'element-plus';

import { api_request } from '@/api/request_provider';
import { findItemBy } from '@/helpers';
import { itemSpeedOptionsList } from '@/constants/global';
import { useSensors } from '@/composables/useSensors';

export function useSaveRPMParams({
	sensorData,
	fftItem,
	itemData,
	equipmentData,
	loadingRPM,
	showRpmSettingsDialog,
	defaultRpmSourceItem,
	successRpmSaveCallback,
} = {}) {
	const { setFftRpmParams } = useSensors();

	const resolve = (value) =>
		value && typeof value === 'object' && 'value' in value ? value.value : value;
	const getEquipment = () => resolve(equipmentData) || resolve(itemData) || {};
	const getSensorData = () => resolve(sensorData) || {};
	const getFftItem = () => resolve(fftItem) || {};
	const getDefaultRpmSourceItem = () => resolve(defaultRpmSourceItem);
	const setLoading = (value) => {
		if (loadingRPM && typeof loadingRPM === 'object' && 'value' in loadingRPM) {
			loadingRPM.value = value;
		}
	};
	const closeDialog = () => {
		if (
			showRpmSettingsDialog &&
			typeof showRpmSettingsDialog === 'object' &&
			'value' in showRpmSettingsDialog
		) {
			showRpmSettingsDialog.value = false;
		}
	};
	const notifySuccess = (settings = {}) => {
		if (settings.successMessage) {
			ElMessage({
				type: 'info',
				message: settings.successMessage,
			});
		}
	};
	const runSuccessCallback = (payload) => {
		if (successRpmSaveCallback) {
			successRpmSaveCallback(payload);
		}
	};

	const saveFftRpmParams = (data, settings = {}) => {
		const sensor = getSensorData();
		const fft = getFftItem();

		setLoading(true);

		return setFftRpmParams({
			sensorId: sensor.id,
			fftId: fft.id,
			notNotify: true,
			data: { rpm_value: data.rpm_value },
		})
			.then(({ value }) => {
				const payload = {
					fftItem: value,
					...settings,
				};

				closeDialog();
				runSuccessCallback(payload);
				notifySuccess(settings);
				return payload;
			})
			.finally(() => {
				setLoading(false);
			});
	};

	const saveEquipmentRpmParams = (data, settings = {}) => {
		const equipment = getEquipment();
		const sensor = getSensorData();
		const fft = getFftItem();
		const selectedRpmOption = findItemBy(
			'id',
			equipment.rpm_source_item,
			itemSpeedOptionsList(),
		);
		let finalRpmSourceItem = equipment.rpm_source_item;

		if (selectedRpmOption) {
			finalRpmSourceItem = sensor.rpmSources?.[selectedRpmOption.source_key]
				? finalRpmSourceItem
				: getDefaultRpmSourceItem();
		}

		setLoading(true);

		return api_request
			.put(`/equipments/${equipment.id}/rpm-params`, {
				notNotify: true,
				data: {
					is_rpm_visible: !!equipment.is_rpm_visible,
					rpm_source_item: finalRpmSourceItem || getDefaultRpmSourceItem(),
					...data,
				},
			})
			.then(({ value }) => {
				if (!fft.rpm_value) {
					const payload = {
						equipmentItem: value,
						...settings,
					};

					closeDialog();
					runSuccessCallback(payload);
					notifySuccess(settings);
					return payload;
				}

				return setFftRpmParams({
					fftId: fft.id,
					sensorId: sensor.id,
					notNotify: true,
					data: { rpm_value: null },
				}).then(({ value: fftItemValue }) => {
					const payload = {
						equipmentItem: value,
						fftItem: fftItemValue,
						...settings,
					};

					closeDialog();
					runSuccessCallback(payload);
					notifySuccess(settings);
					return payload;
				});
			})
			.finally(() => {
				setLoading(false);
			});
	};

	const saveRpmParams = (data, settings = {}) => {
		if (data.isFFTRPM) {
			return saveFftRpmParams(data, settings);
		}
		return saveEquipmentRpmParams(data, settings);
	};

	return {
		saveRpmParams,
		saveFftRpmParams,
		saveEquipmentRpmParams,
	};
}
