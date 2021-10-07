import React, { createContext, useEffect, useRef, useState, FunctionComponent } from 'react';

export type Dimensions = {
	width: number;
	height: number
}

export const DimensionsContext = createContext<Dimensions>(null);

export const DimensionsProvider: FunctionComponent<{}> = ({ children }) => {

	const container = useRef<HTMLDivElement>(null);
	const [dim, setDim] = useState<Dimensions>({ width: 0, height: 0 });

	useEffect(() => {
		if (container.current) {
			container.current.addEventListener("resize", () => {
				const width = container.current.clientWidth;
				const height = container.current.clientHeight;

				setDim({ width, height });
			});
		}
	}, [container])

	return <div ref={container}>
			<DimensionsContext.Provider value={dim}>
				{ children }
			</DimensionsContext.Provider>
	</div>
}

export const DimensionsConsumer = DimensionsContext.Consumer;
