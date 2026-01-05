<template>
	<el-tooltip
		class=""
		effect="light"
		placement="bottom"
		:manual="true"
		:visible="show"
	>
		<template #content>
			<div class="password-creation-tooltip">
				<div class="title semi-bold">{{ tt('phrases.password_must') }}:</div>
				<ul class="conditions-list">
					<li>
						<div :class="['indicator', passCheckList.hasLowercase ? 'success' : 'error']"></div>
						<div class="text">{{ tt('aliases.pass_req_l_case') }}</div>
					</li>
					<li>
						<div :class="['indicator', passCheckList.hasUppercase ? 'success' : 'error']"></div>
						<div class="text">{{ tt('aliases.pass_req_u_case') }}</div>
					</li>
					<li>
						<div :class="['indicator', passCheckList.hasDigit ? 'success' : 'error']"></div>
						<div class="text">{{ tt('aliases.pass_req_number') }}</div>
					</li>
					<li>
						<div :class="['indicator', passCheckList.hasSpecialChar ? 'success' : 'error']"></div>
						<div class="text">{{ tt('aliases.pass_req_spec_char') }}</div>
					</li>
					<li>
						<div :class="['indicator', passCheckList.isLength ? 'success' : 'error']"></div>
						<div class="text">{{ tt('aliases.pass_req_length') }}</div>
					</li>
					<li>
						<div :class="['indicator', passCheckList.equalsToAccountName ? 'error' : 'success']"></div>
						<div class="text">{{ tt('aliases.pass_req_not_account_name') }}</div>
					</li>
				</ul>
			</div>
		</template>

		<slot></slot>
	</el-tooltip>
</template>

<script setup>
import { computed } from 'vue';
import { isPasswordStrong } from '@/helpers/specialHelpers';
import { Lang } from '@/localization';

const props = defineProps({
	show: Boolean,
	password: String,
	equalsToAccountName: Boolean
});

const { tt } = Lang;

const passCheckList = computed(() => ({
	...isPasswordStrong(props.password),
	equalsToAccountName: props.equalsToAccountName
}));
</script>
