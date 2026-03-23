export default function Container({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="max-w-6xl mx-auto px-6 lg:px-8">{children}</div>;
}