window.initTemplates = () => {
    if(isset(window.button_group_template))
        delete window.button_group_template;
        
    window.button_group_template = {};
    let mode = '';
    
    mode = 'On Off Switch';
    button_group_template[mode] = `
        <li ${tpl_config_attribute}>
            <div class="item-content swipeout-content">
              <a href="#" func="ble_load_to_device_form" ref="{{uuid}}" class="item-link item-content no-chevron no-ripple no-active-state">
                  ${tpl_device_thumb}
                  <div class="item-inner">
                      ${tpl_device_title_block}
                      ${tpl_device_signal_panel}
                  </div>
                  <div class="control-panel-right" style="margin-right:-10px;">
                      ${tpl_device_mode[mode]}
                  </div>
              </a>
              {% if render_type == 'room' %} 
              <!-- region swipe left -->
              <div class="swipeout-actions-left">
                  <a href="/frappe/detail/Google Control Guid/APP_HA_GOOGLE_Form_V5/null/null/profile_subdevice={{ subdevice_name }}/" class="link color-orange"><i class="icon material-icons">mic</i></a>
                  <a href="/frappe/list/Timer/APP_HA_Device_Timer_V3/Profile Subdevice Timer/null/16/profile_subdevice={{ subdevice_name }}/" class="link color-cust-blue"><i class="icon material-icons">alarm</i></a>
                  <a href="#" class="link color-cust-purple" func="iot_ble_toggle_connection"><i class="icon material-icons">settings_bluetooth</i></a>
              </div>
              <div class="swipeout-actions-right">
                <a href="{{setting_link}}"
                class="link color-orange"><i class="icon material-icons">settings</i></a>
                <a href="/frappe/list/Device Control Log/APP_Yoswit_Device_Control_Log_V5/Device Control Log/null/20/subdevice_name={{ subdevice_name }}/" class="link color-cust-blue"><i class="icon material-icons">content_paste_go</i></a>
                <a func="app_set_device_hidden" ref="{{subdevice_name}}" class="link color-cust-green"><i class="icon material-icons">visibility</i></a>
                <a href="#" data-confirm="Are you sure you want to delete this item?" class="link swipeout-delete"><i
                    class="icon material-icons">delete</i></a>
              </div>
              {% else %}
              
              {% endif %}
            </div>
        </li>
    `;
    mode = 'On Off IR';
    button_group_template[mode] = `
    {% if device_type == "Air Conditioner" %}
        <li ${tpl_config_attribute} command="{{command}}" command-type="{{command_type}}">
            <div class="item-content swipeout-content">
                <a href="#" func="ble_load_to_device_form" ref="{{uuid}}"  class="item-link item-content no-chevron no-ripple no-active-state">
                    ${tpl_device_thumb}
                    <div class="item-inner">
                        ${tpl_device_title_block}
                        ${tpl_device_signal_panel}
                    </div>
                    <div class="control-panel-right" style="margin-right:-10px;">
                        <a class="right" func="home_ui_click_ir" button-signal="ARC_ON_OFF"  command="{{command}}" command-type="{{command_type}}">
                            <div class="button button-raised button-big circle">
                                <i class="material-icons">power_settings_new</i>
                            </div>
                        </a>
                    </div>
                </a>
                {% if render_type == 'room' %} 
                <!-- region swipe left -->
                <div class="swipeout-actions-left">
                    <a href="/frappe/detail/Google Control Guid/APP_HA_GOOGLE_Form_V5/null/null/profile_subdevice={{ subdevice_name }}/" class="link color-orange"><i class="icon material-icons">mic</i></a>
                    <a href="/frappe/list/Timer/APP_HA_Device_Timer_V3/Profile Subdevice Timer/null/16/profile_subdevice={{ subdevice_name }}/" class="link color-cust-blue"><i class="icon material-icons">alarm</i></a>
                    <a href="#" class="link color-cust-purple" func="iot_ble_toggle_connection"><i class="icon material-icons">settings_bluetooth</i></a>
                </div>
                <div class="swipeout-actions-right">
                    <a href="{{setting_link}}"
                    class="link color-orange"><i class="icon material-icons">settings</i></a>
                    <a href="/frappe/list/Device Control Log/APP_Yoswit_Device_Control_Log_V5/Device Control Log/null/20/subdevice_name={{ subdevice_name }}/" class="link color-cust-blue"><i class="icon material-icons">content_paste_go</i></a>
                    <a href="/frappe/list/Device Control Log/APP_Yoswit_Device_Control_Log_V5/Device Control Log/null/20/subdevice_name={{ subdevice_name }}/" class="link color-cust-green"><i class="icon material-icons">visibility</i></a>
                    <a href="#" data-confirm="Are you sure you want to delete this item?" class="link swipeout-delete"><i
                        class="icon material-icons">delete</i></a>
                </div>
                {% endif %}
            </div>
        </li>
        <li class="device subdevice home-scanned-peripheral" ${tpl_config_attribute}  style="height:auto;">
        
        </li>
        {% elif device_type == "JOHNSON"  %}
        
        {% elif device_type == "IR"  %}
        <li ${tpl_config_attribute}>
            <div class="item-content swipeout-content">
                <a href="#" func="ble_load_to_device_form" ref="{{uuid}}"  class="item-link item-content no-chevron no-ripple no-active-state">
                    ${tpl_device_thumb}
                    <div class="item-inner">
                        ${tpl_device_title_block}
                        ${tpl_device_signal_panel}
                    </div>
                    <div class="control-panel-right" style="margin-right:-10px;">
                      <a href="#" func="ble_load_to_device_form" class="right" >
                          <div class="button button-raised button-big circle"><div><i class="material-icons" style="line-height:38px;font-size:20px;">settings</i></div></div>
                    </a>
                    </div>
                </a>
            </div>
        </li>
        {% elif device_type == 'Television' or device_type == 'SetTop' or device_type == 'Audio' or device_type == 'Projector' or device_type == 'Fan' or device_type == 'IPTV' or device_type == 'Air Purifier' or device_type == 'Camera' or device_type == 'Dehumidifier' or device_type == 'Robot' %}
        <li ${tpl_config_attribute} command="{{command}}" command-type="{{command_type}}">
            <div class="item-content swipeout-content">
                <a href="#" func="ble_load_to_device_form" ref="{{uuid}}"  class="item-link item-content no-chevron">
                    ${tpl_device_thumb}
                    <div class="item-inner">
                        ${tpl_device_title_block}
                        ${tpl_device_signal_panel}
                    </div>
                    <div class="control-panel-right" style="margin-right:-10px;">
                        <a class="right" func="controller_iot_device_ir_full_panel_click" guid="{{guid}}" button-signal="5"  command="{{command}}" command-type="{{command_type}}">
                            <div class="button button-raised button-big circle">
                                <i class="material-icons">power_settings_new</i>
                            </div>
                        </a>
                        <a class="right" func="iot_device_goto_ir_panel" button-signal="ARC_ON_OFF"  command="{{command}}" command-type="{{command_type}}">
                            <div class="button button-raised button-big circle">
                                <i class="material-icons">view_sidebar</i>
                            </div>
                        </a>
                    </div>
                </a>
                {% if render_type == 'room' %} 
                <!-- region swipe left -->
                <div class="swipeout-actions-left">
                    <a href="/frappe/detail/Google Control Guid/APP_HA_GOOGLE_Form_V5/null/null/profile_subdevice={{ subdevice_name }}/" class="link color-orange"><i class="icon material-icons">mic</i></a>
                    <a href="/frappe/list/Timer/APP_HA_Device_Timer_V3/Profile Subdevice Timer/null/16/profile_subdevice={{ subdevice_name }}/" class="link color-cust-blue"><i class="icon material-icons">alarm</i></a>
                    <a href="#" class="link color-cust-purple" func="iot_ble_toggle_connection"><i class="icon material-icons">settings_bluetooth</i></a>
                </div>
                <div class="swipeout-actions-right">
                    <a href="{{setting_link}}"
                    class="link color-orange"><i class="icon material-icons">settings</i></a>
                    <a href="/frappe/list/Device Control Log/APP_Yoswit_Device_Control_Log_V5/Device Control Log/null/20/subdevice_name={{ subdevice_name }}/" class="link color-cust-blue"><i class="icon material-icons">content_paste_go</i></a>
                    <a href="/frappe/list/Device Control Log/APP_Yoswit_Device_Control_Log_V5/Device Control Log/null/20/subdevice_name={{ subdevice_name }}/" class="link color-cust-green"><i class="icon material-icons">visibility</i></a>
                    <a href="#" data-confirm="Are you sure you want to delete this item?" class="link swipeout-delete"><i
                        class="icon material-icons">delete</i></a>
                </div>
                {% endif %}
            </div>
        </li>   
        {% else  %}
        <li ${tpl_config_attribute}>
            <div class="item-content swipeout-content">
              <a href="#" func="ble_load_to_device_form" ref="{{uuid}}" class="item-link item-content no-chevron no-active-state">
                  ${tpl_device_thumb}
                  <div class="item-inner">
                      ${tpl_device_title_block}
                      ${tpl_device_signal_panel}
                  </div>
                  <div class="control-panel-right" style="margin-right:-10px;">
                      ${tpl_device_mode[mode]}
                  </div>
              </a>
              {% if render_type == 'room' %} 
              <!-- region swipe left -->
              <div class="swipeout-actions-left">
                  <a href="/frappe/detail/Google Control Guid/APP_HA_GOOGLE_Form_V5/null/null/profile_subdevice={{ subdevice_name }}/" class="link color-orange"><i class="icon material-icons">mic</i></a>
                  <a href="/frappe/list/Timer/APP_HA_Device_Timer_V3/Profile Subdevice Timer/null/16/profile_subdevice={{ subdevice_name }}/" class="link color-cust-blue"><i class="icon material-icons">alarm</i></a>
                  <a href="#" class="link color-cust-purple" func="iot_ble_toggle_connection"><i class="icon material-icons">settings_bluetooth</i></a>
              </div>
              <div class="swipeout-actions-right">
                <a href="{{setting_link}}"
                class="link color-orange"><i class="icon material-icons">settings</i></a>
                <a href="/frappe/list/Device Control Log/APP_Yoswit_Device_Control_Log_V5/Device Control Log/null/20/subdevice_name={{ subdevice_name }}/" class="link color-cust-blue"><i class="icon material-icons">content_paste_go</i></a>
                <a href="/frappe/list/Device Control Log/APP_Yoswit_Device_Control_Log_V5/Device Control Log/null/20/subdevice_name={{ subdevice_name }}/" class="link color-cust-green"><i class="icon material-icons">visibility</i></a>
                <a href="#" data-confirm="Are you sure you want to delete this item?" class="link swipeout-delete"><i
                    class="icon material-icons">delete</i></a>
              </div>
              {% endif %}
            </div>
        </li>
    {% endif %}
    `;
    mode = 'Multiway Switch';
    button_group_template[mode] = `
        <li ${tpl_config_attribute} be-pairing="{{be_pairing}}">
            <div class="item-content swipeout-content">
              <a href="#" func="ble_load_to_device_form" ref="{{uuid}}" class="item-link item-content no-chevron no-ripple no-active-state">
                  ${tpl_device_thumb}
                  <div class="item-inner">
                      ${tpl_device_title_block}
                      ${tpl_device_signal_panel}
                  </div>
                  {% if be_pairing != 1 or pairing_gang == "" %}
                  <div class="control-panel-right" style="margin-right:-10px;">
                      ${tpl_device_mode[mode]}
                  </div>
                  {%endif%}
              </a>
              {% if render_type == 'room' %} 
              <!-- region swipe left -->
              <div class="swipeout-actions-left">
                  <a href="/frappe/detail/Google Control Guid/APP_HA_GOOGLE_Form_V5/null/null/profile_subdevice={{ subdevice_name }}/" class="link color-orange"><i class="icon material-icons">mic</i></a>
                  <a href="/frappe/list/Timer/APP_HA_Device_Timer_V3/Profile Subdevice Timer/null/16/profile_subdevice={{ subdevice_name }}/" class="link color-cust-blue"><i class="icon material-icons">alarm</i></a>
                  <a href="#" class="link color-cust-purple" func="iot_ble_toggle_connection"><i class="icon material-icons">settings_bluetooth</i></a>
              </div>
              <div class="swipeout-actions-right">
                <a href="{{setting_link}}"
                class="link color-orange"><i class="icon material-icons">settings</i></a>
                <a href="/frappe/list/Device Control Log/APP_Yoswit_Device_Control_Log_V5/Device Control Log/null/20/subdevice_name={{ subdevice_name }}/" class="link color-cust-blue"><i class="icon material-icons">content_paste_go</i></a>
                <a href="/frappe/list/Device Control Log/APP_Yoswit_Device_Control_Log_V5/Device Control Log/null/20/subdevice_name={{ subdevice_name }}/" class="link color-cust-green"><i class="icon material-icons">visibility</i></a>
                <a href="#" data-confirm="Are you sure you want to delete this item?" class="link swipeout-delete"><i
                    class="icon material-icons">delete</i></a>
              </div>
              {% endif %}
            </div>
        </li>
        <div></div>
    `;
    
    mode = 'Multiway Switch Pairing';
    button_group_template[mode] = `
        <li class="device subdevice home-scanned-peripheral pair-subdevice" ${tpl_config_attribute} be-pairing="{{be_pairing}}" style="height:77px;display:block!important;">
            <div class="item-content swipeout-content">
                <a href="{{setting_link}}" ref="{{uuid}}" class="item-link item-content no-chevron no-ripple no-active-state">
                    ${tpl_device_thumb}
                    <div class="item-inner">
                        ${tpl_device_title_block}
                        ${tpl_device_signal_panel}
                    </div>
                    <div class="control-panel-right" style="margin-right:-10px;top:-38.5px;">
                        ${tpl_device_mode[mode]}
                    </div>
                </a>
            </div>
        </li>
    `;

    mode = 'Toggle Switch';
    button_group_template[mode] = `
        <li ${tpl_config_attribute}>
            <div class="item-content swipeout-content">
              <a href="#" func="ble_load_to_device_form" ref="{{uuid}}" class="item-link item-content no-chevron no-ripple no-active-state">
                  ${tpl_device_thumb}
                  <div class="item-inner">
                      ${tpl_device_title_block}
                      ${tpl_device_signal_panel}
                  </div>
                  <div class="control-panel-right" style="margin-right:-10px;">
                      ${tpl_device_mode[mode]}
                  </div>
              </a>
              {% if render_type == 'room' %} 
              <!-- region swipe left -->
              <div class="swipeout-actions-left">
                  <a href="/frappe/detail/Google Control Guid/APP_HA_GOOGLE_Form_V5/null/null/profile_subdevice={{ subdevice_name }}/" class="link color-orange"><i class="icon material-icons">mic</i></a>
                  <a href="/frappe/list/Timer/APP_HA_Device_Timer_V3/Profile Subdevice Timer/null/16/profile_subdevice={{ subdevice_name }}/" class="link color-cust-blue"><i class="icon material-icons">alarm</i></a>
                  <a href="#" class="link color-cust-purple" func="iot_ble_toggle_connection"><i class="icon material-icons">settings_bluetooth</i></a>
              </div>
              <div class="swipeout-actions-right">
                <a href="{{setting_link}}"
                class="link color-orange"><i class="icon material-icons">settings</i></a>
                <a href="/frappe/list/Device Control Log/APP_Yoswit_Device_Control_Log_V5/Device Control Log/null/20/subdevice_name={{ subdevice_name }}/" class="link color-cust-blue"><i class="icon material-icons">content_paste_go</i></a>
                <a href="/frappe/list/Device Control Log/APP_Yoswit_Device_Control_Log_V5/Device Control Log/null/20/subdevice_name={{ subdevice_name }}/" class="link color-cust-green"><i class="icon material-icons">visibility</i></a>
                <a href="#" data-confirm="Are you sure you want to delete this item?" class="link swipeout-delete"><i
                    class="icon material-icons">delete</i></a>
              </div>
              {% endif %}
            </div>
        </li>
    `;
    
    mode = 'Access Controller';
    button_group_template[mode] = `
        <li ${tpl_config_attribute} type-box="Dimming">
            <div class="item-content swipeout-content">
              <a href="#" func="ble_load_to_device_form" ref="{{uuid}}" class="item-link item-content no-chevron no-ripple no-active-state">
                  ${tpl_device_thumb}
                  <div class="item-inner">
                      ${tpl_device_title_block}
                      ${tpl_device_signal_panel}
                  </div>
                  <div class="control-panel-right" style="margin-right:-10px;">
                      ${tpl_device_mode[mode]}
                  </div>
              </a>
              {% if render_type == 'room' %} 
              <!-- region swipe left -->
              <div class="swipeout-actions-left">
                  <a href="/frappe/detail/Google Control Guid/APP_HA_GOOGLE_Form_V5/null/null/profile_subdevice={{ subdevice_name }}/" class="link color-orange"><i class="icon material-icons">mic</i></a>
                  <a href="/frappe/list/Timer/APP_HA_Device_Timer_V3/Profile Subdevice Timer/null/16/profile_subdevice={{ subdevice_name }}/" class="link color-cust-blue"><i class="icon material-icons">alarm</i></a>
                  <a href="#" class="link color-cust-purple" func="iot_ble_toggle_connection"><i class="icon material-icons">settings_bluetooth</i></a>
              </div>
              <div class="swipeout-actions-right">
                <a href="{{setting_link}}"
                class="link color-orange"><i class="icon material-icons">settings</i></a>
                <a href="/frappe/list/Device Control Log/APP_Yoswit_Device_Control_Log_V5/Device Control Log/null/20/subdevice_name={{ subdevice_name }}/" class="link color-cust-blue"><i class="icon material-icons">content_paste_go</i></a>
                <a href="/frappe/list/Device Control Log/APP_Yoswit_Device_Control_Log_V5/Device Control Log/null/20/subdevice_name={{ subdevice_name }}/" class="link color-cust-green"><i class="icon material-icons">visibility</i></a>
                <a href="#" data-confirm="Are you sure you want to delete this item?" class="link swipeout-delete"><i
                    class="icon material-icons">delete</i></a>
              </div>
              {% endif %}
            </div>
        </li>
    `;

    mode = 'IR';
    button_group_template[mode] = `
        {% if device_type == "Air Conditioner" %}
        <li ${tpl_config_attribute} command="{{command}}" command-type="{{command_type}}">
            <div class="item-content swipeout-content">
                <a href="#" func="ble_load_to_device_form" ref="{{uuid}}"  class="item-link item-content no-chevron no-ripple no-active-state">
                    ${tpl_device_thumb}
                    <div class="item-inner">
                        ${tpl_device_title_block}
                        ${tpl_device_signal_panel}
                    </div>
                    <div class="control-panel-right" style="margin-right:-10px;">
                        <a class="right" func="home_ui_click_ir" button-signal="ARC_ON_OFF"  command="{{command}}" command-type="{{command_type}}">
                            <div class="button button-raised button-big circle">
                                <i class="material-icons">power_settings_new</i>
                            </div>
                        </a>
                    </div>
                </a>
                {% if render_type == 'room' %} 
                <!-- region swipe left -->
                <div class="swipeout-actions-left">
                    <a href="/frappe/detail/Google Control Guid/APP_HA_GOOGLE_Form_V5/null/null/profile_subdevice={{ subdevice_name }}/" class="link color-orange"><i class="icon material-icons">mic</i></a>
                    <a href="/frappe/list/Timer/APP_HA_Device_Timer_V3/Profile Subdevice Timer/null/16/profile_subdevice={{ subdevice_name }}/" class="link color-cust-blue"><i class="icon material-icons">alarm</i></a>
                    <a href="#" class="link color-cust-purple" func="iot_ble_toggle_connection"><i class="icon material-icons">settings_bluetooth</i></a>
                </div>
                <div class="swipeout-actions-right">
                    <a href="{{setting_link}}"
                    class="link color-orange"><i class="icon material-icons">settings</i></a>
                    <a href="/frappe/list/Device Control Log/APP_Yoswit_Device_Control_Log_V5/Device Control Log/null/20/subdevice_name={{ subdevice_name }}/" class="link color-cust-blue"><i class="icon material-icons">content_paste_go</i></a>
                    <a href="/frappe/list/Device Control Log/APP_Yoswit_Device_Control_Log_V5/Device Control Log/null/20/subdevice_name={{ subdevice_name }}/" class="link color-cust-green"><i class="icon material-icons">visibility</i></a>
                    <a href="#" data-confirm="Are you sure you want to delete this item?" class="link swipeout-delete"><i
                        class="icon material-icons">delete</i></a>
                </div>
                {% endif %}
            </div>
        </li>
        <li class="device subdevice home-scanned-peripheral" ${tpl_config_attribute}  style="height:auto;">
        
        </li>
        {% elif device_type == "JOHNSON"  %}

        {% elif device_type == 'Television' or device_type == 'SetTop' or device_type == 'Audio' or device_type == 'Projector' or device_type == 'Fan' or device_type == 'IPTV' or device_type == 'Air Purifier' or device_type == 'Camera' or device_type == 'Dehumidifier' or device_type == 'Robot' %}
        <li ${tpl_config_attribute} command="{{command}}" command-type="{{command_type}}">
            <div class="item-content swipeout-content">
                <a href="#" func="ble_load_to_device_form" ref="{{uuid}}"  class="item-link item-content no-chevron no-ripple no-active-state">
                    ${tpl_device_thumb}
                    <div class="item-inner">
                        ${tpl_device_title_block}
                        ${tpl_device_signal_panel}
                    </div>
                    <div class="control-panel-right" style="margin-right:-10px;">
                        <a class="right" func="controller_iot_device_ir_full_panel_click" guid="{{guid}}" button-signal="5"  command="{{command}}" command-type="{{command_type}}">
                            <div class="button button-raised button-big circle">
                                <i class="material-icons">power_settings_new</i>
                            </div>
                        </a>
                        <a class="right" func="iot_device_goto_ir_panel" button-signal="ARC_ON_OFF"  command="{{command}}" command-type="{{command_type}}">
                            <div class="button button-raised button-big circle">
                                <i class="material-icons">view_sidebar</i>
                            </div>
                        </a>
                    </div>
                </a>
                {% if render_type == 'room' %} 
                <!-- region swipe left -->
                <div class="swipeout-actions-left">
                    <a href="/frappe/detail/Google Control Guid/APP_HA_GOOGLE_Form_V5/null/null/profile_subdevice={{ subdevice_name }}/" class="link color-orange"><i class="icon material-icons">mic</i></a>
                    <a href="/frappe/list/Timer/APP_HA_Device_Timer_V3/Profile Subdevice Timer/null/16/profile_subdevice={{ subdevice_name }}/" class="link color-cust-blue"><i class="icon material-icons">alarm</i></a>
                    <a href="#" class="link color-cust-purple" func="iot_ble_toggle_connection"><i class="icon material-icons">settings_bluetooth</i></a>
                </div>
                <div class="swipeout-actions-right">
                    <a href="{{setting_link}}"
                    class="link color-orange"><i class="icon material-icons">settings</i></a>
                    <a href="/frappe/list/Device Control Log/APP_Yoswit_Device_Control_Log_V5/Device Control Log/null/20/subdevice_name={{ subdevice_name }}/" class="link color-cust-blue"><i class="icon material-icons">content_paste_go</i></a>
                    <a href="/frappe/list/Device Control Log/APP_Yoswit_Device_Control_Log_V5/Device Control Log/null/20/subdevice_name={{ subdevice_name }}/" class="link color-cust-green"><i class="icon material-icons">visibility</i></a>
                    <a href="#" data-confirm="Are you sure you want to delete this item?" class="link swipeout-delete"><i
                        class="icon material-icons">delete</i></a>
                </div>
                {% endif %}
            </div>
        </li>   
        {% else %}
        <li ${tpl_config_attribute}>
            <div class="item-content swipeout-content">
                <a href="#" func="ble_load_to_device_form" ref="{{uuid}}"  class="item-link item-content no-chevron no-ripple no-active-state">
                    ${tpl_device_thumb}
                    <div class="item-inner">
                        ${tpl_device_title_block}
                        ${tpl_device_signal_panel}
                    </div>
                    <div class="control-panel-right" style="margin-right:-10px;">
                        ${(isset(tpl_device_mode[mode]) ? tpl_device_mode[mode] : '')}
                    </div>
                </a>
            </div>
        </li>
        {% endif %}
    `;
    mode = 'Gateway';
    button_group_template[mode] = `
        {% if device_type == "OPEN_LOCK" %}
        <li ${tpl_config_attribute} config="{{config}}">
            <div class="item-content swipeout-content">
                <a href="#" func="ble_load_to_device_form" ref="{{uuid}}"  class="item-link item-content no-chevron no-ripple no-active-state">
                    ${tpl_device_thumb}
                    <div class="item-inner">
                        ${tpl_device_title_block}
                        ${tpl_device_signal_panel}
                    </div>
                    <div class="control-panel-right" style="margin-right:-10px;">
                        <a class="right" func="app_ha_click_lock" button-signal=""  command="{{command}}" command-type="{{command_type}}" ref="0">
                            <div class="button button-raised button-big circle rf-sensor">
                                <i class="material-icons">lock</i>
                            </div>
                        </a>
                    </div>
                </a>
                {% if render_type == 'room' %} 
                <!-- region swipe left -->
                <div class="swipeout-actions-left">
                    
                    <a href="/frappe/list/Timer/APP_HA_Device_Timer_V3/Profile Subdevice Timer/null/16/profile_subdevice={{ subdevice_name }}/" class="link color-cust-blue"><i class="icon material-icons">alarm</i></a>
                    <a href="#" class="link color-cust-purple" func="iot_ble_toggle_connection"><i class="icon material-icons">settings_bluetooth</i></a>
                </div>
                <div class="swipeout-actions-right">
                    <a href="{{setting_link}}"
                    class="link color-orange"><i class="icon material-icons">settings</i></a>
                    <a href="/frappe/list/Device Control Log/APP_Yoswit_Device_Control_Log_V5/Device Control Log/null/20/subdevice_name={{ subdevice_name }}/" class="link color-cust-blue"><i class="icon material-icons">content_paste_go</i></a>
                    <a href="/frappe/list/Device Control Log/APP_Yoswit_Device_Control_Log_V5/Device Control Log/null/20/subdevice_name={{ subdevice_name }}/" class="link color-cust-green"><i class="icon material-icons">visibility</i></a>
                    <a href="#" data-confirm="Are you sure you want to delete this item?" class="link swipeout-delete"><i
                        class="icon material-icons">delete</i></a>
                </div>
                {% endif %}
            </div>
        </li>
        {% else %}
        
        <li ${tpl_config_attribute}>
            <div class="item-content swipeout-content">
                <a href="#" func="ble_load_to_device_form" ref="{{uuid}}"  class="item-link item-content no-chevron no-ripple no-active-state">
                    ${tpl_device_thumb}
                    <div class="item-inner">
                        ${tpl_device_title_block}
                        ${tpl_device_signal_panel}
                    </div>
                    {%if render_type == 'room' %}
                    <div class="control-panel-right" style="margin-right:-10px;">
                        <a href="/frappe/detail/${tran('Gateway Configuration')}/APP_CORE_Gateway_Wifi_Config_V5/null/null/guid={{guid}}&device_name={{profile_device_name}}/" func="" class="right" >
                            <div class="button button-raised button-big circle"><div><i class="material-icons" style="line-height:38px;font-size:20px;">wifi</i></div></div>
                        </a>
                    </div>
                    {% endif %}
                </a>
                {% if render_type == 'room' %} 
                <!-- region swipe left -->
                <div class="swipeout-actions-left">                   
                    <a href="/frappe/list/Timer/APP_HA_Device_Timer_V3/Profile Subdevice Timer/null/16/profile_subdevice={{ subdevice_name }}/" class="link color-cust-blue"><i class="icon material-icons">alarm</i></a>
                    <a href="#" class="link color-cust-purple" func="iot_ble_toggle_connection"><i class="icon material-icons">settings_bluetooth</i></a>
                </div>
                <div class="swipeout-actions-right">
                    <a href="{{setting_link}}"
                    class="link color-orange"><i class="icon material-icons">settings</i></a>
                    <a href="/frappe/list/Device Control Log/APP_Yoswit_Device_Control_Log_V5/Device Control Log/null/20/subdevice_name={{ subdevice_name }}/" class="link color-cust-blue"><i class="icon material-icons">content_paste_go</i></a>
                    <a href="/frappe/list/Device Control Log/APP_Yoswit_Device_Control_Log_V5/Device Control Log/null/20/subdevice_name={{ subdevice_name }}/" class="link color-cust-green"><i class="icon material-icons">visibility</i></a>
                    <a href="#" data-confirm="Are you sure you want to delete this item?" class="link swipeout-delete"><i
                        class="icon material-icons">delete</i></a>
                </div>
                {% endif %}
            </div>
        </li>
        {% endif %}
    `;
    mode = 'RF Sensor';
    button_group_template[mode] = `
        <li ${tpl_config_attribute}>
            <div class="item-content swipeout-content">
                <a href="#" func="ble_load_to_device_form" ref="{{uuid}}"  class="item-link item-content no-chevron no-ripple no-active-state">
                    ${tpl_device_thumb}
                    <div class="item-inner">
                        ${tpl_device_title_block}
                        ${tpl_device_signal_panel}
                    </div>
                    <div class="control-panel-right" style="margin-right:-10px;">
                        <a class="right" func="" button-signal=""  command="{{command}}" command-type="{{command_type}}">
                            <div class="button button-raised button-big circle rf-sensor">
                                <i class="material-icons">block</i>
                            </div>
                        </a>
                    </div>
                </a>
                {% if render_type == 'room' %} 
                <!-- region swipe left -->
                <div class="swipeout-actions-left">
                    <a href="/frappe/detail/Google Control Guid/APP_HA_GOOGLE_Form_V5/null/null/profile_subdevice={{ subdevice_name }}/" class="link color-orange"><i class="icon material-icons">mic</i></a>
                    <a href="/frappe/list/Timer/APP_HA_Device_Timer_V3/Profile Subdevice Timer/null/16/profile_subdevice={{ subdevice_name }}/" class="link color-cust-blue"><i class="icon material-icons">alarm</i></a>
                    <a href="#" class="link color-cust-purple" func="iot_ble_toggle_connection"><i class="icon material-icons">settings_bluetooth</i></a>
                </div>
                <div class="swipeout-actions-right">
                    <a href="{{setting_link}}"
                    class="link color-orange"><i class="icon material-icons">settings</i></a>
                    <a href="/frappe/list/Device Control Log/APP_Yoswit_Device_Control_Log_V5/Device Control Log/null/20/subdevice_name={{ subdevice_name }}/" class="link color-cust-blue"><i class="icon material-icons">content_paste_go</i></a>
                    <a href="/frappe/list/Device Control Log/APP_Yoswit_Device_Control_Log_V5/Device Control Log/null/20/subdevice_name={{ subdevice_name }}/" class="link color-cust-green"><i class="icon material-icons">visibility</i></a>
                    <a href="#" data-confirm="Are you sure you want to delete this item?" class="link swipeout-delete"><i
                        class="icon material-icons">delete</i></a>
                </div>
                {% endif %}
            </div>
        </li>
    `;
    
    mode = 'Curtain Switch';
    button_group_template[mode] = `
        <li ${tpl_config_attribute}>
            <div class="item-content swipeout-content">
                <a href="#" func="ble_load_to_device_form" ref="{{uuid}}"  class="item-link item-content no-chevron no-ripple no-active-state">
                    ${tpl_device_thumb}
                    <div class="item-inner">
                        ${tpl_device_title_block}
                        ${tpl_device_signal_panel}
                    </div>
                    <div class="control-panel-right" style="margin-right:-10px;">
                        ${(isset(tpl_device_mode[mode]) ? tpl_device_mode[mode] : '')}
                    </div>
                </a>
                {% if render_type == 'room' %} 
                <!-- region swipe left -->
                <div class="swipeout-actions-left">
                    <a href="/frappe/detail/Google Control Guid/APP_HA_GOOGLE_Form_V5/null/null/profile_subdevice={{ subdevice_name }}/" class="link color-orange"><i class="icon material-icons">mic</i></a>
                    <a href="/frappe/list/Timer/APP_HA_Device_Timer_V3/Profile Subdevice Timer/null/16/profile_subdevice={{ subdevice_name }}/" class="link color-cust-blue"><i class="icon material-icons">alarm</i></a>
                    <a href="#" class="link color-cust-purple" func="iot_ble_toggle_connection"><i class="icon material-icons">settings_bluetooth</i></a>
                </div>
                <div class="swipeout-actions-right">
                    <a href="{{setting_link}}"
                    class="link color-orange"><i class="icon material-icons">settings</i></a>
                    <a href="/frappe/list/Device Control Log/APP_Yoswit_Device_Control_Log_V5/Device Control Log/null/20/subdevice_name={{ subdevice_name }}/" class="link color-cust-blue"><i class="icon material-icons">content_paste_go</i></a>
                    <a href="/frappe/list/Device Control Log/APP_Yoswit_Device_Control_Log_V5/Device Control Log/null/20/subdevice_name={{ subdevice_name }}/" class="link color-cust-green"><i class="icon material-icons">visibility</i></a>
                    <a href="#" data-confirm="Are you sure you want to delete this item?" class="link swipeout-delete"><i
                        class="icon material-icons">delete</i></a>
                </div>
                {% endif %}
            </div>
        </li>
        <li class="device subdevice home-scanned-peripheral" ${tpl_config_attribute} style="height:auto;">
            <div class="item-content subdevice-item-content" style="min-height: 0px;">
                <div class="item-inner" style="min-height: 0px;">
                    <div class="row" style="--f7-grid-gap:3px;padding-left:20px;padding-right:15px;"> 
                        <button class="col on_flag off_flag button button-large button-raised openclose cl" ref="0" button-group="{{button-group}}" func="home_ui_press_ha_device_v5" command-type="Bluetooth" command="">
                            <div style="margin-left:-5px;"><i class="material-icons" style="font-size:22px!important;">keyboard_double_arrow_right</i><i class="material-icons" style="font-size:22px!important;">keyboard_double_arrow_left</i></div>
                        </button>      
                        <button class="col on_flag off_flag button button-large button-raised stop" ref="n" button-group="{{button_group}}" func="home_ui_press_ha_device_v5" command-type="Bluetooth" command="">
                            <div><i class="material-icons" style="line-height:65px;font-size:18px!important;">pause</i></div>
                        </button>      
                        <button class="col on_flag off_flag button button-large button-raised openclose op" ref="1" button-group="{{button_group}}" func="home_ui_press_ha_device_v5" command-type="Bluetooth" command="">
                            <div style="margin-left:-7px;"><i class="material-icons" style="font-size:22px!important;">keyboard_double_arrow_left</i><i class="material-icons" style="font-size:22px!important;">keyboard_double_arrow_right</i></div>
                        </button>
                    </div>
                </div>
            </div>
        </li>
    `;
    
    mode = 'Triac Dimming';
    button_group_template[mode] = `
        <li ${tpl_config_attribute} type-box="Dimming">
            <div class="item-content swipeout-content">
                <a href="#" func="ble_load_to_device_form" ref="{{uuid}}" class="item-link item-content no-chevron no-ripple no-active-state">
                    ${tpl_device_thumb}
                    <div class="item-inner">
                        ${tpl_device_title_block}
                        ${tpl_device_signal_panel}
                    </div>
                    <div class="control-panel-right" style="margin-right:-10px;">
                        ${(isset(tpl_device_mode[mode]) ? tpl_device_mode[mode] : '')}
                    </div>
                </a>
                {% if render_type == 'room' %} 
                <!-- region swipe left -->
                <div class="swipeout-actions-left">
                    <a href="/frappe/detail/Google Control Guid/APP_HA_GOOGLE_Form_V5/null/null/profile_subdevice={{ subdevice_name }}/" class="link color-orange"><i class="icon material-icons">mic</i></a>
                    <a href="/frappe/list/Timer/APP_HA_Device_Timer_V3/Profile Subdevice Timer/null/16/profile_subdevice={{ subdevice_name }}/" class="link color-cust-blue"><i class="icon material-icons">alarm</i></a>
                    <a href="#" class="link color-cust-purple" func="iot_ble_toggle_connection"><i class="icon material-icons">settings_bluetooth</i></a>
                </div>
                <div class="swipeout-actions-right">
                    <a href="{{setting_link}}"
                    class="link color-orange"><i class="icon material-icons">settings</i></a>
                    <a href="/frappe/list/Device Control Log/APP_Yoswit_Device_Control_Log_V5/Device Control Log/null/20/subdevice_name={{ subdevice_name }}/" class="link color-cust-blue"><i class="icon material-icons">content_paste_go</i></a>
                    <a href="/frappe/list/Device Control Log/APP_Yoswit_Device_Control_Log_V5/Device Control Log/null/20/subdevice_name={{ subdevice_name }}/" class="link color-cust-green"><i class="icon material-icons">visibility</i></a>
                    <a href="#" data-confirm="Are you sure you want to delete this item?" class="link swipeout-delete"><i
                        class="icon material-icons">delete</i></a>
                </div>
                {% endif %}
            </div>
        </li>
        <li class="device subdevice home-scanned-peripheral display-flex dimming-subdevice" ${tpl_config_attribute} style="height:67px!important;">
            <div class="row padding-tb flex-direction-column justify-content-center">
                <div class="col-100 medium-50 large-50">
                    <div class="content display-flex justify-content-center" style="margin-left: 15px;margin-right:15px;">
                        <div class="tip-title"><i class="icon material-icons" style="margin-right:8px;">brightness_low</i></div>
                        <div class="range-slider range-slider-init"
                        data-min="0"
                        data-max="100"
                        data-label="true"
                        data-step="10"
                        data-value="0"
                        data-scale-steps="5"
                        data-scale-sub-steps="4"
                        data-rangeWidth="15px"
                        data-id="dimer_slidebar_{{ guid }}"
                            id="dimer_slidebar_{{ guid }}"
                            changefunc="core_home_left_panel_slidbar_change" 
                            ref="0"
                            button-group="{{button_group}}"
                            guid="{{guid}}" 
                            authfail="0" 
                            mesh="0"
                            mobmob="0"
                            signal="{{ signal }}" 
                            bluetooth="{{ bluetooth }}" 
                            password="{{ password }}" 
                            leader="{{leader}}"
                            ref="{{ profile_device_name }}|{{ subdevice_name}}" 
                            subdevice-name="{{ subdevice_name }}" 
                        ></div>
                        <div class="tip-title"><i class="icon material-icons" style="margin-left:8px;">brightness_high</i></div>
                    </div>
                    <div></div>
                </div>
            </div>
        </li>
    `;
    
    mode = '0-10v Dimming';
    button_group_template[mode] = `
        <li ${tpl_config_attribute} type-box="Dimming">
            <div class="item-content swipeout-content">
                <a href="#" func="ble_load_to_device_form" ref="{{uuid}}" class="item-link item-content no-chevron no-ripple no-active-state">
                    ${tpl_device_thumb}
                    <div class="item-inner">
                        ${tpl_device_title_block}
                        ${tpl_device_signal_panel}
                    </div>
                    <div class="control-panel-right" style="margin-right:-10px;">
                        ${(isset(tpl_device_mode[mode]) ? tpl_device_mode[mode] : '')}
                    </div>
                </a>
                {% if render_type == 'room' %} 
                <!-- region swipe left -->
                <div class="swipeout-actions-left">
                    <a href="/frappe/detail/Google Control Guid/APP_HA_GOOGLE_Form_V5/null/null/profile_subdevice={{ subdevice_name }}/" class="link color-orange"><i class="icon material-icons">mic</i></a>
                    <a href="/frappe/list/Timer/APP_HA_Device_Timer_V3/Profile Subdevice Timer/null/16/profile_subdevice={{ subdevice_name }}/" class="link color-cust-blue"><i class="icon material-icons">alarm</i></a>
                    <a href="#" class="link color-cust-purple" func="iot_ble_toggle_connection"><i class="icon material-icons">settings_bluetooth</i></a>
                </div>
                <div class="swipeout-actions-right">
                    <a href="{{setting_link}}"
                    class="link color-orange"><i class="icon material-icons">settings</i></a>
                    <a href="/frappe/list/Device Control Log/APP_Yoswit_Device_Control_Log_V5/Device Control Log/null/20/subdevice_name={{ subdevice_name }}/" class="link color-cust-blue"><i class="icon material-icons">content_paste_go</i></a>
                    <a href="/frappe/list/Device Control Log/APP_Yoswit_Device_Control_Log_V5/Device Control Log/null/20/subdevice_name={{ subdevice_name }}/" class="link color-cust-green"><i class="icon material-icons">visibility</i></a>
                    <a href="#" data-confirm="Are you sure you want to delete this item?" class="link swipeout-delete"><i
                        class="icon material-icons">delete</i></a>
                </div>
                {% endif %}
            </div>
        </li>
        <li class="device subdevice home-scanned-peripheral display-flex dimming-subdevice" ${tpl_config_attribute} style="height:67px!important;">
            <div class="row padding-tb flex-direction-column justify-content-center">
                <div class="col-100 medium-50 large-50">
                    <div class="content display-flex justify-content-center" style="margin-left: 15px;margin-right:15px;">
                        <div class="tip-title"><i class="icon material-icons" style="margin-right:8px;">brightness_low</i></div>
                        <div class="range-slider range-slider-init"
                        data-min="0"
                        data-max="100"
                        data-label="true"
                        data-step="10"
                        data-value="0"
                        data-scale-steps="5"
                        data-scale-sub-steps="4"
                        data-rangeWidth="15px"
                        data-id="dimer_slidebar_{{ guid }}"
                            id="dimer_slidebar_{{ guid }}"
                            changefunc="core_home_left_panel_slidbar_change" 
                            ref="0"
                            button-group="{{button_group}}"
                            guid="{{guid}}" 
                            authfail="0" 
                            mesh="0"
                            mobmob="0"
                            signal="{{ signal }}" 
                            bluetooth="{{ bluetooth }}" 
                            password="{{ password }}" 
                            leader="{{leader}}"
                            ref="{{ profile_device_name }}|{{ subdevice_name}}" 
                            subdevice-name="{{ subdevice_name }}" 
                        ></div>
                        <div class="tip-title"><i class="icon material-icons" style="margin-left:8px;">brightness_high</i></div>
                    </div>
                    <div></div>
                </div>
            </div>
        </li>
    `;
    mode = 'Thermostat';
    button_group_template[mode] = `
        <li ${tpl_config_attribute} is-thermostat-control="true" type-box="Dimming">
            <div class="item-content swipeout-content">
                <a href="#" func="ble_load_to_device_form" ref="{{uuid}}" class="item-link item-content no-chevron no-ripple no-active-state">
                    ${tpl_device_thumb}
                    <div class="item-inner">
                        ${tpl_device_title_block}
                        ${tpl_device_signal_panel}
                    </div>
                    <div class="control-panel-right" style="margin-right:-10px;">
                        ${(isset(tpl_device_mode[mode]) ? tpl_device_mode[mode] : '')}
                    </div>
                </a>
                {% if render_type == 'room' %} 
                <!-- region swipe left -->
                <div class="swipeout-actions-left">
                    <a href="/frappe/detail/Google Control Guid/APP_HA_GOOGLE_Form_V5/null/null/profile_subdevice={{ subdevice_name }}/" class="link color-orange"><i class="icon material-icons">mic</i></a>
                    <a href="/frappe/list/Timer/APP_HA_Device_Timer_V3/Profile Subdevice Timer/null/16/profile_subdevice={{ subdevice_name }}/" class="link color-cust-blue"><i class="icon material-icons">alarm</i></a>
                    <a href="#" class="link color-cust-purple" func="iot_ble_toggle_connection"><i class="icon material-icons">settings_bluetooth</i></a>
                </div>
                <div class="swipeout-actions-right">
                    <a href="{{setting_link}}"
                    class="link color-orange"><i class="icon material-icons">settings</i></a>
                    <a href="/frappe/list/Device Control Log/APP_Yoswit_Device_Control_Log_V5/Device Control Log/null/20/subdevice_name={{ subdevice_name }}/" class="link color-cust-blue"><i class="icon material-icons">content_paste_go</i></a>
                    <a href="/frappe/list/Device Control Log/APP_Yoswit_Device_Control_Log_V5/Device Control Log/null/20/subdevice_name={{ subdevice_name }}/" class="link color-cust-green"><i class="icon material-icons">visibility</i></a>
                    <a href="#" data-confirm="Are you sure you want to delete this item?" class="link swipeout-delete"><i
                        class="icon material-icons">delete</i></a>
                </div>
                {% endif %}
            </div>
        </li>
        <li class="device subdevice home-scanned-peripheral refonoff-0" ${tpl_config_attribute} style="height:auto;">
            
        </li>
    `;
    mode = 'Curtain Motor';
    button_group_template[mode] = `
        <li ${tpl_config_attribute} config="{{config}}" direction="standard">
            <div class="item-content swipeout-content">
                <a href="#" func="ble_load_to_device_form" ref="{{uuid}}" class="item-link item-content no-chevron no-ripple no-active-state">
                    ${tpl_device_thumb}
                    <div class="item-inner">
                        ${tpl_device_title_block}
                        ${tpl_device_signal_panel}
                    </div>
                    <div class="control-panel-right" style="margin-right:-10px;">
                        ${(isset(tpl_device_mode[mode]) ? tpl_device_mode[mode] : '')}
                    </div>
                </a>
                {% if render_type == 'room' %} 
                <!-- region swipe left -->
                <div class="swipeout-actions-left">
                    <a href="/frappe/detail/Google Control Guid/APP_HA_GOOGLE_Form_V5/null/null/profile_subdevice={{ subdevice_name }}/" class="link color-orange"><i class="icon material-icons">mic</i></a>
                    <a href="/frappe/list/Timer/APP_HA_Device_Timer_V3/Profile Subdevice Timer/null/16/profile_subdevice={{ subdevice_name }}/" class="link color-cust-blue"><i class="icon material-icons">alarm</i></a>
                    <a href="#" class="link color-cust-purple" func="iot_ble_toggle_connection"><i class="icon material-icons">settings_bluetooth</i></a>
                </div>
                <div class="swipeout-actions-right">
                    <a href="{{setting_link}}"
                    class="link color-orange"><i class="icon material-icons">settings</i></a>
                    <a href="/frappe/list/Device Control Log/APP_Yoswit_Device_Control_Log_V5/Device Control Log/null/20/subdevice_name={{ subdevice_name }}/" class="link color-cust-blue"><i class="icon material-icons">content_paste_go</i></a>
                    <a href="/frappe/list/Device Control Log/APP_Yoswit_Device_Control_Log_V5/Device Control Log/null/20/subdevice_name={{ subdevice_name }}/" class="link color-cust-green"><i class="icon material-icons">visibility</i></a>
                    <a href="#" data-confirm="Are you sure you want to delete this item?" class="link swipeout-delete"><i
                        class="icon material-icons">delete</i></a>
                </div>
                {% endif %}
            </div>
        </li>
        <li class="device home-scanned-peripheral display-flex curtain-subdevice" ${tpl_config_attribute} direction="standard" style="height:67px!important;">
            <div class="row padding-tb flex-direction-column justify-content-center">
                <div class="col-100 medium-50 large-50">
                    <div class="content display-flex justify-content-center" style="margin-left: 15px;margin-right:15px;">
                        <div class="tip-title"><img src="${runtime.appConfig.app_api_url}/files/close-curtain.svg" alt="" style="width:20px;height:20px;margin-right:8px;margin-top:5px;"></div>
                        <div class="range-slider range-slider-init"
                        data-min="0"
                        data-max="100"
                        data-label="true"
                        data-step="10"
                        data-value="0"
                        data-scale-steps="5"
                        data-scale-sub-steps="4"
                        data-rangeWidth="15px"
                        data-id="dimer_slidebar_{{ guid }}"
                            id="dimer_slidebar_curtain{{ guid }}"
                            changefunc="core_home_left_panel_slidbar_change" 
                            ref="0"
                            button-group="{{button_group}}"
                            guid="{{guid}}" 
                            authfail="0" 
                            mesh="0"
                            mobmob="0"
                            signal="{{ signal }}" 
                            bluetooth="{{ bluetooth }}" 
                            password="{{ password }}" 
                            leader="{{leader}}"
                            direction="standard"
                            ref="{{ profile_device_name }}|{{ subdevice_name}}" 
                            subdevice-name="{{ subdevice_name }}" 
                        ></div>
                        <div class="tip-title"><img src="${runtime.appConfig.app_api_url}/files/open-curtain.svg" alt="" style="width:20px;height:20px;margin-left:8px;margin-top:5px;"></div>
                    </div>
                    <div></div>
                </div>
            </div>
        </li>
    `;
    mode = 'Curtain Motor Reverse';
    button_group_template[mode] = `
        <li ${tpl_config_attribute} config="{{config}}" direction="reverse">
            <div class="item-content swipeout-content">
                <a href="#" func="ble_load_to_device_form" ref="{{uuid}}" class="item-link item-content no-chevron no-ripple no-active-state">
                    ${tpl_device_thumb}
                    <div class="item-inner">
                        ${tpl_device_title_block}
                        ${tpl_device_signal_panel}
                    </div>
                    <div class="control-panel-right" style="margin-right:-10px;">
                        ${(isset(tpl_device_mode[mode]) ? tpl_device_mode[mode] : '')}
                    </div>
                </a>
                {% if render_type == 'room' %} 
                <!-- region swipe left -->
                <div class="swipeout-actions-left">
                    <a href="/frappe/detail/Google Control Guid/APP_HA_GOOGLE_Form_V5/null/null/profile_subdevice={{ subdevice_name }}/" class="link color-orange"><i class="icon material-icons">mic</i></a>
                    <a href="/frappe/list/Timer/APP_HA_Device_Timer_V3/Profile Subdevice Timer/null/16/profile_subdevice={{ subdevice_name }}/" class="link color-cust-blue"><i class="icon material-icons">alarm</i></a>
                    <a href="#" class="link color-cust-purple" func="iot_ble_toggle_connection"><i class="icon material-icons">settings_bluetooth</i></a>
                </div>
                <div class="swipeout-actions-right">
                    <a href="{{setting_link}}"
                    class="link color-orange"><i class="icon material-icons">settings</i></a>
                    <a href="/frappe/list/Device Control Log/APP_Yoswit_Device_Control_Log_V5/Device Control Log/null/20/subdevice_name={{ subdevice_name }}/" class="link color-cust-blue"><i class="icon material-icons">content_paste_go</i></a>
                    <a href="/frappe/list/Device Control Log/APP_Yoswit_Device_Control_Log_V5/Device Control Log/null/20/subdevice_name={{ subdevice_name }}/" class="link color-cust-green"><i class="icon material-icons">visibility</i></a>
                    <a href="#" data-confirm="Are you sure you want to delete this item?" class="link swipeout-delete"><i
                        class="icon material-icons">delete</i></a>
                </div>
                {% endif %}
            </div>
        </li>
        <li class="device home-scanned-peripheral display-flex curtain-subdevice" ${tpl_config_attribute} direction="reverse" style="height:67px!important;">
            <div class="row padding-tb flex-direction-column justify-content-center">
                <div class="col-100 medium-50 large-50">
                    <div class="content display-flex justify-content-center" style="margin-left: 15px;margin-right:15px;">
                        <div class="tip-title"><img src="${runtime.appConfig.app_api_url}/files/open-curtain.svg" alt="" style="width:20px;height:20px;margin-right:8px;margin-top:5px;"></div>
                        <div class="range-slider range-slider-init"
                        data-min="0"
                        data-max="100"
                        data-label="true"
                        data-step="10"
                        data-value="0"
                        data-scale-steps="5"
                        data-scale-sub-steps="4"
                        data-rangeWidth="15px"
                        data-id="dimer_slidebar_{{ guid }}"
                            id="dimer_slidebar_curtain{{ guid }}"
                            changefunc="core_home_left_panel_slidbar_change" 
                            ref="0"
                            button-group="{{button_group}}"
                            guid="{{guid}}" 
                            authfail="0" 
                            mesh="0"
                            mobmob="0"
                            signal="{{ signal }}" 
                            bluetooth="{{ bluetooth }}" 
                            password="{{ password }}" 
                            leader="{{leader}}"
                            direction="reverse"
                            ref="{{ profile_device_name }}|{{ subdevice_name}}" 
                            subdevice-name="{{ subdevice_name }}" 
                        ></div>
                        <div class="tip-title"><img src="${runtime.appConfig.app_api_url}/files/close-curtain.svg" alt="" style="width:20px;height:20px;margin-left:8px;margin-top:5px;"></div>
                    </div>
                    <div></div>
                </div>
            </div>
        </li>
    `;
    mode = 'IAQ Sensor';
    button_group_template[mode] = `
        <li ${tpl_config_attribute}>
            <div class="item-content swipeout-content">
                <a href="#" func="ble_load_to_device_form" ref="{{uuid}}" class="item-link item-content no-chevron no-ripple no-active-state">
                    ${tpl_device_thumb}
                    <div class="item-inner">
                        ${tpl_device_title_block}
                        ${tpl_device_signal_panel}
                    </div>
                    <div class="control-panel-right" style="margin-right:-10px;">
                        <a class="iot-connect" func="home_ui_click_ble_connect">
                            <div class="button button-raised button-big circle">
                                <i class="material-icons">bluetooth_connected</i>
                            </div>
                        </a>
                        <a class="right iaq-button-score-a" func="" button-signal="ARC_ON_OFF"  command="{{command}}" command-type="{{command_type}}">
                            <div class="button iaq-button-score button-raised button-big circle display-flex flex-direction-column justify-content-center align-content-center align-items-center" style="background-color:green;line-height:18px;padding-top:10px;color:#fff;">

                                <span class="score text-color-white" style="height:29px;font-size:23px;">{{score}}</span>
                                <div class="score-desc text-color-white" style="font-size: 12px;height:29px;line-height:29px;">Good</div>
                            </div>
                        </a>
                    </div>
                </a>
                {% if render_type == 'room' %} 
                <!-- region swipe left -->
                <div class="swipeout-actions-left">
                    <a href="/frappe/detail/Google Control Guid/APP_HA_GOOGLE_Form_V5/null/null/profile_subdevice={{ subdevice_name }}/" class="link color-orange"><i class="icon material-icons">mic</i></a>
                    <a href="/frappe/list/Timer/APP_HA_Device_Timer_V3/Profile Subdevice Timer/null/16/profile_subdevice={{ subdevice_name }}/" class="link color-cust-blue"><i class="icon material-icons">alarm</i></a>
                    <a href="#" class="link color-cust-purple" func="iot_ble_toggle_connection"><i class="icon material-icons">settings_bluetooth</i></a>
                </div>
                <div class="swipeout-actions-right">
                    <a href="{{setting_link}}"
                    class="link color-orange"><i class="icon material-icons">settings</i></a>
                    <a href="/frappe/list/Device Control Log/APP_Yoswit_Device_Control_Log_V5/Device Control Log/null/20/subdevice_name={{ subdevice_name }}/" class="link color-cust-blue"><i class="icon material-icons">content_paste_go</i></a>
                    <a href="/frappe/list/Device Control Log/APP_Yoswit_Device_Control_Log_V5/Device Control Log/null/20/subdevice_name={{ subdevice_name }}/" class="link color-cust-green"><i class="icon material-icons">visibility</i></a>
                    <a href="#" data-confirm="Are you sure you want to delete this item?" class="link swipeout-delete"><i
                        class="icon material-icons">delete</i></a>
                </div>
                {% endif %}
            </div>
        </li>
        <li class="device home-scanned-peripheral iaq-subdevice device-none" ${tpl_config_attribute} style="flex-wrap:wrap;height:auto;">
            <div class="display-flex justify-content-start align-content-center align-items-center" style="flex-wrap:wrap;height:auto;width:100%;">
            <!-- Temperature -->
            <div class="main-btn" style="width: 20%;">
                <div class="box-btn display-flex justify-content-center align-content-center align-items-center">
                    <div class="Temperature display-flex flex-direction-column justify-content-center align-content-center align-items-center">
                        <div class="box-btn-img display-flex justify-content-center align-content-center align-items-center" style="width: 30px;height:30px;border-radius: 50%;padding:5px;">
                            <img class="" src="${runtime.appConfig.app_api_url}/files/Temperature_1.svg" alt="" style="width: 25px;height:25px;">
                        </div>
                        <div class="title-btn display-flex justify-content-center align-items-center">
                            <span class="iaq-title-big">--</span>
                            <span class="unit">℃</span> 
                        </div>
                    </div>
                </div>
            </div>
            <!-- PM1.0 -->
            <div class="main-btn" style="width: 20%;">
                <div class="box-btn display-flex justify-content-center align-content-center align-items-center box-left">
                    <div class="PM1 display-flex flex-direction-column justify-content-center align-content-center align-items-center">
                        <div class="PM1 box-btn-img display-flex justify-content-center align-content-center align-items-center" style="width: 30px;height:30px;border-radius: 50%;padding:5px;">
                            <img class="" src="${runtime.appConfig.app_api_url}/files/PM1.0_1.svg" alt="" style="width: 25px;height:25px;">
                        </div>
                        <div class="title-btn display-flex justify-content-center align-items-center">
                            <span class="iaq-title-big">--</span>
                            <span class="unit">μg/m3</span>
                        </div>
                    </div>
                </div>
            </div>
            <!-- PM2.5 -->
            <div class="main-btn" style="width: 20%;">
                <div class="box-btn display-flex justify-content-center align-content-center align-items-center box-left">
                    <div class="PM2_5 display-flex flex-direction-column justify-content-center align-content-center align-items-center">
                        <div class="box-btn-img display-flex justify-content-center align-content-center align-items-center" style="width: 30px;height:30px;border-radius: 50%;padding:5px;">
                            <img class="" src="${runtime.appConfig.app_api_url}/files/PM2.5_1.svg" alt="" style="width: 25px;height:25px;">
                        </div>
                        <div class="title-btn display-flex justify-content-center align-items-center">
                            <span class="iaq-title-big">--</span>
                            <span class="unit">μg/m3</span>
                        </div>
                    </div>
                </div>
            </div>
            <!-- PM4 -->
            <div class="main-btn" style="width: 20%;">
                <div class="box-btn display-flex justify-content-center align-content-center align-items-center box-left">
                    <div class="PM4 display-flex flex-direction-column justify-content-center align-content-center align-items-center">
                        <div class="box-btn-img display-flex justify-content-center align-content-center align-items-center" style="width: 30px;height:30px;border-radius: 50%;padding:5px;">
                            <img class="" src="${runtime.appConfig.app_api_url}/files/PM4.0_1.svg" alt="" style="width: 25px;height:25px;">
                        </div>
                        <div class="title-btn display-flex justify-content-center align-items-center">
                            <span class="iaq-title-big">--</span>
                            <span class="unit">μg/m3</span>
                        </div>
                    </div>
                </div>
            </div>
            <!-- PM10 -->
            <div class="main-btn" style="width: 20%;">
                <div class="box-btn display-flex justify-content-center align-content-center align-items-center box-left">
                    <div class="PM10 display-flex flex-direction-column justify-content-center align-content-center align-items-center">
                        <div class="box-btn-img display-flex justify-content-center align-content-center align-items-center" style="width: 30px;height:30px;border-radius: 50%;padding:5px;">
                            <img class="" src="${runtime.appConfig.app_api_url}/files/PM10_1.svg" alt="" style="width: 25px;height:25px;">
                        </div>
                        <div class="title-btn display-flex justify-content-center align-items-center">
                            <span class="iaq-title-big">--</span>
                            <span class="unit">μg/m3</span>
                        </div>
                    </div>
                </div>
            </div>
            <!-- Humidity -->
            <div class="main-btn" style="width: 20%;">
                <div class="box-btn display-flex justify-content-center align-content-center align-items-center box-left">
                    <div class="Humidity display-flex flex-direction-column justify-content-center align-content-center align-items-center">
                        <div class="box-btn-img display-flex justify-content-center align-content-center align-items-center" style="width: 30px;height:30px;border-radius: 50%;padding:5px;">
                            <img class="" src="${runtime.appConfig.app_api_url}/files/Humidity_1.svg" alt="" style="width: 25px;height:25px;">
                        </div>
                        <div class="title-btn display-flex justify-content-center align-items-center">
                            <span class="iaq-title-big">--</span>
                            <span class="unit">%</span>
                        </div>
                    </div>
                </div>
            </div>
            <!-- CO2 -->
            <div class="main-btn" style="width: 20%;">
                <div class="box-btn display-flex justify-content-center align-content-center align-items-center box-left">
                    <div class="CO2 display-flex flex-direction-column justify-content-center align-content-center align-items-center">
                        <div class="box-btn-img display-flex justify-content-center align-content-center align-items-center" style="width: 30px;height:30px;border-radius: 50%;padding:5px;">
                            <img class="" src="${runtime.appConfig.app_api_url}/files/CO2_1.svg" alt="" style="width: 25px;height:25px;">
                        </div>
                        <div class="title-btn display-flex justify-content-center align-items-center">
                            <span class="iaq-title-big">--</span>
                            <span class="unit">ppm</span>
                        </div>
                    </div>
                </div>
            </div>
            <!-- TVOCs -->
            <div class="main-btn" style="width: 20%;">
                <div class="box-btn display-flex justify-content-center align-content-center align-items-center box-left">
                    <div class="VOC display-flex flex-direction-column justify-content-center align-content-center align-items-center">
                        <div class="box-btn-img display-flex justify-content-center align-content-center align-items-center" style="width: 30px;height:30px;border-radius: 50%;padding:5px;">
                            <img class="" src="${runtime.appConfig.app_api_url}/files/VOC_1.svg" alt="" style="width: 25px;height:25px;">
                        </div>
                        <div class="title-btn display-flex justify-content-center align-items-center">
                            <span class="iaq-title-big">--</span> 
                            <span class="unit">ppd</span>
                        </div>
                    </div>
                </div>
            </div>
            <!-- Light -->
            <div class="main-btn" style="width: 20%;">
                <div class="box-btn display-flex justify-content-center align-content-center align-items-center box-left">
                    <div class="LUX display-flex flex-direction-column justify-content-center align-content-center align-items-center">
                        <div class="box-btn-img display-flex justify-content-center align-content-center align-items-center" style="width: 30px;height:30px;border-radius: 50%;padding:5px;">
                            <img class="" src="${runtime.appConfig.app_api_url}/files/Light_1.svg" alt="" style="width: 25px;height:25px;">
                        </div>
                        <div class="title-btn display-flex justify-content-center align-items-center">
                            <span class="iaq-title-big">--</span>
                            <span class="unit">lux</span>
                        </div>
                    </div>
                </div>
            </div>
            <!-- NOX_1 -->
            <div class="main-btn" style="width: 20%;">
                <div class="box-btn display-flex justify-content-center align-content-center align-items-center box-left">
                    <div class="NOX display-flex flex-direction-column justify-content-center align-content-center align-items-center">
                        <div class="box-btn-img display-flex justify-content-center align-content-center align-items-center" style="width: 30px;height:30px;border-radius: 50%;padding:5px;">
                            <img class="" src="${runtime.appConfig.app_api_url}/files/NOX_1.svg" alt="" style="width: 25px;height:25px;">
                        </div>
                        <div class="title-btn display-flex justify-content-center align-items-center">
                            <span class="iaq-title-big">--</span>
                            <span class="unit">ppb</span>
                        </div>
                    </div>
                </div>
            </div>
            <!-- CO_1 -->
            <div class="main-btn" style="width: 20%;">
                <div class="box-btn display-flex justify-content-center align-content-center align-items-center box-left">
                    <div class="CO display-flex flex-direction-column justify-content-center align-content-center align-items-center">
                        <div class="box-btn-img display-flex justify-content-center align-content-center align-items-center" style="width: 30px;height:30px;border-radius: 50%;padding:5px;">
                            <img class="" src="${runtime.appConfig.app_api_url}/files/CO_1.svg" alt="" style="width: 25px;height:25px;">
                        </div>
                        <div class="title-btn display-flex justify-content-center align-items-center">
                            <span class="iaq-title-big">--</span>
                            <span class="unit">ppm</span>
                        </div>
                    </div>
                </div>
            </div>
            <!-- O3_1 -->
            <div class="main-btn" style="width: 20%;">
                <div class="box-btn display-flex justify-content-center align-content-center align-items-center box-left">
                    <div class="O3 display-flex flex-direction-column justify-content-center align-content-center align-items-center">
                        <div class="box-btn-img display-flex justify-content-center align-content-center align-items-center" style="width: 30px;height:30px;border-radius: 50%;padding:5px;">
                            <img class="" src="${runtime.appConfig.app_api_url}/files/O3_1.svg" alt="" style="width: 25px;height:25px;">
                        </div>
                        <div class="title-btn display-flex justify-content-center align-items-center">
                            <span class="iaq-title-big">--</span>
                            <span class="unit">ppb</span>
                        </div>
                    </div>
                </div>
            </div>
            <!-- HCHO_1 -->
            <div class="main-btn" style="width: 20%;">
                <div class="box-btn display-flex justify-content-center align-content-center align-items-center box-left">
                    <div class="HCHO display-flex flex-direction-column justify-content-center align-content-center align-items-center">
                        <div class="box-btn-img display-flex justify-content-center align-content-center align-items-center" style="width: 30px;height:30px;border-radius: 50%;padding:5px;">
                            <img class="" src="${runtime.appConfig.app_api_url}/files/HCHO_1.svg" alt="" style="width: 25px;height:25px;">
                        </div>
                        <div class="title-btn display-flex justify-content-center align-items-center">
                            <span class="iaq-title-big">--</span>
                            <span class="unit">ppm</span>
                        </div>
                    </div>
                </div>
            </div>
            <!-- NOISE_1 -->
            <div class="main-btn" style="width: 20%;">
                <div class="box-btn display-flex justify-content-center align-content-center align-items-center box-left">
                    <div class="NOISE display-flex flex-direction-column justify-content-center align-content-center align-items-center">
                        <div class="box-btn-img display-flex justify-content-center align-content-center align-items-center" style="width: 30px;height:30px;border-radius: 50%;padding:5px;">
                            <img class="" src="${runtime.appConfig.app_api_url}/files/NOISE_1.svg" alt="" style="width: 25px;height:25px;">
                        </div>
                        <div class="title-btn display-flex justify-content-center align-items-center">
                            <span class="iaq-title-big">--</span>
                            <span class="unit">dB</span>
                        </div>
                    </div>
                </div>
            </div>
            <!-- PRESSURE_1 -->
            <div class="main-btn" style="width: 20%;">
                <div class="box-btn display-flex justify-content-center align-content-center align-items-center box-left">
                    <div class="PRESSURE display-flex flex-direction-column justify-content-center align-content-center align-items-center">
                        <div class="box-btn-img display-flex justify-content-center align-content-center align-items-center" style="width: 30px;height:30px;border-radius: 50%;padding:5px;">
                            <img class="" src="${runtime.appConfig.app_api_url}/files/PRESSURE_1.svg" alt="" style="width: 25px;height:25px;">
                        </div>
                        <div class="title-btn display-flex justify-content-center align-items-center">
                            <span class="iaq-title-big">--</span>
                            <span class="unit">kpa</span>
                        </div>
                    </div>
                </div>
            </div>
            </div>
        </li>
    `;
    
    mode = 'Door Sensor';
    button_group_template[mode] = `
        <li ${tpl_config_attribute}>
            <div class="item-content swipeout-content">
                <a href="#" func="ble_load_to_device_form" ref="{{uuid}}"  class="item-link item-content no-chevron no-ripple no-active-state">
                    ${tpl_device_thumb}
                    <div class="item-inner">
                        ${tpl_device_title_block}
                        ${tpl_device_signal_panel}
                    </div>
                    <div class="control-panel-right" style="margin-right:-10px;">
                        <a class="right" func="" button-signal=""  command="{{command}}" command-type="{{command_type}}">
                          <div class="button button-raised button-big circle" style="background-color: grey;">
                            <img src="${runtime.appConfig.app_api_url}/files/door_close.svg" style="width:25px;height:25px" alt="">
                        </div>
                        </a>
                    </div>
                </a>
                {% if render_type == 'room' %} 
                <!-- region swipe left -->
                <div class="swipeout-actions-left">
                    <a href="/frappe/detail/Google Control Guid/APP_HA_GOOGLE_Form_V5/null/null/profile_subdevice={{ subdevice_name }}/" class="link color-orange"><i class="icon material-icons">mic</i></a>
                    <a href="/frappe/list/Timer/APP_HA_Device_Timer_V3/Profile Subdevice Timer/null/16/profile_subdevice={{ subdevice_name }}/" class="link color-cust-blue"><i class="icon material-icons">alarm</i></a>
                    <a href="#" class="link color-cust-purple" func="iot_ble_toggle_connection"><i class="icon material-icons">settings_bluetooth</i></a>
                </div>
                <div class="swipeout-actions-right">
                    <a href="{{setting_link}}"
                    class="link color-orange"><i class="icon material-icons">settings</i></a>
                    <a href="/frappe/list/Device Control Log/APP_Yoswit_Device_Control_Log_V5/Device Control Log/null/20/subdevice_name={{ subdevice_name }}/" class="link color-cust-blue"><i class="icon material-icons">content_paste_go</i></a>
                    <a href="/frappe/list/Device Control Log/APP_Yoswit_Device_Control_Log_V5/Device Control Log/null/20/subdevice_name={{ subdevice_name }}/" class="link color-cust-green"><i class="icon material-icons">visibility</i></a>
                    <a href="#" data-confirm="Are you sure you want to delete this item?" class="link swipeout-delete"><i
                        class="icon material-icons">delete</i></a>
                </div>
                {% endif %}
            </div>
        </li>
    `;
    
    
    
    mode = 'MQTT Hub';
    button_group_template[mode] = `
        <li ${tpl_config_attribute}>
            <div class="item-content swipeout-content">
              <a href="#" func="ble_load_to_device_form" ref="{{uuid}}" class="item-link item-content no-chevron no-ripple no-active-state">
                  ${tpl_device_thumb}
                  <div class="item-inner">
                      ${tpl_device_title_block}
                      ${tpl_device_signal_panel}
                  </div>
                  <div class="control-panel-right" style="margin-right:-10px;">
                      ${tpl_device_mode[mode]}
                  </div>
              </a>
              {% if render_type == 'room' %} 
              <!-- region swipe left -->
              <div class="swipeout-actions-left">
                  <a href="/frappe/detail/Google Control Guid/APP_HA_GOOGLE_Form_V5/null/null/profile_subdevice={{ subdevice_name }}/" class="link color-orange"><i class="icon material-icons">mic</i></a>
                  <a href="/frappe/list/Timer/APP_HA_Device_Timer_V3/Profile Subdevice Timer/null/16/profile_subdevice={{ subdevice_name }}/" class="link color-cust-blue"><i class="icon material-icons">alarm</i></a>
                  <a href="#" class="link color-cust-purple" func="iot_ble_toggle_connection"><i class="icon material-icons">settings_bluetooth</i></a>
              </div>
              <div class="swipeout-actions-right">
                <a href="{{setting_link}}"
                class="link color-orange"><i class="icon material-icons">settings</i></a>
                <a href="/frappe/list/Device Control Log/APP_Yoswit_Device_Control_Log_V5/Device Control Log/null/20/subdevice_name={{ subdevice_name }}/" class="link color-cust-blue"><i class="icon material-icons">content_paste_go</i></a>
                <a href="/frappe/list/Device Control Log/APP_Yoswit_Device_Control_Log_V5/Device Control Log/null/20/subdevice_name={{ subdevice_name }}/" class="link color-cust-green"><i class="icon material-icons">visibility</i></a>
                <a href="#" data-confirm="Are you sure you want to delete this item?" class="link swipeout-delete"><i
                    class="icon material-icons">delete</i></a>
              </div>
              {% endif %}
            </div>
        </li>
    `;
};
