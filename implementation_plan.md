# Adicionar recurso de upload de arquivos (Focado no Vercel)

Como o objetivo é hospedar no **Vercel**, precisamos adaptar a forma como os arquivos são salvos. O Vercel utiliza "Serverless Functions" (Funções sem servidor) e seu sistema de arquivos é apenas leitura/temporário. Isso significa que **não podemos salvar arquivos em pastas locais do servidor**, pois eles seriam apagados automaticamente.

A solução nativa e recomendada pelo Vercel é utilizar o **Vercel Blob** (armazenamento na nuvem do Vercel). O site enviará os arquivos para uma Serverless Function, que fará o upload para o Vercel Blob organizando-os em "pastas" virtuais (usando prefixos no nome do arquivo).

## Open Questions

> [!IMPORTANT]
> 1. **Vercel Blob:** Para que isso funcione em produção, você precisará criar um projeto no Vercel, ir na aba "Storage", criar um "Vercel Blob", e adicionar a variável de ambiente `BLOB_READ_WRITE_TOKEN` no seu projeto Vercel. Você concorda com essa abordagem?

## Proposed Changes

### Frontend (`index.html`)
- Adicionar campos de upload (`<input type="file" multiple accept="image/*,video/*">`) nas seguintes seções:
  - "Mídia disponível" (Seção 2)
  - "Depoimentos de pacientes disponíveis" (Seção 4)
  - "Fotos da clínica disponíveis" (Seção 5)
- Adicionar código JavaScript para enviar esses arquivos via requisição (`fetch`) para a rota `/api/upload` assim que o usuário concluir o formulário ou selecionar os arquivos.

### Backend Vercel (`api/upload.js` e `package.json`)
- Criar a pasta `api/` com o arquivo `upload.js` (Serverless Function em Node.js).
- Instalar e configurar o pacote `@vercel/blob` para receber os uploads.
- O código da API vai salvar os arquivos no Vercel Blob com o prefixo da pasta, ex: `midia_sobre/nome_do_arquivo.jpg`, `depoimentos/foto.png`.
- Criar um `package.json` para instalar o `@vercel/blob`.

## Verification Plan

### Manual Verification
- Rodar o ambiente de desenvolvimento local do Vercel usando `vercel dev`.
- Fazer o upload de uma imagem na página.
- Verificar se a imagem foi processada pela Serverless Function e aparece salva no painel do Vercel Blob, dentro do "diretório" correto.
