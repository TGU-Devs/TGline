import FieldLabel from "./FieldLabel";

export type FieldSurface = "background" | "card";

export const fieldSurfaceClass: Record<FieldSurface, string> = {
  background: "bg-background",
  card: "bg-card",
};

type TextFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  inputMode?: "numeric";
  surface?: FieldSurface;
};

const TextField = ({
  label,
  value,
  onChange,
  required = false,
  inputMode,
  surface = "background",
}: TextFieldProps) => {
  return (
    <label className="block">
      <FieldLabel label={label} required={required} />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        inputMode={inputMode}
        className={`h-11 w-full rounded-md border border-input ${fieldSurfaceClass[surface]} px-3 text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20`}
      />
    </label>
  );
};

export default TextField;
