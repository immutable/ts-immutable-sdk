import "./App.css";

function App() {
  return (
    <div>
      <main className="checkout-sdk-app">
        <h1>Sample Widgets</h1>
        <p>Choose a widget from the list below</p>
        <br />
        <div>
          <a href={"/connect"}>Connect Widget</a>
        </div>
        <br />
        <div>
          <a href={"/wallet"}>Wallet Widget</a>
        </div>
        <br />
        <div>
          <a href={"/swap"}>Swap Widget</a>
        </div>
        <br />
        <div>
          <a href={"/bridge"}>Bridge Widget</a>
        </div>
        <br />
        <div>
          <a href={"/on-ramp"}>On-ramp Widget</a>
        </div>
        <br />
        <div>
          <a
            href={
              "/sale?environmentId=249d9b0b-ee16-4dd5-91ee-96bece3b0473&collectionName=Iguanas&excludePaymentTypes=credit"
            }
          >
            Sale Widget
          </a>
        </div>
        <br />
        <div>
          <a href={"/marketplace-orchestrator"}>Marketplace Orchestrator</a>
        </div>
        <br />
      </main>
    </div>
  );
}

export default App;
