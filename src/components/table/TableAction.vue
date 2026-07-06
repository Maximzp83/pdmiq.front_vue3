<template>
	<div
		v-if="actionIsActive"
		:class="['table-action-container', action.containerClassName || '']"
	>
		<span
			v-if="action.prefixContent"
			:class="action.prefixContent.className || ''"
			v-html="action.prefixContent.html"
			@click="
				action.prefixContent.action
					? executeAction(action.prefixContent.action)
					: () => {}
			"
		>
		</span>
		<ElPopover
			:disabled="action.disablePopover"
			:placement="action.popoverPlacement || 'bottom'"
			:popper-class="`button-popover ${action.tool_tip_class || ''}`"
			:title="action.tooltip_text ? action.tooltip_text : 'additional action'"
			trigger="hover"
			:width="90"
			:close-delay="0"
		>
			<template #reference>
				<a
					v-if="action.linkSettings"
					:href="preparedLink.href"
					:target="action.target || ''"
					:class="[
						action.className || action.type || 'el-button el-button--primary inverted'
					]"
					@click.prevent="executeLink()"
				>
					<DynamicComponentWrapper
						v-if="action.buttonContent"
						ref="actionButtonContent"
						:propsData="rowData"
						:additionalProps="action"
						:componentFileLoader="action.buttonContent.component.componentFileLoader"
						@event="handleEvent"
					/>
					<span v-else-if="preparedLink.label">{{ preparedLink.label }}</span>
					<i v-if="action.icon" :class="action.icon"></i>
				</a>

				<ElButton
					v-else
					:disabled="action.isDisabled"
					:class="['action-button', legacyTypeClass, action.className || '']"
					:loading="isProccessing"
					:size="buttonSize || 'small'"
					:type="buttonType"
					:icon="elButtonIcon"
					@click="executeAction"
				>
					<DynamicComponentWrapper
						v-if="action.buttonContent"
						ref="actionButtonContent"
						:propsData="rowData"
						:additionalProps="action"
						:componentFileLoader="action.buttonContent.component.componentFileLoader"
						@event="handleEvent"
					/>

					<img v-else-if="action.img" class="button-image" :src="action.img" />
					<i v-else-if="useCssIcon" :class="action.icon" />
					<img v-if="action.second_img" class="button-image" :src="action.second_img" />
					<span v-if="actionButtonText">{{ actionButtonText }}</span>
				</ElButton>
			</template>

			<DynamicComponentWrapper
				v-if="action.popoverContent"
				ref="actionPopoverContent"
				:propsData="rowData"
				:additionalProps="action"
				:componentFileLoader="action.popoverContent.component.componentFileLoader"
			/>
		</ElPopover>
	</div>
</template>

<script setup>
import { computed, defineAsyncComponent } from 'vue';
import { ElButton, ElPopover } from 'element-plus';
import { getObjectVal, validateBySettings } from '@/helpers';
import { useNavigation } from '@/composables/mixins/useNavigation';
import { useGlobalStore } from '@/stores/GlobalStore';

const DynamicComponentWrapper = defineAsyncComponent(
	() => import('../common/DynamicComponentWrapper.vue')
);

const props = defineProps({
	rowData: {
		type: null,
		default: null,
	},
	rowIndex: {
		type: Number,
		default: 0,
	},
	action: {
		type: Object,
		required: true,
	},
	isProccessing: {
		type: Boolean,
		default: false,
	},
	buttonSize: {
		type: String,
		default: 'small',
	},
});

const emit = defineEmits(['event']);

const { changeRoute } = useNavigation();
const globalStore = useGlobalStore();
const validButtonTypes = new Set(['default', 'primary', 'success', 'warning', 'info', 'danger', 'text', '']);

const buttonType = computed(() => {
	const type = props.action.type || '';
	return validButtonTypes.has(type) ? type : '';
});

const legacyTypeClass = computed(() => {
	const type = props.action.type || '';
	return type && !validButtonTypes.has(type) ? type : '';
});

const preparedLink = computed(() => {
	const { action, rowData } = props;
	if (action.linkSettings) {
		let result = { href: '', label: action.label || '', route: '' };

		const {
			linkHrefProp,
			linkTextProp,
			linkRoute,
			linkTextValue,
			emptyValueText,
		} = action.linkSettings;

		if (linkHrefProp) {
			result.href = getObjectVal(rowData, linkHrefProp);
		} else if (linkRoute) {
			const route_elements = linkRoute.split('/');
			route_elements.forEach((re) => {
				result.route += '/';
				const element_params = re.split(':');

				if (element_params.length > 1) {
					result.route += `${element_params[0]}${getObjectVal(
						rowData,
						element_params[1]
					)}`;
				} else {
					result.route += re;
				}

				result.href = result.route;
			});
		}

		if (linkTextProp) {
			result.label = getObjectVal(rowData, linkTextProp);
			if (!result.label && emptyValueText) result.label = emptyValueText;
		} else if (linkTextValue) {
			result.label = linkTextValue;
		}

		return result;
	}
	return null;
});

const actionIsActive = computed(() => {
	const { action, rowData } = props;
	if (action.conditionSettings) {
		return validateBySettings({
			...action.conditionSettings,
			dataObj: rowData,
		});
	}

	return true;
});

const actionButtonText = computed(() => {
	const { action, rowData } = props;

	if (action.button_text) {
		return action.button_text;
	} else if (action.button_text_prop) {
		return getObjectVal(rowData, action.button_text_prop);
	}
	return '';
});

const useCssIcon = computed(() => {
	const icon = props.action?.icon;
	return typeof icon === 'string' && /\s/.test(icon);
});

const elButtonIcon = computed(() => {
	return useCssIcon.value ? undefined : props.action?.icon;
});

const executeLink = () => {
	const { action } = props;
	if (!action.useHref && preparedLink.value.route) {
		changeRoute({ path: preparedLink.value.route });
	} else if (preparedLink.value.href) {
		const link = document.createElement('a');
		link.href = preparedLink.value.href;
		link.target = '_blank';
		link.click();
	}

	if (action.forceRerender) {
		globalStore.forceRerender(action.forceRerender);
	}
};

const executeAction = (settings = {}) => {
	const data = {
		...props.action,
		index: props.rowIndex,
		row: props.rowData,
	};

	emit('event', {
		eventName: settings.actionName || props.action.name,
		data: { ...data, ...settings },
		onward: true,
	});
};

const handleEvent = (event) => {
	emit('event', event);
};
</script>
