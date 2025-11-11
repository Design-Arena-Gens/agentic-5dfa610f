## CreatorLab Video Studio

Aplicativo web em Next.js que gera roteiros, legendas e vídeo vertical com avatar inteligente para divulgação de produtos nas principais redes sociais.

### Funcionalidades
- Upload da foto da modelo com o produto e pré-visualização instantânea.
- Seleção de rede social (Instagram, TikTok, YouTube, LinkedIn) com adaptação automática de tom, CTA e duração.
- Geração de roteiro completo, legenda otimizada e hashtags estratégicas via API interna.
- Composição de vídeo `.webm` usando Canvas + MediaRecorder, pronto para download e publicação.

### Executando localmente

```bash
yarn install
yarn dev
```

O projeto estará disponível em [http://localhost:3000](http://localhost:3000).

### Deploy

O projeto está preparado para deploy na Vercel (`vercel.json` não é necessário). Use `vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-5dfa610f` conforme instruções.
