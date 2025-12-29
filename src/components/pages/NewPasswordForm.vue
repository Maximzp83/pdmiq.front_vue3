<template>
	<div>
		<div class="card-header filled">
			<h2 class="tilte page-title text-center bold">
				{{ tt('phrases.enter_your_password') }}
			</h2>
		</div>

		<div class="card-content">
			<el-form class="standard-form relative" :model="formData">
				<SimpleSpinner :active="isLoading" />

				<div class="form-row">
					<PasswordCheckList
						:show="showPassTooltip"
						:password="formData.password"
						:equalsToAccountName="equalsToAccountName"
					>
						<el-input
							@focus="showPassTooltip = true"
							@blur="showPassTooltip = false"
							v-model="formData.password"
							placeholder="password"
							type="password"
							show-password
							name="new-password"
							autocomplete="new-password"
						>
							<template #prefix>
								<i class="icomoon icon-lock" />
							</template>
						</el-input>
					</PasswordCheckList>
				</div>

				<div class="form-row">
					<el-input
						v-model="formData.password_confirmation"
						placeholder="repeat password"
						type="password"
						show-password
					>
						<template #prefix>
							<i class="icomoon icon-lock" />
						</template>
					</el-input>
				</div>

				<div class="submit-button-container text-center">
					<el-button
						type="primary"
						@click="handleSubmit"
						:loading="isLoading"
						class="semi-bold mcol-xs-12"
					>
						Send
					</el-button>
				</div>
			</el-form>
		</div>
	</div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElNotification } from 'element-plus';
import { useAuth } from '@/composables/useAuth';
import { isPasswordStrong } from '@/helpers/specialHelpers';
import { getParamsFromUrl } from '@/utils/url-helpers';
import { Lang } from '@/localization';
import PasswordCheckList from './PasswordCheckList.vue';
import SimpleSpinner from '@/components/common/SimpleSpinner.vue';

const route = useRoute();
const router = useRouter();
const { passwordReset, checkPasswordToken } = useAuth();

const tt = (key) => Lang.tt(key);

// Data
const isLoading = ref(false);
const showPassTooltip = ref(false);
const email = ref('');

const formData = reactive({
	token: '',
	password: '',
	password_confirmation: ''
});

// Computed
const equalsToAccountName = computed(() => {
	return email.value === formData.password;
});

// Methods
const handleSubmit = async () => {
	let data = { ...formData };
	data.password = data.password.trim();
	data.password_confirmation = data.password_confirmation.trim();

	if (isPasswordStrong(data.password).isStrong && !equalsToAccountName.value) {
		if (data.password === data.password_confirmation) {
			try {
				await passwordReset(data);
				router.push('/login');
			} catch (error) {
				// Error handling is done in the composable
			}
		} else {
			ElNotification({
				type: 'warning',
				title: Lang.t('Warning'),
				message: Lang.t('aliases.passwords_compar_error'),
				duration: 0
			});
			return false;
		}
	} else {
		ElNotification({
			type: 'warning',
			title: Lang.t('Warning'),
			message: Lang.t('aliases.password_validation'),
			duration: 0
		});
		return false;
	}
};

const checkToken = async ({ token, email: emailParam }) => {
	const data = { token };
	isLoading.value = true;

	try {
		await checkPasswordToken(data);
		formData.token = token;
		email.value = emailParam;
	} catch (error) {
		if (error.response?.status === 422) {
			ElNotification({
				type: 'warning',
				title: Lang.t('Warning'),
				message: Lang.t('aliases.creation_link_exp'),
				dangerouslyUseHTMLString: true,
				duration: 0
			});
			router.push('/login/password/forgot');
		}
	} finally {
		isLoading.value = false;
	}
};

// Lifecycle
onMounted(() => {
	const { email: emailParam } = getParamsFromUrl(route.fullPath);
	const { token } = route.params;

	if (token) {
		checkToken({ token, email: emailParam });
	}
});
</script>
