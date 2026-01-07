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
		<el-popover
			:disabled="action.disablePopover"
			:placement="action.popoverPlacement || 'bottom'"
			:popper-class="`button-popover ${action.tool_tip_class || ''}`"
			:title="action.tooltip_text ? action.tooltip_text : 'additional action'"
			trigger="hover"
			width="90"
			:close-delay="0"
		>
			<a
				v-if="action.linkSettings"
				slot="reference"
				:href="preparedLink.href"
				:target="action.target || ''"
				@click.prevent="executeLink()"
				:class="[
					action.className || action.type || 'el-button el-button--primary inverted'
				]"
			>
				<DynamicComponentWrapper
					@event="handleEventNew"
					ref="actionButtonContent"
					v-if="action.buttonContent"
					:propsData="rowData"
					:additionalProps="action"
					:componentPath="action.buttonContent.component.componentPath"
				/>
				<span v-else-if="preparedLink.label">{{ preparedLink.label }}</span>
				<i v-if="action.icon" :class="action.icon"></i>
			</a>

			<el-button
				v-else
				:disabled="action.isDisabled"
				slot="reference"
				:class="['action-button', action.className || '']"
				@click="executeAction"
				:loading="isProccessing"
				:size="buttonSize || 'mini'"
				:type="action.type"
				:icon="action.icon"
			>
				<DynamicComponentWrapper
					@event="handleEventNew"
					ref="actionButtonContent"
					v-if="action.buttonContent"
					:propsData="rowData"
					:additionalProps="action"
					:componentPath="action.buttonContent.component.componentPath"
				/>

				<img class="button-image" v-else-if="action.img" :src="action.img" />
				<img class="button-image" v-if="action.second_img" :src="action.second_img" />
				<span v-if="actionButtonText">{{ actionButtonText}}</span>
			</el-button>

			<DynamicComponentWrapper
				ref="actionPopoverContent"
				v-if="action.popoverContent"
				:propsData="rowData"
				:additionalProps="action"
				:componentPath="action.popoverContent.component.componentPath"
			/>
		</el-popover>
	</div>
</template>

<script>
// import { isEmptyString } from '@/utils/validate';
import { getObjectVal, validateBySettings } from '@/helpers';

import { navigation, eventHandler } from '@/mixins';

export default {
	mixins: [navigation(), eventHandler()],
	components: {
		DynamicComponentWrapper: () => import('../common/DynamicComponentWrapper.vue')
	},
	props: {
		rowData: null,
		rowIndex: Number,

		// tableSettings: {	type: Object, required: true },
		action: { type: Object, required: true },
		// actionContainerClass: String,
		// className: String,
		isProccessing: Boolean,
		buttonSize: String
	},

	computed: {
		/*cellValue() {
			return getCellValue(this.rowData, this.column, this.rowIndex)
		}*/
		preparedLink() {
			const { action, rowData } = this;
			if (action.linkSettings) {
				let result = { href: '', label: action.label || '', route: '' };

				const {
					linkHrefProp,
					linkTextProp,
					linkRoute,
					linkTextValue,
					emptyValueText
				} = action.linkSettings;

				if (linkHrefProp) {
					result.href = getObjectVal(rowData, linkHrefProp);
					// console.log(result.href)
				} else if (linkRoute) {
					const route_elements = linkRoute.split('/');
					route_elements.forEach(re => {
						result.route += '/';
						const element_params = re.split(':');
						// console.log(re, element_params)

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
			// console.log('----------------')
			return null;
		},

		actionIsActive() {
			const { action, rowData } = this;
			if (action.conditionSettings) {
				return validateBySettings({
					// data_value: cellValue,
					...action.conditionSettings,
					dataObj: rowData
				});
			}

			return true;
		},

		actionButtonText() {
			const { action, rowData } = this;
			
			if (action.button_text) {
				return action.button_text;
			} else if (action.button_text_prop) {
				return getObjectVal(rowData, action.button_text_prop);
			}
			return '';
		}
	},

	/*data() {
		return {
			// hasError: false
		};
	},*/

	methods: {
		executeLink() {
			const { action, preparedLink } = this;
			if (!action.useHref && preparedLink.route) {
				this.changeRoute({ path: preparedLink.route });
			} else if (preparedLink.href) {
				const link = document.createElement('a');
				link.href = preparedLink.href;
				link.target = '_blank';
				// console.log(link)
				link.click();
			}

			if (action.forceRerender) {
				this.$store.dispatch('forceRerender', action.forceRerender);
			}
		},

		executeAction(settings = {}) {
			const data = {
				...this.action,
				index: this.rowIndex,
				row: this.rowData
				// payload: payload
			};

			// console.log({...data, ...settings})

			// if (this.validateOnClickSettings(row, onClickSettings)) {
			this.$emit('event', {
				eventName: settings.actionName || this.action.name,
				data: { ...data, ...settings },
				onward: true
			});
			// }
		}
	}
};
</script>
