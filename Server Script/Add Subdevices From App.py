frappe.response['message'] = frappe.form_dict

if frappe.db.exists('Profile', frappe.form_dict.parent):
    profile = frappe.get_doc('Profile', frappe.form_dict.parent)
    
    # 支持传入 devices 列表，如果不存在则将 form_dict 包装成列表以兼容单设备调用
    devices = frappe.form_dict.get('devices')
    if not isinstance(devices, list):
        devices = [frappe.form_dict]

    for dev_item in devices:
        guid = dev_item.get('guid')
        if not guid:
            continue
            
        # 1. 处理 Device 文档
        if frappe.db.exists('Device', guid):
            frappe.db.set_value('Device', guid, {
                'password': dev_item.get('password'),
                'device_mode': dev_item.get('device_mode'),
                'owner': profile.owner
            })
        else:
            frappe.get_doc({
                'doctype': 'Device',
                'password': dev_item.get('password'),
                'device_mode': dev_item.get('device_mode'),
                'guid': guid,
                'mac_address': dev_item.get('mac_address'),
                'device_model': dev_item.get('model'),
                'batch': dev_item.get('batch'),
                'firmware': dev_item.get('firmware'),
            }).insert()
        
        # 2. 处理 profile_device 子表
        profile_device_name = ""
        gateway = dev_item.get('gateway', '')
        
        for pd in profile.profile_device:
            if pd.device == guid:
                profile_device_name = pd.name
                pd.device_mode = dev_item.get('device_mode')
                break
        
        if not profile_device_name:
            profile.append("profile_device", {
                'device': guid,
                'device_model': dev_item.get('model'),
                'device_mode': dev_item.get('device_mode'),
                'password': dev_item.get('password'),
                'device_name': dev_item.get('peripheral'),
                'network_id': 0,
                'gateway': gateway,
            })
            # 保存以获取子表行的 name
            profile.save()
            # 重新获取刚添加的行的 name
            for pd in profile.profile_device:
                if pd.device == guid:
                    profile_device_name = pd.name
                    break

        # 3. 处理 profile_subdevice 子表
        psds = []
        target_name = dev_item.get('name')
        found_subdevice = False
        
        for psd in profile.profile_subdevice:
            if target_name and psd.name == target_name:
                psd.device_mode = dev_item.get('device_mode')
                psd.profile_device = profile_device_name
                psd.device_button_group = dev_item.get('device_button_group')
                psd.profile_room = dev_item.get('profile_room')
                psd.title = dev_item.get('title')
                if dev_item.get('config'):
                    psd.config = dev_item.get('config')
                psds.append(psd)
                found_subdevice = True
            else:
                # 保留不属于当前处理的 guid 的子设备，或者属于当前 guid 但模式不同的（根据原逻辑保留）
                if psd.device != guid or psd.device_mode == dev_item.get('device_mode') or psd.profile_device == profile_device_name:
                    psds.append(psd)

        if not found_subdevice or not target_name:
            psds.append({
                'title': dev_item.get('title'),
                'profile_device': profile_device_name,
                'device_button_group': dev_item.get('device_button_group'),
                'profile_room': dev_item.get('profile_room'),
                'device_mode': dev_item.get('device_mode'),
                'config': dev_item.get('config'),
                'function': dev_item.get('function'),
                'device': guid, # 确保子设备关联到正确的 guid
                'device_model': dev_item.get('model') # 添加设备型号以支持图片显示
            })
            
        profile.set('profile_subdevice', psds)
    
    # 循环结束后统一保存
    profile.save()
    frappe.response['message'] = profile.as_dict()
else:
    frappe.response['message'] = 'Invalid Profile'
