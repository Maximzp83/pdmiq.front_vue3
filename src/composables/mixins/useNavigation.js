// import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getParentPageRoute } from '@/helpers';

import { useAuthStore } from '@/stores/AuthStore';

export function useNavigation() {
	const { set_redirect_to, sign_out } = useAuthStore();
	const route = useRoute();
	const router = useRouter();

	const changeRoute = ({ addToCurrent, parent, steps, path, history, query, payload }) => {
		// console.log('go to: ', path)
		const currentPath = route.fullPath;

		if (path === '/logout') {
			set_redirect_to(currentPath);
			
			sign_out(payload).then(() => {
				router.push('/login');
			});
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
