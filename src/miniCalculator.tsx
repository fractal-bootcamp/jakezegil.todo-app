import { useExtendedCounterStore } from "./store/counterStore";
import { FC } from "react";
interface MiniCalculatorProps {
  onCalculate?: (result: number) => void;
}

export const MiniCalculator: FC<MiniCalculatorProps> = ({ onCalculate }) => {
  const { count, multiply, reset } = useExtendedCounterStore();

  const handleAdd = (a: number) => {
    multiply(1 + a/count);
    onCalculate?.(count);
  };

  const handleSubtract = (a: number) => {
    multiply(1 - a/count);
    onCalculate?.(count);
  };

  const handleDivide = (a: number) => {
    if (a === 0) {
      console.error("Cannot divide by zero");
      return;
    }
    multiply(1/a);
    onCalculate?.(count);
  };

  const handleClear = () => {
    reset();
    onCalculate?.(0);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <button onClick={() => handleAdd(1)}>+1</button>
        <button onClick={() => handleSubtract(1)}>-1</button>
        <button onClick={() => multiply(2)}>×2</button>
        <button onClick={() => handleDivide(2)}>÷2</button>
      </div>
      <button onClick={handleClear}>Clear</button>
      <div>Current value: {count}</div>
    </div>
  );
};
