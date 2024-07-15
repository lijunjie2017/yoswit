res = frappe.get_list('Profile')
if len(res):
    frappe.response['profile'] = frappe.get_doc('Profile', res[0].name)
else:
    frappe.response['profile'] = frappe.get_doc({
        'doctype':'Profile',
        'profile_name':'Default',
        'created_from':frappe.form_dict.appId
    }).save()
    
# check gateway
# get app app setting
gateway = frappe.form_dict.deviceId+'-'+frappe.session.user
app_setting = frappe.get_doc('App Settings', frappe.form_dict.appId)
if app_setting.single_login:
    gs = frappe.get_all('Device Gateway', fields=["apns_token","name","push_token"], filters=[["owner","=",frappe.session.user]])
    for i in gs:
        if (i.apns_token == None or i.apns_token=="") and (i.push_token == None or i.push_token==""):
            continue
        g = frappe.get_doc('Device Gateway', i.name)
        g.login_status = "Logout"
        g.save(
            ignore_permissions=True, # ignore write permissions during insert
        )
    
if frappe.db.exists('Device Gateway', gateway):
    frappe.response['device_gateway'] = frappe.get_doc('Device Gateway', gateway)
    frappe.response['device_gateway'].login_status = 'Login'
    frappe.response['device_gateway'].save()
else:
    frappe.response['device_gateway'] = frappe.get_doc({
        'doctype':'Device Gateway',
        'guid':gateway,
        'owner':frappe.session.user,
        'login_status':'Login'
    }).save()

# check user settings
user_setting_name = frappe.form_dict.user_setting_name
if frappe.db.exists('User Settings', user_setting_name):
    user_settings = frappe.get_doc('User Settings', user_setting_name)
    
    frappe.response['implicitLogin'] = frappe.form_dict.implicitLogin
    if frappe.form_dict.implicitLogin == '0' or frappe.form_dict.implicitLogin == 0:
        user_settings.active_device_gateway = frappe.response['device_gateway'].name
        user_settings.save()

    frappe.response['user_settings'] = user_settings
    if frappe.response['user_settings'].active_profile != None and frappe.response['user_settings'].active_profile != frappe.response['profile'].name:
        frappe.response['profile'] = frappe.get_doc('Profile', frappe.response['user_settings'].active_profile)
else:
    frappe.response['user_settings'] = frappe.get_doc({
        'doctype':'User Settings',
        'app_id':frappe.form_dict.appId,
        'owner':frappe.session.user,
        'status':frappe.form_dict.resident_status,
        'active_profile':frappe.response['profile'].name,
        'active_device_gateway':frappe.response['device_gateway'].name
    }).save()

# check active profile
if frappe.response['user_settings'].active_profile != None and frappe.response['user_settings'].active_profile != '':
    frappe.response['profile'] = frappe.get_doc('Profile', frappe.response['user_settings'].active_profile)

# check scene details
frappe.response['scene'] = {}
scene = frappe.get_list('Scene', filters={ 'profile': frappe.response['profile'].name })
if len(scene):
    for row in scene:
        frappe.response['scene'][row.name] = frappe.get_doc('Scene', row.name)
    
# get device details 
frappe.response['device'] = {}
for pd in frappe.response['profile'].profile_device:
    if pd.device != None and frappe.db.exists("Device", pd.device):
        frappe.response['device'][pd.device] = frappe.get_doc('Device', pd.device)

# get device button group
frappe.response['device_button_group'] = {}
for pd in frappe.response['profile'].profile_subdevice:
    if pd.device_button_group != None and frappe.db.exists("Device Button Group", pd.device_button_group):
        frappe.response['device_button_group'][pd.device_button_group] = frappe.get_doc('Device Button Group', pd.device_button_group)

# get device command
frappe.response['device_command'] = {}
for k in frappe.response['device_button_group']:
    for li in frappe.response['device_button_group'][k].button_group_list:
        if li.device_command != None and frappe.db.exists("Device Command", li.device_command):
            frappe.response['device_command'][li.device_command] = frappe.get_doc('Device Command', li.device_command)
            
# save
frappe.db.commit()