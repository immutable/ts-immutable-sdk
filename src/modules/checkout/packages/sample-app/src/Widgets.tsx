import ConnectUI from './components/ui/connect/connect';

function Widgets () {
    return (
      <div>
        <main className="checkout-sdk-app">
          <h1>Sample Widgets</h1>
          <p>Choose a widget from the list below</p>
          <div>
            <a href={"/widgets/connect"}>Connect Widget</a>
          </div>
          <div>
           <a href={"/widgets/wallet"}>Wallet Widget</a>
          </div>

        </main>
      </div>
    )
}

export default Widgets;