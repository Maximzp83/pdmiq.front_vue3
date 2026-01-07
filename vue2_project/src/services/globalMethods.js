// import { MessageBox, Message, Notification } from 'element-ui';
import MessageBox from 'element-ui/lib/message-box';
import Message from 'element-ui/lib/message';
import Notification from 'element-ui/lib/notification';
import { storeGetter } from '@/store';
import { hasAccessTo } from '@/utils/hasAccessTo';

import { Lang } from '@/localization';

import 'element-ui/lib/theme-chalk/message-box.css';
import 'element-ui/lib/theme-chalk/message.css';
import 'element-ui/lib/theme-chalk/notification.css';

export default {
	install(Vue /*, installOptions*/) {
		Vue.prototype.$confirm = options => {
			return MessageBox(options);
		};

		Vue.prototype.$message = options => {
			return Message(options);
		};

		Vue.prototype.$notify = options => {
			return Notification(options);
		};

		Vue.prototype.$Lang = Lang;

		Vue.prototype.tt = accessor => {
			return Lang.tt(accessor);
		};
		Vue.prototype.$t = accessor => {
			return Lang.tt(accessor);
		};
		Vue.prototype.$translate = (data, settings) => {
			return Lang.translate(data, settings);
		};
		Vue.prototype.$hasAccessTo = (permissionKeys, method) => {
			const { authUser } = storeGetter('auth');
			return hasAccessTo({ role: authUser.role, permissionKeys, method });
		};
	}
};
