<p align="center">
  <img width="450" height="150" alt="logo-jet url_darkmode" src="https://github.com/user-attachments/assets/79c79e98-9606-4d64-a880-c88c578e885f" />
</p>

# 🚀 Jet.URL | Encurtador de Links Analítico & SaaS

Um sistema de encurtamento de URLs de alta performance e nível corporativo, desenvolvido com foco absoluto em **coleta de dados, rastreamento inteligente, persistência em nuvem e customização avançada.** 

<br>

Acesse o site em: [Jet.URL](https://jet-url.onrender.com/) (talvez seja necessário aguardar o Render carregar a página)

<br>

<p align="center">

<img width="70" height="70" alt="vs-code-svgrepo-com" src="https://github.com/user-attachments/assets/d7906bee-7540-4bff-935d-ef3ea886e5be" />
<img width="70" height="70" alt="python-svgrepo" src="https://github.com/user-attachments/assets/2439d9a9-a6b7-49ea-bec0-4aeb9eb0608b" />
<img width="70" height="70" alt="javascript-svgrepo-com" src="https://github.com/user-attachments/assets/f02fd815-05f8-4b40-b76f-1c5cff272f4e" />
<img width="70" height="70" alt="vue-9-logo-svgrepo" src="https://github.com/user-attachments/assets/d59f7dd1-7b0d-4a27-b02a-5fefada575a5" />
<img width="60" height="70" alt="chart-js-seeklogo" src="https://github.com/user-attachments/assets/e5a9f519-a7e6-43e4-8fbc-954fd61382ce" />
<img width="70" height="70" alt="html-5-svgrepo-com" src="https://github.com/user-attachments/assets/61350760-93f0-4240-9cb6-f9e79d04774c" />
<img width="70" height="70" alt="css-3-svgrepo-com" src="https://github.com/user-attachments/assets/eca10606-61ea-40db-965f-991563f41871" />
<img width="230" height="70" alt="tailwindcss2-svgrepo" src="https://github.com/user-attachments/assets/222bb634-a695-4dcd-8990-f3675147d795" />

</p>

<p align="center">

<img width="320" height="70" alt="FastAPI_logo" src="https://github.com/user-attachments/assets/2b96f7fc-ca27-4f2c-9583-7d86c4d85d86" />
<img width="200" height="70" alt="Jinja_software_logo" src="https://github.com/user-attachments/assets/590e5bcb-b661-4b3b-962a-1c2974fa12ed" />
<img width="240" height="70" alt="render" src="https://github.com/user-attachments/assets/f6a1e874-971f-4428-857b-83fa7edf56a1" />

</p>

<p align="center">

<img width="290" height="70" alt="PostgreSQL_zonalogo" src="https://github.com/user-attachments/assets/571efa63-8747-44e1-900a-cde7f7ead7a7" />
<img width="310" height="70" alt="Supabase_zonalogo" src="https://github.com/user-attachments/assets/3c88ff0c-c737-4bdd-9d5a-7ea80f0cdf5d" />

</p>

<br>

<img width="1100" height="500" alt="jeturlgif v2_1" src="https://github.com/user-attachments/assets/ff1bbdcb-007e-4963-9f18-005a9636f099" />

---

Este projeto vai muito além de um simples redirecionador: ele atua como um verdadeiro micro-pipeline de dados. Capturando métricas de acesso granulares em tempo real e disponibilizando exportações otimizadas (ETL), o Jet.URL serve como uma base sólida para integrações com ferramentas de Business Intelligence (BI) e Inteligência Artificial.

<img width="1100" height="500" alt="jeturlgif v2_2" src="https://github.com/user-attachments/assets/4146d3e9-a3ba-43ea-a4cf-d28642e6c3e8" />

---

A interface reativa garante uma experiência de usuário (*UX*) Premium, suportando **Dark Mode** e **Light Mode** dinâmicos que ajustam gráficos e logotipos automaticamente.

<img width="1100" height="500" alt="jeturlgif v2_3" src="https://github.com/user-attachments/assets/43f9c4e1-0ae1-46a1-aaf7-57b95d962566" />

<br>

---

<img width="1100" height="500" alt="jeturlgif v2_4" src="https://github.com/user-attachments/assets/65321641-caec-4c44-a1e8-5ddf97a4e8e7" />

<br>

# 🎯 Principais Funcionalidades

* **Encurtamento & Customização:** Geração instantânea de links curtos aleatórios com proteção anti-duplicidade, ou criação de **URLs Personalizadas** (ex: `jet.url/minha-marca`).
* **Autodestruição e Validade Temporal:** Agendamento de campanhas com datas de início e expiração configuráveis (Status HTTP 403 e 410 geridos automaticamente pelo backend).
* **QR Code Premium (Manipulação de Imagem):** Geração dinâmica de QR Codes customizáveis em memória RAM (Base64) usando `Pillow`. Suporta alteração de cores (fundo/preenchimento) e injeção de ícones (redes sociais/marcas) centralizados via CDN com tratamento de proteção visual.
* **Rastreio Avançado (Analytics):** Identificação e registro automático do **Dispositivo, Sistema Operacional (OS) e Navegador** via parsing de cabeçalhos HTTP (*User-Agent*).
* **Dashboard Bento Box:** Interface modularizada responsiva construída com Vue.js, exibindo gráficos de rosca (*Doughnut*) interativos renderizados via Chart.js, com algoritmo *Top N* para agrupamento inteligente de dados minoritários.
* **Micro-Pipeline ETL (Exportação):** Rota dedicada para extração dos dados relacionais consolidados, gerando e retornando um arquivo `.csv` instantâneo pronto para análise no Pandas ou Power BI.

<br>

# 🏗️ Arquitetura & Tecnologias

O projeto adota os princípios de **Clean Architecture**, separando regras de negócios, rotas e acesso aos dados.

### **Backend & Dados:**
* **Python:** Orquestração, lógica de negócios e processamento.
* **FastAPI:** Framework web assíncrono de altíssima performance (Entry Point).
* **PostgreSQL (Supabase):** Banco de dados relacional robusto na nuvem para garantir a persistência permanente dos dados.
* **Psycopg2 & Pydantic:** Driver nativo de conexão segura com proteção contra SQL Injection e validação rigorosa de dados de entrada.
* **Pillow (PIL):** Processamento avançado e composição de imagens para os QR Codes.

### **Frontend:**
* **Vue 3 (Composition API):** Framework progressivo adotado para reatividade nativa e renderização declarativa, dispensando manipulações pesadas no DOM.
* **Tailwind CSS:** Estilização utilitária de ponta com gerenciamento nativo de temas (Dark/Light).
* **Chart.js:** Biblioteca para visualização de dados (*Data Viz*).
* **Jinja2:** Renderização híbrida inteligente.

<br>

# ☁️ Deploy e Infraestrutura (Produção)

O Jet.URL está em produção e foi arquitetado para rodar em um ecossistema de nuvem escalável, aplicando a separação estrita entre a camada de aplicação e a persistência de dados:

<br>

* **Aplicação Web (Render):** O backend orquestrado em FastAPI e a interface Vue são servidos através de um *Web Service* no [Render](https://render.com). A plataforma gerencia a instalação automática das dependências através do `requirements.txt` (incluindo `uvicorn`, `psycopg2-binary` e `qrcode[pil]`) e expõe a API de forma segura.
* **Persistência de Dados Resiliente (Supabase):** Como a infraestrutura gratuita do Render sofre hibernação por inatividade (resetando o armazenamento local em disco), o uso de SQLite foi descartado. Toda a carga de dados foi migrada para o **PostgreSQL** hospedado na nuvem do **Supabase**. Isso garante que todas as URLs curtas e as métricas de tráfego permaneçam 100% seguras, imutáveis e disponíveis, independentemente do estado de "sono" do servidor web.
* **Connection Pooling (IPv4):** A comunicação transacional com o banco de dados é roteada nativamente através do *Supavisor* (Connection Pooler do Supabase, porta `6543`). Essa arquitetura resolve limitações de roteamento IPv6 de servidores gratuitos, mantendo a latência baixa e a conexão estável.
* **Continuous Deployment (CI/CD):** Integração contínua ligada diretamente ao repositório no GitHub. Toda vez que um novo *commit* é enviado para a branch `main`, o Render escuta o *webhook*, baixa a nova versão e realiza o *build* em background, efetuando a troca do serviço com *Zero Downtime* (sem queda para o usuário final).
* **Segurança Cloud-Native:** Seguindo as melhores práticas globais de segurança, a `DATABASE_URL` não é versionada no código. As credenciais são injetadas no momento do *build* estritamente através do painel de *Environment Variables* da nuvem.

<br>

# 🗄️ Estrutura do Banco de Dados

O sistema utiliza um modelo relacional eficiente, blindado e escalável no PostgreSQL:

* **Tabela `urls`**: Armazena as URLs originais, a chave única gerada (`short_code`), e as regras temporais de validade (`starts_at` e `expires_at`).
* **Tabela `clicks`**: Registra individualmente cada evento de acesso. Conectada via Chave Estrangeira (Foreign Key), ela armazena logs de `device_type`, `os_name` e `browser_name`.

<br>

<img width="1100" height="500" alt="jeturlgif v2_5" src="https://github.com/user-attachments/assets/cf0b24d3-5200-46d8-b614-e65fe8fdab03" />

<br>

# ⚙️ Como Executar o Projeto Localmente

Siga os passos abaixo para rodar a aplicação na sua máquina.

<br>

1. **Clone este repositório:**
```bash
git clone [https://github.com/AlysonMLL/jet-url.git](https://github.com/AlysonMLL/jet-url.git)
```

2. **Acesse a pasta do projeto:**
```bash
cd jet-url
```

3. **Instale as dependências necessárias:**
```bash
pip install fastapi uvicorn user-agents "qrcode[pil]"
```

4. **Inicie o servidor local:**
```bash
uvicorn backend.main:app --reload
```

5. **Acesse no seu navegador:** http://localhost:8000 para visualizar a interface principal, ou http://localhost:8000/docs para interagir diretamente com a documentação automática (Swagger) da API.

<br>

---

<br>

<p align="center">
  <img src="https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54" />
  <img src="https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi" />
  <img src="https://img.shields.io/badge/postgresql-4169e1?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" />
  <img src="https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" />
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" />
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white" />
  <img src="https://img.shields.io/badge/Visual%20Studio%20Code-0078d7.svg?style=for-the-badge&logo=visual-studio-code&logoColor=white" />
  <img src="https://img.shields.io/badge/git-%23F05033.svg?style=for-the-badge&logo=git&logoColor=white" />
  <img src="https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white" />
</p>
