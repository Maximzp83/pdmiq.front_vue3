// import { rolesHasAccessTo } from '@/constants/roles_has_access_to';
// import { roleHasAccessTo, rolesHasAccessToMap } from '@/utils/hasAccessTo';

const hasAccessToMixin = {
	computed: {
		authUser() {
			return this.$store.state.auth.authUser;
		},

		hasAccessMap: that => that.$store.getters['auth/hasAccessMap']

		/*hasAccessMap() {
			if (this.hasAccessToFromProps) {
				return Object.freeze(this.hasAccessToFromProps);
			}

			const { type } = this.authUser;
			let result = {};
			for (const to in rolesHasAccessTo) {
				result[to] = rolesHasAccessTo[to].some(r => r === type);
			}
			return Object.freeze(result);
		},*/

		/*hasAccessMap() {
			// console.log('hasAccessMap')
			let result = {};

			for (const to in rolesHasAccessToMap) {
				result[to] = roleHasAccessTo({
					key: to,
					role: this.authUser.role,
				});
			}

			return result;
		}*/
	}
};

export default () => hasAccessToMixin;
