import os
import re
import unicodedata
import time
import json
import random
import urllib.request
import urllib.parse
import urllib.error

# CONFIGURATION
# Get your API key from https://pixabay.com/api/docs/
PIXABAY_API_KEY = os.getenv('PIXABAY_API_KEY', 'YOUR_PIXABAY_API_KEY_HERE')
BASE_URL = "https://pixabay.com/api/"
# Fallback support for Unsplash if needed
UNSPLASH_ACCESS_KEY = os.getenv('UNSPLASH_ACCESS_KEY', 'YOUR_UNSPLASH_ACCESS_KEY_HERE')
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'public', 'assets', 'items')

# Mappings for better search queries (Shortened for Pixabay 100char limit)
CATEGORY_KEYWORDS = {
    'Arma': 'fantasy rpg weapon illustration',
    'Armadura': 'fantasy armor illustration',
    'Escudo': 'fantasy shield illustration',
    'Item Geral': 'fantasy rpg item illustration',
    'Alquimía': 'fantasy potion illustration',
    'Vestuário': 'fantasy clothing illustration',
    'Alimentação': 'fantasy food illustration',
    'Ferramenta': 'fantasy tool illustration'
}

def remove_background_placeholder(input_data):
    """
    STUB: Placeholder for rembg background removal.
    To use this, install 'rembg' and 'pillow':
    pip install rembg pillow
    
    Example implementation:
    from rembg import remove
    return remove(input_data)
    """
    return input_data


