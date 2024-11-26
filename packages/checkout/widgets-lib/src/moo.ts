import type { DeeplyNestedSx } from "@biom3/react";

const moo: DeeplyNestedSx = {
	border: "1px solid red",

	":hover": {
		backgroundColor: "blue",
	},
};

console.log("@@@@@", moo);
