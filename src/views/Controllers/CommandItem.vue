<template>
	<div class="card relative">
		<SimpleSpinner :active="isProcessing" />

		<div class="card-header filled uppercase bold">{{ itemData.title }}</div>

		<div class="card-content moderate-paddings">
			<el-form-item
				:class="['content-row', { showJustInfo: isPreInstalled }]"
				:label="tt('Command')"
				prop="message_body"
			>
				<CustomInput
					v-model="messageBody"
					:placeholder="`${tt('input')} ${tt('command')}`"
				/>
			</el-form-item>

			<div
				v-if="itemData.dxm_response !== undefined"
				class="content-row showJustInfo"
			>
				<div class="el-form-item__label">{{ tt('Response') }}</div>
				<div class="value-instead-input el-form-item__content bold">
					<div class="value" v-text="dxmResponse"></div>
				</div>
			</div>

			<div class="content-row flex">
				<el-button
					type="primary"
					native-type="button"
					class="item-action-button mcol-xs-6"
					@click="handleSend"
				>
					<span class="uppercase">{{ tt('Send') }}</span>
				</el-button>

				<el-button
					v-if="!isPreInstalled"
					class="item-action-button mcol-xs-6"
					native-type="button"
					@click="handleClear"
				>
					<span class="uppercase">{{ tt('Clear') }}</span>
				</el-button>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';

import { Lang } from '@/localization';

import SimpleSpinner from '@/components/common/SimpleSpinner.vue';

const { tt } = Lang;

defineOptions({
	name: 'ControllerCommandItem',
});

const props = defineProps({
	isProcessing: Boolean,
	itemData: { type: Object, required: true },
});

const emit = defineEmits(['onSend']);

const messageBody = ref(props.itemData.message_body || '');
const dxmResponse = ref(props.itemData.dxm_response || '');

const isPreInstalled = computed(() => props.itemData.isPreInstalled);

const handleSend = () => {
	emit('onSend', messageBody.value);
};

const handleClear = () => {
	messageBody.value = '';
};

watch(
	() => props.itemData.dxm_response,
	(response) => {
		dxmResponse.value = response || '';
	}
);

watch(
	() => props.itemData.message_body,
	(message) => {
		messageBody.value = message || '';
	}
);
</script>
