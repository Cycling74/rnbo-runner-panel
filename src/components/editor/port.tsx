import React, { CSSProperties, FunctionComponent, memo } from "react";
import { GraphPortRecord, PortDirection } from "../../models/graph";
import { Handle, HandleType, Position } from "reactflow";

export type PortProps = {
	offset: number;
	alias?: string;
	port: GraphPortRecord;
	maxWidth: number;
};

const handleTypeByPortDirection: Record<PortDirection, HandleType> = {
	[PortDirection.Sink]: "target",
	[PortDirection.Source]: "source"
};

const handlePositionByPortDirection: Record<PortDirection, Position> = {
	[PortDirection.Sink]: Position.Left,
	[PortDirection.Source]: Position.Right
};

const EditorPort: FunctionComponent<PortProps> = memo(function WrappedPort({
	port,
	maxWidth,
	alias,
	offset
}) {

	return (
		<Handle
			id={ port.id }
			position={ handlePositionByPortDirection[port.direction] }
			data-c74-type={ port.type }
			data-c74-name={ (alias || port.id.replace(/\((capture|playback)_[0-9]+\)/, "")) }
			type={ handleTypeByPortDirection[port.direction] }
			style={{ top: `${offset}%`, "--label-max-width": `${maxWidth}px` } as CSSProperties }
		/>
	);
});

export default EditorPort;
