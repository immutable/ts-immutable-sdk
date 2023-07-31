import React from "react";
import {
  Box,
  Card,
  Select,
  Option,
  FormControl,
  Button,
} from "@biom3/react";

function LoadingButton() {
  return (
    <Button size={"large"} sx={{ background: "base.gradient.1" }} disabled>
      <Button.Icon
        icon="Loading"
        sx={{
          mr: "base.spacing.x1",
          ml: "0",
          width: "base.icon.size.400",
        }}
      />
      Crafting in progress
    </Button>
  );
}

function CraftingButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      size={"large"}
      sx={{ background: "base.gradient.1" }}
      onClick={onClick}
    >
      <Button.Icon
        icon="Minting"
        iconVariant="bold"
        sx={{
          mr: "base.spacing.x1",
          ml: "0",
          width: "base.icon.size.400",
        }}
      />
      Let's Craft
    </Button>
  );
}

function CraftingBox({
  loading,
  onCraftClick,
}: {
  loading: boolean;
  onCraftClick: () => void;
}) {
  return (
    <Card>
      <Card.Caption>
        <Box>
          <Box sx={{ marginBottom: "base.spacing.x3" }}>
            Choose NFTs in Inventory as Inputs
          </Box>
          {loading ? (
            <LoadingButton />
          ) : (
            <CraftingButton onClick={onCraftClick} />
          )}
        </Box>
        <FormControl sx={{ marginTop: "base.spacing.x8" }}>
          <FormControl.Label>Recipe</FormControl.Label>
          <Select>
            <Option optionKey="one">
              <Option.Icon icon="AirDrop" />
              <Option.Label>option one</Option.Label>
            </Option>
            <Option optionKey="two">
              <Option.Icon icon="Add" />
              <Option.Label>option two</Option.Label>
            </Option>
            <Option optionKey="threw">
              <Option.Icon icon="Calendar" />
              <Option.Label>option three</Option.Label>
            </Option>
          </Select>
        </FormControl>
      </Card.Caption>
    </Card>
  );
}

export default CraftingBox;
