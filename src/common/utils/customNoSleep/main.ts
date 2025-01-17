// https://github.com/zakj/no-sleep/issues/4
import { mp4, webm } from './media';

export interface INoSleep {
	enabled: boolean;
	enable(): void;
	disable(): void;
}

class NoSleepSSR implements INoSleep {
	enabled = false;
	enable() {
		throw new Error('NoSleep using SSR/no-op mode; do not call enable.');
	}
	disable() {
		throw new Error('NoSleep using SSR/no-op mode; do not call disable.');
	}
}

class NoSleepNative implements INoSleep {
	enabled = false;
	wakeLock?: WakeLockSentinel;

	constructor() {
		const handleVisibilityChange = () => this.wakeLock && document.visibilityState === 'visible' && this.enable();
		document.addEventListener('visibilitychange', handleVisibilityChange);
		document.addEventListener('fullscreenchange', handleVisibilityChange);
	}

	async enable() {
		try {
			this.wakeLock = await navigator.wakeLock.request('screen');
			this.enabled = true;
			this.wakeLock.addEventListener('release', () => {
				// TODO: Potentially emit an event for the page to observe since
				// Wake Lock releases happen when page visibility changes.
				// (https://web.dev/wakelock/#wake-lock-lifecycle)
			});
		} catch (err) {
			this.enabled = false;
			if (err instanceof Error) console.error(`${err.name}, ${err.message}`);
		}
	}

	disable() {
		void this.wakeLock?.release();
		this.wakeLock = undefined;
		this.enabled = false;
	}
}

class NoSleepVideo implements INoSleep {
	enabled = false;
	noSleepVideo?: HTMLVideoElement;

	setupVideo() {
		// Set up no sleep video element
		this.noSleepVideo = document.createElement('video');

		this.noSleepVideo.setAttribute('title', 'No Sleep');
		this.noSleepVideo.setAttribute('playsinline', '');

		this._addSourceToVideo(this.noSleepVideo, 'webm', webm);
		this._addSourceToVideo(this.noSleepVideo, 'mp4', mp4);

		// For iOS >15 video needs to be on the document to work as a wake lock
		Object.assign(this.noSleepVideo.style, {
			position: 'absolute',
			left: '-100%',
			top: '-100%',
		});
		document.querySelector('body')?.append(this.noSleepVideo);

		this.noSleepVideo.addEventListener('loadedmetadata', () => {
			if (!this.noSleepVideo) return;

			if (this.noSleepVideo.duration <= 1) {
				// webm source
				this.noSleepVideo.setAttribute('loop', '');
			} else {
				// mp4 source
				this.noSleepVideo.addEventListener('timeupdate', () => {
					if (!this.noSleepVideo) return;
					if (this.noSleepVideo.currentTime > 0.5) {
						this.noSleepVideo.currentTime = Math.random();
					}
				});
			}
		});
	}

	_addSourceToVideo(element: HTMLVideoElement, type: 'webm' | 'mp4', dataURI: string) {
		const source = document.createElement('source');
		source.src = dataURI;
		source.type = `video/${type}`;
		element.appendChild(source);
	}

	async enable() {
		this.setupVideo();
		if (!this.noSleepVideo) return;
		const playPromise = this.noSleepVideo.play();
		try {
			const res = await playPromise;
			this.enabled = true;
			return res;
		} catch (err) {
			this.enabled = false;
			if (err instanceof Error) console.error(`${err.name}, ${err.message}`);
		}
	}

	disable() {
		this.noSleepVideo?.remove();
		this.enabled = false;
	}
}

// Detect native Wake Lock API support
// eslint-disable-next-line @typescript-eslint/prefer-function-type
const defaultExport: { new (): INoSleep } =
	typeof navigator === 'undefined'
		? NoSleepSSR
		: // As of iOS 17.0.3, PWA mode does not support nativeWakeLock.
			// See <https://bugs.webkit.org/show_bug.cgi?id=254545>
			// @ts-expect-error: using non-standard standalone property
			'wakeLock' in navigator && !navigator.standalone
			? NoSleepNative
			: NoSleepVideo;

export default defaultExport;
