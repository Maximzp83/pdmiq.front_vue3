<template>
	<div
		:class="[
			{ card: settings.card },
			'radio-container',
			{ group: settings.group },
			settings.blockClassName
		]"
	>
		<div
			v-if="!settings.hideTitle && settings.title"
			class="card-header capitalize bold article-title"
			v-text="settings.title"
		/>
		<div :class="[{ 'card-content': settings.card }]">
			<div :class="['content-container', { 'mrow flex': settings.inline }, {'wrap': !settings.disableInlineWrap}]">
				<div
					:class="['radio-item']"
					v-for="(item, idx) in optionsList"
					:key="`${settings.title}-${idx}`"
				>
					<el-button
						native-type="button"
						:type="settings.buttonType"
						:class="[settings.className, { [activeKey]: isActive(item) }]"
						@click="switchItem(item)"
					>
						<!-- {{ toConsole(value === item.value) }} -->
						<span
							v-if="settings.className == 'radio-input'"
							class="radio-input-icon"
						></span>
						<span
							v-else-if="settings.isCheckbox"
							:class="['el-checkbox__input', { 'is-checked': isActive(item) }]"
						>
							<span class="el-checkbox__inner"></span>
						</span>
						<span
							v-if="!settings.hideLabel"
							:class="[
								'label capitalize',
								{ 'el-checkbox__label': settings.isCheckbox }
							]"
							v-html="item.name || item.title"
						/>

						<span v-if="settings.icon || item.icon" class="icon-block">
							<i :class="`icomoon ${item.icon || item.icon}`" />
						</span>
					</el-button>

					<span
						v-if="item.hasInput && settings.valueAsObject"
						class="additional-info-cell"
					>
						<CustomInput 
							class="mini additional-input-cell"
							v-if="isActive(item)"
							v-model="value[settings.valueAsObject.valueKey]"
						/>
						<span
							v-else
							class="additional-info-cell"
							v-html="item[settings.valueAsObject.valueKey]"></span>					
					</span>

					<span
						v-else-if="settings.additionalInfoKey"
						class="additional-info-cell"
						v-html="item[settings.additionalInfoKey]"></span>					
				</div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	props: {
		settings: {
			type: Object,
			required: true
		},
		optionsList: {
			type: Array,
			required: true
		},
		value: null,
		alwaysSwitch: Boolean
		// useValue: Boolean
	},

	computed: {
		activeKey: that => (that.settings.isCheckbox ? 'is-checked' : 'active'),
		valueAsObject: that => that.settings.valueAsObject,
		valueAsArray: that => that.settings.valueAsArray
	},

	methods: {
		isActive(item) {
			if (this.valueAsObject) {
				if (this.valueAsObject.isActiveKey) {
					return this.value[this.valueAsObject.isActiveKey] == item[this.valueAsObject.isActiveKey];
				}

				let value = {};
				this.valueAsObject.props.forEach(prop => {
					value[prop] = item[prop];
				});
				// console.log(JSON.stringify(value) == JSON.stringify(this.value))
				return JSON.stringify(value) == JSON.stringify(this.value);
			} else if (this.valueAsArray) {
				return this.value.some(val => val === item.id);
			} else {
				return this.value === item.id;
			}

			// return this.value === ( this.useValue ? item : item.id )
		},

		switchItem(item) {
			let selected_id = null;
			let selected_value;

			// const selected_value = this.valueAsObject ? item : item.id;
			if (this.valueAsObject) {
				selected_value = {};
				this.valueAsObject.props.forEach(prop => {
					selected_value[prop] = item[prop];
				});
			} else if (this.valueAsArray) {
				selected_value = [...this.value];

				if (selected_value.includes(item.id)) {
					selected_value = selected_value.filter(val => val !== item.id);
				} else {
					selected_value.push(item.id);					
				}
				this.$emit('input', selected_value);
				this.$emit('onChange', selected_value);
				return;
			}	else {
				selected_value = item.id;
			}

			if (this.settings.clearable) {
				// console.log(selected_value , this.value)
				if (this.valueAsObject) {
					if (JSON.stringify(selected_value) != JSON.stringify(this.value)) {
						selected_id = selected_value;
					}
				} else if (selected_value !== this.value) {
					selected_id = selected_value;
				}
			} else {
				selected_id = selected_value;
			}
			// console.log(item, selected_id, this.value)
			if (selected_id != this.value || this.settings.alwaysSwitch) {
				this.$emit('input', selected_id);
				this.$emit('onChange', selected_id);
			}
		},

		setupAdditionalInput() {

		}
	}
};
</script>
