import { ElNotification } from 'element-plus';

export function useNotify() {
	const Notify = (options) => ElNotification({ options });

	return { Notify };
}
