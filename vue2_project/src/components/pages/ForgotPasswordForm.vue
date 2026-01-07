<template>
	<div>
		<div class="card-header filled">
			<h2 class="tilte page-title text-center bold">{{
				tt('phrases.forgot_password')
			}}?</h2>
		</div>

		<div class="card-content">
			<div class="standard-form">
				<div class="form-row">
					<el-input type="email" v-model="formData.email" placeholder="email">
						<i slot="prefix" class="icomoon icon-envelope" />
					</el-input>
				</div>

				<div class="submit-button-container text-center">
					<el-button
						@click="handleSubmit"
						type="primary"
						:loading="isLoading"
						class="semi-bold mcol-xs-12"
					>Send
					</el-button>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
// import { logoSrc } from '@/constants/global';
// import { getParamsFromUrl } from '@/services/api/api_helpers';
// import { getYmdDateString } from '@/helpers';

export default {
	/*components: {
		TabsBar: () => import('@/components/common/TabsBar.vue')
	},*/

	data() {
		return {
			isLoading: false,

			formData: {
				email: ''					
			}
		};
	},

	methods: {
		handleSubmit() {
				debugger
			let data = { ...this.formData };
			// console.log(data)
			/*this.$emit('event', {	
				eventName: 'toggleForm',
				data: 'showNewPasswordForm'
			});*/

			/*if (data) {
				console.log('submit', data)
				// return
			}*/

			this.isLoading = true;
				// console.log(this.isLoading)
			this.$store.dispatch('auth/forgot_password', { data }).then(() => {
				this.isLoading = false;
			}).catch(() => {
				this.isLoading = false;
			});
		}
	},
};
</script>
