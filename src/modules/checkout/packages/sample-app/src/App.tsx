import './App.css';

function App () {
    return (
      <div>
        <main className="checkout-sdk-app">
          <h1>Sample App</h1>
          <p>This is a react app which implements the CheckoutSDK and Widgets, choose which one you would like to preview.</p>
          <div className="button-container">
          <div>
            <a href={"/widgets"}>Widgets</a>
          </div>
          <div>
           <a href={"/sdk"}>SDK</a>

          </div>
          </div>
          
        </main>
      </div>
    )
}

export default App;