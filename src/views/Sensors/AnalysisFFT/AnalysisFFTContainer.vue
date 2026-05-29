<template>
	<div class="vibration-analysis-block flex mrow">
		<div class="mcol-xs-12 mcol-sm-3 mcol-lg-auto part-number-options">
			<div class="flex filled_4">
				<ul class="div-block semi-bold">
					<li
						v-for="typeOption in brandModelTypeOptionValuesVisible"
						:key="`option-${typeOption.equipment_type_option_id}`"
						class="option-item flex mrow"
					>
						<div class="mcol-xs-5">{{ typeOption.name }}</div>
						<div class="mcol-xs-7" v-html="typeOption.value"></div>
					</li>
				</ul>

				<div class="div-block">
					<el-button
						native-type="button"
						class="action-button settings-button"
						icon="el-icon-setting"
						@click="showOptionValues"
					/>
				</div>
			</div>
		</div>

		<div class="mcol-xs-12 mcol-sm-9 vibration-analysis-options">
			<div class="flex mrow wrap medium-padding">
				<div v-if="currentRpmSource" class="analysis-item mcol-xs-auto">
					<div class="article-title">{{ tt('Speed') }}</div>
					<div class="card filled_4 bordered">
						<div class="card-content">
							<i class="el-icon-odometer"></i>
							<div class="value">{{ currentRpmSource.value }} RPM</div>
							<el-button
								native-type="button"
								class="action-button settings-button"
								icon="el-icon-setting"
								@click="showRpmSettings"
							/>
						</div>
					</div>
				</div>

				<div v-if="preparedChildComponentsItems.length" class="content-row paint child-components-wrapper">
					<div class="flex mrow wrap medium-padding">
						<ChildComponentItem
							v-for="(child, idx) in preparedChildComponentsItems"
							:key="`child_component-${child.id}`"
							:class="['mcol-xs-auto', { isActive: selectedChildComponentIds?.some((id) => id === child.id) }]"
							:item-data="child"
							:item-index="idx"
							fromFFTPage
							:rpm_source_value="currentRpmSource && currentRpmSource.value"
							:savingInProgress="savingInProgress"
							@event="handleEvent"
							@save="handleSaveForm({ clearSelectedChildComponentsOnCharts: true })"
						/>
					</div>
				</div>
			</div>
		</div>

		<el-dialog
			v-if="initiatedOptionValuesDialog"
			v-model="showOptionValuesDialog"
			append-to-body
			top
			class="small dialog-decorate-header title-center fft-analysis-values-dialog"
			title="Characteristics"
		>
			<div class="options-container">
				<div v-if="preparedTypeOptionValueItems.length" class="content-row">
					<TypeOptionValueItem
						v-for="(option, idx) in preparedTypeOptionValueItems"
						:key="`va-${option.equipment_type_option_id}`"
						:ref="(el) => setOptionRef(el, idx)"
						:item-data="option"
						:item-index="idx"
					/>
				</div>
			</div>
			<div class="dialog-footer dialog-decorate-footer text-center">
				<el-button type="primary" class="uppercase semi-bold" @click="handleSaveForm">
					{{ tt('Save') }}
				</el-button>

				<el-button class="uppercase semi-bold" @click="showOptionValuesDialog = false">
					{{ tt('Cancel') }}
				</el-button>
			</div>
		</el-dialog>

		<el-dialog
			v-if="initiatedRPMDialog"
			v-model="showRpmSettingsDialog"
			append-to-body
			top
			class="tiny dialog-decorate-header title-center rpm-settings-dialog"
			:title="`${tt('Machine')} ${tt('speed')}`"
		>
			<SimpleSpinner :active="loadingRPM" />

			<RPMSettingsDialog
				v-if="showRpmSettingsDialog"
				:sensorData="sensorData"
				:currentRpmSource="currentRpmSource"
				:fftItem="fftItem"
				:rootFilters="rootFilters"
				@save="saveRpmParams"
				@close="showRpmSettingsDialog = false"
			/>
		</el-dialog>
	</div>
