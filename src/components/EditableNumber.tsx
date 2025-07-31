import { useState } from "react";
import { cn } from "@/lib/utils";

interface Props { 
  value: number; 
  onChange: (v: number) => void; 
  className?: string;
}

export default function EditableNumber({value, onChange, className}: Props) {
  const [edit, setEdit] = useState(false);
  const [tmp,  setTmp ] = useState(value);
  
  return edit ? (
    <input
      type="number"
      value={tmp}
      onChange={e=>setTmp(+e.target.value)}
      onBlur={()=>{ onChange(tmp); setEdit(false); }}
      onKeyDown={e=>e.key==='Enter' && (onChange(tmp), setEdit(false))}
      className={cn("w-24 px-1 border rounded", className)}
      autoFocus
    />
  ) : (
    <span
      className={cn("cursor-pointer underline-offset-2 hover:underline", className)}
      onClick={()=>setEdit(true)}
    >
      {value.toLocaleString()}
    </span>
  );
}