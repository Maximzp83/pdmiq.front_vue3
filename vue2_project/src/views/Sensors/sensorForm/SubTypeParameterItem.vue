<template>
	<el-form
		ref="itemForm"
		class="form-subitem-container io-parameter-item-container border-top-devider"
		:model="formData"
		label-width="150px"
		:label-position="isMobile ? 'top' : 'left'"
	>
		<el-form-item
			:label="tt('parameter')"
			class="label_pt-5 mini showJustInfo"
		>
			<div>{{ itemData.title }}</div>
		</el-form-item>

		<el-form-item
			:label="tt('name')"
			prop="name"
			class="mcol-xs-9 label_pt-5 mini"
		>	
			<CustomInput v-model="formData.name" :placeholder="tt('name')" />
		</el-form-item>

		<el-form-item
			:label="tt('units')"
			prop="units"
			class="mcol-xs-9 label_pt-5 mini"
		>	
			<CustomInput v-model="formData.units" :placeholder="tt('units')" />
		</el-form-item>

		<el-form-item
			prop="formula"
			class="mcol-xs-9 label_pt-5 mini"
		>	
			<template v-slot:label>
				<span class="span-block">{{ tt('formula') }}</span>
				<span class="span-block">
					<el-tooltip class="" effect="dark" placement="bottom">
						<i class="el-icon-info"></i>
						<div slot="content" v-html="tooltipContent"></div>
					</el-tooltip>
				</span>
			</template>

			<CustomInput v-model="formData.formula" :placeholder="tt('formula')" />
		</el-form-item>

		<el-form-item
			:label="`${tt('line')} ${tt('speed')}`"
			prop="is_line_speed"
		>
			<el-switch
				v-model="formData.is_line_speed"
				:active-value="1"
				:inactive-value="0"
			/>
		</el-form-item>

	</el-form>
</template>

<script>
// import { updateFormData } from '@/helpers';
import { subItemMixin } from '@/mixins';

export default {
	mixins: [subItemMixin()],
	props: {
		isMobile: Boolean,
		fromModal: Boolean
	},

	data() {
		return {
			formData: {
				id: null,
				name: '',
				units: '',
				formula: '',
				is_line_speed: false
			}
		};
	},

	computed: {
		tooltipContent() {
			/*`Use {value} as the input from the IO. <br/>
			Example: {value} * 60 + 500 <br/>
			NB: The original formula will be applied before this formula`*/
			return this.$t('aliases.subtype_formula_tooltip');
		}
	},

	methods: {
		localGetFormDataCallback(formData) {
			// if (!formData.name) delete formData.name;
			if (this.itemData.isDefaultValues) {
				const { itemData } = this;
				if (formData.name === itemData.name) formData.name = '';
				if (formData.units === itemData.units) formData.units = '';
				if (formData.formula === itemData.formula) formData.formula = '';
			}

			return formData;
		}
	}
};
</script>