</template>

<script setup>
import { computed, ref } from 'vue';

import { Lang } from '@/localization';
import { findItemBy } from '@/helpers';
import { getCurrentRpmSource } from '@/helpers/specialHelpers';
import { useEventHandler } from '@/composables/mixins/useEmitter';
import { useSensors } from '@/composables/useSensors';

import SimpleSpinner from '@/components/common/SimpleSpinner.vue';
import ChildComponentItem from './ChildComponentItem.vue';
import RPMSettingsDialog from '@/views/Sensors/FilterBlock/RPMSettingsDialog.vue';
import TypeOptionValueItem from './TypeOptionValueItem.vue';

const { tt } = Lang;
const { sendRpm, setFftRpmParams } = useSensors();

defineOptions({
	name: 'AnalysisFFTContainer',
});

const props = defineProps({
	fftItem: { type: Object, required: true },
	itemData: { type: Object, required: true },
	sensorData: { type: Object, required: true },
	selectedChildComponentIds: { type: Array, default: () => [] },
	rootFilters: { type: Object, default: () => ({}) },
});

const emit = defineEmits(['event', 'save']);
const showRpmSettingsDialog = ref(false);
const initiatedRPMDialog = ref(false);
const loadingRPM = ref(false);
const initiatedOptionValuesDialog = ref(false);
const showOptionValuesDialog = ref(false);
const savingInProgress = ref(false);
const optionRefs = ref([]);

const currentRpmSource = computed(() =>
	getCurrentRpmSource({
		fftItem: props.fftItem,
		sensorData: props.sensorData,
		rpm_source_item: props.itemData.rpm_source_item,
		rootFilters: props.rootFilters,
	}),
);
const brandModelTypeOptionValues = computed(() => props.itemData.brandModel?.type_option_values || props.itemData.type_option_values || []);
const brandModelTypeOptionValuesVisible = computed(() =>
	brandModelTypeOptionValues.value.filter((item) => item.is_visible_in_vibration_analysis),
);
const preparedTypeOptionValueItems = computed(() =>
	brandModelTypeOptionValues.value.map((item) => ({
		...item,
		is_visible_in_vibration_analysis: item.is_visible_in_vibration_analysis || 0,
	})),
);
const preparedChildComponentsItems = computed(() =>
	(props.itemData.child_components || []).map((child) => {
		const override = findItemBy('id', child.id, props.fftItem.child_components || []);
		return {
			...child,
			...(override || {}),
		};
	}),
);

const setOptionRef = (el, idx) => {
	if (el) optionRefs.value[idx] = el;
};
const showOptionValues = () => {
	initiatedOptionValuesDialog.value = true;
	showOptionValuesDialog.value = true;
};
const showRpmSettings = () => {
	initiatedRPMDialog.value = true;
	showRpmSettingsDialog.value = true;
};
const handleSaveForm = (options = {}) => {
	const optionValues = optionRefs.value.map((item) => item?.collectData?.()).filter(Boolean);
	emit('save', {
		option_values: optionValues,
		...options,
	});
	showOptionValuesDialog.value = false;
};
const saveRpmParams = (data) => {
	if (!props.sensorData.id) return;

	loadingRPM.value = true;
	const request = data.isFFTRPM
		? setFftRpmParams({
				sensorId: props.sensorData.id,
				fftId: props.fftItem.id,
				data,
			})
		: sendRpm({
				sensorId: props.sensorData.id,
				data,
			});

	request
		.then(() => {
			showRpmSettingsDialog.value = false;
			emit('event', {
				eventName: 'rpmParamsSaved',
				data,
				onward: true,
			});
		})
		.finally(() => {
			loadingRPM.value = false;
		});
};

const { handleEvent } = useEventHandler({}, emit);
</script>
