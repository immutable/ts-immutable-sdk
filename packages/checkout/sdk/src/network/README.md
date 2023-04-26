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
                 - throw an internal error to indicate that this was not a rejection of the add network call but of the switch call
                - catch internal error and throw appropriate external error
           - cancel -> catch error user rejected request
             - end


When asking the user to add the specified network. If the user approves the request to add the network MetaMask will automatically popup a request to switch without us having to call for a switch explicitly.

If the user approves adding the network and approves switching then all fine.

If the user rejects adding the network, we throw and error about rejecting the add network request.

If the user adds the network but rejetcs switching to it we must check again for the current network to determine whether the rejection was due to the add or the switch. We throw an internal error if the current network doesn't align with the intended one. We then handle this internal error to be able to throw the appropriate external error explaining that the user rejected the switch.

This seems quite complicated but I think it will help with UX if developers wanted to guide the user through adding and switching and knowing when the user accepted and rejected each request.