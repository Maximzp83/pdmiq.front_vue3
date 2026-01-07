<template>
	<div
		:class="[
			'small nav-tabs-container',
			{ card: card, withScroll: withScroll },
			className
		]"
		v-if="resultTabsList"
	>
		<div :class="['main-group', { 'card-content': card }]" :style="scrollStyles">
			<span
				:class="{ fluid: stretch }"
				v-for="(tab, idx) in resultTabsList"
				:key="`${idx}-navtab_${tab.title}`"
			>
				<el-popover
					:disabled="!tab.popover || tab.popover.disabled"
					:placement="tab.placement || 'bottom'"
					popper-class="button-popover"
					:title="tab.popover ? tab.popover.text : ''"
					trigger="hover"
					width="120"
				>
					<el-button
						:disabled="(disableTabs || tab.disabled) && !customDisable"
						slot="reference"
						v-if="!tab.hide"
						:type="buttonsType"
						:class="[
							'capitalize',
							buttonsClass,
							{ active: tab.prop == activeTab.prop || tab.prop == globalActiveTab },
							{ 'custom-disabled': (disableTabs || tab.disabled) && customDisable }
						]"
						:round="!notRound"
						@click="toggleTab(tab, disableTabs || tab.disabled)"
					>
						<i
							v-if="tab.prefix_icon"
							:class="['icon prefix_icon span-block', tab.prefix_icon]"
						/>
						<img
							v-if="tab.prefix_img"
							:src="tab.prefix_img"
							:class="['img prefix_img span-block']"
						/>

						<span class="span-block">{{ tab.title }}</span>

						<i v-if="tab.icon" :class="['icon postfix_icon span-block', tab.icon]" />
						<img
							v-if="tab.postfix_img"
							:src="tab.postfix_img"
							:class="[' imgpostfix_img span-block']"
						/>

						<span
							v-if="tab.postfix_data"
							:class="tab.postfix_data.className"
							v-html="tab.postfix_data.html"
						>
						</span>
					</el-button>
				</el-popover>
			</span>
		</div>

		<div class="scroll-buttons" v-if="withScroll">
			<el-button
				v-show="showPrevButton"
				@click="scroll(1)"
				type="primary"
				native-type="button"
				class="prev-button"
				icon="icomoon icon-path_2"
			/>

			<el-button
				v-show="showNextButton"
				@click="scroll(-1)"
				type="primary"
				native-type="button"
				class="next-button"
				icon="icomoon icon-path_2"
			/>
		</div>
	</div>
</template>

<script>
export default {
	props: {
		activeTab: Object,
		tabsList: null,
		buttonsType: String,
		disableTabs: Boolean,
		stretch: Boolean,
		notRound: Boolean,
		initialAutoSelect: null,
		card: Boolean,
		withScroll: Boolean,
		customDisable: Boolean,
		className: String,
		buttonsClass: { type: String, default: '' },
		height: null
		/*options: {
			type: Object,
			default: () => ({})
		}*/
	},

	data() {
		return {
			// activeTab: '',
			isInitialSetup: true,

			current_scroll: 0,
			fullScrollWidth: 0,
			containerWidth: 0,
			scrollPath: 0,

			scrollStyles: {
				transform: `translateX(${0}px)`
				// transform: `translateX: ${10}px`
			}
		};
	},

	computed: {
		globalTabsList() {
			return this.$store.state.global.globalTabsList;
		},
		globalActiveTab() {
			return this.$store.state.global.globalActiveTab;
		},

		resultTabsList() {
			return this.tabsList || this.globalTabsList || [];
		},

		showPrevButton() {
			const { current_scroll } = this;
			return Math.abs(current_scroll) > 0;
		},
		showNextButton() {
			const { current_scroll, scrollPath } = this;
			return Math.abs(current_scroll) < scrollPath;
		}
	},

	methods: {
		switchTab(tab) {
			const payload = { stateProp: 'globalActiveTab', value: tab.prop };
			this.$store.dispatch('set_global_state', payload);
		},

		toggleTab(tab, disabled) {
			if (!disabled) {
				const { activeTab, tabsList, globalActiveTab } = this;

				if (tabsList) {
					if (tab.prop !== activeTab.prop) {
						this.$emit('switchTab', tab);
						// this.activeTab.prop = tab.prop;
					}
				} else if (tab.prop !== globalActiveTab.prop) {
					this.switchTab(tab);
				}
			}
		},

		scroll(dir) {
			const { current_scroll, scrollPath, containerWidth } = this;
			let val = containerWidth * dir;
			let newScroll = current_scroll + val;

			if (Math.abs(newScroll) >= scrollPath) {
				newScroll = -scrollPath;
			} else if (newScroll >= 0) {
				newScroll = 0;
			}

			this.scrollStyles.transform = `translateX(${newScroll}px)`;
			this.current_scroll = newScroll;
		},

		setupScroll() {
			const container = this.$el;
			const tabsBar = this.$el.firstElementChild;
			container.style.height = `${this.height}px`;
			// console.log(tabsBar.clientWidth, container.clientWidth, )
			this.containerWidth = container.clientWidth;
			this.fullScrollWidth = tabsBar.clientWidth;
			this.scrollPath = this.fullScrollWidth - this.containerWidth;
		}
	},

	watch: {
		tabsList(list) {
			if (
				this.initialAutoSelect !== undefined &&
				this.isInitialSetup &&
				list.length
			) {
				// console.log('watch tabsList', list[this.initialAutoSelect].prop)
				this.toggleTab(list[this.initialAutoSelect]);
				this.isInitialSetup = false;
			}
		}
	},

	created() {
		// console.log(this.activeTab)
		const { activeTab, tabsList, globalTabsList, globalActiveTab } = this;

		if (tabsList && tabsList.length && !activeTab.prop) {
			this.$emit('switchTab', tabsList[0]);
		} else if (!globalActiveTab.prop && globalTabsList.length) {
			this.switchTab(globalTabsList[0]);
		}
		// console.log('created')
		// this.searchQuery = this.query ? this.query : '';
	},

	mounted() {
		if (this.withScroll && this.tabsList && this.tabsList.length) {
			// this.$el.style.height = `${this.height}px`;
			this.$nextTick(() => {
				setTimeout(() => {
					this.setupScroll();
				}, 500);
			});
			// console.log('1', this, this.height)
		}
	}
};
</script>
