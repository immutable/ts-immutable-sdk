'use client';

export default function Logout() {
  // render the view for after the logout is complete
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">Logged Out</h1>
      <div className="grid grid-cols-1 gap-4 text-center">
        <a
          className="underline"
          href="/"
        >
          Return to examples
        </a>
      </div>
    </div>
  );
}
