import os
import re
import pdfplumber
import sys

# Paths
BASE_DIR = r"c:\Users\welde\Dev\Projetos\rpg-cousins"
THREATS_DIR = os.path.join(BASE_DIR, 'src', 'data', 'threats')
PDF_PATH = os.path.join(BASE_DIR, 'src', 'data', 'T20 - Livro Básico.pdf')
REPORT_PATH = os.path.join(BASE_DIR, 'THREAT_ERRORS.md')

# ND Mapping
ND_MAP = {
    "ChallengeLevel.QUARTER": "0.25",
    "ChallengeLevel.HALF": "0.5",
    "ChallengeLevel.ONE": "1",
    "ChallengeLevel.TWO": "2",
    "ChallengeLevel.THREE": "3",
    "ChallengeLevel.FOUR": "4",
    "ChallengeLevel.FIVE": "5",
    "ChallengeLevel.SIX": "6",
    "ChallengeLevel.SEVEN": "7",
    "ChallengeLevel.EIGHT": "8",
    "ChallengeLevel.NINE": "9",
    "ChallengeLevel.TEN": "10",
    "ChallengeLevel.ELEVEN": "11",
    "ChallengeLevel.TWELVE": "12",
    "ChallengeLevel.THIRTEEN": "13",
    "ChallengeLevel.FOURTEEN": "14",
    "ChallengeLevel.FIFTEEN": "15",
    "ChallengeLevel.SIXTEEN": "16",
    "ChallengeLevel.SEVENTEEN": "17",
    "ChallengeLevel.EIGHTEEN": "18",
    "ChallengeLevel.NINETEEN": "19",
    "ChallengeLevel.TWENTY": "20",
    "ChallengeLevel.S": "21",
    "ChallengeLevel.S_PLUS": "22",
    "1/4": "0.25",
    "1/2": "0.5",
    "1": "1",
    "2": "2",
    "3": "3",
    "4": "4",
    "5": "5",
    "6": "6",
    "7": "7",
    "8": "8",
    "9": "9",
    "10": "10",
    "11": "11",
    "12": "12",
    "13": "13",
    "14": "14",
    "15": "15",
    "16": "16",
    "17": "17",
    "18": "18",
    "19": "19",
    "20": "20",
    "S": "21",
    "S+": "22"
}

def clean_text(text):
    if not text: return ""
    return text.strip().replace('\n', ' ')

def normalize_nd(val):
    val = clean_text(str(val)).replace(',', '.')
    if val in ND_MAP:
        return ND_MAP[val]
    # Try looking up via key
    if val.startswith("ChallengeLevel."):
        return ND_MAP.get(val, val)
    return val

def extract_table_from_pdf(pdf_path, page_num=320):
    print(f"Reading PDF: {pdf_path} around page {page_num}...")
    stats_db = {}
    if not os.path.exists(pdf_path):
        print("PDF not found.")
        return stats_db

    try:
        with pdfplumber.open(pdf_path) as pdf:
            found = False
            for i in range(318, 324):
                if i >= len(pdf.pages): break
                page = pdf.pages[i]
                rows = page.extract_table()
                if not rows: continue
                
                header = [str(c).lower() for c in rows[0] if c]
                header_str = " ".join(header)
                if "nd" in header_str and ("ataque" in header_str or "atk" in header_str):
                    print(f"Found table on page index {i}")
                    for row in rows[1:]:
                        clean_row = [clean_text(str(c)) for c in row if c]
                        if not clean_row: continue
                        nd_raw = clean_row[0]
                        nd_key = normalize_nd(nd_raw)
                        
                        stats_db[nd_key] = {
                            "atk": clean_row[1] if len(clean_row)>1 else "?",
                            "damage": clean_row[2] if len(clean_row)>2 else "?",
                            "def": clean_row[3] if len(clean_row)>3 else "?",
                            "hp": clean_row[7] if len(clean_row)>7 else "?"
                        }
                    found = True
                    break
            if not found:
                print("Could not find stats table in likely pages.")
                
    except Exception as e:
        print(f"Error reading PDF: {e}")

    return stats_db

