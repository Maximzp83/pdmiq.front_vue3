<template>
	<div>
		<div class="card-header filled">
			<h2 class="tilte page-title text-center bold">
				{{ tt('phrases.forgot_password') }}?
			</h2>
		</div>

		<div class="card-content">
			<div class="standard-form">
				<div class="form-row">
					<el-input type="email" v-model="formData.email" placeholder="email">
						<template #prefix>
							<i class="icomoon icon-envelope" />
						</template>
					</el-input>
				</div>

				<div class="submit-button-container text-center">
					<el-button
						@click="handleSubmit"
						type="primary"
						:loading="isLoading"
						class="semi-bold mcol-xs-12"
					>
						Send
					</el-button>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useAuthStore } from '@/stores/AuthStore';
import { Lang } from '@/localization';

const authStore = useAuthStore();

const { tt } = Lang;

// Data
const isLoading = ref(false);

const formData = reactive({
	email: ''
});

// Methods
const handleSubmit = () => {
	const data = { ...formData };

	isLoading.value = true;

	authStore.forgotPassword(data)
		.then(() => {
			// Success handling is done in the store
		})
		.catch((error) => {
			// Error handling is done in the store
		})
		.finally(() => {
			isLoading.value = false;
		});
};
</script>
