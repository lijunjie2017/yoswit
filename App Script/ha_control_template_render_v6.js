window.ha_control_template_render = (guid,device_model,device_button_group) => {
  //get the device_model and image
  const device_models = cloneDeep(erp.doctype.device_model);
  const device_default_template = [];
  let model_map = {};
  for(let i in device_models){
    if(device_models[i].device_model == device_model){
      model_map = device_models[i];
    }
  }
  if(Object.keys(model_map).length != 0){
    device_default_template = model_map.device_default_template;
  }
  // onoff template
  const onoff_template = `
  <li class="device home-scanned-peripheral swipeout swipeout-delete-manual home-scanned-peripheral-smart">
    <a class="item-content">
      <div class="priority-thumb device-thumb item-media display-flex justify-content-center flex-direction-row align-content-center" style="background-image: url('${model_map.thumb}');">
      </div>
      <div class="item-inner">
        <div class="item-title-row">
          <div class="item-title ellipsis"style="width: 190px">${model_map.model_code}</div>
        </div>
      </div>
    </a>
    <div class="item-content swipeout-content">
      <div class="control-panel-right" style="">
        <a class="on_flag off_flag manua-onoff" ref="0" func="manual_onoff" guid="${guid}" device_button_group="${device_button_group}">
          <div class="button button-raised button-big onoff"></div>
        </a>
      </div>
    </div>
  </li>
    `;
};

window.manual_onoff = (params)=>{
  const ref = params.obj.ref;
  const guid = params.obj.guid;
  const device_button_group = params.obj.device_button_group;
  //change ui
  $(`.manua-onoff[guid="${guid}"][device_button_group="${device_button_group}"]`).attr("ref",ref == 0 ? 1 : 0);
  try{
    peripheral[guid].onoff([{
      gang : bleHelper.getGangId(device_button_group),
      on : ref == 0 ? true : false
    }]);
  }catch(error){
    if(error == 7200){
      erp.script.iot_entry_class_password_verify(guid,device_button_group);
    }else{
      app.dialog.alert(_(erp.get_log_description(error)));
    }
  }
}