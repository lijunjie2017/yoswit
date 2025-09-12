def contains_chars(text, chars):
    if text is None or chars is None:
        return False
    text_lower = str(text).lower()
    # 若 chars 是字符串，按子串匹配；若为可迭代，则任一元素作为子串匹配
    if isinstance(chars, str):
        return chars.lower() in text_lower
    try:
        for c in chars:
            if str(c).lower() in text_lower:
                return True
        return False
    except TypeError:
        return str(chars).lower() in text_lower

def get_group_id(query_string):
    if not query_string:
        return 0
    params = query_string.split('^')
    if len(params) < 2:
        return 0
    value = params[1]
    return value
    
def get_scene_id(query_string):
    if not query_string:
        return None
    params = query_string.split('&')
    for param in params:
        if '=' in param:
            parts = param.split('=', 1)
            if len(parts) == 2:
                key = parts[0]
                value = parts[1]
                if key == 'scene_id':
                    return value
    return None

# 规范化 key：去空格、统一大写、压缩多空格、替换 - _ /
def normalize_key(s):
    t = str(s or '')
    t = t.strip().upper()
    t = t.replace('-', ' ').replace('_', ' ').replace('/', ' ')
    t = ' '.join(t.split())
    return t

def ai_button_group_icon_map():
    return {
        'SCENE VIRTUAL ONOFF GANG1': { 'icon_base_64': '' },
        'SCENE VIRTUAL MASTER': { 'icon_base_64': '' },
        'SCENE VIRTUAL DND': { 'icon_base_64': '' },
        'SCENE VIRTUAL CLEAN': { 'icon_base_64': '' },
        'SCENE VIRTUAL MOVIE': { 'icon_base_64': '' },
        'SCENE VIRTUAL REST': { 'icon_base_64': '' },
        'SCENE VIRTUAL DINING': { 'icon_base_64': '' },
        'SCENE VIRTUAL DIM': { 'icon_base_64': '' },
        'SCENE VIRTUAL READING LIGHT': { 'icon_base_64': '' },
        'SCENE VIRTUAL L READING LIGHT': { 'icon_base_64': '' },
        'SCENE VIRTUAL R READING LIGHT': { 'icon_base_64': '' },
        'SCENE VIRTUAL BRIGHTEN': { 'icon_base_64': '' },
        'SCENE VIRTUAL 25': { 'icon_base_64': '' },
        'SCENE VIRTUAL 50': { 'icon_base_64': '' },
        'SCENE VIRTUAL 100': { 'icon_base_64': '' },
        'SCENE VIRTUAL LIVING ROOM': { 'icon_base_64': '' },
        'SCENE VIRTUAL DOOR CURTAIN': { 'icon_base_64': '' },
        'SCENE VIRTUAL SLEEP': { 'icon_base_64': '' },
        'SCENE VIRTUAL SLEEP LEFT': { 'icon_base_64': '' },
        'SCENE VIRTUAL SLEEP RIGHT': { 'icon_base_64': '' },
        'SCENE VIRTUAL MIRROR': { 'icon_base_64': '' },
        'SCENE VIRTUAL BATHROOM': { 'icon_base_64': 'iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAYAAAA6/NlyAAAACXBIWXMAAAsTAAALEwEAmpwYAAAE7ElEQVRoge2aXWhcRRTHf/uhbUqa2ppqKjYKioqNlj4oaO1D6YMVMSC6YvRBQagfiAVFqVYEFcSihD5YxTz4YisS/KaIok/V1hb8iqKmRVM/q1Lth9E02SR7fDhnsjd3703ubu5ubjf7h2Huzp6ZOf+ZOfNxZlIiwlxCerYVqDUahOsdc45wKopQb28vuVyu2rpMhRSwGbgQmGqWTQO/AI8DwxXV1N3djYjMdtgo5WFLWFnZtrY2Ojs7aW1tLSHb0dFBV1dXRQ0VM861+DvgXbSXveZYADLA9SZ7XlhB2YGBAZqamqqiZYw4avFjwGtTyB0GngL+CRNIJ5xsO/AmapMA24FXgNLhqJg/XYFJnaXTwCPAT8DFwO3AZcB9wGq0J+8JyJeZruBsbCrGiwKwHNgEbPGkfwr0AE8DKyopOKmEW4C7p/h/k0cu1F6DkETClwJ9wAbgA4LNbhzIAc8AZwO/RS08iYSXoEN6M/AgwYQLwDyLz+IkJ7wLWIAO11MI3lmlgDwwCIyWU3gSCReAEXQmjh1JXZaqhgbhekeDcL2jQbje0SBc72gQrnfMOcLlHB6aUW9ghqLX8AhwEFiGHtMKHvk/gN/jUTM+RCV8DrAPONOXvhu4CvU/3ev7Lw+sBfbMRMG4EZXwlSjZF4HXLS2N9iLAVmAn2sOC+pu2AjdRW8JDFofeOjjCGWBhiIygXgiAF1D3ix8/WHD4ECW8yEKkK50QpFEiw6hjYD6TTSdIzxZfvSnUWTCGiLwhIsdFZEREhkRkWERGPSEvIuN2hbE+4tVIs4gMikjB8o/OIIyLyJNWbo/9DpLL+65b8sZlyLgdF5GdWeACa5E4kUIdbSnUTTNTtFm8HO3xKKuLv95TgYuyQAdK+k7gfuAd4FmKw0GAa4CHI1bk0IzeGnSXmc+PNPCjfW+kdDUIg6CO+xuB54BtQL+z4QPAJ/a9H/jIl3kBSrgcW8wA3wIfl5FnOhywEBXrUML7gH6Y3PJLLQ4a3v7lKCoWVZgvLpxm8cRdVNSh5nr254jygxZPe9dTa0Rdh8cs3gYcsu80sBe10ZwFZ1tuwjg2cxXjRVTCzhm+xpe+DCW8BiXsx4kK9aoaog5p1zA3A4vRBf50YL2lP4TayRL7v93Sl5IwRO1hZ8P9BA/TYSZv55xM4m42ghQKustxNrkC+BVtgDQ6ZAfRZWshutkQitvU2T5+lnDxKpQKEwL+tXgH8Bd67/MnxYPEE+hB4rD9f9DSq3I/VAEm9g9BPbw4IO1t4FrURl2eFMUd0HbgGyY31t/M/tHQvfmY0MtL2N2kt1OKE+hzoTB8aSFpcBumEZfgHdLOO9FRM3Wqj9UWH3MJXsL7LW4BbqmRQtXEWuAM+/7MJaZk8gPxPvSNxVG0pw9xcqIV+Bw9Tg7geZnnJ3w18J59DwPPo40wSukEl7HCdgErgVXoshQ3MhTniCvQB6ZB9YyZ7CXAXRQPQTm8r/cCvBUPiMh/ER9xfm95dkSUrxS9Vs/eMvLkReRR8fHz97AXtwEvoXb+FvAqOr27NS2DvpTbjQ7/lRQPGXEiC3wFfA1cDpxPaQ8LcAPqNBwFbgXeJ+gNl78FLKwSkSPWUj0hMkkM+0znPhGZFyQTtPVrAu4AvkDfSm2Ip6NqgnXAy+gydF2QwFRDui4x25v7mqNBuN4x5wj/Dz/Y96QEh3TOAAAAAElFTkSuQmCC' },
        'SCENE VIRTUAL BEDROOM': { 'icon_base_64': '' },
        'SCENE VIRTUAL SLEEP BATHROOM': { 'icon_base_64': '' },
        'SCENE VIRTUAL CHECKROOM': { 'icon_base_64': '' },
        'SCENE VIRTUAL ENTRANCE BATHROOM': { 'icon_base_64': '' },
        'SCENE VIRTUAL PANTRYROOM': { 'icon_base_64': '' },
        'RCU DIMMING': { 'icon_base_64': '' },
        'SHADE CURTAIN ON': { 'icon_base_64': '' },
        'SHADE CURTAIN OFF': { 'icon_base_64': '' },
        'SHEER CURTAIN ON': { 'icon_base_64': '' },
        'SHEER CURTAIN OFF': { 'icon_base_64': '' },
    }

