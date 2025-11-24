app_data = frappe.get_doc('App Settings', frappe.form_dict.appId)
frappe.response['data'] = app_data

# frappe.response['data'] = {
#   'logo': {
#     'text': frappe.form_dict.appId,
#     'size': 'h5',
#     'weight': 'bold'
#   },
#   'menuItems': [
#     {
#       'id': 'home',
#       'label': 'Home',
#       'icon': 'home',
#       'action': 'tab',
#       'value': 'home'
#     },
#     {
#       'id': 'group1',
#       'label': 'Yoswit Smart Home',
#       'icon': 'folder',
#       'children': [
#         {
#           'id': 'news',
#           'label': 'Subitem 1.1',
#           'icon': 'article',
#           'action': 'tab',
#           'value': 'news'
#         },
#         {
#           'id': 'settings',
#           'label': 'Subitem 1.2',
#           'icon': 'settings',
#           'action': 'tab',
#           'value': 'settings'
#         }
#       ]
#     },
    
#     {
#       'id': 'group2',
#       'label': 'Hotel Management',
#       'icon': 'folder',
#       'children': [
#         {
#           'id': 'subitem2-1',
#           'label': 'Subitem 2.1',
#           'icon': 'home',
#           'action': 'tab',
#           'value': 'home'
#         },
#         {
#           'id': 'subitem2-2',
#           'label': 'Subitem 2.2',
#           'icon': 'article',
#           'action': 'tab',
#           'value': 'news'
#         },
#         {
#           'id': 'subitem2-3',
#           'label': 'Subitem 2.3',
#           'icon': 'settings',
#           'action': 'tab',
#           'value': 'settings'
#         }
#       ]
#     },
    
#     {
#       'id': 'about',
#       'label': 'About',
#       'icon': 'info',
#       'action': 'route',
#       'value': '/about'
#     }
#   ],
#   'version': {
#     'show': True
#   }
# }