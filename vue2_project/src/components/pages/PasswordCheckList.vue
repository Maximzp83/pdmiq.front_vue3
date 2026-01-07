<template>
	<el-tooltip
		class=""
		effect="light"
		placement="bottom"
		manual
		v-model="show"
	>
		<div slot="content">
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
		</div>

		<slot></slot>
	</el-tooltip>
</template>

<script>
import { isPasswordStrong } from '@/helpers/specialHelpers';

export default {
	props: {
		show: Boolean,
		password: String,
		equalsToAccountName: Boolean
	},
	data() {
		return {
			/*passCheckList: {
				l_case: true,
				u_case: false,
			},*/

		};
	},

	computed: {
		
		passCheckList() {
			return {
				...isPasswordStrong(this.password),
				equalsToAccountName: this.equalsToAccountName
			};
		}

		/*logoSrc() {
			return logoSrc;
		}*/
	},

	methods: {
		/*toggleForm(key) {
			this.showSignInForm = false;
			this.showForgotPasswordForm = false;
			this.showNewPasswordForm = false;
			this.showMfaCheckForm = false;

			this[key] = true;
		},*/

	},

};
</script>
