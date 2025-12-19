import { FunctionComponent } from "react";
import { ActionIcon, Anchor, Group, Pill } from "@mantine/core";
import classes from "./page.module.css";
import { useThemeColorScheme } from "../../hooks/useTheme";
import { IconElement } from "../elements/icon";
import { mdiGithub } from "@mdi/js";

const AboutInfo: FunctionComponent = () => {

	const scheme = useThemeColorScheme();

	return (
		<section>
			<p className={ classes.aboutText } >
				This is an open-source web app that lets you control a RNBO patch exported to the RNBO Runner which can be used to debug RNBO patches sent to your Raspberry Pi (or anywhere the RNBO Runner is active).
				<br/>
				<br/>
				The code for this app is available on Github and <Anchor fz="inherit" href="https://github.com/Cycling74/rnbo-runner-panel/blob/main/LICENSE.txt" target="_blank" rel="noreferrer noopener" >MIT licensed</Anchor>.
				<br/>
				<br/>
				<img src={ scheme === "light" ? "/c74-dark.svg" : "/c74-light.svg" } alt="Cycling '74 Logo"/>
				<br/>
				<br/>
				2024 Cycling &apos;74
			</p>
			<Group gap="xs">
				<ActionIcon
					variant="outline"
					color="gray"
					component="a"
					href="https://github.com/Cycling74/rnbo-runner-panel"
					target="_blank"
					rel="noreferrer noopener"
				>
					<IconElement path={ mdiGithub } />
				</ActionIcon>
				<Pill>v{ __APP_VERSION__ }</Pill>
			</Group>
		</section>
	);
};

export default AboutInfo;
