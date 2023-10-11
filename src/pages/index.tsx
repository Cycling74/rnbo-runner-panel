import { useRouter } from "next/router";
import { FunctionComponent, useEffect } from "react";

const IndexRedirect: FunctionComponent<Record<string, never>> = () => {

	const { replace, query, isReady } = useRouter();

	useEffect(() => {
		if (isReady) {
			replace({
				pathname: "/parameters",
				query
			});
		}
	}, [isReady, query, replace]);

	return <div></div>;
};

export default IndexRedirect;
