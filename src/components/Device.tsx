import ParameterList from "./ParameterList";
import styles from "../../styles/Device.module.css";
import PianoKeyboard from "./PianoKeyboard";
import Ports from "./Ports";
import TwoColumns from "../containers/TwoColumns";
import TabbedContainer from "../containers/TabbedContainer";
import { useMediaQuery } from "react-responsive";

export default function Device() {

	const isTabletOrMobile = useMediaQuery({ query: '(max-width: 1224px)' });

	const paramContents = (
		<>
			<div className={styles.paramContainer}>
				<ParameterList />
			</div>
		</>
	);
	const inputContents = (
		<>
			<div className={styles.keyboardContainer}>
				<h2>MIDI Input</h2>
				<PianoKeyboard />
			</div>
			<div className={styles.portContainer}>
				<h2>Inports</h2>
				<Ports />
			</div>
		</>
	);

	return (
		<>
			<div className={styles.wrapper}>
				{isTabletOrMobile ?
					<TabbedContainer firstTabContents={paramContents} secondTabContents={inputContents}></TabbedContainer> :
					<TwoColumns leftContents={paramContents} rightContents={inputContents}></TwoColumns>
				}
			</div>
		</>
	)
}
