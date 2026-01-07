<template>
	<div
		v-if="mode == 'trigger'"
		:class="[
			'custom-transition-container trigger-mode',
			{ 'fade-out': fadeOut },
			name
		]"
	>
		<slot></slot>
	</div>

	<transition-group
		v-else
		class="custom-transition-container"
		:name="name"
		:tag="tag"
		:css="false"
		@before-enter="onBeforeEnter"
		@enter="onEnter"
		@leave="onLeave"
	>
		<slot></slot>
	</transition-group>
</template>

<script>
// import { isEmptyString } from '@/utils/validate';

export default {
	props: {
		name: { type: String, default: 'standard-fade-250' },
		tag: { type: String, default: 'div' },
		mode: { type: String, default: 'group' },
		// group: Boolean,
		trigger: null,
		startingElementIdx: null
		// duration: {type: Number, default: 1000 }
	},

	data() {
		return {
			fadeOut: false
		};
	},

	computed: {
		duration() {
			const nameArr = this.name.split('-');
			return Number(nameArr[nameArr.length - 1]);
		}
	},

	methods: {
		onBeforeEnter(e) {
			e.classList.add('display-none');
			// console.log('onBeforeEnter 1', e, this.duration)
		},

		onEnter(e, done) {
			// console.log('onEnter 1', e)

			setTimeout(function() {
				// console.log('onEnter 2', e)
				e.classList.remove('display-none');
				done();
			}, this.duration);

			setTimeout(function() {
				// console.log('onEnter 3', e)
				e.classList.add('fade-in');
			}, this.duration + 25);
		},

		onLeave(e, done) {
			// console.log('onLeave 4', e)
			e.classList.remove('fade-in');

			setTimeout(function() {
				done();
			}, this.duration);
		}
	},

	watch: {
		trigger() {
			// console.log(x)
			this.fadeOut = true;

			setTimeout(() => {
				this.fadeOut = false;
			}, this.duration);
		}
	},

	mounted() {
		// console.log('mounted')
		if (this.mode == 'group') {
			this.$nextTick(() => {
				/*setTimeout(() => {
					this.$slots.default[this.startingElementIdx || 0].elm.classList.add(
						'fade-in'
					);
					console.log(this.$slots.default[this.startingElementIdx || 0].elm.classList)
				}, 100);*/
				setTimeout(() => {
					for (var i = 0; i < this.$el.children.length; i++) {
						const el = this.$el.children[i];
						const startingElementIdx = this.startingElementIdx || 0;

						el.classList.add(this.name);

						if (startingElementIdx == i) {
							el.classList.add('fade-in');
						}
					}
				}, 200);

				// console.log(this.$el.children)
				// debugger
			});
		}
	}
};
</script>
