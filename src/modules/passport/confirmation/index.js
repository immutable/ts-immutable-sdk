let newWindow;
const response = document.getElementById('response');
const sendMessage = () => {
    newWindow.postMessage({foo: 'bar'}, '*');
}

const openNewWindow = async () => {
    const messageData = {
        transactionType: "v1/transfer",
        transactionData: {
            type: 'ERC721',
            tokenId: '194442292',
            receiver: '0x0000000000000000000000000000000000000000',
            tokenAddress: '0xacb3c6a43d15b907e8433077b6d38ae40936fe2c',
        },
    }
    const res = await displayConfirmationScreen({messageType: "transaction_start", messageData: messageData})
    alert(res.confirmed)
    setTimeout(()=> {console.log("ressssss again", res)}, 1000)
}

const closeWindow = (message) => {
    window.opener.postMessage({msg: message}, '*');
    window.close();
}


const displayConfirmationScreen = async params => {
    return new Promise(resolve => {
        const confirmationWindow = openPopupCenter({
            url: ConfirmationDomainURL,
            title: ConfirmationTitle,
            width: PopUpWidth,
            height: PopUpHeight
        })

        const timer = setInterval(function () {
            console.log("timeerrr")
            if (confirmationWindow?.closed) {
                console.log("closeddddd")
                clearInterval(timer);
                resolve({ confirmed: false })
            }
        }, 1000);

        const messageHandler = ({data, origin}) => {
            // if (
            //     origin != ConfirmationDomain ||
            //     data.eventType != "imx-passport-confirmation" ||
            //     isReceiveMessageType(data.messageType)
            // ) {
            //     return { confirmed: false }
            // }
            switch (data.messageType) {
                case "confirmation_window_ready": {
                    if (!confirmationWindow) {
                        return
                    }
                    PassportPostMessage(confirmationWindow, {
                        ...params,
                        eventType: "imx-passport-confirmation"
                    })
                    break
                }
                case "transaction_confirmed": {
                    resolve({confirmed: true})
                    break
                }
                case "transaction_error": {
                    resolve({confirmed: false})
                    break
                }
                case "confirmation_window_close": {
                    resolve({confirmed: false})
                    break
                }
                default:
                    throw new Error("Unsupported message type")
            }
        }
        window.addEventListener("message", messageHandler)
    })
}

const PassportPostMessage = (window, message) => {
    window.postMessage(message, "*")
}

const openPopupCenter = ({url, title, width, height}) => {
    // Fixes dual-screen position                             Most browsers      Firefox
    const dualScreenLeft =
        window.screenLeft !== undefined ? window.screenLeft : window.screenX
    const dualScreenTop =
        window.screenTop !== undefined ? window.screenTop : window.screenY

    const windowWidth = window.innerWidth
        ? window.innerWidth
        : document.documentElement.clientWidth
            ? document.documentElement.clientWidth
            : screen.width
    const windowHeight = window.innerHeight
        ? window.innerHeight
        : document.documentElement.clientHeight
            ? document.documentElement.clientHeight
            : screen.height

    const systemZoom = windowWidth / window.screen.availWidth
    const left = (windowWidth - width) / 2 / systemZoom + dualScreenLeft
    const top = (windowHeight - height) / 2 / systemZoom + dualScreenTop
    const newWindow = window.open(
        url,
        title,
        `
    scrollbars=yes,
    width=${width / systemZoom}, 
    height=${height / systemZoom}, 
    top=${top}, 
    left=${left}
   `
    )
    if (newWindow) {
        newWindow.focus()
    }
    return newWindow
}

const ReceiveMessageType = [
    "imx-passport-confirmation-ready",
    "transaction_confirmed",
    "transaction_error",
    "confirmation_window_close"
]

function isReceiveMessageType(value) {
    return ReceiveMessageType.includes(value)
}

const ConfirmationTitle = "Confirm this transaction"
const PopUpWidth = 350
const PopUpHeight = 350

const ConfirmationDomainURL = "http://localhost:3000/transaction-confirmation"
const ConfirmationDomain = "http://localhost:3000"
