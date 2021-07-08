import { useContext } from "react";
import { DimensionsContext } from "../contexts/dimension";

export const useDimensions = () => {
	const dimensions = useContext(DimensionsContext);
	return dimensions;
};
