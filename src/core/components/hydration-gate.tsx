interface HydrationGateProps {
  readonly children: React.ReactNode;
}

/**
 * Renders `children` unchanged. Only the web build gates the first paint —
 * see `hydration-gate.web.tsx`.
 */
export function HydrationGate({
  children,
}: HydrationGateProps): React.JSX.Element {
  return <>{children}</>;
}
