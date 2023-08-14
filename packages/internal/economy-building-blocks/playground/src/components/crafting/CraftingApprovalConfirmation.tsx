import React from "react";

import { ConfirmationDialog, Heading, Body, Button } from "@biom3/react";

function CraftingApprovalConfirmation({
  gameName,
  visible,
  onConfirm,
  onReject,
  onCloseModal,
}: {
  gameName: string;
  visible: boolean;
  onConfirm: () => void;
  onReject: () => void;
  onCloseModal: () => void;
}) {
  return (
    <ConfirmationDialog visible={visible} onCloseModal={onCloseModal}>
      <ConfirmationDialog.Content>
        <Heading>Approval Confirmation</Heading>
        <Body>
          To craft items, please allow {gameName} to manage your tokens on your
          behalf
        </Body>
        <Button sx={{ background: "base.color.accent.1" }} onClick={onConfirm}>
          Confirm
        </Button>
        <Button sx={{ background: "base.color.brand.4" }} onClick={onReject}>
          Reject
        </Button>
      </ConfirmationDialog.Content>
    </ConfirmationDialog>
  );
}

export default CraftingApprovalConfirmation;
