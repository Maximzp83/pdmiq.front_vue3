<template>
	<div>
		<VueElementLoadingWrapper
			:isLoading="itemLoading || equipmentLoading"
			:isSaving="itemSaving || sensorSaving"
			:itemsName="itemsName.one"
		/>

		<div class="view-wrapper item-page-wrapper">
			<div class="mcontainer">
				<!-- <h1 class="title page-title">{{ pageTitle }}</h1> -->
				<div class="view-content-card card">
					<div class="form-wrapper card-content" v-if="loadContent && equipmentData">
						<component
							v-if="componentFile"
							v-bind:is="componentFile"							
							ref="ItemFormComponent"
							@submit="handleSubmitForm"
							@onCancel="handleCloseButton"
							:itemData="itemData"
							:equipmentData="equipmentData"
							:itemsName="itemsName"
						/>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { mapActions } from 'vuex';
import { /*SENSOR_TYPES,*/ NCD_REQUEST_STATUSES } from '@/constants/global';

import {
	itemPageMixin,
	initPageDataMixin,
	fetchItemsHelper,
	webSocketMixin
} from '@/mixins';

export default {
	mixins: [
		itemPageMixin(),
		initPageDataMixin(),
		fetchItemsHelper(),
		webSocketMixin()
	],
	name: 'NCDSensorPage',

	components: {
		// ItemForm: () => import('./sensorForm/ItemFormNCD.vue')
	},

	data: () => ({
		sensorSaving: false,
		equipmentData: null,
		equipmentLoading: false,

		ncd_status_socket: null,
		ncd_status_socket_ready: false
	}),

	computed: {
		componentFile() {
			const splittedPath = this.$route.path.split('/');
			const splittedPath2 = splittedPath[1].split('-');
			let path = '';

			if (splittedPath2.length) {
				if (splittedPath2[0] == 'banner') {
					path = `views/Sensors/sensorForm/ItemForm`;
				} else if (splittedPath2[0] == 'ncd') {
					path = `views/Sensors/sensorForm/ItemFormNCD`;
				}
			}
			if (path) {
				return () => import(`@/${path}.vue`);
			}
			return null;
		},

		itemsName() {
			return {
				one: this.$t('Sensor'),
				mult: this.$t('Sensors')
			};
		},

		socketChannel() {
			const { authUser } = this;
			if (authUser) {
				return `user.${authUser.uuid}`;
			}
			return null;
		}

		/*uploadSettings: () => ({
			fileProp: 'file'
		})*/
	},

	methods: {
		...mapActions({
			fetch_item: 'sensors/fetch_sensor',
			save_item: 'sensors/save_sensor',
			fetch_equipment: 'equipments/fetch_equipment'
			// fetch_global_plants: 'fetch_global_plants'
		}),

		fetchEquipment(id) {
			this.doFetchAction('fetch_equipment', 'equipmentData', 'equipmentLoading', {
				itemId: id
			});
		},

		/*successSubmitCallback() {
			this.fetch_global_plants({ params: { max: -1 } });
		}*/

		localSubmit({ data }) {
			const {
				enableWebSocket,
				isNCDSDT,
				successMessage,
				failMessage,
				payload
			} = data;
			// const { formData } = payload;

			/*if (data) {
				console.log(data, enableWebSocket);
				return;
			}*/

			const initialArchieveStatus = payload.formData.is_archived;

			this.sensorSaving = true;

			this.save_item({
				data: payload.formData,
				itemName: 'Sensor',
				notNotify: enableWebSocket
			})
				.then(answer => {
					// console.log('2', answer, isNCDSDT, initialArchieveStatus, answer.data.data.is_archived )
					if (
						enableWebSocket &&
						(isNCDSDT ? initialArchieveStatus != answer.data.data.is_archived : true)
					) {
						const sensor_id = answer.data.data.id;

						this.setupWebSocket({
							socketName: 'ncd_status_socket',
							socketNameReadyProp: 'ncd_status_socket_ready',
							socketChannel: this.socketChannel,
							localHandleOpen: true,
							localHandleError: this.ncdWebsocketErrorHandler,
							socketCallback: e => this.ncd_socketCallbackHandler(e, {
								sensor_id,
								successMessage,
								failMessage
							})
							// socketCallbackName: 'ncd_socketCallback'
						});

						this.toggleMainPreloader(true, `${this.tt('Working')}...`);

						/*this['ncd_status_socket'].onopen = () => {
							// console.log('onopen')
							this['ncd_status_socket'].onmessage = e => {
								// console.log('onmessage', e)
								this['ncd_socketCallback'](JSON.parse(e.data), {
									sensor_id,
									successMessage,
									failMessage
								})
									.then(() => {
										this.toggleMainPreloader(false);
										this.changeRoute({ parent: true });
									})
									.catch(() => {
										this.toggleMainPreloader(false);
									});
							};
						};*/

					} else {
						this.sensorSaving = false;
						this.changeRoute({ parent: true });
					}
				})
				.catch(() => {
					this.sensorSaving = false;
					// this.toggleSaving(false);
				});
		},

		ncdWebsocketErrorHandler(err) {
			console.log(err);
			this.toggleMainPreloader(false);
			this.$notify({
				type: 'warning',
				title: this.tt('Fail'),
				message: this.tt('phrases.web_socket_error'),
				duration: 0
			});
			this['ncd_status_socket'].close();
		},

		ncd_socketCallbackHandler(e, settings) {		
			this.ncd_socketCallback(e, settings).then(() => {
				this.toggleMainPreloader(false);
				this.changeRoute({ parent: true });
			})
			.catch(() => {
				this.toggleMainPreloader(false);
			})
		},

		ncd_socketCallback(response = {}, settings = {}) {
			const { data, type } = response;
			return new Promise((resolve, reject) => {
				const { successMessage, failMessage, sensor_id } = settings;
				// console.log(type, data)

				if (type == 'ncd.command' && sensor_id == data.sensor_id) {
					if (data.status == NCD_REQUEST_STATUSES.SUCCESS) {
						this.$notify({
							type: 'success',
							title: this.tt('Success'),
							message:
								successMessage || this.tt('phrases.sensor_created_successfully')
						});
						this.closeWebSocket({ socketName: 'ncd_status_socket' });
						resolve();
					}

					if (data.status == NCD_REQUEST_STATUSES.FAIL) {
						this.$notify({
							type: 'warning',
							title: this.tt('Fail'),
							message:
								failMessage ||
								this.tt('phrases.error_check_controller_connectivity'),
							duration: 0
						});
						this.closeWebSocket({ socketName: 'ncd_status_socket' });
						reject();
					}
				}
			});
		},

		toggleMainPreloader(open, text) {
			if (open) {
				this.set_global_state({
					stateProp: 'overlay',
					value: {
						text: text || '',
						textStyle: { fontSize: '25px' }
					}
				});
				this.set_global_state({ stateProp: 'mainPreloader', value: true });
			} else {
				this.set_global_state({ stateProp: 'mainPreloader', value: false });
				this.set_global_state({ stateProp: 'overlay', value: {} });
				this.sensorSaving = false;
			}
		}
	},

	watch: {
		itemData(sensor) {
			if (sensor) {
				this.fetchEquipment(sensor.equipment_id);
			}
		}
	}
};
</script>
