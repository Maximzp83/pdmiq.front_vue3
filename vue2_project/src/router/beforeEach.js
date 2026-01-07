// import {store} from '@/store';
import { dispatchGetter, storeGetter } from '@/store';

import { Notification } from 'element-ui';
import { hasRightsToRoute } from '@/helpers';
import { getParamsFromUrl } from '@/services/api/api_helpers';
import { Lang } from '@/localization';

const nextStep = (to, from, next) => {

	const { hasAccess, reason, authUser } = hasRightsToRoute(to);
	if (hasAccess) {
		// console.log(to, authUser)
		if (authUser && authUser.role.is_forced_mfa) {
			if (!authUser.is_mfa_enabled) {
				if (to && to.path !== '/profile') {
					next('/profile?enableMfa=true');
					Notification({
						type: 'warning',
						title: Lang.tt('phrases.limited_access'),
						message: Lang.tt('aliases.mfa_auth_restriction')
					});
				}
			}
		}
		const beforeEachHook = storeGetter('global.beforeEachHook', {
			skipDeepCopy: true
		});

		if (beforeEachHook) {
			if (beforeEachHook({ from, to })) next();
			return;
		} else {
			next();
		}
	} else if (reason === 'limited_access') {
		Notification({
			type: 'warning',
			title: Lang.tt('phrases.limited_access'),
			message: Lang.tt('phrases.you_do_not_have_permissions_to_view_this_page')
		});
		next(from.fullPath);
		return;
	} else if (reason === 'not_auth') {
		// next({ name: 'Login' });
		// console.log(to)
		dispatchGetter('auth/set_redirect_to', to.fullPath);

		Notification({
			type: 'warning',
			title: Lang.tt('phrases.limited_access'),
			message: Lang.tt('phrases.you_are_not_authorized_to_view_this_page')
		});
		next('/login');
		return;
	} else {
		// console.log(to, reason)
		dispatchGetter('auth/set_redirect_to', to.fullPath);
		next('/login');
		return;
	}
	next();
};

const beforeEach = (to, from, next) => {
	const { token, error } = getParamsFromUrl(to.fullPath);
	if (error) {
		Notification({
			type: 'error',
			// title: 'Limited access',
			message: error
		});
		next('/login');
	} else if (token) {
		dispatchGetter('auth/get_auth_user', token).then(() => {
			nextStep(to, from, next);
		});
	} else {
		nextStep(to, from, next);
	}
};

export default beforeEach;
