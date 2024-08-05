#in order to get the shared user name detail info
res = frappe.get_list('Profile',fields=["*"],filters={"profile_name":['like','%'+frappe.form_dict.keyword+'%']},limit=frappe.form_dict.limit,limit_start=frappe.form_dict.limit_start)
for pd in res:
    user_list =  frappe.get_all('DocShare',filters={'share_doctype':'Profile','share_name': pd.name},fields=['*'])
    for ps in user_list:
        ps.user_image = frappe.db.get_value('User', ps.user, 'user_image')
    pd.shared = user_list
frappe.response['profile'] = res