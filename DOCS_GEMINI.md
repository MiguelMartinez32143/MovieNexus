# Documentación del Sistema de Chat Cinéfilo IA (Lumiere)

Este documento proporciona el contexto técnico, la arquitectura y las pautas de seguridad del sistema de Chat con Inteligencia Artificial integrado en el proyecto **MovieNexus**.

## 1. Arquitectura del Sistema

El flujo de comunicación del chat está diseñado en tres capas para asegurar el desacoplamiento y la seguridad de las claves de API:

```
[Cliente (Componente Angular)]
             │
             ▼ (Historial y Mensaje vía Signal)
[Servicio Angular (GeminiService)]
             │
             ▼ (Llamada POST segura a /api/chat)
[Proxy Backend (Vercel API / Express)]
             │
             ▼ (Carga la GEMINI_API_KEY del servidor)
[API de Gemini (gemini-3.1-flash-lite)]
```

### Componentes Clave:
*   **Interfaz de Usuario**: [chat-widget](file:///c:/Users/SENA/Desktop/Nueva%20carpeta/MovieNexus/src/app/shared/components/chat-widget/) (Componente standalone flotante con estilo Glassmorphism, renderizado Markdown y carrusel de películas).
*   **Servicio de Datos**: [gemini.service.ts](file:///c:/Users/SENA/Desktop/Nueva%20carpeta/MovieNexus/src/app/core/services/gemini.service.ts) (Maneja el estado e historial del chat mediante Angular Signals e integra la búsqueda de metadatos en TMDB de forma paralela y reactiva).
*   **Seguridad y Proxy**: [api/chat.js](file:///c:/Users/SENA/Desktop/Nueva%20carpeta/MovieNexus/api/chat.js) (Función serverless que inyecta las instrucciones del sistema, define la estructura del JSON de salida y actúa de puente con la API de Gemini).
*   **Servidor Local**: [server.ts](file:///c:/Users/SENA/Desktop/Nueva%20carpeta/MovieNexus/src/server.ts) (Habilita el endpoint `/api/chat` en desarrollo local cargando dinámicamente el módulo de la API).

---

## 2. Pautas de Seguridad

> [!WARNING]
> **Protección de la Clave de API**: La clave `GEMINI_API_KEY` **nunca** debe exponerse en el código del cliente de Angular (archivos `.ts`, `.html` o compilados de frontend). Toda comunicación con Gemini debe pasar estrictamente a través del backend `/api/chat`.

*   **Configuración Local**: La clave de API se almacena en el archivo [.env](file:///c:/Users/SENA/Desktop/Nueva%20carpeta/MovieNexus/.env) en el formato:
    ```env
    GEMINI_API_KEY=tu_clave_aqui
    ```
*   **Ignorar Archivo de Configuración**: [.gitignore](file:///c:/Users/SENA/Desktop/Nueva%20carpeta/MovieNexus/.gitignore) está configurado para excluir el archivo `.env` del control de versiones. **No lo elimines** de la lista de exclusión.
*   **Configuración en Producción (Vercel)**: La clave debe configurarse como una Variable de Entorno (`Environment Variable`) en el panel de Vercel con el nombre `GEMINI_API_KEY`.

---

## 3. Entorno de Desarrollo y Ejecución

*   **Comando de Desarrollo**: Corre el comando `npm run start` o `npm run dev` para iniciar el servidor SSR local en `http://localhost:4200`. El servidor Express maneja de manera nativa las peticiones del chat.
*   **Versión de Node.js**: El CLI de Angular requiere Node.js `>= 22.22.3`. Si estás utilizando una versión compatible previa (por ejemplo, `v22.17.0`), las validaciones locales han sido flexibilizadas temporalmente en los archivos de la CLI en `node_modules` para permitir la compilación.
