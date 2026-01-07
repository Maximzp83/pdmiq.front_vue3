<template>
	<div class="work-order-details-item card content-row">
		<div class="card-header filled_2 flex">
			<div class="semi-bold uppercase">{{ title }}</div>
			<div class="ml-auto button-item" v-if="headerButtons">
				<el-button
					v-for="button in headerButtons"
					:key="`hbutton-${button.id}`"
					@click="event(button.event, button.args)"
					native-type="button"
					type="primary"
					:class="['item-action-button', button.className]"
				>
					<i v-if="button.icon" :class="[button.icon]"></i>
					<span>{{ button.text }}</span>
				</el-button>
			</div>
		</div>

		<div class="card-content flex top">
			<div class="header-block flex align-center " v-if="progress !== undefined">
				<div class="step-number bold span-block">
					<span>{{ progress }}</span>
				</div>
			</div>

			<div class="content-row content-block mcol-xs-6">
				<div
					class="details-row "
					v-for="item in detailsList"
					:key="`row-${item.id}`"
				>
					<div class="label " v-text="item.label"></div>
					<div v-if="item.buttons" class=" semi-bold">
						<div v-if="item.buttons.length">
							<el-button
								v-for="(button, idx) in item.buttons"
								:key="`button-${idx}`"
								:class="button.className"
								@click="handleButtonAction(button)"
								:type="button.type"
								:icon="button.icon"
								>{{ button.text }}</el-button
							>
						</div>
						<span v-else>-</span>
					</div>

					<div
						v-else-if="item.values"
						v-for="(value_item_settings, idx) in item.values"
						:key="`value-${idx}`"
						class="flex mrow"
					>
						<div
							v-for="setting_item in value_item_settings"
							:key="`value-${setting_item.id}`"
						>
							<div class="label " v-text="setting_item.label"></div>
							<div class="semi-bold" v-html="setting_item.value"></div>
						</div>
					</div>

					<div v-else class="semi-bold" v-html="item.value"></div>
				</div>

				<div class="FormOperationsButtons" v-if="actionButtons.length">
					<el-button
						v-for="item in actionButtons"
						:key="`button-${item.id}`"
						@click="event(item.event, item.args)"
						native-type="button"
						type="primary"
						:class="['item-action-button', item.className]"
					>
						<span>{{ item.text }}</span>
					</el-button>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
// import { required } from '@/constants/validation';
// import { dynamicItemFormMixin } from '@/mixins';
import { getCellValue } from '@/helpers';

export default {
	// mixins: [dynamicItemFormMixin],
	props: {
		orderData: { type: Object, required: true },
		settings: { type: Array, required: true },
		progress: Number,
		title: String,

		actionButtons: {
			type: Array,
			default: () => []
		},

		headerButtons: Array
	},

	data() {
		return {};
	},

	computed: {
		access_token() {
			return this.$store.state.auth.access_token;
		},
		// getObjectVal: () => getObjectVal,
		detailsList() {
			return this.settings.map(si => {
				const { meta } = si;
				let item = {
					...si,
					value: getCellValue(this.orderData, si)
				};

				if (meta) {
					if (meta.isAttachment) {
						const files = item.value;
						let buttons = [];

						files.forEach(fi => {
							let pathArray = fi.file_path.split('/');
							let filename = pathArray[pathArray.length - 1];
							buttons.push({
								...si.buttonSettings,
								filename: filename,
								fullPath: fi.file_path,
								text: filename
							});
						});

						item.buttons = buttons;
					} else if (meta.isArray) {
						item.values = item.value.map(vi => {
							// console.log(item, vi)
							return meta.isArray.map(vis => {
								return {
									...vis,
									value: getCellValue(vi, vis)
								};
							});
						});
					}
				}

				return item;
			});
		}
	},

	methods: {
		event(name, data) {
			this.$emit('event', name, data);
		},

		handleButtonAction(button) {
			this[button.action](button);
		},

		downloadFile({ filename, fullPath }) {
			// console.log(filename, fullPath)
			// link.href = 'data:png/image;base64,'+fullPath;
			const link = document.createElement('a');
			link.href = fullPath;
			link.download = filename;
			link.target = '_blank';
			link.click();
		}
	}
};
</script>
