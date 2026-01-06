import os
import re
import fitz
from openai import OpenAI
import json
import glob

PDF_PATH = r"C:/Users/welde/Dev/Projetos/rpg-cousins/src/data/T20 - Livro Básico.pdf"
DATA_DIR = r"C:/Users/welde/Dev/Projetos/rpg-cousins/src/data"
REPORT_PATH = r"C:/Users/welde/Dev/Projetos/rpg-cousins/AUDIT_REPORT.md"

class T20Auditor:
    def __init__(self, pdf_path, openai_key=None):
        if not os.path.exists(pdf_path):
            raise FileNotFoundError(f"PDF não encontrado em: {pdf_path}")
        self.doc = fitz.open(pdf_path)
        self.openai_key = openai_key
        self.client = OpenAI(api_key=openai_key) if openai_key else None

    def search_section(self, title, start_page=0, max_pages=10):
        """Busca o início de uma seção (ex: 'RAÇAS')"""
        for i in range(start_page, len(self.doc)):
            text = self.doc[i].get_text()
            if title.upper() in text.upper():
                return i
        return start_page

    def extract_text(self, pages_list):
        """Extrai o texto de uma lista de páginas"""
        text = ""
        for i in pages_list:
            if 0 <= i < len(self.doc):
                text += f"\n--- Page {i+1} ---\n"
                text += self.doc[i].get_text()
        return text

    def extract_item_text(self, item_name, start_page, num_pages=3):
        """Extrai o texto de um item específico (ex: 'Anão')"""
        found_page = -1
        # Aumentando o range de busca para 150 páginas para cobrir o livro todo se necessário
        for i in range(start_page, min(start_page + 150, len(self.doc))):
            text = self.doc[i].get_text()
            # Busca o nome do item como um título ou destaque
            # Usando regex para garantir que é a palavra inteira e evitar falsos positivos
            if re.search(rf'\b{re.escape(item_name)}\b', text, re.IGNORECASE):
                found_page = i
                break
        
        if found_page != -1:
            return self.extract_text(range(found_page, min(found_page + num_pages, len(self.doc))))
        return None

    def get_code_content(self, file_path, item_name):
        """Lê o arquivo de código e tenta isolar o objeto do item"""
        if not os.path.exists(file_path):
            return None
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            # Tenta encontrar a definição do objeto (ex: const ANAO: Race = { ... })
            # Se não conseguir isolar perfeitamente, manda o arquivo todo (mais seguro)
            return content

    def audit(self, item_name, pdf_text, code_text, file_name):
        if not self.client:
            return f"ERRO: OpenAI API Key não configurada para {item_name}"

        system_prompt = (
            "Você é um auditor especializado no sistema de RPG Tormenta 20. "
            "Sua tarefa é comparar o texto extraído do manual oficial (PDF) com a implementação no código (TypeScript). "
            "FOCO: Compare os bônus de atributos e habilidades. "
            "REGRA DE OURO: Se houver diferença, verifique se a versão no código corresponde à Errata da Versão Jogo do Ano (JdA). "
            "Se for apenas um erro de digitação ou valor desatualizado, sugira a correção. "
            "Se no código estiver explicitamente citando bônus que não estão no PDF mas fazem sentido na JdA, considere correto mas mencione.\n"
            "Responda EXCLUSIVAMENTE no formato tabular:\n"
            "[ARQUIVO] -> [ITEM] -> [VALOR ATUAL] -> [VALOR SUGERIDO] -> [MOTIVO]"
        )

        user_prompt = (
            f"ARQUIVO: {file_name}\n"
            f"ITEM: {item_name}\n\n"
            f"--- TEXTO DO PDF ---\n{pdf_text}\n\n"
            f"--- CÓDIGO ATUAL ---\n{code_text}"
        )

        try:
            response = self.client.chat.completions.create(
                model="gpt-4o", # Ou gpt-3.5-turbo se preferir
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"ERRO na API para {item_name}: {str(e)}"

def run_audit(api_key):
    auditor = T20Auditor(PDF_PATH, api_key)
    
    report_lines = ["# RELATÓRIO DE AUDITORIA T20\n"]
    
    # 1. Auditoria de Raças
    print("Auditando Raças...")
    race_files = glob.glob(os.path.join(DATA_DIR, "races", "*.ts"))
    race_start = auditor.search_section("RAÇAS", 20)
    
    for fpath in race_files:
        item_name = os.path.basename(fpath).replace(".ts", "").capitalize()
        # Tratamento especial para nomes de arquivos vs nomes reais se necessário
        # Ex: anao -> Anão
        if item_name == "Anao": item_name = "Anão"
        
        print(f" -> Processando {item_name}...")
        pdf_text = auditor.extract_item_text(item_name, race_start, num_pages=2)
        code_text = auditor.get_code_content(fpath, item_name)
        
        if pdf_text and code_text:
            result = auditor.audit(item_name, pdf_text, code_text, os.path.basename(fpath))
            report_lines.append(result)
        else:
            report_lines.append(f"AVISO: Não foi possível extrair dados para {item_name}")

    # 2. Auditoria de Classes
    print("Auditando Classes...")
    class_files = glob.glob(os.path.join(DATA_DIR, "classes", "*.ts"))
    class_start = auditor.search_section("CLASSES", 40)

    for fpath in class_files:
        item_name = os.path.basename(fpath).replace(".ts", "").capitalize()
        # Mapeamentos de nomes se necessário
        if item_name == "Barbaro": item_name = "Bárbaro"
        if item_name == "Cacador": item_name = "Caçador"
        if item_name == "Clerigo": item_name = "Clérigo"
        if item_name == "Indice": continue # Ignorar index.ts
        
        print(f" -> Processando {item_name}...")
        pdf_text = auditor.extract_item_text(item_name, class_start, num_pages=5)
        code_text = auditor.get_code_content(fpath, item_name)
        
        if pdf_text and code_text:
            result = auditor.audit(item_name, pdf_text, code_text, os.path.basename(fpath))
            report_lines.append(result)
        else:
            report_lines.append(f"AVISO: Não foi possível extrair dados para {item_name}")

    # 3. Auditoria de Magias
    print("Auditando Magias...")
    spell_files = [
        os.path.join(DATA_DIR, "magias", "arcane.ts"),
        os.path.join(DATA_DIR, "magias", "divine.ts")
    ]
    spell_start = auditor.search_section("MAGIAS", 150)

    for fpath in spell_files:
        if not os.path.exists(fpath): continue
        print(f" -> Processando arquivo de magias {os.path.basename(fpath)}...")
        # Como arquivos de magias são listas grandes, aqui poderíamos extrair magias individuais 
        # mas por simplicidade e custo de tokens, vamos focar no cabeçalho ou magias principais
        # Se o usuário quiser auditar TODAS as magias, o script precisaria de um loop interno.
        # Para este MVP, processaremos o arquivo como um todo ou deixaremos nota.
        code_text = auditor.get_code_content(fpath, "Magias")
        # Busca genérica na seção de magias (primeiras 20 páginas da seção)
        pdf_text = auditor.extract_text(list(range(spell_start, min(spell_start + 20, len(auditor.doc)))))
        
        if pdf_text and code_text:
            result = auditor.audit("Grupo de Magias", pdf_text, code_text, os.path.basename(fpath))
            report_lines.append(result)

    # Salvar Relatório
    with open(REPORT_PATH, "w", encoding="utf-8") as rf:
        rf.write("\n\n".join(report_lines))
    
    print(f"\nAuditoria concluída! Relatório gerado em: {REPORT_PATH}")

if __name__ == "__main__":
    import sys
    # A chave será pedida pelo usuário conforme instrução
    key = os.getenv("OPENAI_API_KEY")
    if not key:
        print("ERRO: A variável de ambiente OPENAI_API_KEY não foi encontrada.")
        print("Por favor, execute: $env:OPENAI_API_KEY='sua_chave_aqui' (PowerShell)")
        sys.exit(1)
    
    run_audit(key)
