import { passport } from '@imtbl/sdk'
import { useEffect } from 'react'

function PassportRedirect({passportInstance}: {passportInstance: passport.Passport}) {
  
  useEffect(() => {
    passportInstance.loginCallback();
  }, [passportInstance])

  return (
    <div>Loading...</div>
  )
}

export default PassportRedirect