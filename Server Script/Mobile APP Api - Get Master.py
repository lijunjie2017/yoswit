modified = None
last_modified = '1970-01-01 00:00:00' if frappe.form_dict.modified == None else frappe.form_dict.modified

docs = frappe.get_all('Device Model', fields=["name","hexid","modified"], filters=[["hexid", "is", "set"],["modified", ">", last_modified]], order_by='modified desc')
if len(docs) > 0:
    rs = {}
    for doc in docs:
        rs[doc.hexid] = frappe.get_doc('Device Model', doc.name)
    frappe.response['device_model'] = rs
    if modified==None or (len(docs) > 0 and docs[0].modified > modified):
        modified = docs[0].modified


docs = frappe.get_all('Device Mode', fields=["name","modified"], filters=[["modified", ">", last_modified]], order_by='modified desc')
if len(docs) > 0:
    rs = {}
    for doc in docs:
        rs[doc.name] = frappe.get_doc('Device Mode', doc.name)
    frappe.response['device_mode'] = rs
    if modified==None or (len(docs) > 0 and docs[0].modified > modified):
        modified = docs[0].modified


docs = frappe.get_all('Device Batch', fields=["name","device_hex_batch","modified"], filters=[["device_hex_batch", "is", "set"],["modified", ">", last_modified]], order_by='modified desc')
if len(docs) > 0:
    rs = {}
    for doc in docs:
        rs[doc.device_hex_batch] = frappe.get_doc('Device Batch', doc.name)
    frappe.response['device_batch'] = rs
    if modified==None or (len(docs) > 0 and docs[0].modified > modified):
        modified = docs[0].modified


docs = frappe.get_all('Device Brand', fields=["name","modified"], filters=[["device_setup", "=", "1"],["modified", ">", last_modified]], order_by='modified desc')
if len(docs) > 0:
    rs = {}
    for doc in docs:
        rs[doc.name] = frappe.get_doc('Device Brand', doc.name)
    frappe.response['device_brand'] = rs
    if modified==None or (len(docs) > 0 and docs[0].modified > modified):
        modified = docs[0].modified


docs = frappe.get_all('Web Page', fields=["name", "route","modified"], filters=[["web_page_group", "=", "mobile-app"],["modified", ">", last_modified]], order_by='modified desc')
if len(docs) > 0:
    rs = {}
    for doc in docs:
        rs[doc.route] = frappe.get_doc('Web Page', doc.name)
    frappe.response['web_page'] = rs
    if modified==None or (len(docs) > 0 and docs[0].modified > modified):
        modified = docs[0].modified


docs = frappe.get_all('Web Template', fields=["*"], filters=[["modified", ">", last_modified]], order_by='modified desc')
if len(docs) > 0:
    rs = {}
    for doc in docs:
        rs[doc.name] = doc
    frappe.response['web_template'] = rs
    if modified==None or (len(docs) > 0 and docs[0].modified > modified):
        modified = docs[0].modified


docs = frappe.get_all('Web Form', fields=["name","modified"], filters=[["module", "=", "Mobile App"],["modified", ">", last_modified]], order_by='modified desc')
if len(docs) > 0:
    rs = {}
    for doc in docs:
        rs[doc.name] = frappe.get_doc('Web Form', doc.name)
    frappe.response['web_form'] = rs
    if modified==None or (len(docs) > 0 and docs[0].modified > modified):
        modified = docs[0].modified
        
        
docs = frappe.get_all('Website Sidebar', fields=["name","modified"], filters=[["modified", ">", last_modified]], order_by='modified desc')
if len(docs) > 0:
    rs = {}
    for doc in docs:
        rs[doc.name] = frappe.get_doc('Website Sidebar', doc.name)
    frappe.response['website_sidebar'] = rs
    if modified==None or (len(docs) > 0 and docs[0].modified > modified):
        modified = docs[0].modified
        

docs = frappe.get_all('App Settings', fields=["name","modified"], filters=[["modified", ">", last_modified]], order_by='modified desc')
if len(docs) > 0:
    rs = {}
    for doc in docs:
        rs[doc.name] = frappe.get_doc('App Settings', doc.name)
    frappe.response['app_settings'] = rs
    if modified==None or (len(docs) > 0 and docs[0].modified > modified):
        modified = docs[0].modified


docs = frappe.get_all('App Script', fields=["*"], filters=[["version", "=", "v6"],["status", "in", ["Launched","Deprecated"]],["modified", ">", last_modified]], order_by='modified desc')
if len(docs) > 0:
    rs = {}
    for doc in docs:
        rs[doc.name] = doc
    frappe.response['app_script'] = rs
    if modified==None or (len(docs) > 0 and docs[0].modified > modified):
        modified = docs[0].modified
        

docs = frappe.get_all('Social Login Key', fields=["*"], filters=[["social_login_provider", "=", "Custom"],["modified", ">", last_modified]], order_by='modified desc')
if len(docs) > 0:
    # rs = {}
    index = 0
    for doc in docs:
        doc.app_icon = frappe.get_url(doc.app_icon)
        doc.app_logo = frappe.get_url(doc.app_logo)
        doc.index = index
        index = index + 1
    frappe.response['social_login_key'] = docs
    if modified==None or (len(docs) > 0 and docs[0].modified > modified):
        modified = docs[0].modified


docs = frappe.get_all('Device Log Type', fields=["*"], filters=[["modified", ">", last_modified]], order_by='modified desc')
if len(docs) > 0:
    rs = {}
    for doc in docs:
        rs[doc.name] = doc
    frappe.response['device_log_type'] = rs
    if modified==None or (len(docs) > 0 and docs[0].modified > modified):
        modified = docs[0].modified



frappe.response['modified'] = modified if modified != None else last_modified