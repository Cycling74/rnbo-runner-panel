import { FC, memo, useCallback, useEffect } from "react";
import { EditorSignal, editorSignals } from "../../lib/signal";
import { useReactFlow } from "reactflow";

export const FitView: FC = memo(function WrappedFitView() {

	const { fitView } = useReactFlow();

	const triggerFitView = useCallback(() => {
		fitView();
	}, [fitView]);

	useEffect(() => {
		editorSignals.on(EditorSignal.fitView, triggerFitView);
		return () => {
			editorSignals.off(EditorSignal.fitView, triggerFitView);
		};

	}, [triggerFitView]);

	return null;
});