ITEM_TRANSLATIONS = {
    # WEAPONS
    'adaga': 'dagger',
    'espadacurta': 'short sword',
    'espada curta': 'short sword',
    'espada longa': 'longsword d&d digital art',
    'espada bastarda': 'bastard sword fantasy digital art',
    'montante': 'greatsword fantasy digital art',
    'machadinha': 'handaxe d&d digital art',
    'machado de batalha': 'battleaxe fantasy digital art',
    'machado de guerra': 'greataxe d&d digital art',
    'alfange': 'falchion fantasy digital art',
    'clava': 'club weapon fantasy digital art',
    'lanca': 'spear fantasy digital art',
    'lanca montada': 'lance weapon fantasy digital art',
    'tridente': 'trident weapon fantasy digital art',
    'alabarda': 'halberd fantasy digital art',
    'foice': 'scythe weapon fantasy digital art',
    'gadanho': 'scythe war',
    'picareta': 'pickaxe',
    'martelo de guerra': 'warhammer',
    'maca': 'mace',
    'bordao': 'quarterstaff',
    'florete': 'rapier',
    'cimitarra': 'scimitar',
    'arco curto': 'shortbow',
    'arco longo': 'longbow',
    'besta leve': 'crossbow',
    'besta pesada': 'heavy crossbow',
    'funda': 'sling',
    'mosquete': 'musket',
    'pistola': 'flintlock pistol',
    'municao': 'quiver of arrows digital art',
    'balas': 'sling bullets pouch digital art',
    'flechas': 'wooden arrows bundle digital art',
    'virotes': 'crossbow bolts box digital art',
    'rede': 'net weapon',
    'chicote': 'whip',
    'manopla': 'gauntlet',
    'azagaia': 'javelin',
    'machado anao': 'dwarven axe',
    'corrente de espinhos': 'spiked chain',
    'machado taurico': 'tauric axe',
    'mangual': 'flail',
    'marreta': 'sledgehammer',
    'tacape': 'greatclub',

    # ARMOR
    'armadura acolchoada': 'padded armor d&d style',
    'armadura de couro': 'leather armor fantasy rpg',
    'couro batido': 'studded leather armor d&d',
    'gibao de peles': 'hide armor fantasy illustration',
    'cota de malha': 'chainmail armor rpg',
    'brunea': 'scale mail armor fantasy',
    'loriga segmentada': 'splint mail armor rpg',
    'meia armadura': 'half plate armor d&d',
    'armadura completo': 'full plate armor knight',
    'armadura completa': 'full plate armor knight',
    'couraca': 'breastplate armor fantasy',
    'escudo leve': 'buckler shield icon',
    'escudo pesado': 'heater shield fantasy',

    # GEAR
    'mochila': 'adventurer backpack icon',
    'mochila de aventureiro': 'explorer pack d&d',
    'saco de dormir': 'bedroll camping gear',
    'corda': 'rope coil adventure',
    'tocha': 'burning torch fantasy',
    'algemas': 'manacles prisoner',
    'lampiao': 'oil lantern fantasy',
    'barraca': 'camping tent medieval',
    'agua benta': 'holy water vial',
    'pe de cabra': 'crowbar',
    'luneta': 'spyglass',
    'espelho': 'hand mirror',
    'pederneira': 'flint and steel',
    'bandoleira de pocoes': 'potion bandolier',
    'arpeu': 'grappling hook',
    'oleo': 'oil flask',
    'organizador de pergaminhos': 'scroll case',
    'simbolo sagrado': 'holy symbol',
    'vara de madeira': 'wooden pole',
    
    # TOOLS
    'alaude elfico': 'lute',
    'colecao de livros': 'pile of books',
    'equipamento de viagem': 'travel gear',
    'estojo de disfarces': 'disguise kit',
    'flauta mistica': 'flute',
    'gazua': 'lockpicks',
    'instrumentos de oficio': 'crafting tools',
    'instrumento musical': 'musical instrument',
    'maleta de medicamentos': 'healer kit',
    'sela': 'saddle',
    'tambor das profundezas': 'drum',

    # ALCHEMY
    'acido': 'acid flask',
    'fogo alquimico': 'alchemist fire',
    'balsamo restaurador': 'healing potion herb',
    'essencia de mana': 'mana potion',
    'bomba': 'bomb fuse',
    'cosmetico': 'makeup kit',
    'elixir amor': 'love potion',
    'po do desaparecimento': 'magic dust',
    'baga-de-fogo': 'fireberry',
    'sangue de dragao': 'dragon blood vial',
    'essencia abissal': 'void essence',
    'liquen lilas': 'purple lichen',
    'musgo purpura': 'purple moss',
    'ossos de monstro': 'monster bones',
    'po de cristal': 'crystal dust',
    'po de giz': 'chalk powder',
    'ramo verdejante': 'green branch',
    'saco de sal': 'salt bag',
    'seiva de ambar': 'amber sap',
    'terra de cemiterio': 'graveyard dirt',
    'beladona': 'belladonna plant',
    'bruma sonolenta': 'sleeping gas',
    'cicuta': 'hemlock plant',
    'essencia de sombra': 'shadow essence',
    'nevoa toxica': 'toxic cloud vial',
    'peconha comum': 'poison vial',
    'peconha concentrada': 'green poison vial',
    'peconha potente': 'deadly poison vial',
    'po de lich': 'bone dust',
    'riso de nimb': 'chaos potion',
    
    # CLOTHING
    'andrajos de aldeao': 'peasant rags clothes',
    'bandana': 'fantasy bandana icon',
    'botas reforcadas': 'leather boots fantasy',
    'camisa bufante': 'puffy shirt medieval',
    'capa esvoacante': 'flowing cape fantasy',
    'capa pesada': 'heavy cloak winter',
    'casaco longo': 'long coat medieval',
    'chapeu arcano': 'wizard pointy hat',
    'enfeite de elmo': 'helmet plume crest',
    'fardamento de guarnicao': 'military uniform medieval',
    'gorro de ervas': 'herbalist hood',
    'luva de pelica': 'leather gloves rpg',
    'manto camuflado': 'camo cloak ranger',
    'manto eclesiastico': 'priest cleric robes',
    'robe mistico': 'wizard mystic robes',
    'sapatos de andruanca': 'fancy shoes noble',
    'tabardo': 'medieval tabard icon',
    'traje da corte': 'noble court clothes',
    'traje de viajante': 'traveler clothes d&d',
    'veste de seda': 'silk robe fantasy',

    # FOOD
    'batata valkariana': 'potato',
    'gorad quente': 'hot stew',
    'macarrao de vivakin': 'pasta dish',
    'prato do aventureiro': 'hearty meal',
    'racao de viagem': 'rations food',
    'refeicao comum': 'bread and cheese',
    'sopa de peixe': 'fish soup',
}

