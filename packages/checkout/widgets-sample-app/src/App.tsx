import './App.css';

function App() {
  return (
    <div>
      <main className="checkout-sdk-app">
        <h1>Sample Widgets</h1>
        <p>Choose a widget from the list below</p>
        <br />
        <div>
          <a href={'/connect'}>Connect Widget</a>
        </div>
        <br />
        <div>
          <a href={'/wallet'}>Wallet Widget</a>
        </div>
        <br />
        <div>
          <a href={'/swap'}>Swap Widget</a>
        </div>
        <br />
        <div>
          <a href={'/bridge'}>Bridge Widget</a>
        </div>
        <br />
        <div>
          <a href={'/on-ramp'}>On-ramp Widget</a>
        </div>
        <br />
        <div>
          <a href={'/sale?amount=0.01&fromContractAddress=0x21B51Ec6fB7654B7e59e832F9e9687f29dF94Fb8&environmentId=4dfc4bec-1867-49aa-ad35-d8a13b206c94'}>Sale Widget</a>
        </div>
        <br />
        <div>
          <a href={'/marketplace-orchestrator'}>Marketplace Orchestrator</a>
        </div>
        <br />
      </main>
    </div>
  );
}

export default App;
