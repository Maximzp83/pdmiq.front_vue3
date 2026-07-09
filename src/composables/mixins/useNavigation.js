// import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getParentPageRoute } from '@/helpers';

import { useAuthStore } from '@/stores/AuthStore';

export function useNavigation() {
	const { set_redirect_to, sign_out } = useAuthStore();
	const currentPath = useRoute().fullPath;
	const router = useRouter();

	const changeRoute = ({ addToCurrent, parent, steps, path, history, query }) => {
		// console.log('go to: ', path)

		if (path === '/logout') {
			// console.log('logout')
			set_redirect_to(currentPath);
			router.push({ path: '/login' });
			sign_out();
			return;
		}

		if (parent) {
			const parentPage = getParentPageRoute(currentPath, steps);
			let route = parentPage;
			if (path) {
				route += `/${path}`;
			}
			// console.log(route);
			router.push(route);
			return;
		}

		if (history) {
			router.go(steps);
			return;
		}

		if (currentPath !== path) {
			// console.log(currentPath, path)
			let route = path;

			if (addToCurrent) {
				route = currentPath + path;
			}

			if (query) route += `?${query}`;

			router.push(route);

			return;
		}
	};

	return { changeRoute };
}