def sanitize_filename(name):
    """
    Sanitizes the item name to create a valid filename.
    Converts to lowercase, removes accents, replaces spaces with underscores.
    Example: 'Espada Longa' -> 'espada_longa.webp'
    Example: 'Vara de madeira (3m)' -> 'vara_de_madeira.webp'
    """
    # Remove text inside parentheses first
    name = re.sub(r'\([^)]*\)', '', name)
    
    # Normalize unicode characters
    nfkd_form = unicodedata.normalize('NFKD', name)
    name = "".join([c for c in nfkd_form if not unicodedata.combining(c)])
    
    # Lowercase and replace spaces with underscores
    name = name.strip().lower().replace(' ', '_')
    
    # Remove non-alphanumeric characters (except underscores)
    name = re.sub(r'[^a-z0-9_]', '', name)
    
    # Remove multiple underscores
    name = re.sub(r'_+', '_', name)
    
    # Remove trailing/leading underscores
    name = name.strip('_')
    
    return f"{name}.webp"

def get_english_term(name):
    """
    Tries to find an English translation for better search results.
    """
    # Remove parentheses
    clean_name = re.sub(r'\([^)]*\)', '', name).strip()
    
    # Normalize to match keys in ITEM_TRANSLATIONS
    nfkd_form = unicodedata.normalize('NFKD', clean_name)
    normalized = "".join([c for c in nfkd_form if not unicodedata.combining(c)])
    normalized = normalized.lower().strip()
    
    return ITEM_TRANSLATIONS.get(normalized, name)

def extract_items_from_file(filepath):
    """
    Parses a TypeScript file and extracts item names and their groups.
    Looks for patterns like: nome: 'Item Name', ... group: 'Group Name'
    """
    items = []
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
            # Find all objects that have a name
            object_matches = re.finditer(r"nome:\s*['\"](.+?)['\"]", content)
            
            for match in object_matches:
                item_name = match.group(1)
                start_pos = match.start()
                
                # Search forward for the group within a reasonable range (e.g., 500 chars)
                search_window = content[start_pos:start_pos+500]
                
                group_match = re.search(r"group:\s*['\"](.+?)['\"]", search_window)
                group = group_match.group(1) if group_match else 'Item Geral'
                
                items.append({'name': item_name, 'group': group})
                
    except FileNotFoundError:
        print(f"File not found: {filepath}")
        
    return items

