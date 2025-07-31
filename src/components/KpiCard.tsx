interface Props {
  label:string;
  value:string;
}
export default function KpiCard({label,value}:Props){
  return(
    <div className="rounded-xl bg-muted/30 p-4 shadow-sm w-full
                    flex flex-col gap-1">
      <span className="text-sm uppercase tracking-wide opacity-70">{label}</span>
      <span className="text-2xl font-semibold">{value}</span>
    </div>
  );
}