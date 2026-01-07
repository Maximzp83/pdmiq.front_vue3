<template>
	<ul class="">
		<li>
			<el-button :class="['action-button link underline info-color']">
				<span>{{ propsData.parent.serial_number }}</span>
			</el-button>
		</li>
	</ul>
</template>

<script>
export default {
	props: {
		propsData: { type: Object, required: true }
	}
};
</script>
