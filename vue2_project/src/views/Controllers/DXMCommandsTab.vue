<template>
	<div class="dxm-controllers-commands-form">
		<!-- <VueElementLoading
			:active="sendingDXMCommandRequest"
			spinner="ring"
			:text="tt('processing')"
			:background-color="'rgba(255, 255, 255, .7)'"
		/> -->

		<div class="mrow flex wrap">
			<div class="mcol-xs-12 mcol-sm-5 main-part">
				<div class="custom-form-item el-form-item">
					<div class="el-form-item__label">{{ tt('Controller') }} id</div>
					<div
						class="value-instead-input el-form-item__content bold"
						v-text="controllerData.id"
					></div>
				</div>

				<div class="custom-form-item el-form-item content-row">
					<div class="el-form-item__label">UUID</div>
					<div
						class="value-instead-input el-form-item__content bold"
						v-text="controllerData.uuid"
					></div>
				</div>

				<CommandItem
					class="content-row"
					v-for="item in commandsList"
					:key="`command_item-${item.id}`"
					@onSend="handleSendDXMCommand"
					:itemData="item"
					:isProcessing="sendingDXMCommandRequest || processingDXMCommandRequest"
				/>
			</div>

			<div class="mcol-xs-12 mcol-sm-7 history-part">
				<div class="card">
					<div class="card-header filled uppercase bold">{{ tt('History') }}</div>
				</div>

				<div class="card-content">
					<SimpleSpinner :active="commandsHistoryListLoading" />

					<CommandsHistoryItem
						v-for="item in commandsHistoryList"
						:key="`history_item-${item.id}`"
						:itemData="item"
					/>

					<div class="text-center" v-if="!commandsHistoryList.length">
						{{ `${tt('History')} ${tt('is_empty')}` }}
					</div>
				</div>
			</div>
		</div>

		<!-- <div 
			@click="() => dxmCommand_socketCallback({
				type: 'dxm.command',
				data: {
					id: 32452345,
					controller_id: 151,
					status: 2,
					message_body: 'CMD0004 15,1,1,0,0,256',
					message_response: 'sdfmksldf smdklfsdfnsj njsdkfsdf',
					created_at: '2022-05-09 11:56:44'
				}

			})"
		>test</div> -->
	</div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import { DXM_COMMANDS_REQUEST_STATUSES, CONTROLLER_TOPIC_TYPES } from '@/constants/global';
import { findItemBy } from '@/helpers';

import { webSocketMixin, fetchItemsHelper } from '@/mixins';

