<template>
	<div
		ref="containerRef"
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
					<template #reference>
						<el-button
							:disabled="(disableTabs || tab.disabled) && !customDisable"
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
								:class="['imgpostfix_img span-block']"
							/>

							<span
								v-if="tab.postfix_data"
								:class="tab.postfix_data.className"
								v-html="tab.postfix_data.html"
							>
							</span>
						</el-button>
					</template>
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
			>
				<i class="icomoon icon-path_2"></i>
			</el-button>

			<el-button
				v-show="showNextButton"
				@click="scroll(-1)"
				type="primary"
				native-type="button"
				class="next-button"
			>
				<i class="icomoon icon-path_2"></i>
			</el-button>
		</div>
	</div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, nextTick } from 'vue';
import { useGlobalStore } from '@/stores/GlobalStore';

const props = defineProps({
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
});

const emit = defineEmits(['switchTab']);

const globalStore = useGlobalStore();

// Data
const isInitialSetup = ref(true);
const current_scroll = ref(0);
const fullScrollWidth = ref(0);
const containerWidth = ref(0);
const scrollPath = ref(0);
const containerRef = ref(null);

const scrollStyles = reactive({
	transform: `translateX(${0}px)`
});

// Computed
const globalTabsList = computed(() => globalStore.globalTabsList);
const globalActiveTab = computed(() => globalStore.globalActiveTab);

const resultTabsList = computed(() => {
	return props.tabsList || globalTabsList.value || [];
});

const showPrevButton = computed(() => {
	return Math.abs(current_scroll.value) > 0;
});

const showNextButton = computed(() => {
	return Math.abs(current_scroll.value) < scrollPath.value;
});

// Methods
const switchTab = (tab) => {
	globalStore.set_value('globalActiveTab', tab.prop);
};

const toggleTab = (tab, disabled) => {
	if (!disabled) {
		if (props.tabsList) {
			if (tab.prop !== props.activeTab.prop) {
				emit('switchTab', tab);
			}
		} else if (tab.prop !== globalActiveTab.value.prop) {
			switchTab(tab);
		}
	}
};

const scroll = (dir) => {
	let val = containerWidth.value * dir;
	let newScroll = current_scroll.value + val;

	if (Math.abs(newScroll) >= scrollPath.value) {
		newScroll = -scrollPath.value;
	} else if (newScroll >= 0) {
		newScroll = 0;
	}

	scrollStyles.transform = `translateX(${newScroll}px)`;
	current_scroll.value = newScroll;
};

const setupScroll = () => {
	const container = containerRef.value;
	if (!container) return;

	const tabsBar = container.firstElementChild;
	if (props.height) {
		container.style.height = `${props.height}px`;
	}

	containerWidth.value = container.clientWidth;
	fullScrollWidth.value = tabsBar.clientWidth;
	scrollPath.value = fullScrollWidth.value - containerWidth.value;
};

// Watchers
watch(() => props.tabsList, (list) => {
	if (
		props.initialAutoSelect !== undefined &&
		isInitialSetup.value &&
		list.length
	) {
		toggleTab(list[props.initialAutoSelect]);
		isInitialSetup.value = false;
	}
});

// Lifecycle
onMounted(() => {
	// Auto-select first tab if needed
	if (props.tabsList && props.tabsList.length && !props.activeTab?.prop) {
		emit('switchTab', props.tabsList[0]);
	} else if (!globalActiveTab.value?.prop && globalTabsList.value.length) {
		switchTab(globalTabsList.value[0]);
	}

	// Setup scroll functionality
	if (props.withScroll && props.tabsList && props.tabsList.length) {
		nextTick(() => {
			setTimeout(() => {
				setupScroll();
			}, 500);
		});
	}
});
</script>
