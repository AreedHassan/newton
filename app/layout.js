export const metadata = {
  title: 'Newton Chat',
  description: 'Chat application',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
