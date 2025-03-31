# Event Handling with NextJS

This example demonstrates how to handle events in the Immutable Passport SDK using Next.js.

## Features

- Event handling for Passport authentication
- Example of listening to and responding to Passport events
- Implementation of event cleanup practices
- Modern UI design using Biom3 components

## Prerequisites

- Node.js (v18 or later)
- pnpm
- An Immutable Hub account with:
  - A registered application
  - Client ID
  - Publishable API key

## Setup

1. Clone the repository and navigate to the example directory:

```bash
cd examples/passport/event-handling-with-nextjs
```

2. Install dependencies using pnpm:

```bash
pnpm install
```

3. Copy the `.env.example` file to a new file called `.env.local`:

```bash
cp .env.example .env.local
```

4. Edit `.env.local` and add your credentials:

```
NEXT_PUBLIC_PUBLISHABLE_KEY=your_publishable_key
NEXT_PUBLIC_CLIENT_ID=your_client_id
```

## Running the Application

Start the development server:

```bash
pnpm dev
```

The application will be available at http://localhost:3000.

## User Interface

This application uses the Biom3 UI library to create a consistent and professional user experience. The UI includes:

- Modern card-based layout
- Responsive design that works on mobile and desktop
- Consistent styling across all pages
- Real-time event logging display

## Event Handling Best Practices

- Always clean up event listeners in useEffect cleanup functions
- Use proper error handling for event callbacks
- Verify that an event exists before attempting to listen to it
- Avoid memory leaks by removing listeners when components unmount

## UI Components

This example uses several Biom3 components including:

- `Stack` - For layout management
- `Card` - For containing content in visually distinct boxes
- `Button` - For interactive elements
- `Heading` - For section titles
- `Body` - For regular text content
- `Badge` - For status indicators
- `Divider` - For visual separation of content

## Testing

Run the tests:

```bash
pnpm test
```

Generate test coverage:

```bash
pnpm test:coverage
```

## References

- [Immutable Passport Documentation](https://docs.immutable.com/docs/zkEVM/products/passport)
- [Next.js Documentation](https://nextjs.org/docs)
- [Biom3 UI Components](https://github.com/immutable/biom3) 