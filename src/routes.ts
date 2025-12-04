import { createHashRouter, Params } from "react-router";
import { AppLayout } from "./layouts/app";
import { UrlObject } from "url";
import { parse, ParsedUrlQueryInput, stringify } from "querystring";
import { InstancePage } from "./pages/instance";
import { MIDIMappingsPage } from "./pages/midimappings";
import { ResourcesPage } from "./pages/resources";
import { SetViewsPage } from "./pages/setviews";
import { GraphEditorPage } from "./pages/graphEditor";

export const router = createHashRouter([
	{
		Component: AppLayout,
		children: [
			{ index: true, Component: GraphEditorPage },
			{ path: "/instances/:id", Component: InstancePage },
			{ path: "/midimappings", Component: MIDIMappingsPage },
			{ path: "/resources", Component: ResourcesPage },
			{ path: "/setviews", Component: SetViewsPage }

		]
	}
]);

// Utility Functions to use router outside of Component tree.
// Note that within React Components it's highly recommended to use
// the hooks provided by react-router instead
export const pushRoute = (to: UrlObject | string): Promise<void> => {
	if (typeof to === "string") {
		return router.navigate(to);
	}

	let search: undefined | string = undefined;
	if (to.query && typeof to.query === "string") {
		search = to.query.startsWith("?") ? to.query : `?${to.query}`;
	} else if (to.query) {
		search = `?${stringify(to.query as ParsedUrlQueryInput)}`;
	}

	return router.navigate({
		pathname: to.pathname || "/",
		search
	});
};

export const getCurrentPathname = (): string => {
	return router.state.location.pathname;
};

export const getCurrentSearchParams = (): ParsedUrlQueryInput => {
	return parse(router.state.location.search.replace(/^\?/, "") || "");
};

export const getCurrentParams = (): Params => {
	return router.state.matches.reduce((result, match): Params => {
		return { ...result, ...match.params };
	}, { } as Params);
};
