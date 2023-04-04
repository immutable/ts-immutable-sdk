  ## switchWalletNetwork 
  The switchWalletNetwork function requests the user to switch and add a network to their wallet.

  Try to switch network straight away (only way to check if it exists or not)
         - if network is already added, pop up switch network
           - proceed -> sucessfully switch network
             - end
           - cancel -> catch error user rejected request
             - end
         - catch error network unavailable, network is not already added, need to add network
           - call add network for specific chainId + details
             - proceed add network -> sucessfully add network
             - network is added, Metamask then AUTOMATICALLY calls to switch network without our explicit call
               - proceed -> sucessfully switch network
                 - end
               - cancel -> catch error user rejected request
                 - end
           - cancel -> catch error user rejected request
             - end


When asking the user to add the specified network. If the user approves the request to add the network MetaMask will automatically popup a request to switch without us having to call for a switch explicitly.