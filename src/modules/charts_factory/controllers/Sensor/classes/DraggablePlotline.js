class DraggablePlotline1 {
	constructor(settings) {
		this.onDragStart = null;
		this.onDragChange = null;
		this.onDragFinish = null;

		this.axis = settings.axis;
		this.plotLineId = settings.plotLineId;
		this.clickX = null;
		this.clickY = null;
		this.init_value = null;

		this.plotLine = null;
		this.currentStep = null;

		this.drag_step = e => this.drag_step_handler(e);
		this.drag_stop = e => this.drag_stop_handler(e);

		this.initialSetup();
	}

	initialSetup() {
		this.plotLine = this.getPlotLine(this.axis, this.plotLineId);

		if (this.plotLine) {
			// console.log(1, plotLine.options);
			this.plotLine.svgElem
				.css({ cursor: 'pointer' })
				.translate(0, 0)
				.on('mousedown', e => this.drag_start(e))
				.on('cancel', this.cancel_drag);
		}
	}

	getPlotLine(axis, plotLineId) {
		for (let i = 0; i < axis.plotLinesAndBands.length; i++) {
			if (axis.plotLinesAndBands[i].id === plotLineId) {
				return axis.plotLinesAndBands[i];
			}
		}
		return null;
	}

	getPlotLineValue(axis, plotLine) {
		if (plotLine) {
			const translation = axis.horiz
				? plotLine.svgElem.translateX
				: plotLine.svgElem.translateY;
			let new_value =
				axis.toValue(translation) - axis.toValue(0) + plotLine.options.value;
			new_value = Math.max(axis.min, Math.min(axis.max, new_value));
			return new_value;
		}
		return null;
	}

	drag_start(e) {
		// console.log('drag_start');
		if (!this.plotLine) return;
		// plotLine.options.zIndex = 433;

		document.addEventListener('mousemove', this.drag_step);
		document.addEventListener('mouseup', this.drag_stop);

		this.clickX = e.pageX - this.plotLine.svgElem.translateX;
		this.clickY = e.pageY - this.plotLine.svgElem.translateY;

		this.init_value =
			this.init_value || this.getPlotLineValue(this.axis, this.plotLine);

		if (this.onDragStart) {
			this.onDragStart(this.init_value);
		}
	}

	drag_step_handler(e) {
		let new_translation = this.axis.horiz
			? e.pageX - this.clickX
			: e.pageY - this.clickY;

		if (this.currentStep !== new_translation) {
			this.currentStep = new_translation;
			let new_value =
				this.axis.toValue(new_translation) -
				this.axis.toValue(0) +
				this.plotLine.options.value;
			new_value = Math.max(this.axis.min, Math.min(this.axis.max, new_value));

			if (this.axis.max >= 100) {
				new_value = +new_value.toFixed(0);
			} else if (this.axis.max > 10) {
				new_value = +new_value.toFixed(1);
			} else if (this.axis.max > 1) {
				new_value = +new_value.toFixed(2);
			} else {
				new_value = +new_value.toFixed(4);
			}

			const { min_value, max_value } = this.plotLine.options;

			if (min_value && new_value <= min_value) return;
			if (max_value && new_value >= max_value) return;

			new_translation = this.axis.toPixels(
				new_value + this.axis.toValue(0) - this.plotLine.options.value
			);
			// console.log('new_translation: ', new_translation);

			const xTranslation = this.axis.horiz ? new_translation : 0;
			const yTranslation = this.axis.horiz ? 0 : new_translation;

			this.plotLine.svgElem.translate(xTranslation, yTranslation);

			if (this.plotLine.label)
				this.plotLine.label.translate(xTranslation, yTranslation);

			if (this.onDragChange) {
				this.onDragChange(new_value);
			}
		}
	}

	drag_stop_handler() {
		document.removeEventListener('mousemove', this.drag_step);
		document.removeEventListener('mouseup', this.drag_stop);

		if (this.onDragFinish) {
			this.onDragFinish(this.getPlotLineValue(this.axis, this.plotLine));
		}

		// this.handle_stop({ callDragFinish: true, plotLineValue: this.getPlotLineValue(this.axis, this.plotLine) });
	}

	/*handle_stop({ callDragFinish, plotLineValue }) {
		const plotLineOptions = this.plotLine.options;
		const hasTranslateProperty = Object.prototype.hasOwnProperty.call(
			this.plotLine.svgElem,
			'translateX'
		);

		if (hasTranslateProperty) {
			plotLineOptions.value = plotLineValue;
			this.axis.removePlotLine(plotLineOptions.id);
			this.axis.addPlotLine(plotLineOptions);

			// console.log('hasTranslateProperty', axis.plotLinesAndBands)
			if (callDragFinish && onDragFinish) {
				onDragFinish(plotLineOptions.value);
			}
		}

		if (plotLineOptions.dash_offset) {
			this.plotLine.svgElem.element.setAttribute(
				'stroke-dashoffset',
				plotLineOptions.dash_offset
			);
		}
	};*/
}

export const createDraggablePlotline = settings => new DraggablePlotline1(settings);
