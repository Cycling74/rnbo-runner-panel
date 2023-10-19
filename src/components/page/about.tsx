import { FunctionComponent } from "react";
import { SectionTitle } from "./sectionTitle";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import Link from "next/link";
import { Button, Group, Pill } from "@mantine/core";
import classes from "./page.module.css";

const AboutInfo: FunctionComponent = () => {

	return (
		<section>
			<SectionTitle>About</SectionTitle>
			<p className={ classes.aboutText } >
				This is a small, open-source web app that lets you control a RNBO patch exported to the RNBO Runner which can be used to debug RNBO patches sent to your Raspberry Pi (or anywhere the RNBO Runner is active).
				<br/>
				<br/>
				The code for this app is available on Github and <Link href="https://github.com/Cycling74/rnbo-runner-panel/blob/main/LICENSE.txt" target="_blank" rel="noreferrer noopener" >MIT licensed</Link>.
				<br/>
				<br/>
				2023 Cycling &apos;74
			</p>
			<Group gap="sm">
				<Button
					variant="default"
					component={ Link }
					href="https://github.com/Cycling74/rnbo-runner-panel"
					target="_blank"
					rel="noreferrer noopener"
					size="xs"
					leftSection={ <FontAwesomeIcon icon={ faGithub } /> }
				>
					Github Repository
				</Button>
				<Pill>v{ process.env.appVersion }</Pill>
			</Group>
		</section>
	);
};

export default AboutInfo;
