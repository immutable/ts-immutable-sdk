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
			case 1:
				return setScreenIndex(2);
			case 2: {
				setCacheItem(SEEN_ONBOARDING_KEY, true);
				return setVisible(false);
			}
		}
	}, [screenIndex]);

	return (
		<Drawer size="threeQuarter" visible={visible} showHeaderBar={false}>
			<Drawer.Content sx={{ ...vFlex, alignItems: 'center', textAlign: "center" }}>
				<currentScreenContent.image />
				<Divider size="xSmall" textAlign="center">{currentScreenContent.caption}</Divider>
				<Heading>{currentScreenContent.title}</Heading>
				<OnboardingPagination
					disabled
					currentPage={screenIndex + 1}
					totalPages={3}
				/>
				<Button onClick={handleCtaOnClick}>
					{currentScreenContent.buttonText}
				</Button>
			</Drawer.Content>
		</Drawer>
	);
}
