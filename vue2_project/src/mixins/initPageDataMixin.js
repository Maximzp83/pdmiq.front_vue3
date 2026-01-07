import { validateRouteParams /*getObjectVal*/ } from '@/helpers';

const initPageDataMixin = {
	props: {
		preventSetNavbar: Boolean
	},

	data() {
		return {
			loadContent: false,
			itemData: null,
			itemLoading: false
		};
	},

	computed: {
		authUser() {
			return this.$store.state.auth.authUser;
		},
		pageTitle() {
			const itemName = (this.itemsName && this.itemsName.one) || 'Item';
			if (this.itemData) {
				// return `${itemName}: ${this.companyItem.name}`;
				return `${itemName}`;
			}
			return `${this.tt('New')} ${itemName}`;
		},

		navbarSettings() {
			const additionalNavbarSettings = this.additionalNavbarSettings || {};
			return Object.freeze({
				pageTitle: this.pageTitle,
				...additionalNavbarSettings
			});
			// showSaveButton: true,
			// showCloseButton: true
		}
	},

	methods: {
		initialPageSetup({ params, /* meta,*/ path }) {
			// const { params, meta } = route;
			this.loadContent = false;
			this.setup_navbar(this.navbarSettings);
			let id = this.paramsId || params.id;

			if (path == '/profile') {
				id = this.authUser.id;
			}

			if (validateRouteParams(id)) {
				if (id === 'new') {
					this.loadContent = true;
				} else {
					this.fetchPageData(id, { notNotify: true });
				}
			} else {
				this.$router.push({ name: 'NotFoundPage' });
			}
		},

		setup_navbar(settings) {
			const { meta } = this.$route;
			if (
				(!meta || !meta.preventSetupNavbar) &&
				!this.preventSetupNavbar &&
				!this.preventSetNavbar
			) {
				this.$store.dispatch('setup_navbar', settings);
			}
		},

		fetchPageData(id, options) {
			this.itemLoading = true;

			this.fetch_item({ itemId: id, ...options })
				.then(({ value, request_payload }) => {
					// console.log('ok')
					this.loadContent = true;
					if (!request_payload.setToStore) {
						this.itemData = value;
					}

					if (this.successFetchItemCallback) {
						this.successFetchItemCallback(value);
					}
					this.itemLoading = false;
				})
				.catch(error => {
					this.itemLoading = false;
					if (error.response.status === 404) {
						let path = '';
						// let path = '/sensors';
						if (!this.$hasAccessTo(['view_dashboard'])) {
							if (this.$hasAccessTo(['view_oee'])) path = '/processes';
							else if (this.$hasAccessTo(['view_requisitions']))
								path = '/requisitions';
						} else {
							path = '/dashboard';
						}

						this.$router.push(path);
						const { tt } = this;
						setTimeout(() => {
							this.$notify({
								type: 'warning',
								title: tt('Redirect'),
								message: `${this.itemsName.one} ${tt('with')} id "${id}" ${tt(
									'phrases.not_found'
								)}`
							});
						}, 200);
					}
				});
		}
	},

	watch: {
		pageTitle() {
			this.setup_navbar(this.navbarSettings);
		}

		/*$route(route) {
			// console.log(route)
			this.initialPageSetup(route);
		}*/
	},

	mounted() {
		this.initialPageSetup(this.$route);
	},

	beforeDestroy() {
		if (!this.preventDestroyNavbar && !this.preventSetNavbar) {
			this.setup_navbar({});
		}
	}
};

export default () => initPageDataMixin;
