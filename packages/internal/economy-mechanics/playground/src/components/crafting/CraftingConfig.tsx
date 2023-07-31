import React from "react";
import { Card, FormControl, TextInput } from "@biom3/react";

function CraftingConfig({
  collectionAddress,
  onCollectionAddressChange,
  multicallerAddress,
  onMulticallerAddressChange,
  gameProjectId,
  onGameProjectIdChange,
}: {
  collectionAddress: string;
  onCollectionAddressChange: (collectionAddress: string) => void;
  multicallerAddress: string;
  onMulticallerAddressChange: (multicallerAddress: string) => void;
  gameProjectId: string;
  onGameProjectIdChange: (gameProjectId: string) => void;
}) {
  return (
    <Card>
      <Card.Caption>
        <FormControl sx={{marginBottom: "base.spacing.x4"}}>
          <FormControl.Label>Collection Address</FormControl.Label>
          <TextInput
            value={collectionAddress}
            onChange={async (e) => {
              await onCollectionAddressChange(e.target.value);
            }}
          />
        </FormControl>
        <FormControl sx={{marginBottom: "base.spacing.x4"}}>
          <FormControl.Label>Multicaller Address</FormControl.Label>
          <TextInput
            value={multicallerAddress}
            onChange={async (e) => {
              onMulticallerAddressChange(e.target.value);
            }}
          />
        </FormControl>
        <FormControl sx={{marginBottom: "base.spacing.x4"}}>
          <FormControl.Label>Game Project Id</FormControl.Label>
          <TextInput
            value={gameProjectId}
            onChange={async (e) => {
              onGameProjectIdChange(e.target.value);
            }}
          />
        </FormControl>
      </Card.Caption>
    </Card>
  );
}

export default CraftingConfig;
