<template>
	<div>
		<VueElementLoadingWrapper
			:isLoading="itemLoading"
			:isSaving="false"
			:itemsName="itemsName.one"
		/>

		<div class="view-wrapper item-page-wrapper">
			<div class="mcontainer">
				<div class="view-content-card card">
					<div v-if="!itemLoading && itemData" class="form-wrapper card-content">
						<div class="item-info-block">
							<div class="info-item">
								<div><b>{{ tt('Name') }}</b>:</div>
								<div class="info">{{ itemData.name }}</div>
							</div>

							<div class="info-item">
								<div><b>{{ tt('Address') }}</b>:</div>
								<div class="info">{{ itemData.address }}</div>
							</div>

							<div class="info-item">
								<div><b>{{ tt('Phone') }}</b>:</div>
								<div class="info">{{ itemData.phone_number }}</div>
							</div>

							<div class="info-item">
								<div><b>{{ tt('Comments') }}</b>:</div>
								<div class="info">{{ itemData.comments }}</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ENTITIES } from '@/config/entities';
import { useItemPage } from '@/composables/mixins/useItemPage';
import { useNavigation } from '@/composables/mixins/useNavigation';
const { changeRoute } = useNavigation();

import { Lang } from '@/localization';

import VueElementLoadingWrapper from '@/components/common/VueElementLoadingWrapper.vue';

const { tt } = Lang;

defineOptions({
	name: 'CompaniesInfoPage',
});

const companiesEntity = ENTITIES.Companies;

/*const localPageTitle = () => {
	const itemName = itemsName.one;
	console.log(itemData && itemData.name)
	if (itemData) {
		return `${itemData.name} ${tt('info')}`;
	}
	return `${itemName}`;
};*/

const buildCustomButtons = (itemData) => {
	let buttons = [
		{
			id: 1,
			// wrapper_class: 'menu-block buttonWrapper',
			button_class: 'el-button--secondary shadow save-button',
			icon: 'icomoon icon-path_2',
			handler: () => changeRoute({ history: true, steps: -1 }),
		}
	];

	if (itemData) {
		buttons.push({
			id: 2,
			// wrapper_class: 'menu-block buttonWrapper',
			button_class: 'shadow save-button',
			icon: 'icomoon icon-pencil',
			handler: () => changeRoute({ path: `${companiesEntity.routeBase}/${itemData.id}` }),
		})
		/*return {
			name: 'Edit',
			href: `${companiesEntity.routeBase}/`,
		};*/
	}

	return buttons;
};

const additionalNavbarSettings = Object.freeze({
		// navigateButton: { history: true, steps: -1 },
		hideBackButton: true,
		pageTitle: '',
		// showFilter: true,
});

const { itemData, itemLoading, itemsName } = useItemPage({
	entityKey: 'Companies',
	customButtons: buildCustomButtons,
	additionalNavbarSettings,
	// localPageTitle: localPageTitle
});

</script>
