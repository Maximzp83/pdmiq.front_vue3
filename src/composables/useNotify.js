import 'element-plus/es/components/notification/style/css';
import { ElNotification } from 'element-plus';

export function useNotify() {
	const Notify = (options) => {
		ElNotification(options);
	}

	return { Notify };
}
