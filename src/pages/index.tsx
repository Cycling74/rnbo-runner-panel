import { useRouter } from "next/router";
import { FunctionComponent, useEffect } from "react";

const IndexRedirect: FunctionComponent<Record<string, never>> = () => {

	const { replace, query } = useRouter();

	useEffect(() => {
		replace({
			pathname: "/parameters",
			query
		});
	});

	return <div></div>;
};

export default IndexRedirect;
