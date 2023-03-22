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
    console.log("Resssss", res)
}

const closeWindow = (message) => {
    window.opener.postMessage({msg: message}, '*');
    window.close();
}


const ConfirmationDomainURL = "http://localhost:3000/transaction-confirmation"
const ConfirmationDomain = "http://localhost:3000"

const ConfirmationTitle = "Confirm this transaction"
const PopUpWidth = 350
const PopUpHeight = 350

const ConfirmationReadyMessageType = "ready"
const ConfirmationFinishMessageType = "transaction_confirmed"

const openPopupCenter = ({ url, title, width, height }) => {
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

const displayConfirmationScreen = async params => {
    return new Promise(resolve => {
        const confirmationWindow = openPopupCenter({
            url: ConfirmationDomain,
            title: ConfirmationTitle,
            width: PopUpWidth,
            height: PopUpHeight
        })

        const onConfirmationWindowReady = ({ data, origin }) => {
            if (
                origin != ConfirmationDomain ||
                data.eventType != "imx-passport" ||
                data.messageType != ConfirmationReadyMessageType
            ) {
                return
            }
            if (!confirmationWindow) {
                return
            }
            window.removeEventListener("message", onConfirmationWindowReady)
            PassportPostMessage(confirmationWindow, {
                ...params,
                eventType: "imx-passport"
            })
        }

        window.removeEventListener("message", onConfirmationWindowReady)

        // Handle messages posted from confirmation screen
        window.addEventListener("message", ({ data, origin }) => {
            if (
                origin != ConfirmationDomain ||
                data.eventType != "imx-passport" ||
                data.messageType != ConfirmationFinishMessageType
            ) {
                return
            }
            const { messageData } = data
            console.log("parent received msg: ", data)
            if (messageData.success) {
                resolve({ confirmed: true })
            }
            resolve({ confirmed: false })
        })
    })
}

const PassportPostMessage = (window, message) => {
    window.postMessage(message, "*")
}

