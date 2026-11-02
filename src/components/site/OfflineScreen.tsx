export default function OfflineScreen({
  siteTitle,
  message,
}: {
  siteTitle: string;
  message: string;
}) {
  const [mainWord, ...rest] = siteTitle.split(".");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center text-foreground">
      <span className="text-3xl font-extrabold tracking-tight">
        <span className="text-accent">{mainWord}</span>
        {rest.length > 0 && <span className="align-super text-sm">.{rest.join(".")}</span>}
      </span>
      <p className="mt-6 max-w-md text-balance text-muted">{message}</p>
    </div>
  );
}
