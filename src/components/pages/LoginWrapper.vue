<template>
	<div class="login-page">
		<div class="bg top" />
		<div class="bg bottom" />

		<div
			class="wrapper wrapper-full-page inlineImg"
			:style="{ backgroundImage: `url(${backgroundImage})` }"
		>
			<div class="logo">
				<div class="logo-img">
					<img :src="logoImage" alt="logo" />
				</div>
				<div class="description">
					<div class="title common-title semi-bold">
						Sign In To Industrial Matrix
					</div>
					<div class="sub-description">
						Enter your details to login to your account:
					</div>
				</div>
			</div>

			<div class="login-content">
				<div class="card">
					<router-view v-slot="{ Component }">
						<transition name="standard-fade" mode="out-in">
							<component :is="Component" />
						</transition>
					</router-view>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useAuthStore } from '@/stores/AuthStore';
import backgroundImage from '@/assets/img/background/background_login.png';
import logoImage from '@/assets/img/top-logo-white.png';

const authStore = useAuthStore();

onMounted(() => {
	// Reset first_loading_app and preventRequests flags on login page
	authStore.set_value('first_loading_app', false);
	authStore.set_value('preventRequests', false);
});
</script>

<style lang="scss" scoped>
	@use "@/assets/sass/variables" as *;

	.login-page {
		.wrapper {
			width: 100%;
		}

		.bg {
			position: absolute;
			left: 0;
			right: 0;
			z-index: -1;

			&.top {
				top: 0;
				background-color: $primary-color;
				padding-top: 429px;
			}
			&.bottom {
				background-color: $secondaryFontColor;
				top: 429px;
				bottom: 0;
			}
		}

		.logo,
		.card {
			margin-left: auto;
			margin-right: auto;
			overflow: hidden;
		}

		.logo {
			max-width: 445px;
			text-align: center;
			display: block;
			// justify-content: center;
			padding-top: 61px;

			// .logo-normal {display: block !important;}
			.description {
				color: #fff;
				margin-top: 50px;

				.sub-description {
					color: #B6BDC4;
					font-weight: 600;
				}
			}

			img {
				height: 92px;
				width: 92px;
				transition: transform 2s linear;
				animation: loader 10s infinite linear;
			}

			.logo-text {
				font-size: 32px;

				& > span:first-child {color: #ADB5BD;}
				& > span:last-child {color: #fff;}
			}
		}


		.card {
			max-width: 445px;
			width: 100%;
			margin-top: 61px;
			background-color: #F7FAFC;

			:deep(.card-header) {
				padding: 35px 48px;

				&.underline-tabs {
					border: none;
					padding-top: 45px;
					padding-bottom: 23px;
					// padding-bottom: 0;
				}

				.el-button {
					font-size: 24px;
					text-transform: none; 				
				}
			}

			:deep(.card-content) {
				padding: 36px 48px 36px;
			}

			:deep(.underline-tabs) {
				.el-button {
					&:after {
						margin-top: 31px;
					}

					&:not(.active):after {
						background: transparent;						
					}
				}
			}

			:deep(.sso-button) {
				background-color: #F0F2F5;
				img {
					max-width: 145px;
					margin: 0 auto;
				}
			}

			:deep(.standard-form) {
				width: 100%;
			}
		}

		:deep(.el-input__wrapper) {
			border-color: transparent !important;
			box-shadow: 0 2px 4px 0 rgba(0,0,0,0.1) !important;
			background-color: #e8f0fe;
			
			.el-input__inner {
				border-color: transparent !important;

				&:focus {
					border-color: transparent !important;
				}
			}
		}


		:deep(.form-row) {
			& + .form-row {margin-top: 24px;}		
		}

		// .submit-button-container {margin-top: 36px;}

		/* ======Media Queries===== */

		@media (min-width: 991px) {

		}

		@media (min-width: 1199px) {

		}
	}

	.password-creation-tooltip {
		font-size: 14px;

		.title {
			margin-left: 33px;
		}

		.conditions-list {
			margin-top: 10px;
			padding: 8px;

			li {
				display: flex;
				align-items: center;

				& + li { margin-top: 10px; }

				.indicator {
					width: 13px;
					height: 13px;
					border-radius: 50%;
					border: 1px solid #B6BDC4;

					&.error { 
						border-color: $danger-color;
						& + .text {	color: $danger-color; font-weight:600;	}
					}
					&.success {
						background-color: $success-color;
						border-color: $success-color;
					}


				}

				.text {
					margin-left: 10px;
				}
			}
		}
	}
</style>
