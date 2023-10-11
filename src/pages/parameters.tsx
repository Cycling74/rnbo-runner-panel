import { Group } from "@mantine/core";
import ParameterList from "../components/parameter/list";
import PresetControl from "../components/parameter/presets";
import { PageTitle } from "../components/page/title";

export default function Parameters() {
	return (
		<>
			<Group justify="space-between" >
				<PageTitle>Parameters</PageTitle>
				<Group justify="flex-end">
					<PresetControl />
				</Group>
			</Group>
			<div style={{ flex: 1, overflow: "auto" }} >
				<ParameterList />
			</div>
		</>
	);
}
