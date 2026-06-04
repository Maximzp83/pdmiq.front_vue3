<template>
	<div class="section-row">
		<div class="content-row card view-content-card">
			<div class="card-header">
				<el-button type="primary" native-type="button" class="item-action-button" @click="handleSaveFormulas">
					<span>Save {{ itemsName.mult }}</span>
				</el-button>
			</div>
			<div class="card-content">
				<FormulasForm ref="formulasFormRef" />
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, ref } from 'vue';

import { Lang } from '@/localization';
import FormulasForm from './FormulasForm.vue';

const { tt } = Lang;

defineOptions({
	name: 'CustomFormulasTab',
});

const formulasFormRef = ref(null);

const itemsName = computed(() => ({
	one: tt('Custom_formula'),
	mult: tt('Custom_formulas'),
}));

const handleSaveFormulas = () => {
	formulasFormRef.value?.handleSubmit?.();
};
</script>