ai_icon_map_normalized = None

def get_ai_icon_map_normalized():
    global ai_icon_map_normalized
    if ai_icon_map_normalized is not None:
        return ai_icon_map_normalized
    mapping = ai_button_group_icon_map()
    norm = {}
    for k, v in (mapping or {}).items():
        keyn = normalize_key(k)
        b64 = ''
        try:
            b64 = v.get('icon_base_64') or ''
        except Exception:
            b64 = ''
        norm[keyn] = b64
    ai_icon_map_normalized = norm
    return ai_icon_map_normalized

def get_ai_button_group_icon(button_group, fallback=''):
    if not button_group:
        return ''
    key_norm = normalize_key(button_group)
    norm_map = get_ai_icon_map_normalized() or {}
    if key_norm in norm_map:
        return norm_map.get(key_norm) or ''
    return ''

# 提取标签内容，如 [en]Bedroom[/en] -> Bedroom；未命中返回原字符串
def extract_tag_content(text, tag='en'):
    if text is None:
        return ''
    s = str(text)
    s_lower = s.lower()
    open_tag = f'[{str(tag).lower()}]'
    close_tag = f'[/{str(tag).lower()}]'
    start = s_lower.find(open_tag)
    if start == -1:
        return s
    start_content = start + len(open_tag)
    end = s_lower.find(close_tag, start_content)
    if end == -1:
        return s
    return s[start_content:end]
