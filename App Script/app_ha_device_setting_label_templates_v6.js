window.initSettingTemplate = ()=>{
    if(isset(window.setting_label_template)){
        delete window.setting_label_template
    }
    window.setting_label_template = {};
    let setting_label = "";
    setting_label = "Title";
    setting_label_template[setting_label] = `
        <h3 class="my-3">{{ _(self_setting_data.setting_type) }}</h3>
    `;
    setting_label = "General Settings";
    setting_label_template[setting_label] = `
        <div class="card margin-bottom-half mx-0 my-3" dependencies="{{self_setting_data.dependencies}}">
            <div class="card-content card-content-padding">
                <div class="row">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">settings</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">${_(setting_label)}</h5>
                    </div>
                    <div class="col-auto">
                        <a 
                            func="ble_load_to_device_form_auto" 
                            subdevice-name="{{profile_subdevice_name}}"
                            device-name="{{device_name}}"
                            mac-address="{{mac_address}}"
                            hexBatch="{{device_hex_batch}}"
                            hexModel="{{ guid[-6:-2]}}"
                            firmware="{{firmware}}"
                            uuid="{{uuid}}"
                            button_group="{{device_button_group}}"
                            guid="{{guid}}"
                            display-name="{{setting_title}}"
                            load-type="setting"
                            page-type="1"
                            ref="{{ device }}|{{ device_button_group }}|{{ profile_subdevice_name }}|0" 
                            href="#"
                            class="button button-fill button-44 color-theme button-raised device"
                        >
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Change Name";
    setting_label_template[setting_label] = `
        <div class="card margin-bottom-half mx-0 my-3" dependencies="{{self_setting_data.dependencies}}">
            <div class="card-content card-content-padding">
                <div class="row">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">settings</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">${_(setting_label)}</h5>
                    </div>
                    <div class="col-auto">
                        <a 
                            func="iot_device_load_detail" 
                            device-name="{{device_name}}"
                            mac-address="{{mac_address}}"
                            hexBatch="{{device_hex_batch}}"
                            hexModel="{{ guid[-6:-2]}}"
                            firmware="{{firmware}}"
                            uuid="{{uuid}}"
                            button_group="{{device_button_group}}"
                            guid="{{guid}}"
                            display-name="{{setting_title}}"
                            load-type="setting"
                            ref="{{ device }}|{{ device_button_group }}|{{ profile_subdevice_name }}|0" 
                            href="#"
                            class="button button-fill button-44 color-theme button-raised device"
                        >
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Set Time";
    setting_label_template[setting_label] = `
        <div class="card margin-bottom-half mx-0 my-3" dependencies="{{self_setting_data.dependencies}}">
            <div class="card-content card-content-padding">
                <div class="row">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">settings</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">${_(setting_label)}</h5>
                    </div>
                    <div class="col-auto">
                        <a 
                            func="iot_ble_sync_clock" 
                            device-name="{{device_name}}"
                            mac-address="{{mac_address}}"
                            hexBatch="{{device_hex_batch}}"
                            hexModel="{{ guid[-6:-2]}}"
                            firmware="{{firmware}}"
                            uuid="{{uuid}}"
                            button_group="{{device_button_group}}"
                            guid="{{guid}}"
                            display-name="{{setting_title}}"
                            load-type="setting"
                            ref="{{ device }}|{{ device_button_group }}|{{ profile_subdevice_name }}|0" 
                            href="#"
                            class="button button-fill button-44 color-theme button-raised device"
                        >
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Change Mode";
    setting_label_template[setting_label] = `
        <div 
            class="auto-init card margin-bottom-half mx-0 my-3"
            ref="{{ device }}"
            init-func="iot_mode_setup_change_mode_init"
            setting-type="{{ self_setting_data.setting_type }}"
            setting-name="{{ self_setting_data.name }}"
            setting-value="{{ self_setting_data.setting }}"
            device-mode="{{device_mode }}"
            button-group="{{device_button_group }}"
            dependencies="{{self_setting_data.dependencies}}"
            subdevice-name="{{profile_subdevice_name}}"
            slot-index="{{slot_index}}"
        >
            <input name="change_mode" type="hidden" value="" />
            <div class="card-content card-content-padding">
                <div class="row align-items-center">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">bolt</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">{{ _(self_setting_data.setting_type) }}</h5>
                    </div>
                    <div class="col-auto">
                        <a id="action-change-mode" href="#" class="button button-fill button-44 color-theme button-raised">
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Mesh Retry Times";
    setting_label_template[setting_label] = `
        <div 
            class="auto-init card margin-bottom-half mx-0 my-3"
            ref="{{ device }}"
            init-func="iot_mode_setup_rcu_retry_time_init"
            setting-type="{{ self_setting_data.setting_type }}"
            setting-name="{{ self_setting_data.name }}"
            setting-value="{{ self_setting_data.setting }}"
            device-mode="{{device_mode }}"
            button-group="{{device_button_group }}"
            dependencies="{{self_setting_data.dependencies}}"
            subdevice-name="{{profile_subdevice_name}}"
            slot-index="{{slot_index}}"
        >
            <input name="rcu_retry_time" type="hidden" value="" />
            <div class="card-content card-content-padding">
                <div class="row align-items-center">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">bolt</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">{{ _(self_setting_data.setting_type) }}</h5>
                        {% if self_setting_data.setting != ""  %}
                        <p class="setting-value text-muted size-12">{{_(self_setting_data.setting)}}</p>
                        {% else %}
                        <p class="setting-value text-muted size-12">{{_("5")}}</p>
                        {% endif %}
                    </div>
                    <div class="col-auto">
                        <a id="action-rcu-retry-time" href="#" class="button button-fill button-44 color-theme button-raised">
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Change Virtual Button";
    setting_label_template[setting_label] = `
        <div 
            class="auto-init card margin-bottom-half mx-0 my-3"
            ref="{{ device }}"
            setting-type="{{ self_setting_data.setting_type }}"
            setting-name="{{ self_setting_data.name }}"
            setting-value="{{ self_setting_data.setting }}"
            device-mode="{{device_mode }}"
            button-group="{{device_button_group }}"
            dependencies="{{self_setting_data.dependencies}}"
            subdevice-name="{{profile_subdevice_name}}"
            slot-index="{{slot_index}}"
        >
            <input name="rcu_retry_time" type="hidden" value="" />
            <div class="card-content card-content-padding">
                <div class="row align-items-center">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">bolt</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">{{ _(self_setting_data.setting_type) }}</h5>
                        {% if self_setting_data.setting != ""  %}
                        <p class="setting-value text-muted size-12">{{_(self_setting_data.setting)}}</p>
                        {% else %}
                        {% endif %}
                    </div>
                    <div class="col-auto">
                        <a func="iot_ble_change_virtual_button" ref="{{ device }}" button-group="{{device_button_group }}" class="button button-fill button-44 color-theme button-raised">
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Device Test";
    setting_label_template[setting_label] = `
        <div 
            class="auto-init card margin-bottom-half mx-0 my-3"
            ref="{{ device }}"
            setting-type="{{ self_setting_data.setting_type }}"
            setting-name="{{ self_setting_data.name }}"
            setting-value="{{ self_setting_data.setting }}"
            device-mode="{{device_mode }}"
            button-group="{{device_button_group }}"
            dependencies="{{self_setting_data.dependencies}}"
            subdevice-name="{{profile_subdevice_name}}"
            slot-index="{{slot_index}}"
        >
            <input name="rcu_retry_time" type="hidden" value="" />
            <div class="card-content card-content-padding">
                <div class="row align-items-center">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">bolt</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">{{ _(self_setting_data.setting_type) }}</h5>
                        
                    </div>
                    <div class="col-auto">
                        <a func="iot_device_test" ref="{{ device }}" button-group="{{device_button_group }}" href="#" class="button button-fill button-44 color-theme button-raised">
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Device Test Log";
    setting_label_template[setting_label] = `
        <div 
            class="auto-init card margin-bottom-half mx-0 my-3"
            ref="{{ device }}"
            setting-type="{{ self_setting_data.setting_type }}"
            setting-name="{{ self_setting_data.name }}"
            setting-value="{{ self_setting_data.setting }}"
            device-mode="{{device_mode }}"
            button-group="{{device_button_group }}"
            dependencies="{{self_setting_data.dependencies}}"
            subdevice-name="{{profile_subdevice_name}}"
            slot-index="{{slot_index}}"
        >
            <input name="rcu_retry_time" type="hidden" value="" />
            <div class="card-content card-content-padding">
                <div class="row align-items-center">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">bolt</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">{{ _(self_setting_data.setting_type) }}</h5>
                    </div>
                    <div class="col-auto">
                        <a href="/mobile-app/device-connect-log?guid={{ device }}" class="button button-fill button-44 color-theme button-raised">
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Change Password";
    setting_label_template[setting_label] = `
        <div class="card margin-bottom-half mx-0 my-3" dependencies="{{self_setting_data.dependencies}}">
            <div class="card-content card-content-padding">
                <div class="row">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">key</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">${_(setting_label)}</h5>
                    </div>
                    <div class="col-auto">
                        <a 
                            func="iot_ble_change_password" 
                            ref="{{ device }}" 
                            device-name="{{ profile_device_name }}" 
                            href="#"
                            class="button button-fill button-44 color-theme button-raised "
                        >
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Change Ble Name";
    setting_label_template[setting_label] = `
        <div class="card margin-bottom-half mx-0 my-3" dependencies="{{self_setting_data.dependencies}}">
            <div class="card-content card-content-padding">
                <div class="row">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">key</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">${_(setting_label)}</h5>
                    </div>
                    <div class="col-auto">
                        <a 
                            func="iot_ble_change_ble_name" 
                            ref="{{ device }}" 
                            device-name="{{ profile_device_name }}" 
                            href="#"
                            class="button button-fill button-44 color-theme button-raised "
                        >
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Active Configuration";
    setting_label_template[setting_label] = `
        <div class="card margin-bottom-half mx-0 my-3" dependencies="{{self_setting_data.dependencies}}">
            <div class="card-content card-content-padding">
                <div class="row">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">key</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">${_(setting_label)}</h5>
                    </div>
                    <div class="col-auto">
                        <a 
                            ref="{{ device }}" 
                            device-name="{{ profile_device_name }}" 
                            href="/mobile-app/scene-guid-active-page?guid={{guid}}"
                            class="button button-fill button-44 color-theme button-raised "
                        >
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Toggle Sound Notification";
    setting_label_template[setting_label] = `
        <div class="card margin-bottom-half mx-0 my-3" dependencies="{{self_setting_data.dependencies}}">
            <div class="card-content card-content-padding">
                <div class="row">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">key</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">${_(setting_label)}</h5>
                    </div>
                    <div class="col-auto">
                        <a 
                            func="iot_ble_change_ble_toggle_sound" 
                            ref="{{ device }}" 
                            device-name="{{ profile_device_name }}" 
                            href="#"
                            class="button button-fill button-44 color-theme button-raised "
                        >
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Set Password & Expiry Time";
    setting_label_template[setting_label] = `
        <div class="card margin-bottom-half mx-0 my-3" dependencies="{{self_setting_data.dependencies}}">
            <div class="card-content card-content-padding">
                <div class="row">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">key</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">${_(setting_label)}</h5>
                    </div>
                    <div class="col-auto">
                        <a 
                            func="iot_ble_set_password_expiry_time" 
                            ref="{{ device }}" 
                            device-name="{{ profile_device_name }}" 
                            href="#"
                            class="button button-fill button-44 color-theme button-raised "
                        >
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Replace Device";
    setting_label_template[setting_label] = `
        <div class="card margin-bottom-half mx-0 my-3" dependencies="{{self_setting_data.dependencies}}">
            <div class="card-content card-content-padding">
                <div class="row">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">download</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">${_(setting_label)}</h5>
                    </div>
                    <div class="col-auto">
                        <a 
                            func="core_device_replace_search_device" 
                            ref="{{device}}|{{device_name}}|{{device_model}}|{{settings}}|{{hexid}}|{{device_hex_batch}}|{{model_name}}|{{batch_name}}|{{profile_device_name}}" 
                            device-name="{{ profile_device_name }}" 
                            href="#"
                            class="button button-fill button-44 color-theme button-raised "
                        >
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Power-Up Status";
    setting_label_template[setting_label] = `
        <div 
            class="auto-init card margin-bottom-half mx-0 my-3"
            ref="{{ device }}"
            init-func="iot_mode_setup_powerup_status_auto_init"
            setting-type="{{ self_setting_data.setting_type }}"
            setting-name="{{ self_setting_data.name }}"
            setting-value="{{ self_setting_data.setting }}"
            device-mode="{{device_mode }}"
            button-group="{{device_button_group }}"
            dependencies="{{self_setting_data.dependencies}}"
            slot-index="{{slot_index}}"
        >
            <input name="powerup_status" type="hidden" value="" />
            <div class="card-content card-content-padding">
                <div class="row align-items-center">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">bolt</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">{{ _(self_setting_data.setting_type) }}</h5>
                        {% if self_setting_data.setting == '' %}
                        <p class="setting-value text-muted size-12">{{ _('Off') }}</p>
                        {% else %}
                        <p class="setting-value text-muted size-12">{{ _(self_setting_data.setting) }}</p>
                        {% endif %}
                    </div>
                    <div class="col-auto">
                        <a id="action-powerup-status" href="#" class="button button-fill button-44 color-theme button-raised">
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Physical Switch Lock";
    setting_label_template[setting_label] = `
        <div 
            class="auto-init card margin-bottom-half mx-0 my-3"
            ref="{{ device }}"
            setting-type="{{ self_setting_data.setting_type }}"
            setting-name="{{ self_setting_data.name }}"
            setting-value="{{ self_setting_data.setting }}"
            button-group="{{device_button_group }}"
            device-mode="{{device_mode }}"
            dependencies="{{self_setting_data.dependencies}}"
            slot-index="{{slot_index}}"
        >
           
            <div class="card-content card-content-padding">
                <div class="row align-items-center">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">screen_lock_landscape</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">{{ _(self_setting_data.setting_type) }}</h5>
                        <p class="setting-value text-muted size-12">{{self_setting_data.setting}}</p>
                    </div>
                    <div class="col-auto">
                        <label class="toggle toggle-init">
                            <input 
                                type="checkbox"
                                button-group="{{device_button_group }}"
                                setting-type="{{ self_setting_data.setting_type }}"
                                setting-name="{{ self_setting_data.name }}"
                                device-mode="{{device_mode }}"
                                ref="{{ device }}"
                                slot-index="{{slot_index}}"
                                changefunc="iot_mode_setup_physical_switch_lock_change"
                                {% if self_setting_data.setting != 'Off' and self_setting_data.setting !="" %}checked{% endif %}
                            />
                            <span class="toggle-icon"></span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "PVI Enable";
    setting_label_template[setting_label] = `
        <div 
            class="auto-init card margin-bottom-half mx-0 my-3"
            ref="{{ device }}"
            setting-type="{{ self_setting_data.setting_type }}"
            setting-name="{{ self_setting_data.name }}"
            setting-value="{{ self_setting_data.setting }}"
            button-group="{{device_button_group }}"
            device-mode="{{device_mode }}"
            dependencies="{{self_setting_data.dependencies}}"
            slot-index="{{slot_index}}"
        >
           
            <div class="card-content card-content-padding">
                <div class="row align-items-center">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">screen_lock_landscape</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">{{ _(self_setting_data.setting_type) }}</h5>
                    </div>
                    <div class="col-auto">
                        <label class="toggle toggle-init">
                            <input 
                                type="checkbox"
                                button-group="{{device_button_group }}"
                                setting-type="{{ self_setting_data.setting_type }}"
                                setting-name="{{ self_setting_data.name }}"
                                device-mode="{{device_mode }}"
                                ref="{{ device }}"
                                changefunc="iot_mode_setup_pvi_status_change"
                                {% if self_setting_data.setting != 'false' and self_setting_data.setting !="" %}checked{% endif %}
                            />
                            <span class="toggle-icon"></span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    setting_label = "LED Mode";
    setting_label_template[setting_label] = `
        <div 
            class="auto-init card margin-bottom-half mx-0 my-3"
            ref="{{ device }}"
            init-func="iot_mode_setup_led_mode_auto_init"
            setting-type="{{ led_data.setting_type }}"
            setting-name="{{ led_data.name }}"
            setting-value="{{ led_data.setting }}"
            button-group="{{device_button_group }}"
            dependencies="{{led_data.dependencies}}"
            slot-index="{{slot_index}}"
        >
            <input name="led_mode" type="hidden" value="" />
            <div class="card-content card-content-padding">
                <div class="row align-items-center">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">wb_iridescent</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">{{ _(led_data.setting_type) }}</h5>
                        {% if led_data.setting == '' %}
                        <p class="setting-value text-muted size-12">{{ _('Reverse') }}</p>
                        {% else %}
                        <p class="setting-value text-muted size-12">{{ _(led_data.setting) }}</p>
                        {% endif %}
                    </div>
                    <div class="col-auto">
                        <a id="action" href="#" class="button button-fill button-44 color-theme button-raised">
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Backlight Brightness";
    setting_label_template[setting_label] = `
        <div 
            class="auto-init card margin-bottom-half mx-0 my-3"
            ref="{{ device }}"
            init-func="iot_mode_setup_backlight_brightness_mode_auto_init"
            setting-type="{{ self_setting_data.setting_type }}"
            setting-name="{{ self_setting_data.name }}"
            setting-value="{{ self_setting_data.setting }}"
            button-group="{{device_button_group }}"
            dependencies="{{self_setting_data.dependencies}}"
            slot-index="{{slot_index}}"
        >
            <input name="backlight_brightness" type="hidden" value="" />
            <div class="card-content card-content-padding">
                <div class="row align-items-center">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">light_mode</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">{{ _(self_setting_data.setting_type) }}</h5>
                        {% if self_setting_data.setting == '' %}
                        <p class="setting-value text-muted size-12"></p>
                        {% else %}
                        <p class="setting-value text-muted size-12">{{ _(self_setting_data.setting) }}</p>
                        {% endif %}
                    </div>
                    <div class="col-auto">
                        <a id="action" href="#" class="button button-fill button-44 color-theme button-raised">
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Manned Backlight Brightness";
    setting_label_template[setting_label] = `
        <div 
            class="auto-init card margin-bottom-half mx-0 my-3"
            ref="{{ device }}"
            init-func="iot_mode_setup_manned_backlight_brightness_mode_auto_init"
            setting-type="{{ self_setting_data.setting_type }}"
            setting-name="{{ self_setting_data.name }}"
            setting-value="{{ self_setting_data.setting }}"
            button-group="{{device_button_group }}"
            dependencies="{{self_setting_data.dependencies}}"
            slot-index="{{slot_index}}"
        >
            <input name="manned_backlight_brightness" type="hidden" value="" />
            <div class="card-content card-content-padding">
                <div class="row align-items-center">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">light_mode</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">{{ _(self_setting_data.setting_type) }}</h5>
                        {% if self_setting_data.setting == '' %}
                        <p class="setting-value text-muted size-12"></p>
                        {% else %}
                        <p class="setting-value text-muted size-12">{{ _(self_setting_data.setting) }}</p>
                        {% endif %}
                    </div>
                    <div class="col-auto">
                        <a id="action" href="#" class="button button-fill button-44 color-theme button-raised">
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Manned Backlight Time";
    setting_label_template[setting_label] = `
        <div 
            class="auto-init card margin-bottom-half mx-0 my-3"
            ref="{{ device }}"
            init-func="iot_mode_setup_manned_backlight_time_mode_auto_init"
            setting-type="{{ self_setting_data.setting_type }}"
            setting-name="{{ self_setting_data.name }}"
            setting-value="{{ self_setting_data.setting }}"
            button-group="{{device_button_group }}"
            dependencies="{{self_setting_data.dependencies}}"
            slot-index="{{slot_index}}"
        >
            <input name="manned_backlight_time" type="hidden" value="" />
            <div class="card-content card-content-padding">
                <div class="row align-items-center">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">light_mode</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">{{ _(self_setting_data.setting_type) }}</h5>
                        {% if self_setting_data.setting == '' %}
                        <p class="setting-value text-muted size-12"></p>
                        {% else %}
                        <p class="setting-value text-muted size-12">{{ _(self_setting_data.setting) }}</p>
                        {% endif %}
                    </div>
                    <div class="col-auto">
                        <a id="action" href="#" class="button button-fill button-44 color-theme button-raised">
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Radar Distance";
    setting_label_template[setting_label] = `
        <div 
            class="auto-init card margin-bottom-half mx-0 my-3"
            ref="{{ device }}"
            setting-type="{{ self_setting_data.setting_type }}"
            setting-name="{{ self_setting_data.name }}"
            setting-value="{{ self_setting_data.setting }}"
            button-group="{{device_button_group }}"
            dependencies="{{self_setting_data.dependencies}}"
            slot-index="{{slot_index}}"
        >
            <div class="card-content card-content-padding">
                <div class="row align-items-center">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">light_mode</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">{{ _(self_setting_data.setting_type) }}</h5>
                        {% if self_setting_data.setting == '' %}
                        <p class="setting-value text-muted size-12"></p>
                        {% else %}
                        <p class="setting-value text-muted size-12"></p>
                        {% endif %}
                    </div>
                    <div class="col-auto">
                        <a id="action" href="/mobile-app/radar-distance-limit?guid={{guid}}&subdevice={{subdevice}}" class="button button-fill button-44 color-theme button-raised">
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Linked Virtual Id";
    setting_label_template[setting_label] = `
        <div 
            class="auto-init card margin-bottom-half mx-0 my-3"
            ref="{{ device }}"
            init-func="iot_mode_setup_change_virtual_id_init"
            setting-type="{{ link_virtual_data.setting_type }}"
            setting-name="{{ link_virtual_data.name }}"
            setting-value="{{ link_virtual_data.setting }}"
            button-group="{{device_button_group }}"
            dependencies="{{link_virtual_data.dependencies}}"
            slot-index="{{slot_index}}"
        >
            <input name="link_virtual_id" type="hidden" value="" />
            <div class="card-content card-content-padding">
                <div class="row align-items-center">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">wb_iridescent</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">{{ _(link_virtual_data.setting_type) }}</h5>
                        {% if link_virtual_data.setting == '' %}
                        <p class="setting-value text-muted size-12"></p>
                        {% else %}
                        <p class="setting-value text-muted size-12">{{ _(link_virtual_data.setting) }}</p>
                        {% endif %}
                    </div>
                    <div class="col-auto">
                        <a id="action" href="#" class="button button-fill button-44 color-theme button-raised">
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Link Scene On";
    setting_label_template[setting_label] = `
        <div 
            class="auto-init card margin-bottom-half mx-0 my-3"
            ref="{{ device }}"
            init-func="iot_mode_setup_link_scene_init"
            setting-type="{{ self_setting_data.setting_type }}"
            setting-name="{{ self_setting_data.name }}"
            setting-value="{{ self_setting_data.setting }}"
            button-group="{{device_button_group }}"
            dependencies="{{self_setting_data.dependencies}}"
            slot-index="{{slot_index}}"
        >
            <input name="link_scene_id" type="hidden" value="" />
            <div class="card-content card-content-padding">
                <div class="row align-items-center">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">wb_iridescent</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">{{ _(self_setting_data.setting_type) }}</h5>
                        {% if self_setting_data.setting == '' %}
                        <p class="setting-value text-muted size-12"></p>
                        {% else %}
                        <p class="setting-value text-muted size-12">{{ _(self_setting_data.setting) }}</p>
                        {% endif %}
                    </div>
                    <div class="col-auto">
                        <a id="action" href="#" class="button button-fill button-44 color-theme button-raised">
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Link Scene Off";
    setting_label_template[setting_label] = `
        <div 
            class="auto-init card margin-bottom-half mx-0 my-3"
            ref="{{ device }}"
            init-func="iot_mode_setup_link_scene_off_init"
            setting-type="{{ self_setting_data.setting_type }}"
            setting-name="{{ self_setting_data.name }}"
            setting-value="{{ self_setting_data.setting }}"
            button-group="{{device_button_group }}"
            dependencies="{{self_setting_data.dependencies}}"
            slot-index="{{slot_index}}"
        >
            <input name="link_scene_off_id" type="hidden" value="" />
            <div class="card-content card-content-padding">
                <div class="row align-items-center">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">wb_iridescent</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">{{ _(self_setting_data.setting_type) }}</h5>
                        {% if self_setting_data.setting == '' %}
                        <p class="setting-value text-muted size-12"></p>
                        {% else %}
                        <p class="setting-value text-muted size-12">{{ _(self_setting_data.setting) }}</p>
                        {% endif %}
                    </div>
                    <div class="col-auto">
                        <a id="action" href="#" class="button button-fill button-44 color-theme button-raised">
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Delay / Last for";
    setting_label_template[setting_label] = `
        <div 
            class="auto-init card margin-bottom-half mx-0 my-3"
            ref="{{ device }}"
            setting-type="{{ self_setting_data.setting_type }}"
            setting-name="{{ self_setting_data.name }}"
            setting-value="{{ self_setting_data.setting }}"
            button-group="{{device_button_group }}"
            dependencies="{{self_setting_data.dependencies}}"
            slot-index="{{slot_index}}"
        >
            
            <div class="card-content card-content-padding">
                <div class="row align-items-center">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">hourglass_empty</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">${_(setting_label)}</h5>
                        <p class="setting-value text-muted size-12">{{self_setting_data.setting}}</p>
                    </div>
                    <div class="col-auto">
                        <a href="/frappe/form/{{ _(self_setting_data.setting_type)|replace('/', '%2F') }}/APP_HA_Device_Delay_Lastfor_Form_V5/Profile Subdevice/{{ profile_subdevice_name }}/" class="button button-fill button-44 color-theme button-raised">
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Device Pairing";
    setting_label_template[setting_label] = `
        <div 
            class="auto-init card margin-bottom-half mx-0 my-3" 
            ref="{{ device }}"
            init-func="iot_mode_setup_pairing_mode_auto_init"
            setting-type="{{ pair_data.setting_type }}"
            setting-name="{{ pair_data.name }}"
            setting-value="{{ pair_data.setting }}"
            button-group="{{device_button_group}}"
            model="{{device_model}}"
            firmware="{{firmware}}"
            device-name="{{device_name}}"
            subdevice-name="{{profile_subdevice_name}}"
            dependencies="{{self_setting_data.dependencies}}"
        >
            <input name="pairing_name" type="hidden" value="" />
            <div class="pairing-device" style="display: none;">
            {%for pro_sb in  subdevice_list %}
                {%if pro_sb.device_mode == "Multiway Switch" and network_id == pro_sb.network_id and pro_sb.network_id!=0 %}
                <li name="{{pro_sb.device_model}}-{{pro_sb.device_name}}-{{pro_sb.device_button_group}}" guid="{{pro_sb.device}}" button-group="{{pro_sb.device_button_group}}" display-name="{{pro_sb.title}}" subdevice-name="{{pro_sb.profile_subdevice_name}}"></li>
                {%endif%}
            {%endfor%}
            </div>
            <div class="card-content card-content-padding">
                <div class="row align-items-center">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">wb_iridescent</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">{{ _("Device Pairing") }}</h5>
                        {% if pair_data.setting_type!= ""%}
                        <p class="setting-value text-muted size-12">{{pair_data.setting}}</p>
                        {% else %}
                        <p class="setting-value text-muted size-12">{{ _("No Pairing") }}</p>
                        {% endif %}
                    </div>
                    <div class="col-auto">
                        <a id="action" href="#" class="button button-fill button-44 color-theme button-raised">
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Virtual Device Pairing";
    setting_label_template[setting_label] = `
        <div 
            class="auto-init card margin-bottom-half mx-0 my-3"
            init-func="iot_mode_setup_virtual_device_pairing_auto_init"
            ref="{{ device }}"
            setting-type="{{ self_setting_data.setting_type }}"
            setting-name="{{ self_setting_data.name }}"
            setting-value="{{ self_setting_data.setting }}"
            button-group="{{ device_button_group }}"
            subdevice-name="{{profile_subdevice_name}}"
            device-model="{{device_model}}"
            dependencies="{{self_setting_data.dependencies}}"
        >   
            <div id="network-group-device" style="display: none;">
                {% for row in subdevice_list %}
                    {% if network_id == row.network_id and row.network_id != "0"   %}
                    <div class="device" guid="{{ row.device }}" button-group="{{ row.device_button_group }}" mac-address="{{ row.device_name }}" name="{{ _(row.title) }}" subdevice-name="{{row.profile_subdevice_name}}"></div>
                    {% endif %}
                {% endfor %}
            </div>
            <input type="hidden" name="virtual_device_pairing" />
            <div class="card-content card-content-padding">
                <div class="row">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">precision_manufacturing</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">{{ _(self_setting_data.setting_type) }}</h5>
                        {% if self_setting_data.setting != ""  %}
                        <p class="setting-value text-muted size-12">{{_(self_setting_data.setting)}}</p>
                        {% else %}
                        <p class="setting-value text-muted size-12">{{_("No Pairing")}}</p>
                        {% endif %}
                    </div>
                    <div class="col-auto">
                        <a id="action" class="button button-fill button-44 color-theme button-raised">
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Device Infomation";
    setting_label_template[setting_label] = `
        <div class="card margin-bottom-half mx-0 my-3" dependencies="{{self_setting_data.dependencies}}">
            <div class="card-content card-content-padding">
                <div class="row">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">info</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">{{ _(self_setting_data.setting_type) }}</h5>
                    </div>
                    <div class="col-auto"></div>
                </div>
                <div style="margin-top: 10px;">
                    <div class="list">
                        <ul>
                            <li>
                                <a href="#" class="item-content" style="padding-left: 0px;">
                                    <div class="item-inner" style="padding-right: 0px;">
                                        <div class="item-title">{{ _('Brand') }}</div>
                                        <div class="item-after">
                                            {% if brand != None and brand_image != None and brand_image != '' %}
                                                <img style="height: 44px; background-contain: cover; background-repeat: no-repeat; background-position: center center;" src="{{ frappe.get_url(brand_image)  }}" />
                                            {% endif %}
                                        </div>
                                    </div>
                                </a>
                            </li>
                            <li>
                                <a href="#" class="item-content" style="padding-left: 0px;">
                                    <div class="item-inner" style="padding-right: 0px;">
                                        <div class="item-title">{{ _('Model') }}</div>
                                        <div class="item-after">{{device_model }}</div>
                                    </div>
                                </a>
                            </li>
                            <li>
                                <a href="#" class="item-content" style="padding-left: 0px;">
                                    <div class="item-inner" style="padding-right: 0px;">
                                        <div class="item-title">{{ _('Batch No') }}</div>
                                        <div class="item-after">{{ batch }}</div>
                                    </div>
                                </a>
                            </li>
                            <li>
                                <a href="#" class="item-content" style="padding-left: 0px;">
                                    <div class="item-inner" style="padding-right: 0px;">
                                        <div class="item-title">{{ _('MAC Address') }}</div>
                                        <div class="item-after">{{ mac_address }}</div>
                                    </div>
                                </a>
                            </li>
                            <li>
                                <a href="#" class="item-content" style="padding-left: 0px;">
                                    <div class="item-inner" style="padding-right: 0px;">
                                        <div class="item-title">{{ _('Firmware') }}</div>
                                        <div class="item-after">{{ firmware if firmware != 'undefined' else '----' }}</div>
                                    </div>
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Restart";
    setting_label_template[setting_label] = `
        <div class="card margin-bottom-half mx-0 my-3" dependencies="{{self_setting_data.dependencies}}">
            <div class="card-content card-content-padding">
                <div class="row">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">play_arrow</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">{{ _(self_setting_data.setting_type) }}</h5>
                    </div>
                    <div class="col-auto">
                        <a 
                            func="iot_device_restart"
                            ref="{{device }}" 
                            href="#"
                            class="button button-fill button-44 color-theme button-raised"
                        >
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Reset";
    setting_label_template[setting_label] = `
        <div class="card margin-bottom-half mx-0 my-3" dependencies="{{self_setting_data.dependencies}}">
            <div class="card-content card-content-padding">
                <div class="row">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">restart_alt</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">{{ _(self_setting_data.setting_type) }}</h5>
                    </div>
                    <div class="col-auto">
                        <a 
                        func="iot_device_reset"
                        profile-device-name="{{ profile_device_name }}"
                        profile-subdevice-name="{{ profile_subdevice_name }}"
                        ref="{{ device }}" 
                        href="#"
                        class="button button-fill button-44 color-red button-raised"
                    >
                        <i class="material-icons">navigate_next</i>
                    </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Wifi";
    setting_label_template[setting_label] = `
        <div class="card margin-bottom-half mx-0 my-3" dependencies="{{self_setting_data.dependencies}}">
            <div class="card-content card-content-padding">
                <div class="row">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">wifi</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">{{ _(self_setting_data.setting_type) }}</h5>
                    </div>
                    <div class="col-auto">
                        <a href="/mobile-app/gateway-wifi-setting?profile_subdevice_name={{ profile_subdevice_name }}&guid={{guid}}&device_name={{profile_device_name}}" class="button button-fill button-44 color-theme button-raised">
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Set Slot";
    setting_label_template[setting_label] = `
        <div class="card margin-bottom-half mx-0 my-3" dependencies="{{self_setting_data.dependencies}}">
            <div class="card-content card-content-padding">
                <div class="row">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">attractions</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">{{ _(self_setting_data.setting_type) }}</h5>
                    </div>
                    <div class="col-auto">
                        <a href="/mobile-app/app-setting-rcu-slot?profile_subdevice_name={{ profile_subdevice_name }}&guid={{guid}}&device_name={{profile_device_name}}" class="button button-fill button-44 color-theme button-raised">
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Create Output";
    setting_label_template[setting_label] = `
        <div class="card margin-bottom-half mx-0 my-3" dependencies="{{self_setting_data.dependencies}}">
            <div class="card-content card-content-padding">
                <div class="row">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">attractions</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">{{ _(self_setting_data.setting_type) }}</h5>
                    </div>
                    <div class="col-auto">
                        <a func="iot_create_rcu_output" guid="{{guid}}"  class="button button-fill button-44 color-theme button-raised">
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Active Output";
    setting_label_template[setting_label] = `
        <div class="card margin-bottom-half mx-0 my-3" dependencies="{{self_setting_data.dependencies}}">
            <div class="card-content card-content-padding">
                <div class="row">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">attractions</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">{{ _(self_setting_data.setting_type) }}</h5>
                    </div>
                    <div class="col-auto">
                        <a func="iot_active_rcu_output" subdevice-name="{{profile_subdevice_name}}" guid="{{guid}}" button-group="{{ profile_subdevice.device_button_group }}"  class="button button-fill button-44 color-theme button-raised">
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Active Input";
    setting_label_template[setting_label] = `
        <div class="card margin-bottom-half mx-0 my-3" dependencies="{{self_setting_data.dependencies}}">
            <div class="card-content card-content-padding">
                <div class="row">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">attractions</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">{{ _(self_setting_data.setting_type) }}</h5>
                    </div>
                    <div class="col-auto">
                        <a func="iot_active_rcu_intput" subdevice-name="{{profile_subdevice_name}}" guid="{{guid}}" button-group="{{ profile_subdevice.device_button_group }}"  class="button button-fill button-44 color-theme button-raised">
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Audio Source Switch";
    setting_label_template[setting_label] = `
        <div class="card margin-bottom-half mx-0 my-3" dependencies="{{self_setting_data.dependencies}}">
            <div class="card-content card-content-padding">
                <div class="row">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">attractions</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">{{ _(self_setting_data.setting_type) }}</h5>
                    </div>
                    <div class="col-auto">
                        <a func="iot_source_switching" subdevice-name="{{profile_subdevice_name}}" guid="{{guid}}" button-group="{{ profile_subdevice.device_button_group }}"  class="button button-fill button-44 color-theme button-raised">
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Reset Mesh";
    setting_label_template[setting_label] = `
        <div class="card margin-bottom-half mx-0 my-3" dependencies="{{self_setting_data.dependencies}}">
            <div class="card-content card-content-padding">
                <div class="row">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">attractions</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">{{ _(self_setting_data.setting_type) }}</h5>
                    </div>
                    <div class="col-auto">
                        <a func="iot_reset_mesh" subdevice-name="{{profile_subdevice_name}}" guid="{{guid}}" button-group="{{ profile_subdevice.device_button_group }}"  class="button button-fill button-44 color-theme button-raised">
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Email Address";
    setting_label_template[setting_label] = `
        <div class="card margin-bottom-half mx-0 my-3" dependencies="{{self_setting_data.dependencies}}">
            <div class="card-content card-content-padding">
                <div class="row">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">mail</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">{{ _(self_setting_data.setting_type) }}</h5>
                        {% if self_setting_data.setting == '' %}
                        <p class="setting-value text-muted size-12">{{ _('No Set') }}</p>
                        {% else %}
                        <p class="setting-value text-muted size-12">{{ _(self_setting_data.setting) }}</p>
                        {% endif %}
                    </div>
                    <div class="col-auto">
                        <a 
                            func="iot_mode_setup_email_address" 
                            ref="{{ device }}" 
                            device-name="{{profile_device_name}}"
                            mac="{{mac_address}}"
                            setting-type="{{ self_setting_data.setting_type }}" 
                            href="#"
                            class="button button-fill button-44 color-theme button-raised "
                        >
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Server URI";
    setting_label_template[setting_label] = `
        <div class="card margin-bottom-half mx-0 my-3" dependencies="{{self_setting_data.dependencies}}">
            <div class="card-content card-content-padding">
                <div class="row">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">link</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">{{ _(self_setting_data.setting_type) }}</h5>
                        {% if self_setting_data.setting == '' %}
                        <p class="setting-value text-muted size-12">{{ _('No Set') }}</p>
                        {% else %}
                        <p class="setting-value text-muted size-12">{{ _(self_setting_data.setting) }}</p>
                        {% endif %}
                    </div>
                    <div class="col-auto">
                        <a 
                            func="iot_mode_setup_server_uri" 
                            ref="{{ device }}" 
                            setting-type="{{ self_setting_data.setting_type }}" 
                            href="#"
                            class="button button-fill button-44 color-theme button-raised "
                        >
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Server Port";
    setting_label_template[setting_label] = `
        <div class="card margin-bottom-half mx-0 my-3" dependencies="{{self_setting_data.dependencies}}">
            <div class="card-content card-content-padding">
                <div class="row">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">dns</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">{{ _(self_setting_data.setting_type) }}</h5>
                        {% if self_setting_data.setting == '' %}
                        <p class="setting-value text-muted size-12">{{ _('No Set') }}</p>
                        {% else %}
                        <p class="setting-value text-muted size-12">{{ _(self_setting_data.setting) }}</p>
                        {% endif %}
                    </div>
                    <div class="col-auto">
                        <a 
                            func="iot_mode_setup_server_port" 
                            ref="{{ device }}" 
                            setting-type="{{ self_setting_data.setting_type }}" 
                            href="#"
                            class="button button-fill button-44 color-theme button-raised "
                        >
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Server Username";
    setting_label_template[setting_label] = `
        <div class="card margin-bottom-half mx-0 my-3" dependencies="{{self_setting_data.dependencies}}">
            <div class="card-content card-content-padding">
                <div class="row">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">badge</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">{{ _(self_setting_data.setting_type) }}</h5>
                        {% if self_setting_data.setting == '' or self_setting_data.setting == 'null'  %}
                        <p class="setting-value text-muted size-12">{{ _('No Set') }}</p>
                        {% else %}
                        <p class="setting-value text-muted size-12">{{ _(self_setting_data.setting) }}</p>
                        {% endif %}
                    </div>
                    <div class="col-auto">
                        <a 
                            func="iot_mode_setup_server_username" 
                            ref="{{ device }}" 
                            setting-type="{{ self_setting_data.setting_type }}" 
                            href="#"
                            class="button button-fill button-44 color-theme button-raised "
                        >
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Server Password";
    setting_label_template[setting_label] = `
        <div class="card margin-bottom-half mx-0 my-3" dependencies="{{self_setting_data.dependencies}}">
            <div class="card-content card-content-padding">
                <div class="row">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">password</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">{{ _(self_setting_data.setting_type) }}</h5>
                        {% if self_setting_data.setting == '' or self_setting_data.setting == 'null' %}
                        <p class="setting-value text-muted size-12">{{ _('No Set') }}</p>
                        {% else %}
                        <p class="setting-value text-muted size-12">{{ _(self_setting_data.setting) }}</p>
                        {% endif %}
                    </div>
                    <div class="col-auto">
                        <a 
                            func="iot_mode_setup_server_password" 
                            ref="{{ device }}" 
                            setting-type="{{ self_setting_data.setting_type }}" 
                            href="#"
                            class="button button-fill button-44 color-theme button-raised "
                        >
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Firmware Upgrade";
    setting_label_template[setting_label] = `
        <div class="card margin-bottom-half mx-0 my-3" ref="{{ device }}" init-func="iot_mode_setup_firmware_upgrade_auto_init" dependencies="{{self_setting_data.dependencies}}">
            <div class="card-content card-content-padding">
                <div class="row">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">browser_updated</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">{{ _(self_setting_data.setting_type) }}</h5>
                    </div>
                    <div class="col-auto">
                        <!-- href="/frappe/form/{{ _(self_setting_data.setting_type)|replace('/', '%2F') }}/APP_HA_Device_Firmware_Upgrade_Form_V5/Profile Subdevice/{{ profile_subdevice_name }}/" -->
                        <a href="/mobile-app/ha-device-setting-firmware-upgrade?guid={{guid}}&subdevice={{ profile_subdevice_name }}" class="button button-fill button-44 color-theme button-raised">
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Device Log";
    setting_label_template[setting_label] = `
        <div class="card margin-bottom-half mx-0 my-3" ref="{{ device }}" init-func="iot_mode_setup_firmware_upgrade_auto_init" dependencies="{{self_setting_data.dependencies}}">
            <div class="card-content card-content-padding">
                <div class="row">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">content_paste_go</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">{{ _(self_setting_data.setting_type) }}</h5>
                    </div>
                    <div class="col-auto">
                        <!-- href="/frappe/form/{{ _(self_setting_data.setting_type)|replace('/', '%2F') }}/APP_HA_Device_Firmware_Upgrade_Form_V5/Profile Subdevice/{{ profile_subdevice_name }}/" -->
                        <a href="/mobile-app/device-log?subdevice={{ profile_subdevice_name }}&guid={{guid}}" class="button button-fill button-44 color-theme button-raised">
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Command Debug";
    setting_label_template[setting_label] = `
        <div class="card margin-bottom-half mx-0 my-3" ref="{{ device }}" init-func="iot_mode_setup_firmware_upgrade_auto_init" dependencies="{{self_setting_data.dependencies}}">
            <div class="card-content card-content-padding">
                <div class="row">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">keyboard_command_key</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">{{ _(self_setting_data.setting_type) }}</h5>
                    </div>
                    <div class="col-auto">
                        <!-- href="/frappe/form/{{ _(self_setting_data.setting_type)|replace('/', '%2F') }}/APP_HA_Device_Firmware_Upgrade_Form_V5/Profile Subdevice/{{ profile_subdevice_name }}/" -->
                        <a href="/mobile-app/command-debug?subdevice={{ profile_subdevice_name }}&guid={{guid}}" class="button button-fill button-44 color-theme button-raised">
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "IR Debug";
    setting_label_template[setting_label] = `
        <div class="card margin-bottom-half mx-0 my-3" ref="{{ device }}" init-func="iot_mode_setup_firmware_upgrade_auto_init" dependencies="{{self_setting_data.dependencies}}">
            <div class="card-content card-content-padding">
                <div class="row">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">keyboard_command_key</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">{{ _(self_setting_data.setting_type) }}</h5>
                    </div>
                    <div class="col-auto">
                        <!-- href="/frappe/form/{{ _(self_setting_data.setting_type)|replace('/', '%2F') }}/APP_HA_Device_Firmware_Upgrade_Form_V5/Profile Subdevice/{{ profile_subdevice_name }}/" -->
                        <a href="/mobile-app/ir-test-page?subdevice={{ profile_subdevice_name }}&guid={{guid}}" class="button button-fill button-44 color-theme button-raised">
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Catch Log";
    setting_label_template[setting_label] = `
        <div class="card margin-bottom-half mx-0 my-3" ref="{{ device }}" init-func="iot_mode_setup_firmware_upgrade_auto_init" dependencies="{{self_setting_data.dependencies}}">
            <div class="card-content card-content-padding">
                <div class="row">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">content_paste_go</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">{{ _(self_setting_data.setting_type) }}</h5>
                    </div>
                    <div class="col-auto">
                        <!-- href="/frappe/form/{{ _(self_setting_data.setting_type)|replace('/', '%2F') }}/APP_HA_Device_Firmware_Upgrade_Form_V5/Profile Subdevice/{{ profile_subdevice_name }}/" -->
                        <a href="/mobile-app/device-catch-log?subdevice={{ profile_subdevice_name }}&guid={{guid}}" class="button button-fill button-44 color-theme button-raised">
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Timezone";
    setting_label_template[setting_label] = `
        <div class="auto-init card margin-bottom-half mx-0 my-3" 
        ref="{{ device }}" 
        init-func="iot_mode_setup_timezone_auto_init" 
        dependencies="{{self_setting_data.dependencies}}"
        setting-type="{{ self_setting_data.setting_type }}"
        setting-name="{{ self_setting_data.name }}"
        setting-value="{{ self_setting_data.setting }}"
        >
            <input name="timezone" type="hidden" value="" />
            <div class="card-content card-content-padding">
                <div class="row">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">near_me</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">{{ _(self_setting_data.setting_type) }}</h5>
                        {% if self_setting_data.setting == "" %}
                        <p class="setting-value text-muted size-12">{{ _("China") }}</p>
                        {% else %}
                        <p class="setting-value text-muted size-12">{{ _(self_setting_data.setting) }}</p>
                        {% endif %}
                    </div>
                    <div class="col-auto">
                        <a id="action" href="#" class="button button-fill button-44 color-theme button-raised">
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Thermostat";
    setting_label_template[setting_label] = `
        <div class="card margin-bottom-half mx-0 my-3" 
        ref="{{ device }}" 
        dependencies="{{self_setting_data.dependencies}}"
        setting-type="{{ self_setting_data.setting_type }}"
        setting-name="{{ self_setting_data.name }}"
        setting-value="{{ self_setting_data.setting }}"
        >
            <div class="card-content card-content-padding">
                <div class="row">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">device_thermostat</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">{{ _(self_setting_data.setting_type) }}</h5>
                    </div>
                    <div class="col-auto">
                        <a href="/frappe/form/{{ _(self_setting_data.setting_type)|replace('/', '%2F') }}/APP_HA_Device_Thermostat_Form_V5/Profile Subdevice/{{ profile_subdevice_name }}/" class="button button-fill button-44 color-theme button-raised">
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Setpoint Limit";
    setting_label_template[setting_label] = `
        <div class="card margin-bottom-half mx-0 my-3" 
        ref="{{ device }}" 
        dependencies="{{self_setting_data.dependencies}}"
        setting-type="{{ self_setting_data.setting_type }}"
        setting-name="{{ self_setting_data.name }}"
        setting-value="{{ self_setting_data.setting }}"
        >
            <div class="card-content card-content-padding">
                <div class="row">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">device_thermostat</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">{{ _(self_setting_data.setting_type) }}</h5>
                    </div>
                    <div class="col-auto">
                        <a href="/mobile-app/ir-setpoint-limit?guid={{device}}" class="button button-fill button-44 color-theme button-raised">
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Volume Limit";
    setting_label_template[setting_label] = `
        <div class="card margin-bottom-half mx-0 my-3" 
        ref="{{ device }}" 
        dependencies="{{self_setting_data.dependencies}}"
        setting-type="{{ self_setting_data.setting_type }}"
        setting-name="{{ self_setting_data.name }}"
        setting-value="{{ self_setting_data.setting }}"
        >
            <div class="card-content card-content-padding">
                <div class="row">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">device_thermostat</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">{{ _(self_setting_data.setting_type) }}</h5>
                    </div>
                    <div class="col-auto">
                        <a href="/mobile-app/music-volume-limit?guid={{device}}" class="button button-fill button-44 color-theme button-raised">
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Local IP";
    setting_label_template[setting_label] = `
        <div class="card margin-bottom-half mx-0 my-3" 
        ref="{{ device }}" 
        dependencies="{{self_setting_data.dependencies}}"
        setting-type="{{ self_setting_data.setting_type }}"
        setting-name="{{ self_setting_data.name }}"
        setting-value="{{ self_setting_data.setting }}"
        >
            <div class="card-content card-content-padding">
                <div class="row">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">memory</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">{{ _(self_setting_data.setting_type) }}</h5>
                        {% if self_setting_data.setting == '' %}
                        <p class="setting-value text-muted size-12">{{ _('No Set') }}</p>
                        {% else %}
                        <p class="setting-value text-muted size-12">{{ _(self_setting_data.setting) }}</p>
                        {% endif %}
                    </div>
                    <div class="col-auto">
                        <a 
                            func="iot_mode_setup_iaq_ip" 
                            ref="{{ device }}" 
                            setting-type="{{ self_setting_data.setting_type }}" 
                            href="#"
                            class="button button-fill button-44 color-theme button-raised "
                        >
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Reverse";
    setting_label_template[setting_label] = `
        <div class="auto-init card margin-bottom-half mx-0 my-3" 
        ref="{{ device }}" 
        subdevice-name="{{profile_subdevice_name}}"
        init-func="iot_mode_setup_physical_switch_reverse_init" 
        dependencies="{{self_setting_data.dependencies}}"
        setting-type="{{ self_setting_data.setting_type }}"
        setting-name="{{ self_setting_data.name }}"
        setting-value="{{ self_setting_data.setting }}"
        >
            <input name="reverse" type="hidden" value="" />
            <div class="card-content card-content-padding">
                <div class="row">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">screen_lock_landscape</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">{{ _(self_setting_data.setting_type) }}</h5>
                        {% if self_setting_data.setting == "" %}
                        <p class="setting-value text-muted size-12">{{ _("Standard") }}</p>
                        {% else %}
                        <p class="setting-value text-muted size-12">{{ _(self_setting_data.setting) }}</p>
                        {% endif %}
                    </div>
                    <div class="col-auto">
                        <a id="action-reverse" href="#" class="button button-fill button-44 color-theme button-raised">
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Radar Detection";
    setting_label_template[setting_label] = `
        <div class="card margin-bottom-half mx-0 my-3" 
        ref="{{ device }}" 
        dependencies="{{self_setting_data.dependencies}}"
        setting-type="{{ self_setting_data.setting_type }}"
        setting-name="{{ self_setting_data.name }}"
        setting-value="{{ self_setting_data.setting }}"
        >
            <input name="radar_detection" type="hidden" value="" />
            <div class="card-content card-content-padding">
                <div class="row">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">radar</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">{{ _(self_setting_data.setting_type) }}</h5>
                    </div>
                    <div class="col-auto">
                        <a href="/frappe/form/{{ _(self_setting_data.setting_type)|replace('/', '%2F') }}/APP_CORE_Mode_Setup_Radar_Detection_Detail_V5/Profile Subdevice/{{ profile_subdevice_name }}/" class="button button-fill button-44 color-theme button-raised">
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Target Position";
    setting_label_template[setting_label] = `
        <div class="card margin-bottom-half mx-0 my-3" 
        ref="{{ device }}" 
        dependencies="{{self_setting_data.dependencies}}"
        setting-type="{{ self_setting_data.setting_type }}"
        setting-name="{{ self_setting_data.name }}"
        setting-value="{{ self_setting_data.setting }}"
        >
            <input name="target_position" type="hidden" value="" />
            <div class="card-content card-content-padding">
                <div class="row">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">radar</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">{{ _(self_setting_data.setting_type) }}</h5>
                    </div>
                    <div class="col-auto">
                        <a href="/mobile-app/ha-device-setting-randar-target-position?guid={{ device }}" class="button button-fill button-44 color-theme button-raised">
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Sleep Mode Status";
    setting_label_template[setting_label] = `
        <div class="card margin-bottom-half mx-0 my-3" 
        ref="{{ device }}" 
        dependencies="{{self_setting_data.dependencies}}"
        setting-type="{{ self_setting_data.setting_type }}"
        setting-name="{{ self_setting_data.name }}"
        setting-value="{{ self_setting_data.setting }}"
        >
            <input name="sleep" type="hidden" value="" />
            <div class="card-content card-content-padding">
                <div class="row">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">screen_lock_landscape</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">{{ _(self_setting_data.setting_type) }}</h5>
                    </div>
                    <div class="col-auto">
                        <label class="toggle toggle-init">
                            <input 
                                type="checkbox"
                                button-group="{{ profile_subdevice.device_button_group }}"
                                setting-type="{{ setting_type }}"
                                setting-name="{{ vars.name }}"
                                ref="{{ profile_subdevice.device }}"
                                changefunc="iot_mode_setup_radar_sleep_mode_status_change"
                                {% if vars.setting != 'Off' %}checked{% endif %}
                            />
                            <span class="toggle-icon"></span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Normal Mode Config";
    setting_label_template[setting_label] = `
        <div class="card margin-bottom-half mx-0 my-3" 
        ref="{{ device }}" 
        dependencies="{{self_setting_data.dependencies}}"
        setting-type="{{ self_setting_data.setting_type }}"
        setting-name="{{ self_setting_data.name }}"
        setting-value="{{ self_setting_data.setting }}"
        >
            <input name="normal_mode_config" type="hidden" value="" />
            <div class="card-content card-content-padding">
                <div class="row">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">radar</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">{{ _(self_setting_data.setting_type) }}</h5>
                    </div>
                    <div class="col-auto">
                        <a href="/frappe/form/{{ _(self_setting_data.setting_type)|replace('/', '%2F') }}/APP_CORE_Mode_Setup_Radar_Mode_Detail_V5/Profile Subdevice/{{ profile_subdevice_name }}/mode=normal/" class="button button-fill button-44 color-theme button-raised">
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Sleep Mode Config";
    setting_label_template[setting_label] = `
        <div class="card margin-bottom-half mx-0 my-3" 
        ref="{{ device }}" 
        dependencies="{{self_setting_data.dependencies}}"
        setting-type="{{ self_setting_data.setting_type }}"
        setting-name="{{ self_setting_data.name }}"
        setting-value="{{ self_setting_data.setting }}"
        >
            <input name="sleep_mode_config" type="hidden" value="" />
            <div class="card-content card-content-padding">
                <div class="row">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">radar</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">{{ _(self_setting_data.setting_type) }}</h5>
                    </div>
                    <div class="col-auto">
                        <a href="/frappe/form/{{ _(self_setting_data.setting_type)|replace('/', '%2F') }}/APP_CORE_Mode_Setup_Radar_Mode_Detail_V5/Profile Subdevice/{{ profile_subdevice_name }}/mode=sleep/" class="button button-fill button-44 color-theme button-raised">
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Sensitivity";
    setting_label_template[setting_label] = `
        <div class="auto-init card margin-bottom-half mx-0 my-3" 
        ref="{{ device }}" 
        init-func="iot_mode_setup_sensitivity_mode_init" 
        dependencies="{{self_setting_data.dependencies}}"
        setting-type="{{ self_setting_data.setting_type }}"
        setting-name="{{ self_setting_data.name }}"
        setting-value="{{ self_setting_data.setting }}"
        button-group="{{ device_button_group }}"
        slot-index="{{slot_index}}"
        >
            <input name="sensitivity" type="hidden" value="" />
            <div class="card-content card-content-padding">
                <div class="row">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">lightbulb_circle</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">{{ _(self_setting_data.setting_type) }}</h5>
                        {% if self_setting_data.setting == "" %}
                        <p class="setting-value text-muted size-12">{{ _("High") }}</p>
                        {% else %}
                        <p class="setting-value text-muted size-12">{{ _(self_setting_data.setting) }}</p>
                        {% endif %}
                    </div>
                    <div class="col-auto">
                        <a id="action" href="#" class="button button-fill button-44 color-theme button-raised">
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Trigger Speed";
    setting_label_template[setting_label] = `
        <div class="auto-init card margin-bottom-half mx-0 my-3" 
        ref="{{ device }}" 
        init-func="iot_mode_setup_trigger_speed_mode_init" 
        dependencies="{{self_setting_data.dependencies}}"
        setting-type="{{ self_setting_data.setting_type }}"
        setting-name="{{ self_setting_data.name }}"
        setting-value="{{ self_setting_data.setting }}"
        button-group="{{ device_button_group }}"
        slot-index="{{slot_index}}"
        >
            <input name="trigger_speed" type="hidden" value="" />
            <div class="card-content card-content-padding">
                <div class="row">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">lightbulb_circle</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">{{ _(self_setting_data.setting_type) }}</h5>
                        {% if self_setting_data.setting == "" %}
                        <p class="setting-value text-muted size-12">{{ _("Fast") }}</p>
                        {% else %}
                        <p class="setting-value text-muted size-12">{{ _(self_setting_data.setting) }}</p>
                        {% endif %}
                    </div>
                    <div class="col-auto">
                        <a id="action" href="#" class="button button-fill button-44 color-theme button-raised">
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Unmanned Duration";
    setting_label_template[setting_label] = `
        <div class="auto-init card margin-bottom-half mx-0 my-3" 
        ref="{{ device }}" 
        init-func="iot_mode_setup_unmanned_duration_init" 
        dependencies="{{self_setting_data.dependencies}}"
        setting-type="{{ self_setting_data.setting_type }}"
        setting-name="{{ self_setting_data.name }}"
        setting-value="{{ self_setting_data.setting }}"
        button-group="{{ device_button_group }}"
        slot-index="{{slot_index}}"
        >
            <div class="card-content card-content-padding">
                <div class="row">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">light</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">{{ _(self_setting_data.setting_type) }}</h5>
                        {% if self_setting_data.setting == "" %}
                        <p class="setting-value text-muted size-12">30</p>
                        {% else %}
                        <p class="setting-value text-muted size-12">{{ _(self_setting_data.setting) }}</p>
                        {% endif %}
                    </div>
                    <div class="col-auto">
                        <a id="action" href="#" class="button button-fill button-44 color-theme button-raised">
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Coordinate(X-Y-Z)";
    setting_label_template[setting_label] = `
        <div class="auto-init card margin-bottom-half mx-0 my-3" 
        ref="{{ device }}" 
        dependencies="{{self_setting_data.dependencies}}"
        setting-type="{{ self_setting_data.setting_type }}"
        setting-name="{{ self_setting_data.name }}"
        setting-value="{{ self_setting_data.setting }}"
        button-group="{{ device_button_group }}"
        slot-index="{{slot_index}}"
        >
            <div class="card-content card-content-padding">
                <div class="row">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">light</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">{{ _(self_setting_data.setting_type) }}</h5>
                    </div>
                    <div class="col-auto">
                        <a id="action" href="/mobile-app/app-setting-coordinate?guid={{guid}}" class="button button-fill button-44 color-theme button-raised">
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Set X-Y-Z";
    setting_label_template[setting_label] = `
        <div class="auto-init card margin-bottom-half mx-0 my-3" 
        ref="{{ device }}" 
        dependencies="{{self_setting_data.dependencies}}"
        setting-type="{{ self_setting_data.setting_type }}"
        setting-name="{{ self_setting_data.name }}"
        setting-value="{{ self_setting_data.setting }}"
        button-group="{{ device_button_group }}"
        slot-index="{{slot_index}}"
        >
            <div class="card-content card-content-padding">
                <div class="row">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">settings</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">{{ _(self_setting_data.setting_type) }}</h5>
                    </div>
                    <div class="col-auto">
                        <a id="action" func="iot_mode_setup_set_xyz_init" ref="{{ device }}"  class="button button-fill button-44 color-theme button-raised">
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "X-Y-Z";
    setting_label_template[setting_label] = `
        <div class="auto-init card margin-bottom-half mx-0 my-3" 
        ref="{{ device }}" 
        dependencies="{{self_setting_data.dependencies}}"
        setting-type="{{ self_setting_data.setting_type }}"
        setting-name="{{ self_setting_data.name }}"
        setting-value="{{ self_setting_data.setting }}"
        button-group="{{ device_button_group }}"
        slot-index="{{slot_index}}"
        >
            <div class="card-content card-content-padding">
                <div class="row">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">settings</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">{{ _(self_setting_data.setting_type) }}</h5>
                        {% if self_setting_data.setting == "" %}
                        
                        {% else %}
                        <p class="setting-value text-muted size-12">{{ _(self_setting_data.setting) }}</p>
                        {% endif %}
                    </div>
                    <div class="col-auto">
                        <a id="action" func="iot_mode_setup_xyz_init" ref="{{ device }}"  class="button button-fill button-44 color-theme button-raised">
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Read Rate of Change";
    setting_label_template[setting_label] = `
        <div class="auto-init card margin-bottom-half mx-0 my-3" 
        ref="{{ device }}" 
        dependencies="{{self_setting_data.dependencies}}"
        setting-type="{{ self_setting_data.setting_type }}"
        setting-name="{{ self_setting_data.name }}"
        setting-value="{{ self_setting_data.setting }}"
        button-group="{{ device_button_group }}"
        slot-index="{{slot_index}}"
        >
            <div class="card-content card-content-padding">
                <div class="row">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">visibility</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">{{ _(self_setting_data.setting_type) }}</h5>
                        {% if self_setting_data.setting == "" %}
                        
                        {% else %}
                        <p class="setting-value text-muted size-12">{{ _(self_setting_data.setting) }}</p>
                        {% endif %}
                    </div>
                    <div class="col-auto">
                        <a id="action" func="iot_mode_setup_read_rate_init" ref="{{ device }}"  class="button button-fill button-44 color-theme button-raised">
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Rate of Change";
    setting_label_template[setting_label] = `
        <div class="auto-init card margin-bottom-half mx-0 my-3" 
        ref="{{ device }}" 
        dependencies="{{self_setting_data.dependencies}}"
        setting-type="{{ self_setting_data.setting_type }}"
        setting-name="{{ self_setting_data.name }}"
        setting-value="{{ self_setting_data.setting }}"
        button-group="{{ device_button_group }}"
        slot-index="{{slot_index}}"
        >
            <div class="card-content card-content-padding">
                <div class="row">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">settings</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">{{ _(self_setting_data.setting_type) }}</h5>
                        {% if self_setting_data.setting == "" %}
                        
                        {% else %}
                        <p class="setting-value text-muted size-12">{{ _(self_setting_data.setting) }}</p>
                        {% endif %}
                    </div>
                    <div class="col-auto">
                        <a id="action" func="iot_mode_setup_rate_init" ref="{{ device }}"  class="button button-fill button-44 color-theme button-raised">
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Change Value";
    setting_label_template[setting_label] = `
        <div class="auto-init card margin-bottom-half mx-0 my-3" 
        ref="{{ device }}" 
        dependencies="{{self_setting_data.dependencies}}"
        setting-type="{{ self_setting_data.setting_type }}"
        setting-name="{{ self_setting_data.name }}"
        setting-value="{{ self_setting_data.setting }}"
        button-group="{{ device_button_group }}"
        slot-index="{{slot_index}}"
        >
            <div class="card-content card-content-padding">
                <div class="row">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">settings</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">{{ _(self_setting_data.setting_type) }}</h5>
                    </div>
                    <div class="col-auto">
                        <a id="action" func="iot_mode_setup_change_init" ref="{{ device }}"  class="button button-fill button-44 color-theme button-raised">
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Read Change Value";
    setting_label_template[setting_label] = `
        <div class="auto-init card margin-bottom-half mx-0 my-3" 
        ref="{{ device }}" 
        dependencies="{{self_setting_data.dependencies}}"
        setting-type="{{ self_setting_data.setting_type }}"
        setting-name="{{ self_setting_data.name }}"
        setting-value="{{ self_setting_data.setting }}"
        button-group="{{ device_button_group }}"
        slot-index="{{slot_index}}"
        >
            <div class="card-content card-content-padding">
                <div class="row">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">visibility</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">{{ _(self_setting_data.setting_type) }}</h5>
                        {% if self_setting_data.setting == "" %}
                        
                        {% else %}
                        <p class="setting-value text-muted size-12">{{ _(self_setting_data.setting) }}</p>
                        {% endif %}
                    </div>
                    <div class="col-auto">
                        <a id="action" func="iot_mode_setup_read_change_init" ref="{{ device }}"  class="button button-fill button-44 color-theme button-raised">
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Read Battery Voltage Threshold";
    setting_label_template[setting_label] = `
        <div class="auto-init card margin-bottom-half mx-0 my-3" 
        ref="{{ device }}" 
        dependencies="{{self_setting_data.dependencies}}"
        setting-type="{{ self_setting_data.setting_type }}"
        setting-name="{{ self_setting_data.name }}"
        setting-value="{{ self_setting_data.setting }}"
        button-group="{{ device_button_group }}"
        slot-index="{{slot_index}}"
        >
            <div class="card-content card-content-padding">
                <div class="row">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">visibility</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">{{ _(self_setting_data.setting_type) }}</h5>
                        {% if self_setting_data.setting == "" %}
                        
                        {% else %}
                        <p class="setting-value text-muted size-12">{{ _(self_setting_data.setting) }}</p>
                        {% endif %}
                    </div>
                    <div class="col-auto">
                        <a id="action" func="iot_mode_setup_read_battery_init" ref="{{ device }}"  class="button button-fill button-44 color-theme button-raised">
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Set Battery Voltage Threshold";
    setting_label_template[setting_label] = `
        <div class="auto-init card margin-bottom-half mx-0 my-3" 
        ref="{{ device }}" 
        dependencies="{{self_setting_data.dependencies}}"
        setting-type="{{ self_setting_data.setting_type }}"
        setting-name="{{ self_setting_data.name }}"
        setting-value="{{ self_setting_data.setting }}"
        button-group="{{ device_button_group }}"
        slot-index="{{slot_index}}"
        >
            <div class="card-content card-content-padding">
                <div class="row">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">settings</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">{{ _(self_setting_data.setting_type) }}</h5>
                        
                    </div>
                    <div class="col-auto">
                        <a id="action" func="iot_mode_setup_set_battery_init" ref="{{ device }}"  class="button button-fill button-44 color-theme button-raised">
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Phase-Cut Mode";
    setting_label_template[setting_label] = `
        <div class="auto-init card margin-bottom-half mx-0 my-3" 
        ref="{{ device }}" 
        init-func="iot_mode_setup_phase_cut_mode_init" 
        dependencies="{{self_setting_data.dependencies}}"
        setting-type="{{ self_setting_data.setting_type }}"
        setting-name="{{ self_setting_data.name }}"
        setting-value="{{ self_setting_data.setting }}"
        button-group="{{ device_button_group }}"
        slot-index="{{slot_index}}"
        >
            <input name="phase_cut_mode" type="hidden" value="" />
            <div class="card-content card-content-padding">
                <div class="row">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">lightbulb_circle</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">{{ _(self_setting_data.setting_type) }}</h5>
                        {% if self_setting_data.setting == "" %}
                        <p class="setting-value text-muted size-12">{{ _("Leading Edge") }}</p>
                        {% else %}
                        <p class="setting-value text-muted size-12">{{ _(self_setting_data.setting) }}</p>
                        {% endif %}
                    </div>
                    <div class="col-auto">
                        <a id="action" href="#" class="button button-fill button-44 color-theme button-raised">
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Wiring Mode";
    setting_label_template[setting_label] = `
        <div class="auto-init card margin-bottom-half mx-0 my-3" 
        ref="{{ device }}" 
        init-func="iot_mode_setup_wiring_mode_init" 
        dependencies="{{self_setting_data.dependencies}}"
        setting-type="{{ self_setting_data.setting_type }}"
        setting-name="{{ self_setting_data.name }}"
        setting-value="{{ self_setting_data.setting }}"
        button-group="{{ device_button_group }}"
        slot-index="{{slot_index}}"
        >
            <input name="wiring_mode" type="hidden" value="" />
            <div class="card-content card-content-padding">
                <div class="row">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">cable</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">{{ _(self_setting_data.setting_type) }}</h5>
                        {% if self_setting_data.setting == "" %}
                        <p class="setting-value text-muted size-12">{{ _("Without Neutral") }}</p>
                        {% else %}
                        <p class="setting-value text-muted size-12">{{ _(self_setting_data.setting) }}</p>
                        {% endif %}
                    </div>
                    <div class="col-auto">
                        <a id="action" href="#" class="button button-fill button-44 color-theme button-raised">
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Dimming Mode";
    setting_label_template[setting_label] = `
        <div class="auto-init card margin-bottom-half mx-0 my-3" 
        ref="{{ device }}" 
        init-func="iot_mode_setup_dimming_mode" 
        dependencies="{{self_setting_data.dependencies}}"
        setting-type="{{ self_setting_data.setting_type }}"
        setting-name="{{ self_setting_data.name }}"
        setting-value="{{ self_setting_data.setting }}"
        button-group="{{ device_button_group }}"
        slot-index="{{slot_index}}"
        >
            <input name="dimming_mode" type="hidden" value="" />
            <div class="card-content card-content-padding">
                <div class="row">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">cable</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">{{ _(self_setting_data.setting_type) }}</h5>
                        {% if self_setting_data.setting == "" %}
                        <p class="setting-value text-muted size-12">{{ _("0-10v Dimming") }}</p>
                        {% else %}
                        <p class="setting-value text-muted size-12">{{ _(self_setting_data.setting) }}</p>
                        {% endif %}
                    </div>
                    <div class="col-auto">
                        <a id="action" href="#" class="button button-fill button-44 color-theme button-raised">
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Per Press Brightness";
    setting_label_template[setting_label] = `
        <div class="auto-init card margin-bottom-half mx-0 my-3" 
        ref="{{ device }}" 
        init-func="iot_mode_setup_per_press_brightness_init" 
        dependencies="{{per_data.dependencies}}"
        setting-type="{{ per_data.setting_type }}"
        setting-name="{{ per_data.name }}"
        setting-value="{{ per_data.setting }}"
        button-group="{{ device_button_group }}"
        slot-index="{{slot_index}}"
        >
            <input name="per_press_brightness" type="hidden" value="" />
            <div class="card-content card-content-padding">
                <div class="row">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">cable</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">{{ _('Per Press Brightness') }}</h5>
                        {% if per_data.setting == "" %}
                        <p class="setting-value text-muted size-12">5</p>
                        {% else %}
                        <p class="setting-value text-muted size-12">{{ _(per_data.setting) }}</p>
                        {% endif %}
                    </div>
                    <div class="col-auto">
                        <a id="action" href="#" class="button button-fill button-44 color-theme button-raised">
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Minimum Brightness";
    setting_label_template[setting_label] = `
        <div class="auto-init card margin-bottom-half mx-0 my-3" 
        ref="{{ device }}" 
        init-func="iot_mode_setup_min_brightness_init" 
        dependencies="{{min_brightness.dependencies}}"
        setting-type="{{ min_brightness.setting_type }}"
        setting-name="{{ min_brightness.name }}"
        setting-value="{{ min_brightness.setting }}"
        button-group="{{ device_button_group }}"
        slot-index="{{slot_index}}"
        >
            <input name="min_brightness" type="hidden" value="" />
            <div class="card-content card-content-padding">
                <div class="row">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">cable</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">{{ _('Minimum Brightness') }}</h5>
                        {% if min_brightness.setting == "" %}
                        <p class="setting-value text-muted size-12"></p>
                        {% else %}
                        <p class="setting-value text-muted size-12">{{ _(min_brightness.setting+'%') }}</p>
                        {% endif %}
                    </div>
                    <div class="col-auto">
                        <a id="action" href="#" class="button button-fill button-44 color-theme button-raised">
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Minimum Trim";
    setting_label_template[setting_label] = `
        <div class="auto-init card margin-bottom-half mx-0 my-3" 
        ref="{{ device }}" 
        init-func="iot_mode_setup_minimum_trim_init" 
        dependencies="{{self_setting_data.dependencies}}"
        setting-type="{{ self_setting_data.setting_type }}"
        setting-name="{{ self_setting_data.name }}"
        setting-value="{{ self_setting_data.setting }}"
        button-group="{{ device_button_group }}"
        slot-index="{{slot_index}}"
        >
            <input name="minimum_trim" type="hidden" value="" />
            <div class="card-content card-content-padding">
                <div class="row">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">light</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">{{ _(self_setting_data.setting_type) }}</h5>
                        {% if rcu_min.setting == "" %}
                        <p class="setting-value text-muted size-12">1</p>
                        {% else %}
                        <p class="setting-value text-muted size-12">{{ _(rcu_min.setting) }}</p>
                        {% endif %}
                    </div>
                    <div class="col-auto">
                        <a id="action" href="#" class="button button-fill button-44 color-theme button-raised">
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Battery Alert";
    setting_label_template[setting_label] = `
        <div class="auto-init card margin-bottom-half mx-0 my-3" 
        ref="{{ device }}" 
        dependencies="{{self_setting_data.dependencies}}"
        setting-type="{{ self_setting_data.setting_type }}"
        setting-name="{{ self_setting_data.name }}"
        setting-value="{{ self_setting_data.setting }}"
        button-group="{{ device_button_group }}"
        slot-index="{{slot_index}}"
        >
            <input name="setup_battery_threshold" type="hidden" value="" />
            <div class="card-content card-content-padding">
                <div class="row">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">earbuds_battery</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">{{ _(self_setting_data.setting_type) }}</h5>
                    </div>
                    <div class="col-auto">
                        <a href="/mobile-app/sensor-data-settings-list?guid={{device}}" class="button button-fill button-44 color-theme button-raised">
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Battery Alert Threshold";
    setting_label_template[setting_label] = `
        <div class="auto-init card margin-bottom-half mx-0 my-3" 
        ref="{{ device }}" 
        init-func="iot_mode_setup_battery_threshold_init" 
        dependencies="{{self_setting_data.dependencies}}"
        setting-type="{{ self_setting_data.setting_type }}"
        setting-name="{{ self_setting_data.name }}"
        setting-value="{{ self_setting_data.setting }}"
        button-group="{{ device_button_group }}"
        slot-index="{{slot_index}}"
        >
            <input name="setup_battery_threshold" type="hidden" value="" />
            <div class="card-content card-content-padding">
                <div class="row">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">earbuds_battery</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">{{ _(self_setting_data.setting_type) }}</h5>
                        {% if self_setting_data.setting == "" %}
                        <p class="setting-value text-muted size-12"></p>
                        {% else %}
                        <p class="setting-value text-muted size-12">{{_('Less Than: ')}}{{ _(self_setting_data.setting) }}</p>
                        {% endif %}
                    </div>
                    <div class="col-auto">
                        <a id="action" href="#" class="button button-fill button-44 color-theme button-raised">
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Notification";
    setting_label_template[setting_label] = `
        <div class="auto-init card margin-bottom-half mx-0 my-3" 
        ref="{{ device }}" 
        init-func="iot_setup_notification_init" 
        dependencies="{{self_setting_data.dependencies}}"
        setting-type="{{ self_setting_data.setting_type }}"
        setting-name="{{ self_setting_data.name }}"
        setting-value="{{ self_setting_data.setting }}"
        button-group="{{ device_button_group }}"
        slot-index="{{slot_index}}"
        >
            <input name="setup_notification" type="hidden" value="" />
            <div class="card-content card-content-padding">
                <div class="row">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">light</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">{{ _(self_setting_data.setting_type) }}</h5>
                        {% if self_setting_data.setting == "" %}
                        <p class="setting-value text-muted size-12"></p>
                        {% else %}
                        <p class="setting-value text-muted size-12">{{ _(self_setting_data.setting) }}</p>
                        {% endif %}
                    </div>
                    <div class="col-auto">
                        <a id="action" href="#" class="button button-fill button-44 color-theme button-raised">
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Mesh Test";
    setting_label_template[setting_label] = `
        <div class="auto-init card margin-bottom-half mx-0 my-3" 
        ref="{{ device }}" 
        init-func="iot_setup_mesh_test_init" 
        dependencies="{{self_setting_data.dependencies}}"
        setting-type="{{ self_setting_data.setting_type }}"
        setting-name="{{ self_setting_data.name }}"
        setting-value="{{ self_setting_data.setting }}"
        button-group="{{ device_button_group }}"
        slot-index="{{slot_index}}"
        >
            <input name="mesh_test" type="hidden" value="" />
            <div class="card-content card-content-padding">
                <div class="row">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">hub</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">{{ _(self_setting_data.setting_type) }}</h5>
                        {% if self_setting_data.setting == "" %}
                        <p class="setting-value text-muted size-12"></p>
                        {% else %}
                        <p class="setting-value text-muted size-12">{{ _(self_setting_data.setting) }}</p>
                        {% endif %}
                    </div>
                    <div class="col-auto">
                        <a id="action" href="#" class="button button-fill button-44 color-theme button-raised">
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Alert Notification";
    setting_label_template[setting_label] = `
        <div class="auto-init card margin-bottom-half mx-0 my-3" 
        ref="{{ device }}" 
        dependencies="{{self_setting_data.dependencies}}"
        setting-type="{{ self_setting_data.setting_type }}"
        setting-name="{{ self_setting_data.name }}"
        setting-value="{{ self_setting_data.setting }}"
        button-group="{{ device_button_group }}"
        slot-index="{{slot_index}}"
        >
            <input name="setup_notification" type="hidden" value="" />
            <div class="card-content card-content-padding">
                <div class="row">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">light</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">{{ _(self_setting_data.setting_type) }}</h5>
                        {% if self_setting_data.setting == "" %}
                        <p class="setting-value text-muted size-12"></p>
                        {% else %}
                        <p class="setting-value text-muted size-12">{{ _(self_setting_data.setting) }}</p>
                        {% endif %}
                    </div>
                    <div class="col-auto">
                        <a id="action" href="/mobile-app/sensor-data-settings-list?guid={{device}}" class="button button-fill button-44 color-theme button-raised">
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Refresh Rate";
    setting_label_template[setting_label] = `
        <div class="auto-init card margin-bottom-half mx-0 my-3" 
        ref="{{ device }}" 
        init-func="iot_mode_refresh_rate_init" 
        dependencies="{{self_setting_data.dependencies}}"
        setting-type="{{ self_setting_data.setting_type }}"
        setting-name="{{ self_setting_data.name }}"
        setting-value="{{ self_setting_data.setting }}"
        button-group="{{ device_button_group }}"
        slot-index="{{slot_index}}"
        >
            <input name="refresh_rate" type="hidden" value="" />
            <div class="card-content card-content-padding">
                <div class="row">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">refresh</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">{{ _(self_setting_data.setting_type) }}</h5>
                        {% if self_setting_data.setting == "" %}
                        <p class="setting-value text-muted size-12"></p>
                        {% else %}
                        <p class="setting-value text-muted size-12">{{ _(self_setting_data.setting) }}min</p>
                        {% endif %}
                    </div>
                    <div class="col-auto">
                        <a id="action" href="#" class="button button-fill button-44 color-theme button-raised">
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Push Interval";
    setting_label_template[setting_label] = `
        <div class="auto-init card margin-bottom-half mx-0 my-3" 
        ref="{{ device }}" 
        init-func="iot_mode_setup_push_interval_init" 
        dependencies="{{self_setting_data.dependencies}}"
        setting-type="{{ self_setting_data.setting_type }}"
        setting-name="{{ self_setting_data.name }}"
        setting-value="{{ self_setting_data.setting }}"
        button-group="{{ device_button_group }}"
        slot-index="{{slot_index}}"
        >
            <input name="push_interval" type="hidden" value="" />
            <div class="card-content card-content-padding">
                <div class="row">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">manage_history</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">{{ _(self_setting_data.setting_type) }}</h5>
                        {% if self_setting_data.setting == "" %}
                        <p class="setting-value text-muted size-12"></p>
                        {% else %}
                        <p class="setting-value text-muted size-12">{{ _(self_setting_data.setting) }}</p>
                        {% endif %}
                    </div>
                    <div class="col-auto">
                        <a id="action" href="#" class="button button-fill button-44 color-theme button-raised">
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Notification Interval";
    setting_label_template[setting_label] = `
        <div class="auto-init card margin-bottom-half mx-0 my-3" 
        ref="{{ device }}" 
        init-func="iot_mode_setup_notification_interval_init" 
        dependencies="{{self_setting_data.dependencies}}"
        setting-type="{{ self_setting_data.setting_type }}"
        setting-name="{{ self_setting_data.name }}"
        setting-value="{{ self_setting_data.setting }}"
        button-group="{{ device_button_group }}"
        slot-index="{{slot_index}}"
        >
            <input name="notification_interval" type="hidden" value="" />
            <div class="card-content card-content-padding">
                <div class="row">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">manage_history</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">{{ _(self_setting_data.setting_type) }}</h5>
                        {% if self_setting_data.setting == "" %}
                        <p class="setting-value text-muted size-12">60min</p>
                        {% else %}
                        <p class="setting-value text-muted size-12">{{ _(self_setting_data.setting) }}</p>
                        {% endif %}
                    </div>
                    <div class="col-auto">
                        <a id="action" href="#" class="button button-fill button-44 color-theme button-raised">
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Battery Notification";
    setting_label_template[setting_label] = `
        <div 
            class="auto-init card margin-bottom-half mx-0 my-3"
            ref="{{ device }}"
            setting-type="{{ self_setting_data.setting_type }}"
            setting-name="{{ self_setting_data.name }}"
            setting-value="{{ self_setting_data.setting }}"
            button-group="{{device_button_group }}"
            device-mode="{{device_mode }}"
            dependencies="{{self_setting_data.dependencies}}"
            slot-index="{{slot_index}}"
        >
           
            <div class="card-content card-content-padding">
                <div class="row align-items-center">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">notifications</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">{{ _(self_setting_data.setting_type) }}</h5>
                        <p class="setting-value text-muted size-12 battery-notification">{{_(self_setting_data.setting)}}</p>
                    </div>
                    <div class="col-auto">
                        <label class="toggle toggle-init">
                            <input 
                                type="checkbox"
                                button-group="{{device_button_group }}"
                                setting-type="{{ self_setting_data.setting_type }}"
                                setting-name="{{ self_setting_data.name }}"
                                device-mode="{{device_mode }}"
                                ref="{{ device }}"
                                slot-index="{{slot_index}}"
                                changefunc="iot_mode_setup_battery_notification_change"
                                {% if self_setting_data.setting != 'Off' and self_setting_data.setting !="" %}checked{% endif %}
                            />
                            <span class="toggle-icon"></span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Buzzer";
    setting_label_template[setting_label] = `
        <div class="auto-init card margin-bottom-half mx-0 my-3" 
        ref="{{ device }}" 
        init-func="iot_mode_setup_buzzer_auto_init" 
        dependencies="{{self_setting_data.dependencies}}"
        setting-type="{{ self_setting_data.setting_type }}"
        setting-name="{{ self_setting_data.name }}"
        setting-value="{{ self_setting_data.setting }}"
        button-group="{{ device_button_group }}"
        >
            <input name="buzzer" type="hidden" value="" />
            <div class="card-content card-content-padding">
                <div class="row">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">sensors</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">{{ _(self_setting_data.setting_type) }}</h5>
                        {% if self_setting_data.setting == "" %}
                        <p class="setting-value text-muted size-12">{{ _("Door Open") }}</p>
                        {% else %}
                        <p class="setting-value text-muted size-12">{{ _(self_setting_data.setting) }}</p>
                        {% endif %}
                    </div>
                    <div class="col-auto">
                        <a id="action" href="#" class="button button-fill button-44 color-theme button-raised">
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Time Interval";
    setting_label_template[setting_label] = `
    <div class="card margin-bottom-half mx-0 my-3" dependencies="{{self_setting_data.dependencies}}">
        <div class="card-content card-content-padding">
            <div class="row">
                <div class="col-auto">
                    <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                        <i class="material-icons">timelapse</i>
                    </div>
                </div>
                <div class="col align-self-center no-padding-left">
                    <h5 class="no-margin-bottom">{{ _(self_setting_data.setting_type) }}</h5>
                </div>
                <div class="col-auto">
                    <a 
                        func="iot_mode_setup_time_interval" 
                        ref="{{ device }}" 
                        device-name="{{profile_device_name}}"
                        mac="{{mac_address}}"
                        setting-type="{{ self_setting_data.setting_type }}" 
                        setting-value="{{ self_setting_data.setting }}"
                        href="#"
                        class="button button-fill button-44 color-theme button-raised "
                    >
                        <i class="material-icons">navigate_next</i>
                    </a>
                </div>
            </div>
        </div>
    </div>
    `;
    setting_label = "Auto Restart";
    setting_label_template[setting_label] = `
        <div 
            class="auto-init card margin-bottom-half mx-0 my-3"
            ref="{{ device }}"
            setting-type="{{ self_setting_data.setting_type }}"
            setting-name="{{ self_setting_data.name }}"
            setting-value="{{ self_setting_data.setting }}"
            button-group="{{device_button_group }}"
            device-mode="{{device_mode }}"
            dependencies="{{self_setting_data.dependencies}}"
            slot-index="{{slot_index}}"
        >
           
            <div class="card-content card-content-padding">
                <div class="row align-items-center">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">screen_lock_landscape</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">{{ _(self_setting_data.setting_type) }}</h5>
                        <p class="setting-value text-muted size-12">{{self_setting_data.setting}}</p>
                    </div>
                    <div class="col-auto">
                        <label class="toggle toggle-init">
                            <input 
                                type="checkbox"
                                button-group="{{device_button_group }}"
                                setting-type="{{ self_setting_data.setting_type }}"
                                setting-name="{{ self_setting_data.name }}"
                                device-mode="{{device_mode }}"
                                ref="{{ device }}"
                                changefunc="iot_mode_setup_auto_restart_change"
                                {% if self_setting_data.setting != 'Off' and self_setting_data.setting !="" %}checked{% endif %}
                            />
                            <span class="toggle-icon"></span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Crossover";
    setting_label_template[setting_label] = `
        <div 
            class="auto-init card margin-bottom-half mx-0 my-3"
            ref="{{ device }}"
            init-func="iot_mode_setup_crossover_auto_init"
            setting-type="{{ self_setting_data.setting_type }}"
            setting-name="{{ self_setting_data.name }}"
            setting-value="{{ self_setting_data.setting }}"
            button-group="{{device_button_group }}"
            dependencies="{{self_setting_data.dependencies}}"
            slot-index="{{slot_index}}"
        >
            <input name="crossover" type="hidden" value="" />
            <div class="card-content card-content-padding">
                <div class="row align-items-center">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">wb_iridescent</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">{{ _(self_setting_data.setting_type) }}</h5>
                        {% if self_setting_data.setting == '' %}
                        <p class="setting-value text-muted size-12">{{ _('No Setup') }}</p>
                        {% else %}
                        <p class="setting-value text-muted size-12">{{ _(self_setting_data.setting) }}</p>
                        {% endif %}
                    </div>
                    <div class="col-auto">
                        <a id="action" href="#" class="button button-fill button-44 color-theme button-raised">
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Maximum";
    setting_label_template[setting_label] = `
        <div class="auto-init card margin-bottom-half mx-0 my-3" 
        ref="{{ device }}" 
        init-func="iot_mode_setup_admin_minimum_init" 
        dependencies="{{self_setting_data.dependencies}}"
        setting-type="{{ self_setting_data.setting_type }}"
        setting-name="{{ self_setting_data.name }}"
        setting-value="{{ self_setting_data.setting }}"
        button-group="{{ device_button_group }}"
        slot-index="{{slot_index}}"
        >
            <div class="card-content card-content-padding">
                <div class="row">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">light</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">{{ _(self_setting_data.setting_type) }}</h5>
                        {% if self_setting_data.setting == "" %}
                        <p class="setting-value text-muted size-12">210</p>
                        {% else %}
                        <p class="setting-value text-muted size-12">{{ _(self_setting_data.setting) }}</p>
                        {% endif %}
                    </div>
                    <div class="col-auto">
                        <a id="action" href="#" class="button button-fill button-44 color-theme button-raised">
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Reset PWM";
    setting_label_template[setting_label] = `
        <div class="auto-init card margin-bottom-half mx-0 my-3" 
        ref="{{ device }}"
        dependencies="{{self_setting_data.dependencies}}"
        setting-type="{{ self_setting_data.setting_type }}"
        setting-name="{{ self_setting_data.name }}"
        setting-value="{{ self_setting_data.setting }}"
        button-group="{{ device_button_group }}"
        slot-index="{{slot_index}}"
        >
            <div class="card-content card-content-padding">
                <div class="row">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">light</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">{{ _(self_setting_data.setting_type) }}</h5>
                    </div>
                    <div class="col-auto">
                        <a id="action" ref="{{ device }}"  func="iot_ble_reset_pwm" href="#" class="button button-fill button-44 color-theme button-raised">
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    setting_label = "Manual Dim Steps";
    setting_label_template[setting_label] = `
        <div class="auto-init card margin-bottom-half mx-0 my-3" 
        ref="{{ device }}" 
        init-func="iot_mode_setup_admin_manual_init" 
        dependencies="{{self_setting_data.dependencies}}"
        setting-type="{{ self_setting_data.setting_type }}"
        setting-name="{{ self_setting_data.name }}"
        setting-value="{{ self_setting_data.setting }}"
        button-group="{{ device_button_group }}"
        slot-index="{{slot_index}}"
        >
            <div class="card-content card-content-padding">
                <div class="row">
                    <div class="col-auto">
                        <div class="avatar avatar-44 elevation-2 rounded-10 bg-color-gray text-color-white">
                            <i class="material-icons">light</i>
                        </div>
                    </div>
                    <div class="col align-self-center no-padding-left">
                        <h5 class="no-margin-bottom">{{ _(self_setting_data.setting_type) }}</h5>
                        {% if self_setting_data.setting == "" %}
                        <p class="setting-value text-muted size-12">8</p>
                        {% else %}
                        <p class="setting-value text-muted size-12">{{ _(self_setting_data.setting) }}</p>
                        {% endif %}
                    </div>
                    <div class="col-auto">
                        <a id="action" href="#" class="button button-fill button-44 color-theme button-raised">
                            <i class="material-icons">navigate_next</i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
}