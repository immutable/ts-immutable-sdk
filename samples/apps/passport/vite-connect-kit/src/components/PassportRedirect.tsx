import { passport } from '@imtbl/sdk'
import { useEffect } from 'react'

function PassportRedirect({
  passportInstance
}: { passportInstance: passport.Passport }) {
  
  useEffect(() => {
    passportInstance.loginCallback();
  }, [])

  return (
    <div>Redirect...</div>
  )
}

export default PassportRedirect
