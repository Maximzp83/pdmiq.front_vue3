import { findItemBy } from '@/helpers';

const tabsMixin = {
	data() {
		return {
			activeTab: {}
		};
	},

	methods: {
		switchTab(tab) {
			// console.log('switchTab', tab)
			this.activeTab = tab;
		}
	},

	beforeMount() {
		// console.log('beforeMount', this.hideTabsBar, this.activeTab)

		if (this.hideTabsBar) {
			this.activeTab = this.activeTab.prop ? this.activeTab : this.tabsList[0];
		}

		if (this.$route.query && this.$route.query.activeTab) {
			if (this.localTabSetup) {
				this.localTabSetup(this.$route.query.activeTab);
			}
		}

		if (this.switchTabTo) {
			const { key, value } = this.switchTabTo;
			const tab = findItemBy(key, value, this.tabsList);

			if (tab) {
				this.activeTab = tab;
			}
		}
	}
};

export default () => tabsMixin;
