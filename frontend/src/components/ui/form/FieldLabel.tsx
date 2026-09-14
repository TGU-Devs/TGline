type FieldLabelProps = {
  label: string;
  required: boolean;
};

const FieldLabel = ({ label, required }: FieldLabelProps) => {
  return (
    <span className="mb-1 flex items-center gap-2 text-sm font-semibold text-slate-700">
      {label}
      <span
        className={`rounded-sm px-1.5 py-0.5 text-[10px] font-bold ${
          required ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
        }`}
      >
        {required ? "必須" : "任意"}
      </span>
    </span>
  );
};

export default FieldLabel;
