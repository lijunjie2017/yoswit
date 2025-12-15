guid = frappe.form_dict.guid

def get_random_password():
    # 生成4位纯数字随机密码，纯Python实现
    # 使用id()获取新创建对象的内存地址作为随机种子
    seed = id({}) ^ id([]) ^ id("")
    result = ""
    for i in range(4):
        seed = (seed * 1103515245 + 12345) & 0x7FFFFFFF
        result += str(seed % 10)
    return result
device = frappe.get_doc('Device', guid)

settings = device.settings
new_settings = []
random_password = get_random_password()

for setting in settings:
    if setting.setting_type == 'ConnectKey':
        setting.setting = random_password
    
    new_settings.append(setting)

device.set("settings", new_settings)
device.save(ignore_permissions=True)

#创建新的control log
control_log_doc2 = frappe.new_doc('Device Control Log')
control_log_doc2.device = guid
control_log_doc2.profile = frappe.form_dict.profile_name
control_log_doc2.timestamp = frappe.utils.now()
control_log_doc2.status = 'MQTT'
control_log_doc2.control_source = 'Api'
control_log_doc2.details = f'{frappe.form_dict.gateway},9800000008{"".join("3" + char for char in random_password)}3b3b171f0c3308'
control_log_doc2.insert()



frappe.response['message'] = random_password
