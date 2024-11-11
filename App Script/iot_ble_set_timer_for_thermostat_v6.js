window.iot_ble_set_timer_for_thermostat = (params) => {
  const subdevice = params.obj.attr('subdevice');
  const timerid = params.obj.attr('timerid');
  const guid = params.obj.attr('guid');
  const action = params.obj.attr('action');
  let mode_code = window.peripheral[guid] ? window.peripheral[guid].prop.hexModel : '';
  if (mode_code == '021B') {
    ///mobile-app/timer-form-page?subdevice={{subdevice.name}}
    mainView.router.navigate(`/mobile-app/timer-form-page?subdevice=${subdevice}&timer_id=${timerid}&action=${action}`);
  } else {
    //"/frappe/form/{{ _('Device') }}/APP_HA_Device_Timer_Form_V3/Profile Subdevice Timer/{{ subdevice.name }}/timerid={{ timer.timer_id }}/"
    mainView.router.navigate(`/frappe/form/${ _('Device') }/APP_HA_Device_Timer_Form_V3/Profile Subdevice Timer/${ subdevice }/timerid=${ timerid }/`);
  }
};
