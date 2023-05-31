import './App.css';

function App() {
  return (
    <div>
      <main className="checkout-sdk-app">
        <h1>Sample Widgets</h1>
        <p>Choose a widget from the list below</p>
        <br />
        <div>
          <a href={'/connect'}>Connect Widget (React)</a> |{' '}
          <a href={'/lib/examples/connect.html'}>Connect Widget (Static)</a>
        </div>
        <br />
        <div>
          <a href={'/wallet'}>Wallet Widget (React)</a> |{' '}
          <a href={'/lib/examples/wallet.html'}>Wallet Widget (Static)</a>
        </div>
        <br />
        <div>
          <a href={'/swap'}>Swap Widget (React)</a> |{' '}
          <a href={'/lib/examples/swap.html'}>Swap Widget (Static)</a>
        </div>
        <br />
        <div>
          <a href={'/bridge'}>Bridge Widget (React)</a> |{' '}
          <a href={'/lib/examples/bridge.html'}>Bridge Widget (Static)</a>
        </div>
        <br />
        <div>
          <a href={'/buy'}>Buy Order Widget (React)</a> |{' '}
          <a href={'/lib/examples/buy.html'}>Buy Widget (Static)</a>
        </div>
        <br />
        <div>
          <a href={'/example'}>Example Widget (React)</a> |{' '}
          <a href={'/lib/examples/example.html'}>Example Widget (Static)</a> |{' '}
          <a href={'/lib/examples/example-webview.html'}>
            Example Widget (Web View)
          </a>
        </div>
        <br />
        <div>
          <a href={'/marketplace-orchestrator'}>Marketplace Orchestrator</a>
        </div>
        <br />
        <div>
          <a href={'/async-loader'}>Async Loader</a>
        </div>
      </main>
    </div>
  );
}

export default App;
