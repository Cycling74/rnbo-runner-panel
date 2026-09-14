// The Devices pane lists two kinds of device with separate id spaces — a patcher instance id is
// a bare number, a Link device is keyed by its JACK port group ("Link: Live", "Link: Sends") —
// so both the select's option values and the routes are namespaced.

export const patcherDeviceValue = (id: string): string => `patcher:${id}`;
export const linkDeviceValue = (nodeId: string): string => `link:${nodeId}`;

export const isLinkDeviceValue = (value: string): boolean => value.startsWith("link:");

export const patcherDevicePath = (id: string): string => `/instances/${encodeURIComponent(id)}`;
export const linkDevicePath = (nodeId: string): string => `/devices/link/${encodeURIComponent(nodeId)}`;
