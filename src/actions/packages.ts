import { PackageType } from "../models/package";

export const getPackageFromRemote = async (packageType: PackageType, itemName?: string) => {
	const link = document.createElement("a");
	let target;
	switch (packageType) {
		case PackageType.All:
			target = "all";
			break;
		case PackageType.Patcher:
			target = `patchers/${itemName!}`;
			break;
		case PackageType.Set:
			target = `graphs/${itemName!}`;
			break;
		default:
			throw new Error(`${packageType} download not implemented`);
	}
	link.href = `http://${window.location.host}/packages/${target}`;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
};
