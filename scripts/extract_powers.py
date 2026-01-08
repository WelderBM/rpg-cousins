import fitz
import sys

PDF_PATH = r"C:/Users/welde/Dev/Projetos/rpg-cousins/src/data/T20 - Livro Básico.pdf"
OUTPUT_PATH = r"C:/Users/welde/Dev/Projetos/rpg-cousins/temp_powers_text.txt"

def extract_powers():
    try:
        doc = fitz.open(PDF_PATH)
        start_page = 119 # Page 120
        end_page = 149   # Page 150
        
        print(f"Starting extraction at page {start_page + 1}")
        
        text = ""
        for i in range(start_page, min(end_page, len(doc))):
            page_text = doc[i].get_text()
            text += f"\n--- Page {i+1} ---\n"
            text += page_text
            
        with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
            f.write(text)
            
        print(f"Extracted content to {OUTPUT_PATH}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    extract_powers()
