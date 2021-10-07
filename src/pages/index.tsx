import { useRouter } from "next/router";
import { FunctionComponent, useEffect } from "react";

const IndexRedirect: FunctionComponent<{}> = () => {

	const { replace } = useRouter();

	useEffect(() => {
		replace("/parameters");
	}, []);

	return <div></div>;
};

export default IndexRedirect;
