type Orientation = "portrait" | "landscape";

export type SocialTemplateKey =
  | "instagram"
  | "tiktok"
  | "youtube"
  | "linkedin";

export interface ScriptSegment {
  id: string;
  title: string;
  text: string;
  duration: number;
}

export interface SocialTemplate {
  id: SocialTemplateKey;
  label: string;
  orientation: Orientation;
  defaultDuration: number;
  tone: string;
  hookStyle: string;
  structure: {
    intro: string;
    body: string;
    proof: string;
    callToAction: string;
  };
  hashtags: string[];
  notes: string[];
}

export const socialTemplates: Record<SocialTemplateKey, SocialTemplate> = {
  instagram: {
    id: "instagram",
    label: "Instagram Reels",
    orientation: "portrait",
    defaultDuration: 28,
    tone: "Vibrante, rápido e aspiracional",
    hookStyle: "Pergunta direta ou promessa ousada em até 5 palavras.",
    structure: {
      intro: "Abertura com close do produto e benefício imediato.",
      body: "Transição rápida destacando os diferenciais com cortes ágeis.",
      proof: "Exibição rápida de prova social ou depoimento curto.",
      callToAction:
        "Convite para experimentar com incentivo ao link na bio ou sticker.",
    },
    hashtags: [
      "#descobertareels",
      "#tendencia",
      "#novidade",
      "#inovacao",
      "#paravoce",
    ],
    notes: [
      "Legendas grandes e com alto contraste.",
      "Adicionar stickers e setas indicando o produto.",
    ],
  },
  tiktok: {
    id: "tiktok",
    label: "TikTok Short",
    orientation: "portrait",
    defaultDuration: 20,
    tone: "Autêntico, dinâmico e direto ao ponto",
    hookStyle: "Começa com uma reação ou algo surpreendente.",
    structure: {
      intro: "Comece com uma pergunta ousada ou trend visual.",
      body: "Demonstrar o produto com cortes rápidos e ângulos diferentes.",
      proof: "Mostrar resultado antes/depois ou expressão genuína.",
      callToAction: "Encerrar com chamada para seguir e clicar no link do perfil.",
    },
    hashtags: [
      "#fyp",
      "#paravoce",
      "#tiktokmefezcomprar",
      "#descobertas",
      "#inspiracao",
    ],
    notes: [
      "Use texto na tela sincronizado com a fala.",
      "Inclua movimento constante ou zoom in/out.",
    ],
  },
  youtube: {
    id: "youtube",
    label: "YouTube Shorts",
    orientation: "portrait",
    defaultDuration: 45,
    tone: "Educativo, confiante e com storytelling leve",
    hookStyle: "Promessa forte com números ou benefício concreto.",
    structure: {
      intro: "Headline clara com forte benefício visual.",
      body: "Explique em até dois pontos principais e uma história rápida.",
      proof: "Traga credibilidade com uma prova social ou dado.",
      callToAction:
        "Convite para acessar o link fixado na descrição ou comentários.",
    },
    hashtags: [
      "#shorts",
      "#reviewrapida",
      "#produtodoano",
      "#dicaexpress",
      "#imperdivel",
    ],
    notes: [
      "Sugestão de usar lower-third com título dos tópicos.",
      "Ritmo de cortes mais espaçados para permitir absorção.",
    ],
  },
  linkedin: {
    id: "linkedin",
    label: "LinkedIn Vertical",
    orientation: "portrait",
    defaultDuration: 60,
    tone: "Profissional, inspirador e orientado a resultados",
    hookStyle: "Pergunta estratégica ou insight estatístico.",
    structure: {
      intro: "Contextualize o problema de forma profissional.",
      body: "Destaque o produto como solução com foco em ROI.",
      proof: "Apresente dados, cases ou depoimentos corporativos.",
      callToAction:
        "Convite para conectar, agendar demo ou acessar o artigo completo.",
    },
    hashtags: [
      "#inovacao",
      "#transformacaodigital",
      "#casesucesso",
      "#growth",
      "#tendencias",
    ],
    notes: [
      "Use subtítulos com dados concretos.",
      "Mantenha ritmo mais calmo e profissional.",
    ],
  },
};

export function getTemplate(key: SocialTemplateKey): SocialTemplate {
  return socialTemplates[key] ?? socialTemplates.instagram;
}
