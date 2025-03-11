"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/@magic-sdk+types@17.2.0";
exports.ids = ["vendor-chunks/@magic-sdk+types@17.2.0"];
exports.modules = {

/***/ "(ssr)/../../../node_modules/.pnpm/@magic-sdk+types@17.2.0/node_modules/@magic-sdk/types/dist/es/index.mjs":
/*!***********************************************************************************************************!*\
  !*** ../../../node_modules/.pnpm/@magic-sdk+types@17.2.0/node_modules/@magic-sdk/types/dist/es/index.mjs ***!
  \***********************************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   DeepLinkPage: () => (/* binding */ f),\n/* harmony export */   DeviceVerificationEventEmit: () => (/* binding */ T),\n/* harmony export */   DeviceVerificationEventOnReceived: () => (/* binding */ A),\n/* harmony export */   EthChainType: () => (/* binding */ R),\n/* harmony export */   Events: () => (/* binding */ c),\n/* harmony export */   LoginWithEmailOTPEventEmit: () => (/* binding */ I),\n/* harmony export */   LoginWithEmailOTPEventOnReceived: () => (/* binding */ x),\n/* harmony export */   LoginWithMagicLinkEventEmit: () => (/* binding */ v),\n/* harmony export */   LoginWithMagicLinkEventOnReceived: () => (/* binding */ E),\n/* harmony export */   MagicIncomingWindowMessage: () => (/* binding */ u),\n/* harmony export */   MagicOutgoingWindowMessage: () => (/* binding */ g),\n/* harmony export */   MagicPayloadMethod: () => (/* binding */ l),\n/* harmony export */   RPCErrorCode: () => (/* binding */ m),\n/* harmony export */   RecoveryMethodType: () => (/* binding */ N),\n/* harmony export */   SDKErrorCode: () => (/* binding */ o),\n/* harmony export */   SDKWarningCode: () => (/* binding */ _),\n/* harmony export */   Wallets: () => (/* binding */ p)\n/* harmony export */ });\nvar o=(i=>(i.MissingApiKey=\"MISSING_API_KEY\",i.ModalNotReady=\"MODAL_NOT_READY\",i.MalformedResponse=\"MALFORMED_RESPONSE\",i.InvalidArgument=\"INVALID_ARGUMENT\",i.ExtensionNotInitialized=\"EXTENSION_NOT_INITIALIZED\",i.IncompatibleExtensions=\"INCOMPATIBLE_EXTENSIONS\",i))(o||{}),_=(a=>(a.SyncWeb3Method=\"SYNC_WEB3_METHOD\",a.DuplicateIframe=\"DUPLICATE_IFRAME\",a.ReactNativeEndpointConfiguration=\"REACT_NATIVE_ENDPOINT_CONFIGURATION\",a.DeprecationNotice=\"DEPRECATION_NOTICE\",a))(_||{}),m=(t=>(t[t.ParseError=-32700]=\"ParseError\",t[t.InvalidRequest=-32600]=\"InvalidRequest\",t[t.MethodNotFound=-32601]=\"MethodNotFound\",t[t.InvalidParams=-32602]=\"InvalidParams\",t[t.InternalError=-32603]=\"InternalError\",t[t.MagicLinkFailedVerification=-1e4]=\"MagicLinkFailedVerification\",t[t.MagicLinkExpired=-10001]=\"MagicLinkExpired\",t[t.MagicLinkRateLimited=-10002]=\"MagicLinkRateLimited\",t[t.MagicLinkInvalidRedirectURL=-10006]=\"MagicLinkInvalidRedirectURL\",t[t.UserAlreadyLoggedIn=-10003]=\"UserAlreadyLoggedIn\",t[t.UpdateEmailFailed=-10004]=\"UpdateEmailFailed\",t[t.UserRequestEditEmail=-10005]=\"UserRequestEditEmail\",t[t.InactiveRecipient=-10010]=\"InactiveRecipient\",t[t.AccessDeniedToUser=-10011]=\"AccessDeniedToUser\",t[t.RedirectLoginComplete=-10015]=\"RedirectLoginComplete\",t))(m||{});var p=(s=>(s.MetaMask=\"metamask\",s.CoinbaseWallet=\"coinbase_wallet\",s))(p||{}),c=(n=>(n.WalletSelected=\"wallet_selected\",n.WalletConnected=\"wallet_connected\",n.WalletRejected=\"wallet_rejected\",n))(c||{}),l=(e=>(e.LoginWithSms=\"magic_auth_login_with_sms\",e.LoginWithEmailOTP=\"magic_auth_login_with_email_otp\",e.LoginWithMagicLink=\"magic_auth_login_with_magic_link\",e.LoginWithCredential=\"magic_auth_login_with_credential\",e.SetAuthorizationToken=\"magic_auth_set_authorization_token\",e.GetIdToken=\"magic_auth_get_id_token\",e.GenerateIdToken=\"magic_auth_generate_id_token\",e.GetMetadata=\"magic_auth_get_metadata\",e.IsLoggedIn=\"magic_is_logged_in\",e.Logout=\"magic_auth_logout\",e.UpdateEmail=\"magic_auth_update_email\",e.UserSettings=\"magic_auth_settings\",e.UserSettingsTestMode=\"magic_auth_settings_testing_mode\",e.LoginWithSmsTestMode=\"magic_auth_login_with_sms_testing_mode\",e.LoginWithEmailOTPTestMode=\"magic_auth_login_with_email_otp_testing_mode\",e.LoginWithMagicLinkTestMode=\"magic_login_with_magic_link_testing_mode\",e.LoginWithCredentialTestMode=\"magic_auth_login_with_credential_testing_mode\",e.GetIdTokenTestMode=\"magic_auth_get_id_token_testing_mode\",e.GenerateIdTokenTestMode=\"magic_auth_generate_id_token_testing_mode\",e.GetMetadataTestMode=\"magic_auth_get_metadata_testing_mode\",e.IsLoggedInTestMode=\"magic_auth_is_logged_in_testing_mode\",e.LogoutTestMode=\"magic_auth_logout_testing_mode\",e.UpdateEmailTestMode=\"magic_auth_update_email_testing_mode\",e.IntermediaryEvent=\"magic_intermediary_event\",e.RequestAccounts=\"eth_requestAccounts\",e.GetInfo=\"magic_get_info\",e.ShowUI=\"magic_wallet\",e.NFTPurchase=\"magic_nft_purchase\",e.NFTCheckout=\"magic_nft_checkout\",e.NFTTransfer=\"magic_nft_transfer\",e.RequestUserInfoWithUI=\"mc_request_user_info\",e.Disconnect=\"mc_disconnect\",e.RecoverAccount=\"magic_auth_recover_account\",e.RecoverAccountTestMode=\"magic_auth_recover_account_testing_mode\",e.MagicBoxHeartBeat=\"magic_box_heart_beat\",e.AutoConnect=\"mc_auto_connect\",e.Login=\"mc_login\",e.EncryptV1=\"magic_auth_encrypt_v1\",e.DecryptV1=\"magic_auth_decrypt_v1\",e.ShowNFTs=\"magic_show_nfts\",e.ShowOnRamp=\"magic_show_fiat_onramp\",e.ShowSendTokensUI=\"magic_show_send_tokens_ui\",e.ShowAddress=\"magic_show_address\",e.ShowBalances=\"magic_show_balances\",e.SendGaslessTransaction=\"eth_sendGaslessTransaction\",e))(l||{});var u=(i=>(i.MAGIC_HANDLE_RESPONSE=\"MAGIC_HANDLE_RESPONSE\",i.MAGIC_OVERLAY_READY=\"MAGIC_OVERLAY_READY\",i.MAGIC_SHOW_OVERLAY=\"MAGIC_SHOW_OVERLAY\",i.MAGIC_HIDE_OVERLAY=\"MAGIC_HIDE_OVERLAY\",i.MAGIC_HANDLE_EVENT=\"MAGIC_HANDLE_EVENT\",i.MAGIC_MG_BOX_SEND_RECEIPT=\"MAGIC_MG_BOX_SEND_RECEIPT\",i))(u||{}),g=(r=>(r.MAGIC_HANDLE_REQUEST=\"MAGIC_HANDLE_REQUEST\",r))(g||{});var f=(n=>(n.UpdateEmail=\"update-email\",n.MFA=\"mfa\",n.Recovery=\"recovery\",n))(f||{});var v=(r=>(r.Retry=\"retry\",r))(v||{}),E=(s=>(s.EmailSent=\"email-sent\",s.EmailNotDeliverable=\"email-not-deliverable\",s))(E||{}),I=(s=>(s.VerifyEmailOtp=\"verify-email-otp\",s.Cancel=\"cancel\",s))(I||{}),x=(n=>(n.EmailOTPSent=\"email-otp-sent\",n.InvalidEmailOtp=\"invalid-email-otp\",n.ExpiredEmailOtp=\"expired-email-otp\",n))(x||{}),T=(r=>(r.Retry=\"device-retry\",r))(T||{}),A=(a=>(a.DeviceApproved=\"device-approved\",a.DeviceNeedsApproval=\"device-needs-approval\",a.DeviceVerificationLinkExpired=\"device-verification-link-expired\",a.DeviceVerificationEmailSent=\"device-verification-email-sent\",a))(A||{});var R=(r=>(r.Harmony=\"HARMONY\",r))(R||{});var N=(r=>(r.PhoneNumber=\"phone_number\",r))(N||{});\n//# sourceMappingURL=index.mjs.map\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL0BtYWdpYy1zZGsrdHlwZXNAMTcuMi4wL25vZGVfbW9kdWxlcy9AbWFnaWMtc2RrL3R5cGVzL2Rpc3QvZXMvaW5kZXgubWpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsK1FBQStRLDZNQUE2TSxveEJBQW94QixFQUFFLDZFQUE2RSw2SEFBNkgsd2pFQUF3akUsRUFBRSxzU0FBc1MsZ0VBQWdFLEVBQUUsbUZBQW1GLEVBQUUsb0NBQW9DLHlGQUF5Rix3RUFBd0UsOEhBQThILHlDQUF5QyxxT0FBcU8sRUFBRSx3Q0FBd0MsRUFBRSxpREFBaUQsRUFBcWM7QUFDdGlLIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vQGV4YW1wbGVzL2xvZ2luLXdpdGgtcGFzc3BvcnQtYnJpZGdlLy4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9AbWFnaWMtc2RrK3R5cGVzQDE3LjIuMC9ub2RlX21vZHVsZXMvQG1hZ2ljLXNkay90eXBlcy9kaXN0L2VzL2luZGV4Lm1qcz82ZGRlIl0sInNvdXJjZXNDb250ZW50IjpbInZhciBvPShpPT4oaS5NaXNzaW5nQXBpS2V5PVwiTUlTU0lOR19BUElfS0VZXCIsaS5Nb2RhbE5vdFJlYWR5PVwiTU9EQUxfTk9UX1JFQURZXCIsaS5NYWxmb3JtZWRSZXNwb25zZT1cIk1BTEZPUk1FRF9SRVNQT05TRVwiLGkuSW52YWxpZEFyZ3VtZW50PVwiSU5WQUxJRF9BUkdVTUVOVFwiLGkuRXh0ZW5zaW9uTm90SW5pdGlhbGl6ZWQ9XCJFWFRFTlNJT05fTk9UX0lOSVRJQUxJWkVEXCIsaS5JbmNvbXBhdGlibGVFeHRlbnNpb25zPVwiSU5DT01QQVRJQkxFX0VYVEVOU0lPTlNcIixpKSkob3x8e30pLF89KGE9PihhLlN5bmNXZWIzTWV0aG9kPVwiU1lOQ19XRUIzX01FVEhPRFwiLGEuRHVwbGljYXRlSWZyYW1lPVwiRFVQTElDQVRFX0lGUkFNRVwiLGEuUmVhY3ROYXRpdmVFbmRwb2ludENvbmZpZ3VyYXRpb249XCJSRUFDVF9OQVRJVkVfRU5EUE9JTlRfQ09ORklHVVJBVElPTlwiLGEuRGVwcmVjYXRpb25Ob3RpY2U9XCJERVBSRUNBVElPTl9OT1RJQ0VcIixhKSkoX3x8e30pLG09KHQ9Pih0W3QuUGFyc2VFcnJvcj0tMzI3MDBdPVwiUGFyc2VFcnJvclwiLHRbdC5JbnZhbGlkUmVxdWVzdD0tMzI2MDBdPVwiSW52YWxpZFJlcXVlc3RcIix0W3QuTWV0aG9kTm90Rm91bmQ9LTMyNjAxXT1cIk1ldGhvZE5vdEZvdW5kXCIsdFt0LkludmFsaWRQYXJhbXM9LTMyNjAyXT1cIkludmFsaWRQYXJhbXNcIix0W3QuSW50ZXJuYWxFcnJvcj0tMzI2MDNdPVwiSW50ZXJuYWxFcnJvclwiLHRbdC5NYWdpY0xpbmtGYWlsZWRWZXJpZmljYXRpb249LTFlNF09XCJNYWdpY0xpbmtGYWlsZWRWZXJpZmljYXRpb25cIix0W3QuTWFnaWNMaW5rRXhwaXJlZD0tMTAwMDFdPVwiTWFnaWNMaW5rRXhwaXJlZFwiLHRbdC5NYWdpY0xpbmtSYXRlTGltaXRlZD0tMTAwMDJdPVwiTWFnaWNMaW5rUmF0ZUxpbWl0ZWRcIix0W3QuTWFnaWNMaW5rSW52YWxpZFJlZGlyZWN0VVJMPS0xMDAwNl09XCJNYWdpY0xpbmtJbnZhbGlkUmVkaXJlY3RVUkxcIix0W3QuVXNlckFscmVhZHlMb2dnZWRJbj0tMTAwMDNdPVwiVXNlckFscmVhZHlMb2dnZWRJblwiLHRbdC5VcGRhdGVFbWFpbEZhaWxlZD0tMTAwMDRdPVwiVXBkYXRlRW1haWxGYWlsZWRcIix0W3QuVXNlclJlcXVlc3RFZGl0RW1haWw9LTEwMDA1XT1cIlVzZXJSZXF1ZXN0RWRpdEVtYWlsXCIsdFt0LkluYWN0aXZlUmVjaXBpZW50PS0xMDAxMF09XCJJbmFjdGl2ZVJlY2lwaWVudFwiLHRbdC5BY2Nlc3NEZW5pZWRUb1VzZXI9LTEwMDExXT1cIkFjY2Vzc0RlbmllZFRvVXNlclwiLHRbdC5SZWRpcmVjdExvZ2luQ29tcGxldGU9LTEwMDE1XT1cIlJlZGlyZWN0TG9naW5Db21wbGV0ZVwiLHQpKShtfHx7fSk7dmFyIHA9KHM9PihzLk1ldGFNYXNrPVwibWV0YW1hc2tcIixzLkNvaW5iYXNlV2FsbGV0PVwiY29pbmJhc2Vfd2FsbGV0XCIscykpKHB8fHt9KSxjPShuPT4obi5XYWxsZXRTZWxlY3RlZD1cIndhbGxldF9zZWxlY3RlZFwiLG4uV2FsbGV0Q29ubmVjdGVkPVwid2FsbGV0X2Nvbm5lY3RlZFwiLG4uV2FsbGV0UmVqZWN0ZWQ9XCJ3YWxsZXRfcmVqZWN0ZWRcIixuKSkoY3x8e30pLGw9KGU9PihlLkxvZ2luV2l0aFNtcz1cIm1hZ2ljX2F1dGhfbG9naW5fd2l0aF9zbXNcIixlLkxvZ2luV2l0aEVtYWlsT1RQPVwibWFnaWNfYXV0aF9sb2dpbl93aXRoX2VtYWlsX290cFwiLGUuTG9naW5XaXRoTWFnaWNMaW5rPVwibWFnaWNfYXV0aF9sb2dpbl93aXRoX21hZ2ljX2xpbmtcIixlLkxvZ2luV2l0aENyZWRlbnRpYWw9XCJtYWdpY19hdXRoX2xvZ2luX3dpdGhfY3JlZGVudGlhbFwiLGUuU2V0QXV0aG9yaXphdGlvblRva2VuPVwibWFnaWNfYXV0aF9zZXRfYXV0aG9yaXphdGlvbl90b2tlblwiLGUuR2V0SWRUb2tlbj1cIm1hZ2ljX2F1dGhfZ2V0X2lkX3Rva2VuXCIsZS5HZW5lcmF0ZUlkVG9rZW49XCJtYWdpY19hdXRoX2dlbmVyYXRlX2lkX3Rva2VuXCIsZS5HZXRNZXRhZGF0YT1cIm1hZ2ljX2F1dGhfZ2V0X21ldGFkYXRhXCIsZS5Jc0xvZ2dlZEluPVwibWFnaWNfaXNfbG9nZ2VkX2luXCIsZS5Mb2dvdXQ9XCJtYWdpY19hdXRoX2xvZ291dFwiLGUuVXBkYXRlRW1haWw9XCJtYWdpY19hdXRoX3VwZGF0ZV9lbWFpbFwiLGUuVXNlclNldHRpbmdzPVwibWFnaWNfYXV0aF9zZXR0aW5nc1wiLGUuVXNlclNldHRpbmdzVGVzdE1vZGU9XCJtYWdpY19hdXRoX3NldHRpbmdzX3Rlc3RpbmdfbW9kZVwiLGUuTG9naW5XaXRoU21zVGVzdE1vZGU9XCJtYWdpY19hdXRoX2xvZ2luX3dpdGhfc21zX3Rlc3RpbmdfbW9kZVwiLGUuTG9naW5XaXRoRW1haWxPVFBUZXN0TW9kZT1cIm1hZ2ljX2F1dGhfbG9naW5fd2l0aF9lbWFpbF9vdHBfdGVzdGluZ19tb2RlXCIsZS5Mb2dpbldpdGhNYWdpY0xpbmtUZXN0TW9kZT1cIm1hZ2ljX2xvZ2luX3dpdGhfbWFnaWNfbGlua190ZXN0aW5nX21vZGVcIixlLkxvZ2luV2l0aENyZWRlbnRpYWxUZXN0TW9kZT1cIm1hZ2ljX2F1dGhfbG9naW5fd2l0aF9jcmVkZW50aWFsX3Rlc3RpbmdfbW9kZVwiLGUuR2V0SWRUb2tlblRlc3RNb2RlPVwibWFnaWNfYXV0aF9nZXRfaWRfdG9rZW5fdGVzdGluZ19tb2RlXCIsZS5HZW5lcmF0ZUlkVG9rZW5UZXN0TW9kZT1cIm1hZ2ljX2F1dGhfZ2VuZXJhdGVfaWRfdG9rZW5fdGVzdGluZ19tb2RlXCIsZS5HZXRNZXRhZGF0YVRlc3RNb2RlPVwibWFnaWNfYXV0aF9nZXRfbWV0YWRhdGFfdGVzdGluZ19tb2RlXCIsZS5Jc0xvZ2dlZEluVGVzdE1vZGU9XCJtYWdpY19hdXRoX2lzX2xvZ2dlZF9pbl90ZXN0aW5nX21vZGVcIixlLkxvZ291dFRlc3RNb2RlPVwibWFnaWNfYXV0aF9sb2dvdXRfdGVzdGluZ19tb2RlXCIsZS5VcGRhdGVFbWFpbFRlc3RNb2RlPVwibWFnaWNfYXV0aF91cGRhdGVfZW1haWxfdGVzdGluZ19tb2RlXCIsZS5JbnRlcm1lZGlhcnlFdmVudD1cIm1hZ2ljX2ludGVybWVkaWFyeV9ldmVudFwiLGUuUmVxdWVzdEFjY291bnRzPVwiZXRoX3JlcXVlc3RBY2NvdW50c1wiLGUuR2V0SW5mbz1cIm1hZ2ljX2dldF9pbmZvXCIsZS5TaG93VUk9XCJtYWdpY193YWxsZXRcIixlLk5GVFB1cmNoYXNlPVwibWFnaWNfbmZ0X3B1cmNoYXNlXCIsZS5ORlRDaGVja291dD1cIm1hZ2ljX25mdF9jaGVja291dFwiLGUuTkZUVHJhbnNmZXI9XCJtYWdpY19uZnRfdHJhbnNmZXJcIixlLlJlcXVlc3RVc2VySW5mb1dpdGhVST1cIm1jX3JlcXVlc3RfdXNlcl9pbmZvXCIsZS5EaXNjb25uZWN0PVwibWNfZGlzY29ubmVjdFwiLGUuUmVjb3ZlckFjY291bnQ9XCJtYWdpY19hdXRoX3JlY292ZXJfYWNjb3VudFwiLGUuUmVjb3ZlckFjY291bnRUZXN0TW9kZT1cIm1hZ2ljX2F1dGhfcmVjb3Zlcl9hY2NvdW50X3Rlc3RpbmdfbW9kZVwiLGUuTWFnaWNCb3hIZWFydEJlYXQ9XCJtYWdpY19ib3hfaGVhcnRfYmVhdFwiLGUuQXV0b0Nvbm5lY3Q9XCJtY19hdXRvX2Nvbm5lY3RcIixlLkxvZ2luPVwibWNfbG9naW5cIixlLkVuY3J5cHRWMT1cIm1hZ2ljX2F1dGhfZW5jcnlwdF92MVwiLGUuRGVjcnlwdFYxPVwibWFnaWNfYXV0aF9kZWNyeXB0X3YxXCIsZS5TaG93TkZUcz1cIm1hZ2ljX3Nob3dfbmZ0c1wiLGUuU2hvd09uUmFtcD1cIm1hZ2ljX3Nob3dfZmlhdF9vbnJhbXBcIixlLlNob3dTZW5kVG9rZW5zVUk9XCJtYWdpY19zaG93X3NlbmRfdG9rZW5zX3VpXCIsZS5TaG93QWRkcmVzcz1cIm1hZ2ljX3Nob3dfYWRkcmVzc1wiLGUuU2hvd0JhbGFuY2VzPVwibWFnaWNfc2hvd19iYWxhbmNlc1wiLGUuU2VuZEdhc2xlc3NUcmFuc2FjdGlvbj1cImV0aF9zZW5kR2FzbGVzc1RyYW5zYWN0aW9uXCIsZSkpKGx8fHt9KTt2YXIgdT0oaT0+KGkuTUFHSUNfSEFORExFX1JFU1BPTlNFPVwiTUFHSUNfSEFORExFX1JFU1BPTlNFXCIsaS5NQUdJQ19PVkVSTEFZX1JFQURZPVwiTUFHSUNfT1ZFUkxBWV9SRUFEWVwiLGkuTUFHSUNfU0hPV19PVkVSTEFZPVwiTUFHSUNfU0hPV19PVkVSTEFZXCIsaS5NQUdJQ19ISURFX09WRVJMQVk9XCJNQUdJQ19ISURFX09WRVJMQVlcIixpLk1BR0lDX0hBTkRMRV9FVkVOVD1cIk1BR0lDX0hBTkRMRV9FVkVOVFwiLGkuTUFHSUNfTUdfQk9YX1NFTkRfUkVDRUlQVD1cIk1BR0lDX01HX0JPWF9TRU5EX1JFQ0VJUFRcIixpKSkodXx8e30pLGc9KHI9PihyLk1BR0lDX0hBTkRMRV9SRVFVRVNUPVwiTUFHSUNfSEFORExFX1JFUVVFU1RcIixyKSkoZ3x8e30pO3ZhciBmPShuPT4obi5VcGRhdGVFbWFpbD1cInVwZGF0ZS1lbWFpbFwiLG4uTUZBPVwibWZhXCIsbi5SZWNvdmVyeT1cInJlY292ZXJ5XCIsbikpKGZ8fHt9KTt2YXIgdj0ocj0+KHIuUmV0cnk9XCJyZXRyeVwiLHIpKSh2fHx7fSksRT0ocz0+KHMuRW1haWxTZW50PVwiZW1haWwtc2VudFwiLHMuRW1haWxOb3REZWxpdmVyYWJsZT1cImVtYWlsLW5vdC1kZWxpdmVyYWJsZVwiLHMpKShFfHx7fSksST0ocz0+KHMuVmVyaWZ5RW1haWxPdHA9XCJ2ZXJpZnktZW1haWwtb3RwXCIscy5DYW5jZWw9XCJjYW5jZWxcIixzKSkoSXx8e30pLHg9KG49PihuLkVtYWlsT1RQU2VudD1cImVtYWlsLW90cC1zZW50XCIsbi5JbnZhbGlkRW1haWxPdHA9XCJpbnZhbGlkLWVtYWlsLW90cFwiLG4uRXhwaXJlZEVtYWlsT3RwPVwiZXhwaXJlZC1lbWFpbC1vdHBcIixuKSkoeHx8e30pLFQ9KHI9PihyLlJldHJ5PVwiZGV2aWNlLXJldHJ5XCIscikpKFR8fHt9KSxBPShhPT4oYS5EZXZpY2VBcHByb3ZlZD1cImRldmljZS1hcHByb3ZlZFwiLGEuRGV2aWNlTmVlZHNBcHByb3ZhbD1cImRldmljZS1uZWVkcy1hcHByb3ZhbFwiLGEuRGV2aWNlVmVyaWZpY2F0aW9uTGlua0V4cGlyZWQ9XCJkZXZpY2UtdmVyaWZpY2F0aW9uLWxpbmstZXhwaXJlZFwiLGEuRGV2aWNlVmVyaWZpY2F0aW9uRW1haWxTZW50PVwiZGV2aWNlLXZlcmlmaWNhdGlvbi1lbWFpbC1zZW50XCIsYSkpKEF8fHt9KTt2YXIgUj0ocj0+KHIuSGFybW9ueT1cIkhBUk1PTllcIixyKSkoUnx8e30pO3ZhciBOPShyPT4oci5QaG9uZU51bWJlcj1cInBob25lX251bWJlclwiLHIpKShOfHx7fSk7ZXhwb3J0e2YgYXMgRGVlcExpbmtQYWdlLFQgYXMgRGV2aWNlVmVyaWZpY2F0aW9uRXZlbnRFbWl0LEEgYXMgRGV2aWNlVmVyaWZpY2F0aW9uRXZlbnRPblJlY2VpdmVkLFIgYXMgRXRoQ2hhaW5UeXBlLGMgYXMgRXZlbnRzLEkgYXMgTG9naW5XaXRoRW1haWxPVFBFdmVudEVtaXQseCBhcyBMb2dpbldpdGhFbWFpbE9UUEV2ZW50T25SZWNlaXZlZCx2IGFzIExvZ2luV2l0aE1hZ2ljTGlua0V2ZW50RW1pdCxFIGFzIExvZ2luV2l0aE1hZ2ljTGlua0V2ZW50T25SZWNlaXZlZCx1IGFzIE1hZ2ljSW5jb21pbmdXaW5kb3dNZXNzYWdlLGcgYXMgTWFnaWNPdXRnb2luZ1dpbmRvd01lc3NhZ2UsbCBhcyBNYWdpY1BheWxvYWRNZXRob2QsbSBhcyBSUENFcnJvckNvZGUsTiBhcyBSZWNvdmVyeU1ldGhvZFR5cGUsbyBhcyBTREtFcnJvckNvZGUsXyBhcyBTREtXYXJuaW5nQ29kZSxwIGFzIFdhbGxldHN9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aW5kZXgubWpzLm1hcFxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(ssr)/../../../node_modules/.pnpm/@magic-sdk+types@17.2.0/node_modules/@magic-sdk/types/dist/es/index.mjs\n");

/***/ })

};
;