import { Group, Stack } from "@mantine/core";
import { PageTitle } from "../components/page/title";
import SettingsList from "../components/settings/list";
import SettingsIntro from "../components/settings/intro";
import ResetSettingsButton from "../components/settings/reset";
import AboutInfo from "../components/page/about";

export default function Settings() {
	return (
		<Stack gap="sm">
			<Group justify="space-between" >
				<PageTitle>Settings</PageTitle>
				<Group justify="flex-end">
					<ResetSettingsButton />
				</Group>
			</Group>
			<SettingsIntro />
			<SettingsList />
			<AboutInfo />
		</Stack>
	);
}
