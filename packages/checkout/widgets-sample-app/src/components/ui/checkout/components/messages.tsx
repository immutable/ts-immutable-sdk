import { Box, Body, Heading } from "@biom3/react";

const backgroundColors = {
  error: "base.color.status.fatal.bright",
  warning: "base.color.status.attention.bright",
  success: "base.color.status.success.bright",
};

type MessageType = "error" | "warning" | "success";

type MessageProps = {
  children: React.ReactNode;
  type: MessageType;
  title?: string;
};

/**
 * A versatile message component for displaying error, warning, or success messages.
 *
 * @param {Object} props - The component props.
 * @param {React.ReactNode} props.children - The content of the message.
 * @param {MessageType} props.type - The type of message ('error', 'warning', or 'success').
 *
 * @example
 * // Error message
 * <Message type="error">An error occurred. Please try again.</Message>
 *
 * @example
 * // Warning message
 * <Message type="warning">Your session will expire in 5 minutes.</Message>
 *
 * @example
 * // Success message
 * <Message type="success">Your changes have been saved successfully.</Message>
 */
export const Message = ({ children, type, title }: MessageProps) => {
  return (
    <Box
      sx={{
        background: backgroundColors[type],
        padding: "base.spacing.x4",
        borderRadius: "base.borderRadius.x4",
        marginTop: "base.spacing.x4",
      }}
    >
      {title && <Heading size="xSmall">{title}</Heading>}
      <Body size="small" sx={{ wordWrap: "break-word" }}>
        {children}
      </Body>
    </Box>
  );
};
