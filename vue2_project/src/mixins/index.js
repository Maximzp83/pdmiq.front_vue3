import navigation from './navigation';
import itemsDataMixin from './itemsDataMixin';

import itemPageMixin from './itemPageMixin';
import itemFormMixin from './itemFormMixin';
import eventHandler from './eventHandler';
import requestsListMixin from './requestsListMixin';

import fetchItemsHelper from './fetchItemsHelper';
import initPageDataMixin from './initPageDataMixin';
// import dynamicItemFormMixin from './dynamicItemFormMixin';
// import refsOperationsMixin from './refsOperationsMixin';
import formOperationsInItemsListMixin from './formOperationsInItemsListMixin';

import tabsMixin from './tabsMixin';
import loadMoreMixin from './loadMoreMixin';
import createFormItemMixin from './createFormItemMixin';
import actionButtonsMixin from './actionButtonsMixin';

import webSocketMixin from './webSocketMixin';
import dragNdropSortableMixin from './dragNdropSortableMixin';
import dragNdropDroppableMixin from './dragNdropDroppableMixin';
import multiformMixin from './multiformMixin';
import onSelectFileMixin from './onSelectFileMixin';

import itemCardMixin from './itemCardMixin';
import switchGridViewMixin from './switchGridViewMixin';
import sensorTypeMixin from './sensorTypeMixin';
import exportListToFileMixin from './exportListToFileMixin';
import hasAccessToMixin from './hasAccessToMixin';
import dashboardListsReorderMixin from './dashboardListsReorderMixin';
import mainInstanceDetailsPage from './mainInstanceDetailsPage';
import importMixin from './importMixin';
import subItemsListMixin from './subItemsListMixin';
import subItemMixin from './subItemMixin';

import itemDetailsPreviewMixin from '../views/Maintenance/itemDetailsPreviewMixin';
import chartsCompareExportMixin from '../views/Sensors/mixins/chartsCompareExportMixin';
import RebaselineRequestMixin from '../views/Sensors/mixins/RebaselineRequestMixin';
import saveRPMParamsMixin from '../views/Sensors/mixins/saveRPMParamsMixin';

// import handleSaveFormBlock from './handleSaveFormBlock'; //todo (remove)

export {
	navigation,
	itemsDataMixin,
	eventHandler,
	itemPageMixin,
	itemFormMixin,
	requestsListMixin,
	fetchItemsHelper,
	initPageDataMixin,
	// refsOperationsMixin,
	formOperationsInItemsListMixin,
	tabsMixin,
	loadMoreMixin,
	createFormItemMixin,
	actionButtonsMixin,
	// dynamicItemFormMixin,
	webSocketMixin,
	dragNdropSortableMixin,
	dragNdropDroppableMixin,
	multiformMixin,
	onSelectFileMixin,
	itemCardMixin,
	switchGridViewMixin,
	sensorTypeMixin,
	exportListToFileMixin,
	hasAccessToMixin,
	dashboardListsReorderMixin,
	mainInstanceDetailsPage,
	itemDetailsPreviewMixin,
	importMixin,
	chartsCompareExportMixin,
	RebaselineRequestMixin,
	saveRPMParamsMixin,
	// handleSaveFormBlock,
	subItemsListMixin,
	subItemMixin
};
