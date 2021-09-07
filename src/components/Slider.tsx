import React from "react";
import styles from "../../styles/Device.module.css";

export default function Slider() {

return (
	<div>
		<input type="range" min="1" max="100" value="50" className="slider" id="myRange"/>
	</div>

)
}
