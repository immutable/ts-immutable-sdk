import {
	Button,
	Divider,
	Drawer,
	Heading,
	OnboardingPagination,
	vFlex,
} from "@biom3/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
	getCacheItem,
	SEEN_ONBOARDING_KEY,
	setCacheItem,
} from "../../functions/onboardingState";
import { OnboardingIllustration1 } from "./OnboardingIllustration1";
import { OnboardingIllustration2 } from "./OnboardingIllustration2";
import { OnboardingIllustration3 } from "./OnboardingIllustration3";

const MAPPED_SCREEN_CONTENT = [
	{
		title: (
			<>
				Payments on Immutable
				<br />
				have evolved
			</>
		),
		caption: "listen up",
		buttonText: "Next",
		image: OnboardingIllustration1,
	},
	{
		title: (
			<>
				Deliver tokens to Passport
				<br />
				&amp; pay from any wallet
			</>
		),
		caption: "whats evolved",
		buttonText: "Next",
		image: OnboardingIllustration2,
	},
	{
		title: (
			<>
				Pay with tokens on other chains,
				<br />
				we'll find you the best option
			</>
		),
		caption: "listen up",
		buttonText: "Choose the Wallet to Pay with",
		image: OnboardingIllustration3,
	},
];

export function OnboardingDrawer() {
	const [visible, setVisible] = useState(false);
	const [screenIndex, setScreenIndex] = useState<0 | 1 | 2>(0);
	const currentScreenContent = useMemo(
		() => MAPPED_SCREEN_CONTENT[screenIndex],
		[screenIndex],
	);

	useEffect(() => {
		async function checkToInitialiseDrawer() {
			const cachedValue = await getCacheItem(SEEN_ONBOARDING_KEY);
			return cachedValue ? setVisible(false) : setVisible(true);
		}

		checkToInitialiseDrawer();
	}, []);

	const handleCtaOnClick = useCallback(() => {
		switch (screenIndex) {
			case 0:
				return setScreenIndex(1);
			case 1: {
				// @NOTE: once they have "seen" the final slide, mark it as such
				// in the cache so that we don't show this to users again
				setCacheItem(SEEN_ONBOARDING_KEY, true);
				return setScreenIndex(2);
			};
			case 2: 
				// @NOTE: they have "seen" all slides - so this drawer can be closed
				return setVisible(false);
		}
	}, [screenIndex]);

	return (
		<Drawer size="threeQuarter" visible={visible} showHeaderBar={false}>
			<Drawer.Content
				sx={{
					...vFlex,
					alignItems: "center",
					textAlign: "center",
					px: "base.spacing.x6",
				}}
			>
				<currentScreenContent.image />
				<Divider
					size="xSmall"
					textAlign="center"
					sx={{ mt: "base.spacing.x6", mb: "base.spacing.x4" }}
				>
					{currentScreenContent.caption}
				</Divider>
				<Heading size="small">{currentScreenContent.title}</Heading>
				<OnboardingPagination
					disabled
					size="small"
					currentPage={screenIndex + 1}
					totalPages={3}
					sx={{ mt: "base.spacing.x11", mb: "base.spacing.x8" }}
				/>
				<Button
					variant={screenIndex === 2 ? "primary" : "tertiary"}
					onClick={handleCtaOnClick}
					size="large"
					sx={{ alignSelf: "stretch" }}
				>
					{currentScreenContent.buttonText}
				</Button>
			</Drawer.Content>
		</Drawer>
	);
}
