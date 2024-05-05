import requests
import json

response = requests.get('https://api.github.com/emojis')
data = json.loads(response.text)
formatted_data = {}

for key, value in data.items():
    emoji_data = {}

    emoji_code = f":{key}:"
    emoji_symbol = key.replace('+', ' ').replace('-', ' ')
    emoji_image = value

    if 'unicode/' in emoji_image:
        unicode = 'U+' + emoji_image.split('unicode/')[1].split('.png')[0]
        emoji_info = unicode.split('U+')[1]

    emoji_data["code"] = emoji_code
    emoji_data["image"] = emoji_image
    emoji_data["unicode"] = unicode
    emoji_data["info"] = f'https://www.openmoji.org/library/emoji-{emoji_info.upper()}'

    formatted_data[key] = emoji_data

with open('output.json', 'w') as f:
    json.dump(formatted_data, f, indent=4)
