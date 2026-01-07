class IdleTimer {
	constructor({ timeout, onTimeout /*onExpired*/ }) {
		this.timeout = timeout;
		this.onTimeout = onTimeout;
		this.isIdleStarted = false;

		this.eventHandler = this.resetIdle.bind(this);

		this.tracker();
		this.startInterval();
	}

	startInterval() {
		this.resetIdle();
		this.isIdleStarted = true;

		this.interval = setInterval(() => {
			const storedIdleTime = localStorage.getItem('_expiredIdleTime');

			if (storedIdleTime) {
				const expiredIdleTime = parseInt(storedIdleTime, 10);
				// console.log('1', new Date(expiredIdleTime).getSeconds(), new Date(Date.now()).getSeconds(), expiredIdleTime <= Date.now() )

				if (expiredIdleTime <= Date.now()) {
					this.onTimeout();
				}
			} else {
				this.onTimeout();
			}
		}, 1000);
	}

	tracker() {
		window.addEventListener('focus', this.eventHandler);
		window.addEventListener('keydown', this.eventHandler);
		window.addEventListener('click', this.eventHandler);
	}

	resetIdle() {
		// console.log('reset', new Date( Date.now() + this.timeout), this.interval )
		const storedIdleTime = localStorage.getItem('_expiredIdleTime');
		// console.log('reset storedIdleTime', storedIdleTime)
		if (!storedIdleTime && this.isIdleStarted) {
			this.onTimeout();
			// console.log('isIdleStarted', this.isIdleStarted)
		} else {
			localStorage.setItem('_expiredIdleTime', Date.now() + this.timeout);
		}
	}

	cleanUp() {
		clearInterval(this.interval);
		this.interval = null;
		this.isIdleStarted = false;

		localStorage.removeItem('_expiredIdleTime');
		// console.log('cleanUp', localStorage.getItem("_expiredIdleTime"))

		window.removeEventListener('focus', this.eventHandler);
		window.removeEventListener('keydown', this.eventHandler);
		window.removeEventListener('click', this.eventHandler);
	}
}
export default IdleTimer;
