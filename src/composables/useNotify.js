import 'element-plus/es/components/notification/style/css';

let notificationModulePromise;

const loadNotification = () => {
	notificationModulePromise ||= import('element-plus/es/components/notification/index');
	return notificationModulePromise;
};

export function useNotify() {
	const Notify = async (options) => {
		const { ElNotification } = await loadNotification();
		ElNotification(options);
	};

	return { Notify };
}
