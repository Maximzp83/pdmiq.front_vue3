<template>
	<div class="section-row">
		<div class="content-row card view-content-card">
			<div class="card-content">
				<ItemForm />
			</div>
		</div>
	</div>
</template>

<script setup>
import ItemForm from './ItemForm.vue';

defineOptions({
	name: 'BackEndRegistersTab',
});
</script>