def search_and_download_image(item, existing_files):
    filename = sanitize_filename(item['name'])
    
    if filename in existing_files:
        # Check happens in main loop now to provide better summary
        return

    print(f"Processing: {item['name']}...")
    
    # Determine search query
    english_name = get_english_term(item['name'])
    base_keyword = CATEGORY_KEYWORDS.get(item['group'], 'fantasy rpg item')
    
    # 100 character limit for Pixabay 'q' parameter.
    # Format: "{name} {category} digital art"
    query = f"{english_name} {base_keyword} digital art"
    
    # Ensure it's under 100 chars
    if len(query) > 95:
        query = query[:95]
    
    print(f"  -> Query: '{query}'")
    
    # Check key format
    if PIXABAY_API_KEY == 'YOUR_PIXABAY_API_KEY_HERE' and UNSPLASH_ACCESS_KEY == 'YOUR_UNSPLASH_ACCESS_KEY_HERE':
        print(f"  [DRY RUN] Would search Pixabay for: '{query}'")
        print("  ! Please set PIXABAY_API_KEY env var to enable downloads.")
        return

    try:
        # Search Pixabay (Primary)
        if PIXABAY_API_KEY != 'YOUR_PIXABAY_API_KEY_HERE':
            params = urllib.parse.urlencode({
                'key': PIXABAY_API_KEY,
                'q': query,
                'image_type': 'illustration',
                'category': 'backgrounds',
                'per_page': 3,
                'page': random.randint(1, 3),
                'safesearch': 'true'
            })
            
            req = urllib.request.Request(f"{BASE_URL}?{params}", headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req) as response:
                data = json.loads(response.read().decode())
                
                if data['hits']:
                    # Take first result
                    image_url = data['hits'][0]['webformatURL']
                    print(f"  Found on Pixabay: {image_url}")
                    
                    # Download
                    img_req = urllib.request.Request(image_url, headers={'User-Agent': 'Mozilla/5.0'})
                    with urllib.request.urlopen(img_req) as img_resp:
                        content = img_resp.read()
                        
                        # Apply background removal stub if it were active
                        # content = remove_background_placeholder(content)
                        
                        output_path = os.path.join(OUTPUT_DIR, filename)
                        with open(output_path, 'wb') as f:
                            f.write(content)
                        print(f"  Downloaded: {filename}")
                        time.sleep(1) # Pixabay is more generous but still good to be nice
                        return
                    
        # Fallback to Unsplash if Pixabay fails or no key
        if UNSPLASH_ACCESS_KEY != 'YOUR_UNSPLASH_ACCESS_KEY_HERE':
            print("  Attempting Unsplash fallback...")
            # (Keep old Unsplash logic if key exists)
            unsplash_url = "https://api.unsplash.com/search/photos"
            params = urllib.parse.urlencode({
                'query': query,
                'per_page': 3,
                'page': random.randint(1, 3),
                'client_id': UNSPLASH_ACCESS_KEY
            })
            req = urllib.request.Request(f"{unsplash_url}?{params}")
            with urllib.request.urlopen(req) as response:
                data = json.loads(response.read().decode())
                if data['results']:
                    image_url = data['results'][0]['urls']['small']
                    img_req = urllib.request.Request(image_url)
                    with urllib.request.urlopen(img_req) as img_resp:
                        content = img_resp.read()
                        with open(os.path.join(OUTPUT_DIR, filename), 'wb') as f:
                            f.write(content)
                        print(f"  Downloaded from Unsplash: {filename}")
                        time.sleep(2)
                        return
            
    except urllib.error.HTTPError as e:
        if e.code == 401:
            print(f"  API Error: 401 - Unauthorized. Your Unsplash Access Key is invalid or expired.")
        elif e.code == 403:
            print(f"  API Error: 403 - Forbidden. Rate limit exceeded or access denied.")
        else:
            print(f"  API Error: {e.code} - {e.reason}")
            
    except Exception as e:
        print(f"  Error: {str(e)}")

def main():
    print("--- Market Asset Downloader ---")
    print(f"Using Key: {UNSPLASH_ACCESS_KEY[:4]}...{UNSPLASH_ACCESS_KEY[-4:] if len(UNSPLASH_ACCESS_KEY) > 8 else ''}")
    
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
        print(f"Created directory: {OUTPUT_DIR}")

    # Paths to data files
    base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    files_to_scan = [
        os.path.join(base_path, 'src', 'data', 'equipamentos.ts'),
        os.path.join(base_path, 'src', 'data', 'equipamentos-gerais.ts')
    ]
    
    all_items = []
    for filepath in files_to_scan:
        print(f"Scanning {os.path.basename(filepath)}...")
        items = extract_items_from_file(filepath)
        all_items.extend(items)
        print(f"  Found {len(items)} items.")
        
    print(f"Total items found in source: {len(all_items)}")
    
    # Get existing files
    existing_files = set(os.listdir(OUTPUT_DIR))
    
    missing_items = []
    for item in all_items:
        filename = sanitize_filename(item['name'])
        if filename not in existing_files:
            missing_items.append(item)
            
    print(f"Items already downloaded: {len(all_items) - len(missing_items)}")
    print(f"Items missing (to download): {len(missing_items)}")
    print("-" * 30)
    
    for item in missing_items:
        search_and_download_image(item, existing_files)
        
    print("\nDone!")

if __name__ == "__main__":
    main()
