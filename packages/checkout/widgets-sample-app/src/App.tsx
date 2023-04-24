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
          <a href={'/lib/examples/connect.html'}>Connect Widget (Static)</a> |{' '}
          <a href={'/lib/examples/connect-webview.html'}>
            Connect Widget (Web View)
          </a>
        </div>
        <br />
        <div>
          <a href={'/wallet'}>Wallet Widget (React)</a> |{' '}
          <a href={'/lib/examples/wallet.html'}>Wallet Widget (Static)</a> |{' '}
          <a href={'/lib/examples/wallet-webview.html'}>
            Wallet Widget (Web View)
          </a>
        </div>
        <br />
        <div>
          <a href={'/swap'}>Swap Widget (React)</a> |{' '}
          <a href={'/lib/examples/swap.html'}>Swap Widget (Static)</a> |{' '}
          <a href={'/lib/examples/swap-webview.html'}>Swap Widget (Web View)</a>
        </div>
        <br />
        <div>
          <a href={'/bridge'}>Bridge Widget (React)</a> |{' '}
          <a href={'/lib/examples/bridge.html'}>Bridge Widget (Static)</a> |{' '}
          <a href={'/lib/examples/bridge-webview.html'}>
            Bridge Widget (Web View)
          </a>
        </div>
        <br />
        <div>
          <a href={'/buy'}>Buy Order Widget (React)</a> |{' '}
          <a href={'/lib/examples/buy.html'}>Buy Widget (Static)</a> |{' '}
          <a href={'/lib/examples/buy-webview.html'}>Buy Widget (Web View)</a>
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
      </main>
    </div>
  );
}

export default App;