export default {
	mixins: [webSocketMixin(), fetchItemsHelper()],
	components: {
		CommandsHistoryItem: () => import('./CommandsHistoryItem.vue'),
		CommandItem: () => import('./CommandItem.vue')
	},

	props: {
		controllerData: { type: Object, required: true },
		topicType: Number
	},

	data() {
		return {
			sendingDXMCommandRequest: false,
			processingDXMCommandRequest: false,

			message_body: '',
			dxm_response: '',

			commandsHistoryListLoading: false,
			commandsHistoryList: [
				/*{ id:1, created_at: '2022-05-09 11:56:44', message_body: 'CMD00123', message_response: 'sdfmksldf smdklfsdfnsj njsdkfsdf' },
				{ id:2, created_at: '2022-05-09 11:56:44', message_body: 'CMD00124', message_response: 'sdfmksldf smdklfsdfnsj njsdkfsdf' },
				{ id:3, created_at: '2022-05-09 11:56:44', message_body: 'CMD00125', message_response: 'sdfmksldf smdklfsdfnsj njsdkfsdf' },*/
			],

			dxm_command_socket: null,
			dxm_command_socket_ready: false,

			commandsList: [
				{
					id: 1,
					isPreInstalled: true,
					title: `${this.tt('Reboot')} DXM`,
					message_body: 'CMD0200'
				},
				{
					id: 2,
					isPreInstalled: true,
					title: `${this.tt('Reboot')} ${this.tt('RADIO')}`,
					message_body: '',
					// message_body: 'CMD0004 15,1,1,0,0,256',
					dxm_response: ''
				},
				{
					id: 3,
					title: `${this.tt('Command')}`,
					message_body: '',
					dxm_response: ''
				}
			]
		};
	},

	computed: {
		...mapState({
			authUser: state => state.auth.authUser
		}),

		socketChannelDXMCommandRequest() {
			const { authUser } = this;

			if (authUser) {
				return `user.${authUser.uuid}`;
			}
			return null;
		}

		/*commandsList() {
			const { tt } = this;
			return [
				{
					id: 1,
					isPreInstalled: true,
					title: `${tt('Reboot')} DXM`,
					message_body: 'CMD0200',
				},
				{
					id: 2,
					isPreInstalled: true,
					title: `${tt('Reboot')} ${tt('RADIO')}`,
					message_body: 'CMD0004 15,1,1,0,0,256',
					dxm_response: ''
				},
				{
					id: 3,
					title: `${tt('Command')}`,
					message_body: '',
					dxm_response: ''
				},
			];
		},*/
	},

	methods: {
		...mapActions({
			request_dxm_command: 'controllers/request_dxm_command',
			fetch_dxm_commands_history: 'controllers/fetch_dxm_commands_history'
		}),

		fetchCommandsHistory() {
			this.doFetchAction(
				'fetch_dxm_commands_history',
				'commandsHistoryList',
				'commandsHistoryListLoading',
				{ controllerId: this.controllerData.id }
			);
		},

		handleSendDXMCommand(message_body) {
			if (message_body) {
				this.sendingDXMCommandRequest = true;
				const payload = {
					controllerId: this.controllerData.id,
					data: { message_body }
				};

				/*if (payload) {
					console.log(payload)
					return;
				}*/

				this.request_dxm_command(payload)
					.then(response => {
						if (!response.value || response.value.status !== 2) {
							this.handleDXMCommandResponse(response);
						}

						this.sendingDXMCommandRequest = false;
						/*setTimeout(() => {
						this.sendingDXMCommandRequest = false;
					}, 100);*/
					})
					.catch(() => {
						this.sendingDXMCommandRequest = false;
						/*if (!error.response || error.response.status !== 400) {
						this.sendingDXMCommandRequest = false;
					}*/
					});
			} else {
				this.$notify({
					type: 'warning',
					message: this.tt('phrases.command_should_be_filled')
				});
			}
		},

		handleDXMCommandResponse() {
			try {
				this.processingDXMCommandRequest = true;
				this.setupWebSocket({
					socketName: 'dxm_command_socket',
					socketNameReadyProp: 'dxm_command_socket_ready',
					socketChannel: this.socketChannelDXMCommandRequest,
					socketCallbackName: 'dxmCommand_socketCallback'
				});

				// this.toggleMainPreloader(true, `${this.tt('phrases.working_config')}...`);
			} catch (e) {
				console.log(e);
			}
		},

		dxmCommand_socketCallback(response = {}) {
			const { type, data } = response;
			const { tt } = this;

			if (type.toLowerCase() === 'dxm.command' && data.controller_id === this.controllerData.id) {
				if (data.status == DXM_COMMANDS_REQUEST_STATUSES.SUCCESS) {
					this.$notify({
						type: 'success',
						title: tt('constants.Success'),
						message: `DXM ${tt('requesting')} ${tt('Successfull')}`
					});
				}

				if (data.status == DXM_COMMANDS_REQUEST_STATUSES.FAIL) {
					this.$notify({
						type: 'warning',
						title: tt('constants.Fail'),
						message: `${tt('Error')} - ${tt(
							'phrases.check_controller_connectivity'
						)}`,
						duration: 0
					});
				}

				if (data.status !== DXM_COMMANDS_REQUEST_STATUSES.PENDING) {
					const commandItem = findItemBy(
						'message_body',
						data.message_body,
						this.commandsList
					);

					if (commandItem) {
						commandItem.dxm_response = data.message_response;
					}

					this.commandsHistoryList.unshift(data);
					this.closeWebSocket({ socketName: 'dxm_command_socket' });
					this.processingDXMCommandRequest = false;
				}
			}
		},

		setupMessageBody(type) {
			const commandItem = findItemBy('id', 2,	this.commandsList);
			if (type === CONTROLLER_TOPIC_TYPES.PDM) {
				commandItem.message_body =  'CMD0004 15,1,1,0,0,256';
			} else if (type === CONTROLLER_TOPIC_TYPES.PDM_V2) {
				commandItem.message_body =  'CMD0004 4151,1,51,0,0,10';				
			}
		},
	},

	watch: {
		topicType(type) {
			this.setupMessageBody(type);
		}
	},

	created() {
		this.setupMessageBody(this.topicType);

		this.fetchCommandsHistory();
	},

	beforeDestroy() {
		this.closeWebSocket({ socketName: 'dxm_command_socket' });
	}
};
</script>
