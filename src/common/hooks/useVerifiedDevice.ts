import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const DEVICE_DEVICES_KEY = 'verifiedDevices';

type Device = {
	email: string;
	deviceId: string;
};

interface VerifiedDeviceStore {
	devices: Device[];
	addDevice: (device: Device) => void;
	removeDevice: (deviceId: string) => void;
	getDevice: (email: string) => Device | undefined;
}

export const useVerifiedDevice = create<VerifiedDeviceStore>()(
	persist(
		(set, get) => ({
			devices: [],
			getDevice: (email: string) => get().devices.find((item) => item.email === email),
			addDevice: (device) => set((state) => ({ devices: [...state.devices, device] })),
			removeDevice: (deviceId) =>
				set((state) => ({
					devices: state.devices.filter((device) => device.deviceId !== deviceId),
				})),
		}),
		{ name: DEVICE_DEVICES_KEY },
	),
);
