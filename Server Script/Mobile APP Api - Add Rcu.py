frappe.response['message'] = frappe.form_dict
indexList = frappe.form_dict.index.split(",")
if frappe.db.exists('Profile', frappe.form_dict.parent):
    profile = frappe.get_doc('Profile', frappe.form_dict.parent)
    psds = []
    for psd in profile.profile_subdevice:
        if psd.config is None or not psd.config:
            psds.append(psd)
    device = frappe.get_doc('Device',frappe.form_dict.guid)
    for indexs in indexList:
        for sets in device.settings:
            if sets.setting_type == indexs:
                #setting value 01 on off,02 GD,03 GK,04 GV
                if sets.setting == '01':
                    indexlist = [1,2,3,4]
                    for ids in indexlist:
                        psds.append({
                            'title':'YO780-4G '+str(int(indexs))+'-'+str(ids),
                            'profile_device':frappe.form_dict.profile_device,
                            'device_button_group':'RCU ONOFF GANG'+str(4*(int(indexs)-1)+ids),
                            'profile_room':frappe.form_dict.profile_room,
                            'device_mode':'On Off Switch',
                            'config':indexs,
                        })
                elif sets.setting == '02':
                    psds.append({
                        'title':'YO780-2GD '+str(int(indexs))+'-1',
                        'profile_device':frappe.form_dict.profile_device,
                        'device_button_group':'RCU DIMMING'+str(2*(int(indexs))-1),
                        'profile_room':frappe.form_dict.profile_room,
                        'device_mode':'Triac Dimming',
                        'config':indexs,
                    })
                    psds.append({
                        'title':'YO780-2GD '+str(int(indexs))+'-2',
                        'profile_device':frappe.form_dict.profile_device,
                        'device_button_group':'RCU DIMMING'+str(2*(int(indexs))),
                        'profile_room':frappe.form_dict.profile_room,
                        'device_mode':'Triac Dimming',
                        'config':indexs,
                    })
                elif sets.setting == '03':
                    psds.append({
                        'title':'YO780-2GK '+str(int(indexs))+'-1',
                        'profile_device':frappe.form_dict.profile_device,
                        'device_button_group':'RCU OPENCLOSE GANG'+str(2*(int(indexs))-1),
                        'profile_room':frappe.form_dict.profile_room,
                        'device_mode':'Curtain Switch',
                        'config':indexs,
                    })
                    psds.append({
                        'title':'YO780-2GK '+str(int(indexs))+'-2',
                        'profile_device':frappe.form_dict.profile_device,
                        'device_button_group':'RCU OPENCLOSE GANG'+str(2*(int(indexs))),
                        'profile_room':frappe.form_dict.profile_room,
                        'device_mode':'Curtain Switch',
                        'config':indexs,
                    })
                elif sets.setting == '04':
                    psds.append({
                        'title':'YO780-2GV '+str(int(indexs))+'-1',
                        'profile_device':frappe.form_dict.profile_device,
                        'device_button_group':'RCU DIMMING'+str(2*(int(indexs))-1),
                        'profile_room':frappe.form_dict.profile_room,
                        'device_mode':'0-10v Dimming',
                        'config':indexs,
                    })
                    psds.append({
                        'title':'YO780-2GV '+str(int(indexs))+'-2',
                        'profile_device':frappe.form_dict.profile_device,
                        'device_button_group':'RCU DIMMING'+str(2*(int(indexs))),
                        'profile_room':frappe.form_dict.profile_room,
                        'device_mode':'0-10v Dimming',
                        'config':indexs,
                    })
    profile.set('profile_subdevice', psds)
    profile.save()
    frappe.db.commit()
    frappe.response['message'] = profile
else:
    frappe.response['message'] = 'Invalid Profile'