import FieldLabel from "./FieldLabel";
import { fieldSurfaceClass, type FieldSurface } from "./TextField";

type SelectFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  required?: boolean;
  getLabel?: (value: string) => string;
  surface?: FieldSurface;
};

const SelectField = ({
  label,
  value,
  onChange,
  options,
  required = false,
  getLabel,
  surface = "background",
}: SelectFieldProps) => {
  return (
    <label className="block">
      <FieldLabel label={label} required={required} />
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className={`h-11 w-full rounded-md border border-input ${fieldSurfaceClass[surface]} px-3 text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20`}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {getLabel ? getLabel(option) : option}
          </option>
        ))}
      </select>
    </label>
  );
};

export default SelectField;
