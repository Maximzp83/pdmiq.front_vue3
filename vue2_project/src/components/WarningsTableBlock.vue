<template functional>
	<!-- <template> -->
	<div :key="`WarningsTableBlock-${props.title}`">
		<!-- <div v-once> -->
		<div
			class="content-container warnings-table-block"
			:class="{ 'full-width-background': props.full_width }"
			v-if="props.tableData.length"
		>
			<div class="block-header content-row flex wrap mrow align-center">
				<div class="header-item title-item mcol-xs-12 mcol-sm-2">
					<b class="uppercase">{{ props.title }}</b>
				</div>
				<div class="header-item mcol-xs-12 mcol-sm-5">
					<i class="icomoon icon-warning warning-color" />
					<b class="type">Warning</b>
					<b class="warning-color count">{{ props.warnings_count }}</b>
				</div>
				<div class="header-item mcol-xs-12 mcol-sm-5">
					<i class="icomoon icon-alarm alarm-color" />
					<b class="type">Alarm</b>
					<b class="alarm-color count">{{ props.alarms_count }}</b>
				</div>
			</div>

			<div
				class="block-content flex-table standard-form"
				:class="{ 'full-width-background': props.full_width }"
			>
				<div
					class="form-header table-row capitalize wrapperBlock"
					v-if="table_header"
				>
					<div class="table-cell time">
						<div>{{ tt('Date') }}</div>
					</div>
					<div class="table-cell sensor-name">
						<div>{{ tt('name') }}</div>
					</div>
					<div class="table-cell parameter-type"><div>Parameter</div></div>
					<div class="table-cell alert_rule"><div>Category</div></div>
					<div class="table-cell alert_type"><div>Type</div></div>
				</div>

				<div
					class="table-row"
					v-for="item in props.tableData"
					:key="`${props.title}-${item.id}_${item.alert_type_name}`"
				>
					<div class="table-cell time">
						<div>
							<i class="icomoon icon-chronic" />
							<span v-text="item.created_at" />
						</div>
					</div>

					<div class="table-cell sensor-name">
						<div>
							<i class="icomoon icon-sensor" />
							<span class="ellipsis" v-text="item.sensor_name" />
						</div>
					</div>

					<div class="table-cell parameter-type">
						<div>
							<i
								:class="
									`icomoon ${props.getParamTypeIcon(item.sensor_parameter_name)}`
								"
							/>
							<span class="capitalize" v-text="item.sensor_parameter_name" />
						</div>
					</div>

					<div class="table-cell alert_rule">
						<div>
							<i :class="`icomoon icon-${item.alert_rule_name}`" />
							<span class="capitalize" v-text="item.alert_rule_name" />
						</div>
					</div>

					<div class="table-cell alert_type">
						<div>
							<i :class="`icomoon icon-${item.alert_type_name}`" />

							<span
								:class="
									`capitalize ${
										item.alert_type_name == 'warning'
											? 'warning-color'
											: 'alarm-color'
									}`
								"
								v-text="item.alert_type_name"
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div v-else class="text-center section-block">
			Warnings for <b>{{ props.title }}</b> not found
		</div>
		<!-- </div> -->
	</div>
</template>

<script>
// import { getItemValue } from '@/helpers';

export default {
	functional: true,
	props: {
		tableData: {
			type: Array,
			default: () => []
			// required: true
		},
		alarms_count: {
			type: Number,
			default: 0
		},
		warnings_count: {
			type: Number,
			default: 0
		},
		title: {
			type: String,
			default: ''
		},
		full_width: Boolean,
		table_header: Boolean,
		getParamTypeIcon: {
			type: Function,
			default: name => {
				const arr = name.split(' ');
				return `icon-${arr[arr.length - 1]}`;
			}
		}
	}
};
</script>
