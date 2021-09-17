import Ports from "../components/Ports";
import styled from "styled-components";

const IOWrapper = styled.div`
	.ports {
		display: flex;
		max-width: 400px;
	}

	.inport {
		display: flex;
	}

	.inportLabel {
		padding-right: 8px
	}

	.inportInput > input[type="text"] {
		width: 240px;
	}

	.inportInput > input[type="submit"] {
		margin-left: 8px;
	}
`;

export default function IO() {
	return (
		<div>
			<Ports />
		</div>
	);
}