# 安全将任意值转换为 int，失败返回 None
def to_int_or_none(value):
    try:
        if value is None:
            return None
        if isinstance(value, int):
            return value
        s = str(value).strip()
        return int(s)
    except Exception:
        return None

# 用于 subItemList 排序的键函数：无效 guest_mode_idx 置后
def sort_by_guest_mode_idx_key(item):
    v = to_int_or_none(item.get('guest_mode_idx'))
    if v is None:
        return (1, 0)
    return (0, v)

# 仅用于非 Frappe 环境的静态检查占位，不影响真实运行环境
try:
    frappe  # type: ignore
except NameError:
    class FrappeStub:
        def get_doc(self, *args, **kwargs):
            return {}
        def get_all(self, *args, **kwargs):
            return []
        response = {}
        class FormDict:
            pass
        form_dict = FormDict()
    frappe = FrappeStub()  # type: ignore

#获取用户配置的profile信息（防异常）
try:
    profile = frappe.get_doc('Profile', frappe.form_dict.profile_name)
except Exception:
    profile = {}

profile_subdevice = profile.get('profile_subdevice') or []

try:
    scenes = frappe.get_all('Scene', filters=[["profile", "=", frappe.form_dict.profile_name],["scene_template","=","RCU Scene Button"]],fields=['name'])
except Exception:
    scenes = []

scene_list = []

for scene in scenes:
    try:
        scene_name = scene.get('name') if hasattr(scene, 'get') else getattr(scene, 'name', None)
        if scene_name is None:
            continue
        scene_map = frappe.get_doc('Scene', scene_name)
        scene_list.append(scene_map)
    except Exception:
        continue

subItemList = []

#场景处理，区分是否是通过virtual button控制，sceneTpye 0是virtual button，1是通过scene id控制,2是雷达场景,3是dnd,4是clean,5是其他wifi产品

for item in profile_subdevice:
    try:
        title = item.get('title')
        button_group = item.get('device_button_group')
        guest_mode = item.get('guest_mode')
        if guest_mode == 1:
            config = item.get('config')
            group_id = item.get('function')
            result_item = {
                'device_button_group': button_group,
                'device_mode': item.get('device_mode'),
                'guest_mode': guest_mode,
                'config': config,
                'device': item.get('device'),
                'title': extract_tag_content(item.get('title'), 'en'),
                'group_id': get_group_id(group_id),
                'guest_mode_idx': item.get('guest_mode_idx'),
                'profile_room': item.get('profile_room'),
                'room_name': extract_tag_content(item.get('room_name'), 'en'),
                'image_base_64': get_ai_button_group_icon(button_group, ''),
            }
            result_item['scene_type'] = 0
            if config is not None and contains_chars(config, 'scene_id'):
                result_item['scene_type'] = 2
                #拼接scene id
                result_item['scene_id'] = get_scene_id(config)
            #获取virtual id
            if contains_chars(button_group, 'scene') and config is not None and not contains_chars(config, 'scene_id'):
                #16进制的数
                result_item['virtual_id'] = config
                #进一步区分是dnd还是clean
                if contains_chars(title, 'dnd'):
                    result_item['scene_type'] = 3
                if contains_chars(title, 'clean'):
                    result_item['scene_type'] = 4
            if contains_chars(button_group, ['25', '50', '100']) and config is not None:
                result_item['scene_type'] = 1
                #从场景中获取他的scene id
                try:
                    decimal_num = int(str(config), 16)
                except Exception:
                    decimal_num = None
                if decimal_num is not None:
                    found = False
                    for scene_item in scene_list:
                        scene_virtual_button = scene_item.get('scene_virtual_button') or []
                        for scene_virtual_button_item in scene_virtual_button:
                            if scene_virtual_button_item.get('virtual_button_id') == decimal_num:
                                scene_device_location = scene_item.get('scene_device_location') or []
                                for scene_device_location_item in scene_device_location:
                                    if scene_device_location_item.get('device') == item.get('device'):
                                        result_item['scene_id'] = scene_device_location_item.get('storage_id')
                                        found = True
                                        break
                            if found:
                                break
                        if found:
                            break
            #其他wifi产品，仅当仍未判定类型时设置为 5
            if not contains_chars(button_group, 'scene') and result_item['scene_type'] == 0:
                result_item['scene_type'] = 5
            
            subItemList.append(result_item)
    except Exception:
        # 单个 item 出错时，降级为最小结果，防止整体失败
        try:
            subItemList.append({
                'device_button_group': item.get('device_button_group') if hasattr(item, 'get') else None,
                'device': item.get('device') if hasattr(item, 'get') else None,
                'scene_type': 0,
            })
        except Exception:
            # 连降级也失败时，跳过该项
            continue

try:
    subItemList.sort(key=sort_by_guest_mode_idx_key)
    frappe.response['data'] = subItemList
except Exception:
    # 最终兜底，确保不会因设置 response 失败而异常
    pass
