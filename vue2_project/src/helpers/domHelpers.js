const calculateFullfidthPopover1 = (popoverQuery, arrowLeft) => {
	const popover = document.querySelector(popoverQuery);
	const pageContainer = document.querySelector('.dashboard-content-container');

	if (popover && pageContainer) {
		popover.style.width = `${pageContainer.offsetWidth}px`;

		setTimeout(() => {
			const arrow = popover.querySelector('.popper__arrow');
			if (arrow) {
				const left = arrow.style.left;

				if (left) {
					let leftNum = +left.slice(0, -2);
					if (leftNum) {
						arrow.style.left = leftNum - arrowLeft + 'px';
					}
				}
				// console.log(arrow.style.left)
			}
		}, 50);
	}
};

const overflowHiddenTo1 = (containerQuery, show) => {
	const container = document.querySelector(containerQuery);
	// console.log(container, show)
	if (container) {
		if (show) {
			container.classList.add('overflowHidden');
		} else {
			container.classList.remove('overflowHidden');
		}
	}
};

const dropDown1 = (e, { onlyMobile, recalculateHeight, target, timeout }) => {
	// button, targetBlock, parentBlock
	// console.log(e)
	if (onlyMobile) {
		if (document.documentElement.clientWidth > 991) {
			return;
		}
	}

	if (recalculateHeight) {
		setTimeout(function() {
			const targetBlock = document.getElementById(target);
			const newHeight = targetBlock.firstElementChild.offsetHeight;
			targetBlock.style.height = newHeight + 'px';
		}, timeout || 0);
		return;
	}

	const button = e.currentTarget;
	const options = e.currentTarget.dataset;
	const targetBlock = document.getElementById(target || options.target);
	// console.log(options)

	if (button.checked || button.classList.contains('active')) {
		targetBlock.style.height = '0px';
		button.classList.remove('active');

		if (options.text) {
			button.querySelector('.buttonText').textContent = options.text;
		}
		/*if (parentBlock) {
			parentBlock.style.height = parentBlock.offsetHeight + newHeight + 'px';
		}*/
	} else {
		button.classList.add('active');

		if (options.textActive) {
			button.querySelector('.buttonText').textContent = options.textActive;
		}

		const newHeight = targetBlock.firstElementChild.offsetHeight;
		targetBlock.style.height = newHeight + 'px';

		// console.log(targetBlock, newHeight)
		// const newHeight = targetBlock.firstElementChild.offsetHeight;

		/*if (parentBlock) {
			parentBlock.style.height = parentBlock.offsetHeight - newHeight + 'px';
		}*/
	}
};

const ellipsisString1 = (str, querySelector, rows, columnIdx, index) => {
	const rowItem = document.querySelectorAll(querySelector)[index];
	let result = '';
	if (rowItem) {
		const columnItem = rowItem.children[columnIdx];
		// console.log(rowItem.children)

		if (columnItem) {
			const { width } = columnItem.getBoundingClientRect();
			const symbolsInRow = Math.floor(((width - 20) / 8) * rows - 3);
			result = str.slice(0, symbolsInRow);

			if (symbolsInRow < str.length) {
				if (result[0] == '<' && result[result.length - 1] != '>') {
					result = result + '...</p>';
				} else {
					result = result + '...';
				}
			}
		}
	}

	return result || str;
};

export const calculateFullfidthPopover = (popoverQuery, arrowLeft) =>
	calculateFullfidthPopover1(popoverQuery, arrowLeft);
export const overflowHiddenTo = (containerQuery, show) =>
	overflowHiddenTo1(containerQuery, show);
export const dropDown = (e, payload) => dropDown1(e, payload);
export const ellipsisString = (str, querySelector, rows, columnIdx, index) =>
	ellipsisString1(str, querySelector, rows, columnIdx, index);

// export { calculateFullfidthPopover, overflowHiddenTo, dropDown, ellipsisString };
