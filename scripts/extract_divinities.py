import fitz
import sys

PDF_PATH = r"C:/Users/welde/Dev/Projetos/rpg-cousins/src/data/T20 - Livro Básico.pdf"
OUTPUT_PATH = r"C:/Users/welde/Dev/Projetos/rpg-cousins/temp_divinities_text.txt"

def extract_divinities():
    try:
        doc = fitz.open(PDF_PATH)
        start_page = 95 # Page 96 in book (approx)
        end_page = 118  # Page 119 in book (approx)
        
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
    extract_divinities()
