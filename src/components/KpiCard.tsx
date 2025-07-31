interface Props {
  label:string;
  value:string;
}
export default function KpiCard({label,value}:Props){
  return(
    <div className="rounded-xl bg-card shadow p-4 flex flex-col gap-1 dark:bg-muted/50">
      <span className="text-sm uppercase tracking-wide opacity-70">{label}</span>
      <span className="text-2xl font-semibold">{value}</span>
    </div>
  );
}