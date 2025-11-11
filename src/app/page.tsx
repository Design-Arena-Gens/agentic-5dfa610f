"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import clsx from "clsx";

import type { ScriptSegment, SocialTemplateKey } from "@/lib/socialTemplates";
import { getTemplate, socialTemplates } from "@/lib/socialTemplates";
import { composeVideo } from "@/lib/videoComposer";

type GenerationResult = {
  template: ReturnType<typeof getTemplate>;
  segments: ScriptSegment[];
  caption: string;
  hashtags: string[];
};

const socialOptions: { label: string; value: SocialTemplateKey }[] = [
  { label: "Instagram Reels", value: "instagram" },
  { label: "TikTok Short", value: "tiktok" },
  { label: "YouTube Shorts", value: "youtube" },
  { label: "LinkedIn Vertical", value: "linkedin" },
];

const defaultBenefits =
  "resultado rápido, experiência premium, prova social autêntica";

export default function Home() {
  const [productName, setProductName] = useState("");
  const [productBenefits, setProductBenefits] = useState(defaultBenefits);
  const [brandName, setBrandName] = useState("");
  const [targetAudience, setTargetAudience] = useState("seguidores que amam novidades");
  const [tone, setTone] = useState("");
  const [socialNetwork, setSocialNetwork] =
    useState<SocialTemplateKey>("instagram");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
      if (videoSrc) {
        URL.revokeObjectURL(videoSrc);
      }
    };
  }, [imagePreview, videoSrc]);

  const selectedTemplate = useMemo(
    () => socialTemplates[socialNetwork],
    [socialNetwork],
  );

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Envie uma imagem válida (JPEG, PNG ou WEBP).");
      return;
    }
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setError(null);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleGenerate = async () => {
    if (!imageFile || !imagePreview) {
      setError("Envie a foto da modelo com o produto para começar.");
      return;
    }
    if (!productName.trim()) {
      setError("Informe o nome do produto para personalizar o roteiro.");
      return;
    }

    setIsGenerating(true);
    setIsComposing(false);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          socialNetwork,
          productName,
          productBenefits,
          brandName,
          targetAudience,
          tone,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Falha ao gerar o roteiro.");
      }

      const data = (await response.json()) as GenerationResult;
      setResult(data);
      setIsGenerating(false);

      setIsComposing(true);
      const composed = await composeVideo({
        imageSrc: imagePreview,
        segments: data.segments,
        orientation: data.template.orientation,
      });

      if (videoSrc) {
        URL.revokeObjectURL(videoSrc);
      }
      setVideoSrc(composed);
    } catch (generationError) {
      console.error(generationError);
      setError(
        generationError instanceof Error
          ? generationError.message
          : "Erro inesperado. Tente novamente.",
      );
    } finally {
      setIsGenerating(false);
      setIsComposing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="border-b border-white/5 bg-slate-950/60 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-300">
              <span className="text-xl font-semibold">AI</span>
            </div>
            <div>
              <p className="text-lg font-semibold">CreatorLab Video Studio</p>
              <p className="text-sm text-slate-400">
                Gere vídeos com avatar realista adaptados para cada rede social.
              </p>
            </div>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-sm text-slate-300 md:flex">
            <div className="h-2 w-2 rounded-full bg-emerald-400" />
            Studio pronto para gerar
          </div>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-12 lg:grid-cols-[1.05fr_1fr]">
        <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-8 shadow-xl shadow-slate-950/40">
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-2xl font-semibold">
                1. Configure a sua campanha
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Envie a foto da modelo, descreva o produto e escolha a rede
                social. A IA adapta roteiro, legendas e proporção automaticamente.
              </p>
            </div>

            <div className="flex flex-col gap-8">
              <label className="grid gap-3 rounded-2xl border border-dashed border-cyan-400/40 bg-cyan-500/5 p-6 text-center transition hover:border-cyan-300/80 hover:bg-cyan-500/10">
                <span className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-200">
                  Upload da modelo + produto
                </span>
                {imagePreview ? (
                  <div className="relative mx-auto h-60 w-52 overflow-hidden rounded-xl border border-white/10 shadow-lg shadow-cyan-500/20">
                    <Image
                      src={imagePreview}
                      alt="Pré-visualização enviada"
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="mx-auto flex h-60 w-52 flex-col items-center justify-center gap-3 rounded-xl border border-white/5 bg-slate-950/40 text-sm text-slate-400">
                    <span>Arraste e solte ou clique para enviar</span>
                    <span className="rounded-full bg-slate-950 px-3 py-1 text-xs text-slate-500">
                      Formatos: JPG, PNG, WEBP
                    </span>
                  </div>
                )}
                <input
                  onChange={handleFileChange}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-200">
                    Nome do produto
                  </label>
                  <input
                    value={productName}
                    onChange={(event) => setProductName(event.target.value)}
                    placeholder="Ex: Glow Serum Ultra Light"
                    className="rounded-xl border border-white/5 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none ring-2 ring-transparent transition focus:border-cyan-400/60 focus:ring-cyan-500/30"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-200">
                    Nome da marca
                  </label>
                  <input
                    value={brandName}
                    onChange={(event) => setBrandName(event.target.value)}
                    placeholder="Ex: Aurora Labs"
                    className="rounded-xl border border-white/5 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none ring-2 ring-transparent transition focus:border-cyan-400/60 focus:ring-cyan-500/30"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-200">
                    Benefícios e diferenciais
                  </label>
                  <textarea
                    value={productBenefits}
                    onChange={(event) => setProductBenefits(event.target.value)}
                    rows={3}
                    placeholder="Liste diferenciais separados por vírgula."
                    className="resize-none rounded-xl border border-white/5 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none ring-2 ring-transparent transition focus:border-cyan-400/60 focus:ring-cyan-500/30"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-200">
                    Público alvo
                  </label>
                  <textarea
                    value={targetAudience}
                    onChange={(event) => setTargetAudience(event.target.value)}
                    rows={3}
                    placeholder="Quem você quer impactar? Ex: criadores de conteúdo, profissionais de beleza..."
                    className="resize-none rounded-xl border border-white/5 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none ring-2 ring-transparent transition focus:border-cyan-400/60 focus:ring-cyan-500/30"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-[1fr_0.6fr]">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-200">
                    Escolha a rede social
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {socialOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setSocialNetwork(option.value)}
                        type="button"
                        className={clsx(
                          "rounded-xl border px-4 py-3 text-left transition focus:outline-none focus:ring-2 focus:ring-cyan-400/60",
                          socialNetwork === option.value
                            ? "border-cyan-400/80 bg-cyan-500/10 text-cyan-100"
                            : "border-white/10 bg-slate-950/40 text-slate-300 hover:border-cyan-500/30 hover:bg-cyan-500/10 hover:text-cyan-100",
                        )}
                      >
                        <span className="block text-sm font-semibold">
                          {option.label}
                        </span>
                        <span className="mt-1 block text-xs text-slate-400">
                          {socialTemplates[option.value].tone}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-200">
                    Tom desejado (opcional)
                  </label>
                  <input
                    value={tone}
                    onChange={(event) => setTone(event.target.value)}
                    placeholder="Ex: energético, luxo, descontraído..."
                    className="rounded-xl border border-white/5 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none ring-2 ring-transparent transition focus:border-cyan-400/60 focus:ring-cyan-500/30"
                  />
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="group relative flex items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-500 px-6 py-4 text-base font-semibold text-slate-950 shadow-lg shadow-cyan-500/40 transition focus:outline-none focus:ring-4 focus:ring-cyan-300/40 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isGenerating ? (
                  <span className="flex items-center gap-3">
                    <span className="h-2 w-2 animate-ping rounded-full bg-slate-950" />
                    Gerando roteiro personalizado...
                  </span>
                ) : (
                  <>Gerar divulgação com IA</>
                )}
              </button>
              {error && (
                <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-200">
                  {error}
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="flex h-max flex-col gap-6 rounded-3xl border border-white/10 bg-slate-900/40 p-8 shadow-xl shadow-slate-950/30">
          <div>
            <h2 className="text-2xl font-semibold">
              2. Pré-visualize o vídeo e roteiro
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Ganhamos velocidade na criação, mantendo consistência de linguagem
              e formatos ideais para {selectedTemplate.label}.
            </p>
          </div>

          <div className="relative flex aspect-[9/16] w-full items-center justify-center overflow-hidden rounded-2xl border border-white/5 bg-slate-950">
            {videoSrc ? (
              <video
                src={videoSrc}
                controls
                playsInline
                className="h-full w-full object-cover"
              />
            ) : imagePreview ? (
              <Image
                src={imagePreview}
                alt="Pré-visualização"
                fill
                className="object-cover opacity-70"
              />
            ) : (
              <div className="flex flex-col items-center gap-3 text-sm text-slate-500">
                O vídeo gerado aparece aqui
              </div>
            )}
            {isComposing && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70 backdrop-blur">
                <div className="flex flex-col items-center gap-3">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
                  <span className="text-sm text-cyan-100">
                    Compondo vídeo com avatar inteligente...
                  </span>
                </div>
              </div>
            )}
          </div>

          {videoSrc && (
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100">
              <span>Baixe e publique imediatamente no formato ideal.</span>
              <a
                href={videoSrc}
                download={`${productName || "campanha"}-${socialNetwork}.webm`}
                className="rounded-xl border border-cyan-300/40 bg-cyan-400/20 px-4 py-2 font-semibold text-cyan-50 transition hover:border-cyan-200/60 hover:bg-cyan-300/30"
              >
                Baixar vídeo .webm
              </a>
            </div>
          )}

          {result ? (
            <div className="flex flex-col gap-6">
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
                <h3 className="text-lg font-semibold text-cyan-200">
                  Estrutura adaptada para {result.template.label}
                </h3>
                <p className="mt-1 text-xs uppercase tracking-[0.3em] text-slate-500">
                  {result.template.tone}
                </p>
                <ul className="mt-4 space-y-3 text-sm text-slate-300">
                  <li>
                    <span className="font-semibold text-slate-100">Intro:</span>{" "}
                    {result.template.structure.intro}
                  </li>
                  <li>
                    <span className="font-semibold text-slate-100">Desenvolvimento:</span>{" "}
                    {result.template.structure.body}
                  </li>
                  <li>
                    <span className="font-semibold text-slate-100">Prova:</span>{" "}
                    {result.template.structure.proof}
                  </li>
                  <li>
                    <span className="font-semibold text-slate-100">CTA:</span>{" "}
                    {result.template.structure.callToAction}
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-5">
                <h3 className="text-lg font-semibold text-cyan-200">
                  Roteiro automático
                </h3>
                <div className="mt-4 space-y-4">
                  {result.segments.map((segment) => (
                    <div
                      key={segment.id}
                      className="rounded-xl border border-cyan-400/20 bg-cyan-500/5 p-4"
                    >
                      <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-cyan-200">
                        <span>{segment.title}</span>
                        <span>{segment.duration.toFixed(0)}s</span>
                      </div>
                      <p className="mt-2 text-sm text-slate-200">
                        {segment.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-5">
                <h3 className="text-lg font-semibold text-cyan-200">
                  Legenda otimizada
                </h3>
                <pre className="mt-2 whitespace-pre-wrap rounded-xl border border-white/10 bg-slate-950/40 p-4 text-sm text-slate-200">
                  {result.caption}
                </pre>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-cyan-200">
                  {result.hashtags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-6 text-sm text-slate-400">
              Após gerar sua divulgação, o roteiro completo, legenda e hashtags
              personalizados aparecem aqui.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
