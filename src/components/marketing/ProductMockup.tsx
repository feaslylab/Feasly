interface ProductMockupProps {
  className?: string;
}

export function ProductMockup({ className = "" }: ProductMockupProps) {
  return (
    <div className={`w-[420px] md:w-[560px] drop-shadow-xl rounded-2xl ${className}`}>
      <img 
        src="/hero-mock.png" 
        alt="Feasly Financial Modeling Dashboard" 
        className="w-full h-auto rounded-2xl"
        loading="eager"
      />
    </div>
  );
}