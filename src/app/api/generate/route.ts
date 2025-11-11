import { NextResponse } from "next/server";
import {
  getTemplate,
  ScriptSegment,
  SocialTemplateKey,
} from "@/lib/socialTemplates";

interface GeneratePayload {
  socialNetwork: SocialTemplateKey;
  productName: string;
  productBenefits: string;
  brandName: string;
  targetAudience: string;
  tone: string;
}

const HASHTAG_LIMIT = 6;

function createSegments(
  templateKey: SocialTemplateKey,
  {
    productName,
    productBenefits,
    brandName,
    targetAudience,
    tone,
  }: GeneratePayload,
): ScriptSegment[] {
  const template = getTemplate(templateKey);
  const benefits = productBenefits || "benefícios exclusivos";
  const audience = targetAudience || "sua audiência";
  const persona = brandName || "sua marca";
  const chosenTone = tone || template.tone;

  const intro: ScriptSegment = {
    id: "hook",
    title: "Abertura",
    duration: Math.min(6, template.defaultDuration * 0.2),
    text: `${template.hookStyle} ${audience}, conheça ${productName} – ${benefits
      .split(",")
      .map((part) => part.trim())
      .slice(0, 1)
      .join(" ")}`,
  };

  const body: ScriptSegment = {
    id: "body",
    title: "Demonstração",
    duration: Math.min(18, template.defaultDuration * 0.45),
    text: `${persona} apresenta: ${benefits
      .split(",")
      .map((part) => part.trim())
      .slice(0, 3)
      .join(". ")}.`,
  };

  const proof: ScriptSegment = {
    id: "proof",
    title: "Prova Social",
    duration: Math.min(10, template.defaultDuration * 0.2),
    text: `Clientes reais relatam: "${productName} transformou nossa rotina."`,
  };

  const cta: ScriptSegment = {
    id: "cta",
    title: "Chamada Final",
    duration: Math.max(5, template.defaultDuration - (intro.duration + body.duration + proof.duration)),
    text: `${template.structure.callToAction} ${audience}, garanta o seu hoje mesmo!`,
  };

  return [intro, body, proof, cta].map((segment) => ({
    ...segment,
    text: `${segment.text} (Tom: ${chosenTone.toLowerCase()})`,
  }));
}

function buildCaption(
  templateKey: SocialTemplateKey,
  data: GeneratePayload,
  segments: ScriptSegment[],
) {
  const template = getTemplate(templateKey);
  const points = segments.map((segment) => `• ${segment.title}: ${segment.text}`);
  return [
    `${data.productName} por ${data.brandName || "sua marca"}`,
    `Pensado para ${data.targetAudience || "quem busca inovação"}`,
    ...points,
    template.structure.callToAction,
  ].join("\n");
}

function composeHashtags(
  templateKey: SocialTemplateKey,
  productName: string,
): string[] {
  const template = getTemplate(templateKey);
  const normalized = productName
    .split(" ")
    .filter((chunk) => chunk.length > 2)
    .slice(0, 2)
    .map((chunk) => `#${chunk.replace(/[^a-zA-Z0-9]/g, "")}`);

  const combined = [...normalized, ...template.hashtags];
  const unique = Array.from(new Set(combined.map((tag) => tag.toLowerCase())));
  return unique.slice(0, HASHTAG_LIMIT);
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Partial<GeneratePayload>;
    const socialKey = (payload.socialNetwork || "instagram") as SocialTemplateKey;

    const validated: GeneratePayload = {
      socialNetwork: socialKey,
      productName: payload.productName || "Produto inovador",
      productBenefits:
        payload.productBenefits ||
        "resultado rápido, experiência premium, confiança garantida",
      brandName: payload.brandName || "Marca destaque",
      targetAudience: payload.targetAudience || "pessoas que buscam transformar o dia a dia",
      tone: payload.tone || "",
    };

    const segments = createSegments(socialKey, validated);
    const caption = buildCaption(socialKey, validated, segments);
    const hashtags = composeHashtags(socialKey, validated.productName);

    return NextResponse.json(
      {
        template: getTemplate(socialKey),
        segments,
        caption,
        hashtags,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("generation-error", error);
    return NextResponse.json(
      { error: "Falha ao gerar o roteiro. Tente novamente em instantes." },
      { status: 500 },
    );
  }
}
