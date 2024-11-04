import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { useExtendedCounterStore } from "./store/counterStore";
import { MiniCalculator } from "./miniCalculator";



function App() {
  const { count: counter, increment, decrement, reset, multiply } = useExtendedCounterStore();

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <MiniCalculator onCalculate={() => {}} />
      <h1>Counter App</h1>
      <div className="card">
        <div className="flex gap-4 justify-center">
          <button onClick={decrement}>Decrement</button>
          <button onClick={reset}>Reset</button>
          <button onClick={increment}>Increment</button>
          <button onClick={() => multiply(2)}>Double</button>
        </div>
        <p className="mt-4">Count: {counter}</p>
      </div>
      <p className="read-the-docs">
        Use the buttons above to modify the counter
      </p>
    </>
  );
}

export default App;