def extract_table_from_code():
    table_path = os.path.join(THREATS_DIR, 'combatTables.ts')
    stats_db = {}
    if not os.path.exists(table_path):
        return stats_db
        
    print(f"Fallback: Reading stats from {table_path}")
    with open(table_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    match_list = re.search(r'SOLO_COMBAT_TABLE[:\s\w\[\]]*= \[([\s\S]*?)\];', content)
    if not match_list:
        return stats_db
        
    list_content = match_list.group(1)
    obj_matches = re.finditer(r'\{([\s\S]*?)\}', list_content)
    
    for obj_match in obj_matches:
        block = obj_match.group(1)
        nd_m = re.search(r'nd:\s*(ChallengeLevel\.[A-Z_]+)', block)
        if not nd_m: continue
        nd_raw = nd_m.group(1)
        nd_key = normalize_nd(nd_raw)
        
        atk_m = re.search(r'attackValue:\s*(\d+)', block)
        def_m = re.search(r'defense:\s*(\d+)', block)
        hp_m = re.search(r'hitPoints:\s*(\d+)', block)
        
        stats_db[nd_key] = {
            "atk": atk_m.group(1) if atk_m else "?",
            "def": def_m.group(1) if def_m else "?",
            "hp": hp_m.group(1) if hp_m else "?"
        }

    return stats_db

def parse_ts_file(filepath):
    threats = []
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    nd_matches = re.finditer(r'nd:\s*(ChallengeLevel\.[A-Z_]+)', content)
    
    for match in nd_matches:
        nd_raw = match.group(1)
        nd_key = normalize_nd(nd_raw)
        
        start_idx = match.end()
        chunk = content[start_idx:start_idx+2000]
        
        attrs = {}
        skills = {}
        
        attr_match = re.search(r'attributes:\s*\{([^}]+)\}', chunk)
        if attr_match:
            vals = re.findall(r'(\w+):\s*(\d+)', attr_match.group(1))
            for k, v in vals:
                attrs[k] = int(v)
        
        skill_match = re.search(r'skills:\s*\{([^}]+)\}', chunk)
        if skill_match:
            vals = re.findall(r'(\w+):\s*(\d+)', skill_match.group(1))
            for k, v in vals:
                skills[k] = int(v)
                
        threats.append({
            "file": os.path.basename(filepath),
            "nd": nd_key,
            "raw_nd": nd_raw,
            "attributes": attrs,
            "skills": skills
        })
        
    return threats

def main():
    report = ["# Relatório de Inconsistências de Ameaças (THREAT_ERRORS)\n\n"]
    
    # 1. Get Table
    stats_table = extract_table_from_pdf(PDF_PATH)
    if not stats_table:
        report.append("WARN: Tabela PDF não encontrada. Tentando extrair de combatTables.ts...\n")
        stats_table = extract_table_from_code()
    
    if stats_table:
        report.append(f"## Tabela de Referência Carregada ({len(stats_table)} entradas)\n\n")
    else:
        report.append("## ERRO CRÍTICO: Não foi possível carregar tabela de estatísticas.\n\n")

    # 2. Iterate Threat Files
    all_threats = []
    if os.path.exists(THREATS_DIR):
        print(f"Scanning directory: {THREATS_DIR}")
        for fname in os.listdir(THREATS_DIR):
            if fname.endswith('.ts') and fname != 'combatTables.ts':
                fpath = os.path.join(THREATS_DIR, fname)
                threats = parse_ts_file(fpath)
                all_threats.extend(threats)
    
    if not all_threats:
        report.append("Nenhuma ameaça encontrada nos arquivos .ts em src/data/threats/.\n")
    
    # 3. Validation Logic
    report.append("## Análise\n")
    
    for t in all_threats:
        issues = []
        nd = t['nd']
        
        try:
           nd_float = float(nd)
        except:
           nd_float = 999 

        is_low_mid = nd_float <= 10
        
        for attr, val in t['attributes'].items():
            if is_low_mid and val > 40:
                issues.append(f"Atributo '{attr}' anormalmente alto (+{val}) para ND {nd}")
        
        for skill, val in t['skills'].items():
            if is_low_mid and val > 60:
                issues.append(f"Perícia '{skill}' anormalmente alta (+{val}) para ND {nd}")

        if issues:
            report.append(f"### {t['file']} (ND {t['raw_nd']})\n")
            for i in issues:
                report.append(f"- [SANITY] {i}\n")
            report.append("\n")

    with open(REPORT_PATH, 'w', encoding='utf-8') as f:
        f.write("".join(report))
    
    print(f"Relatório gerado em: {REPORT_PATH}")

if __name__ == "__main__":
    main()
