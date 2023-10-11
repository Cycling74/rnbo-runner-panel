import classes from "./settings.module.css";

const SettingsIntro = () => (
	<div className={ classes.intro } >
		Settings are device scoped, saved to the local storage and restored on page load.
	</div>
);

export default SettingsIntro;
