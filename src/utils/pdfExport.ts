import { Character } from "@/interfaces/Character";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/**
 * Calcula o modificador de um atributo para o sistema Tormenta20
 */
function getAttrMod(attr: any): number {
  if (typeof attr === "object" && attr !== null) {
    // No T20, o valor total do atributo é o próprio modificador
    return attr.value?.total ?? attr.total ?? attr.mod ?? 0;
  }
  if (typeof attr === "number") {
    return attr;
  }
  return 0;
}

/**
 * Obtém o valor total de um atributo
 */
function getAttrTotal(attr: any): number {
  return getAttrMod(attr);
}

/**
 * Cria um elemento HTML temporário com a ficha do personagem
 */
function createCharacterSheetHTML(character: Character): HTMLElement {
  const container = document.createElement("div");
  container.style.cssText = `
    width: 210mm;
    background: white;
    padding: 20mm;
    font-family: 'Helvetica', 'Arial', sans-serif;
    color: #1c1917;
    box-sizing: border-box;
  `;

  // Calcular estatísticas (Tormenta20)
  const conMod = getAttrMod(character.attributes?.Constituição);
  const hpBase = character.class?.pv || 16;
  const hpMax = hpBase + conMod;

  const pmBase = character.class?.pm || 4;
  const pmMax = pmBase;

  const dexMod = getAttrMod(character.attributes?.Destreza);
  const armorPenalty = (character.bag as any)?.armorPenalty || 0;
  const defense = 10 + dexMod + armorPenalty;

  // Dinheiro
  const money = character.money || 0;
  const gold = typeof money === "number" ? money : (money as any).gold || 0;
  const silver = typeof money === "number" ? 0 : (money as any).silver || 0;
  const copper = typeof money === "number" ? 0 : (money as any).copper || 0;

  container.innerHTML = `
    <style>
      .pdf-header {
        background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%);
        color: white;
        padding: 20px;
        margin: -20mm -20mm 20px -20mm;
        text-align: center;
      }
      .pdf-header h1 {
        margin: 0 0 10px 0;
        font-size: 32px;
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 2px;
      }
      .pdf-header p {
        margin: 0;
        font-size: 16px;
        opacity: 0.95;
      }
      .section {
        margin-bottom: 20px;
        page-break-inside: avoid;
      }
      .section-title {
        background: #d97706;
        color: white;
        padding: 8px 12px;
        font-size: 14px;
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 10px;
      }
      .field {
        margin-bottom: 8px;
        font-size: 12px;
      }
      .field-label {
        font-weight: bold;
        color: #78716c;
      }
      .field-value {
        color: #1c1917;
      }
      .attributes-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
        margin-bottom: 20px;
      }
      .attribute-box {
        border: 2px solid #d97706;
        border-radius: 8px;
        padding: 12px;
        text-align: center;
      }
      .attribute-name {
        font-size: 10px;
        color: #78716c;
        font-weight: bold;
        text-transform: uppercase;
        margin-bottom: 5px;
      }
      .attribute-value {
        font-size: 28px;
        font-weight: bold;
        color: #d97706;
      }
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 15px;
        margin-bottom: 20px;
      }
      .stat-box {
        border: 2px solid #e7e5e4;
        border-radius: 8px;
        padding: 12px;
        text-align: center;
      }
      .stat-label {
        font-size: 10px;
        color: #78716c;
        font-weight: bold;
        text-transform: uppercase;
        margin-bottom: 5px;
      }
      .stat-value {
        font-size: 20px;
        font-weight: bold;
        color: #1c1917;
      }
      .list-item {
        background: #fafaf9;
        border: 1px solid #e7e5e4;
        border-radius: 6px;
        padding: 10px;
        margin-bottom: 8px;
        font-size: 11px;
      }
      .list-item-title {
        font-weight: bold;
        color: #1c1917;
        margin-bottom: 4px;
      }
      .list-item-desc {
        color: #57534e;
        font-style: italic;
        line-height: 1.4;
      }
      .inventory-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
      }
      .money-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
      }
      .skills-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
      }
      .skill-item {
        font-size: 11px;
        color: #1c1917;
        padding: 6px 10px;
        background: #fafaf9;
        border-left: 3px solid #d97706;
        border-radius: 4px;
      }
    </style>

    <!-- HEADER -->
    <div class="pdf-header">
      <h1>${character.name || "Personagem"}</h1>
      <p>${character.race?.name || "Raça"} (${
    character.race?.subrace || ""
  }) • ${character.class?.name || "Classe"} Nível ${character.level || 1}</p>
    </div>

    <!-- INFORMAÇÕES BÁSICAS -->
    <div class="section">
      <div class="section-title">Informações Básicas</div>
      <div class="field">
        <span class="field-label">Nome:</span>
        <span class="field-value">${character.name || "Não definido"}</span>
      </div>
      <div class="field">
        <span class="field-label">Raça:</span>
        <span class="field-value">${character.race?.name || "Não definida"} ${
    character.race?.subrace ? `(${character.race.subrace})` : ""
  }</span>
      </div>
      <div class="field">
        <span class="field-label">Classe:</span>
        <span class="field-value">${
          character.class?.name || "Não definida"
        }</span>
      </div>
      <div class="field">
        <span class="field-label">Nível:</span>
        <span class="field-value">${character.level || 1}</span>
      </div>
      <div class="field">
        <span class="field-label">Origem:</span>
        <span class="field-value">${
          character.origin?.name ||
          (character as any).originName ||
          "Não definida"
        }</span>
      </div>
      ${
        character.physicalTraits
          ? `
        <div class="field">
          <span class="field-label">Traços Físicos:</span>
          <span class="field-value">
            ${
              character.physicalTraits.gender
                ? `Gênero: ${character.physicalTraits.gender}. `
                : ""
            }
            ${
              character.physicalTraits.height
                ? `Altura: ${character.physicalTraits.height}. `
                : ""
            }
            ${
              character.physicalTraits.hair
                ? `Cabelo: ${character.physicalTraits.hair}. `
                : ""
            }
            ${
              character.physicalTraits.eyes
                ? `Olhos: ${character.physicalTraits.eyes}. `
                : ""
            }
            ${
              character.physicalTraits.skin
                ? `Pele: ${character.physicalTraits.skin}. `
                : ""
            }
            ${
              character.physicalTraits.scars
                ? `Cicatrizes: ${character.physicalTraits.scars}. `
                : ""
            }
            ${
              character.physicalTraits.extra
                ? `Outros: ${character.physicalTraits.extra}`
                : ""
            }
          </span>
        </div>
      `
          : ""
      }
    </div>

    <!-- ATRIBUTOS -->
    <div class="section">
      <div class="section-title">Atributos</div>
      <div class="attributes-grid">
        ${[
          "Força",
          "Destreza",
          "Constituição",
          "Inteligência",
          "Sabedoria",
          "Carisma",
        ]
          .map((attrName) => {
            const attrKey = attrName as keyof typeof character.attributes;
            const attr = character.attributes?.[attrKey];
            const total = getAttrTotal(attr);
            return `
              <div class="attribute-box">
                <div class="attribute-name">${attrName}</div>
                <div class="attribute-value">${total}</div>
              </div>
            `;
          })
          .join("")}
      </div>
    </div>

    <!-- ESTATÍSTICAS DE COMBATE -->
    <div class="section">
      <div class="section-title">Estatísticas de Combate</div>
      <div class="stats-grid">
        <div class="stat-box">
          <div class="stat-label">Pontos de Vida (PV)</div>
          <div class="stat-value">${hpMax}</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">Pontos de Mana (PM)</div>
          <div class="stat-value">${pmMax}</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">Defesa</div>
          <div class="stat-value">${defense}</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">Deslocamento</div>
          <div class="stat-value">${character.race?.deslocamento || "9m"}</div>
        </div>
      </div>
    </div>

    <!-- DINHEIRO -->
    <div class="section">
      <div class="section-title">Dinheiro</div>
      <div class="money-grid">
        <div class="stat-box">
          <div class="stat-label">Tibares (T$)</div>
          <div class="stat-value">${gold}</div>
        </div>
        ${
          silver > 0
            ? `
          <div class="stat-box">
            <div class="stat-label">Prata</div>
            <div class="stat-value">${silver}</div>
          </div>
        `
            : ""
        }
        ${
          copper > 0
            ? `
          <div class="stat-box">
            <div class="stat-label">Cobre</div>
            <div class="stat-value">${copper}</div>
          </div>
        `
            : ""
        }
      </div>
    </div>

    <!-- PERÍCIAS -->
    ${
      character.skills && character.skills.length > 0
        ? `
      <div class="section">
        <div class="section-title">Perícias</div>
        <div class="skills-grid">
          ${character.skills
            .map((skill: any) => {
              const name =
                typeof skill === "string" ? skill : skill.name || skill.nome;
              return `<div class="skill-item">${name}</div>`;
            })
            .join("")}
        </div>
      </div>
    `
        : ""
    }

    <!-- INVENTÁRIO -->
    ${(() => {
      const bag = character.bag as any;
      let items: any[] = [];

      if (bag) {
        if (Array.isArray(bag.items)) {
          items = bag.items;
        } else if (bag.equipments) {
          // Flatten categories from BagEquipments
          items = Object.values(bag.equipments).flat();
        }
      }

      if (items.length === 0) return "";

      return `
        <div class="section">
          <div class="section-title">Inventário</div>
          <div class="inventory-grid">
            ${items
              .map(
                (item: any) => `
              <div class="list-item">
                <div class="list-item-title">
                  ${item.name || item.nome}
                  ${item.quantidade > 1 ? ` (x${item.quantidade})` : ""}
                </div>
                ${
                  item.description || item.text
                    ? `
                  <div class="list-item-desc">${
                    item.description || item.text
                  }</div>
                `
                    : ""
                }
              </div>
            `
              )
              .join("")}
          </div>
        </div>
      `;
    })()}

    <!-- HABILIDADES DE RAÇA -->
    ${
      character.race?.abilities && character.race.abilities.length > 0
        ? `
      <div class="section">
        <div class="section-title">Habilidades de Raça</div>
        ${character.race.abilities
          .map(
            (ability: any) => `
          <div class="list-item">
            <div class="list-item-title">${ability.name || ability.nome}</div>
            ${
              ability.description || ability.text
                ? `
              <div class="list-item-desc">${
                ability.description || ability.text
              }</div>
            `
                : ""
            }
          </div>
        `
          )
          .join("")}
      </div>
    `
        : ""
    }

    <!-- BENEFÍCIOS DE ORIGEM -->
    ${
      (character as any).originBenefits &&
      (character as any).originBenefits.length > 0
        ? `
      <div class="section">
        <div class="section-title">Benefícios de Origem</div>
        ${(character as any).originBenefits
          .map((benefit: any) => {
            // Description might be in value.text or value.description if value is an object
            // If value is just a string (e.g. skill name), no description.
            const description =
              typeof benefit.value === "object"
                ? benefit.value.text || benefit.value.description
                : "";

            return `
          <div class="list-item">
            <div class="list-item-title">${benefit.name}</div>
            ${
              description
                ? `
              <div class="list-item-desc">${description}</div>
            `
                : ""
            }
          </div>
        `;
          })
          .join("")}
      </div>
    `
        : ""
    }

    <!-- HABILIDADES DE CLASSE -->
    ${
      character.class?.abilities && character.class.abilities.length > 0
        ? `
      <div class="section">
        <div class="section-title">Habilidades de Classe</div>
        ${character.class.abilities
          .filter(
            (ability: any) =>
              !ability.nivel || ability.nivel <= (character.level || 1)
          )
          .map(
            (ability: any) => `
          <div class="list-item">
            <div class="list-item-title">${ability.name || ability.nome}</div>
            ${
              ability.description || ability.text
                ? `
              <div class="list-item-desc">${
                ability.description || ability.text
              }</div>
            `
                : ""
            }
          </div>
        `
          )
          .join("")}
      </div>
    `
        : ""
    }

    <!-- PODERES DE CLASSE -->
    ${
      (character as any).classPowers &&
      (character as any).classPowers.length > 0
        ? `
      <div class="section">
        <div class="section-title">Poderes de Classe</div>
        ${(character as any).classPowers
          .map(
            (power: any) => `
          <div class="list-item">
            <div class="list-item-title">${power.name || power.nome}</div>
            ${
              power.cost
                ? `<div style="font-size: 10px; color: #78716c; margin-top: 3px;">Custo: ${power.cost}</div>`
                : ""
            }
            ${
              power.range
                ? `<div style="font-size: 10px; color: #78716c;">Alcance: ${power.range}</div>`
                : ""
            }
            ${
              power.duration
                ? `<div style="font-size: 10px; color: #78716c;">Duração: ${power.duration}</div>`
                : ""
            }
            ${
              power.description || power.text
                ? `
              <div class="list-item-desc">${
                power.description || power.text
              }</div>
            `
                : ""
            }
          </div>
        `
          )
          .join("")}
      </div>
    `
        : ""
    }

    <!-- PROFICIÊNCIAS -->
    ${
      character.class?.proficiencias && character.class.proficiencias.length > 0
        ? `
      <div class="section">
        <div class="section-title">Proficiências</div>
        ${character.class.proficiencias
          .map(
            (prof: string) => `
          <div class="list-item"><div class="list-item-title">${prof}</div></div>
        `
          )
          .join("")}
      </div>
    `
        : ""
    }
  `;

  return container;
}

/**
 * Exporta as informações do personagem para um PDF usando HTML2Canvas
 */
export async function exportCharacterToPDF(character: Character) {
  try {
    // Criar elemento HTML temporário
    const htmlElement = createCharacterSheetHTML(character);
    document.body.appendChild(htmlElement);

    // Aguardar um momento para renderização
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Converter para canvas
    const canvas = await html2canvas(htmlElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });

    // Remover elemento temporário
    document.body.removeChild(htmlElement);

    // Criar PDF
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * pageWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // Adicionar primeira página
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Adicionar páginas adicionais se necessário
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Salvar o PDF
    const fileName = `${
      character.name?.replace(/\s+/g, "_") || "personagem"
    }_ficha.pdf`;
    pdf.save(fileName);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
}
