import { getParentPageRoute } from '@/helpers';

const navigation = {
	methods: {
		changeRoute({ addToCurrent, parent, steps, path, history, query }) {
			// console.log('go to: ', path)

			if (path === '/logout') {
				// console.log('logout')
				this.$store.dispatch('auth/set_redirect_to', this.$route.fullPath);
				this.$store.dispatch('auth/sign_out');
				return;
			}

			if (parent) {
				const parentPage = getParentPageRoute(this.$route.fullPath, steps);
				let route = parentPage;
				if (path) {
					route += `/${path}`;
				}
				this.$router.push(route);
				return;
			}

			if (history) {
				// const parentPage = getParentPageRoute(this.$route.fullPath, steps);
				this.$router.go(steps);
				// console.log(this.$router)
				return;
			}

			if (this.$route.fullPath !== path) {
				// console.log(this.$route.fullPath, path)
				let route = path;

				if (addToCurrent) {
					route = this.$route.fullPath + path;
				}

				if (query) route += `?${query}`;
				// console.log('nav: ', route)

				this.$router.push({ path: route });
				// this.$emit('changeRoute', route);

				return;
			}
		}
	}
};

export default () => navigation;
