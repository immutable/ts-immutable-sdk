import { Button } from "@biom3/react";
import { Widgets } from "@imtbl/checkout-widgets";
import React, { useCallback, useEffect, useMemo } from "react"

export function TestWidgets() {

  const widgets = useMemo(() => new Widgets(),[]);

  useEffect(() => {
    widgets.connect.mount('the-connect-widget', {targetLayer: 'LAYER1'})
  }, [widgets])

  const update = useCallback(() => {
    if(!widgets) return;
    widgets.connect.update({targetLayer: 'LAYER2'})
  }, [widgets])


  return (
    <div>
      <div id='the-connect-widget'>Hello</div>
      <button onClick={update}>Update</button>
    </div>
  )
}