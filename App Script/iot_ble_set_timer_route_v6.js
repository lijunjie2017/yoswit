window.iot_ble_set_timer_route = (params) => {
  //href="/frappe/form/{{ _('Device') }}/APP_HA_Device_Timer_Form_V3/Profile Subdevice Timer/{{ doc.filters.profile_subdevice }}/
  const subdevice = params.obj.attr('subdevice');
  const guid = params.obj.attr('guid');
  let mode_code = window.peripheral[guid] ? window.peripheral[guid].prop.hexModel : '';
  console.log(mode_code);
  if (mode_code == '021B') {
    ///mobile-app/timer-form-page?subdevice={{subdevice.name}}
    mainView.router.navigate(`/mobile-app/timer-form-page?subdevice=${subdevice}`);
  }else if(mode_code == '0355' || mode_code == '0378' || mode_code == '0377' || mode_code == '0376'){
    mainView.router.navigate(`/mobile-app/timer-radar-form-page?subdevice=${subdevice}`);
  } else {
    //"/frappe/form/{{ _('Device') }}/APP_HA_Device_Timer_Form_V3/Profile Subdevice Timer/{{ subdevice.name }}/timerid={{ timer.timer_id }}/"
    mainView.router.navigate(`/frappe/form/${ _('Device') }/APP_HA_Device_Timer_Form_V3/Profile Subdevice Timer/${ subdevice }/`);
  }
};
