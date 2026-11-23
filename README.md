# Chat web mínimo con Mistral AI

App web minimalista con interfaz de chat que llama a la API de Mistral usando el SDK oficial de TypeScript (`@mistralai/mistralai`). La clave `MISTRAL_API_KEY` se usa únicamente en el servidor: el navegador solo habla con `/api/chat` y nunca ve la clave.

- **Modelo:** `mistral-small-latest`
- **Servidor:** Node + Express + TypeScript (se ejecuta con `tsx`, sin paso de build)
- **Streaming:** el servidor transmite la respuesta por SSE (Server-Sent Events)
- **Historial:** se mantiene en el cliente y se envía en cada petición (el servidor es sin estado)

## Requisitos

- Node.js 18+ (probado con Node 22)

## Instalación

```bash
npm install
```

## Configuración

Exporta tu clave de API antes de arrancar (o copia `.env.example` a `.env`: el servidor la carga con `dotenv`):

```bash
cp .env.example .env
# edita .env y pon tu clave real
export MISTRAL_API_KEY="tu-clave"   # alternativa: exportarla directamente
```

Consigue una clave gratuita en https://console.mistral.ai

## Ejecución

```bash
npm run dev      # con recarga automática
# o
npm start
```

Abre http://localhost:3000

Puerto personalizable con `PORT` (por defecto 3000).
