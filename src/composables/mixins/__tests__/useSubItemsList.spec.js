import { describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';

import { useSubItemsList } from '../useSubItemsList';

describe('useSubItemsList', () => {
	it('collects data from component refs stored inside a refs map array', () => {
		const getFormData = vi.fn(() => [{ file: 'attachment.pdf' }]);
		const componentRef = ref({ getFormData });
		const refsMap = ref({
			AttachmentsUploadBlock: [componentRef],
		});
		const formData = ref({ attachments: [] });
		const { collectDataFromSubItems } = useSubItemsList({ formData, refsMap });

		const collectedData = collectDataFromSubItems([
			{ ref: 'AttachmentsUploadBlock', targetProp: 'attachments' },
		]);

		expect(getFormData).toHaveBeenCalledOnce();
		expect(collectedData).toEqual({
			attachments: [{ file: 'attachment.pdf' }],
		});
	});
});
