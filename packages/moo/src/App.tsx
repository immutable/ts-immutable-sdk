import { onLightBase } from "@biom3/design-tokens";
import {
	BiomeCombinedProviders,
	type DeeplyNestedSx,
	MenuItem,
} from "@biom3/react";
import { useMemo } from "react";
import { merge } from "ts-deepmerge";

const someSx: DeeplyNestedSx = {
	w: "200px",
	bg: "dodgerblue",
	moo: {
		brad: "30px",
	},
};

export function App() {
	const merged = useMemo(
		() => merge({ borderTopRightRadius: "20px", w: "300px" }, someSx),
		[],
	);
	return (
		<BiomeCombinedProviders theme={{ base: onLightBase }}>
			<MenuItem emphasized sx={merged}>
				<MenuItem.Label
					sx={{
						borderTopRightRadius: "0",
						borderTopLeftRadius: "0",
						button: {
							p: "base.spacing.x1",
						},
						article: {
							pr: "base.spacing.x10",
						},
					}}
				>
					Something
				</MenuItem.Label>
				<MenuItem.Caption>some caption</MenuItem.Caption>
				<MenuItem.Icon icon="AirDrop" />
			</MenuItem>
		</BiomeCombinedProviders>
	);
}
