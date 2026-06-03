type TooltipPayloadItem = {
  dataKey?: string | number;
  name?: string | number;
  value?: string | number | null;
};

export function ChartTooltip({
  active,
  label,
  payload,
}: {
  active?: boolean;
  label?: string | number;
  payload?: TooltipPayloadItem[];
}) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-lg border bg-background px-3 py-2 text-xs shadow-sm">
      <p className="mb-1 font-medium">{label}</p>
      <div className="space-y-1">
        {payload.map((item) => (
          <div key={item.dataKey?.toString()} className="flex gap-3">
            <span className="text-muted-foreground">{item.name}</span>
            <span className="font-medium">{String(item.value ?? "-")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
