import React, { createContext, useEffect, useRef, useState } from 'react';

export type Dimensions = {
	width: number;
	height: number
}

export const DimensionsContext = createContext<Dimensions>(null);

export function DimensionsProvider({ children }) {

	const container = useRef<HTMLDivElement>(null);

	const [dim, setDim] = useState<Dimensions>({width: 0, height: 0});

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
			<DimensionsContext.Provider value={{ width: dim.width, height: dim.height }}>
				{ children }
			</DimensionsContext.Provider>
	</div>
}

export const DimensionsConsumer = DimensionsContext.Consumer;
