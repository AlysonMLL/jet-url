# 🚀 Jet.URL | Encurtador de Links Analítico

Um sistema de encurtamento de URLs de alta performance desenvolvido com foco em **coleta de dados, rastreamento inteligente e integração.** 

<img width="1000" height="500" alt="jetgif1" src="https://github.com/user-attachments/assets/a846ea9e-b450-43be-bd0b-75781010e730" />

---

Este projeto vai além de um simples redirecionador: ele atua como um micro-pipeline de dados, capturando métricas de acesso em tempo real e disponibilizando exportações otimizadas, servindo como uma base sólida para integrações com ferramentas de Business Intelligence (BI) e Inteligência Artificial.

<img width="1000" height="500" alt="jetgif2" src="https://github.com/user-attachments/assets/ff3c9fad-d44d-474b-ab8d-013c4e515c64" />

---

O site também conta com **Dark Mode** e **Light Mode**, visando o conforto do usuário conforme suas preferências.

<img width="1000" height="500" alt="jetgif3" src="https://github.com/user-attachments/assets/0a5f2fe4-10dd-4e65-98ac-7d65181273e0" />

---


## 🎯 Principais Funcionalidades

* **Encurtamento Inteligente:** Geração rápida de links curtos com regra de negócio anti-duplicidade (economizando I/O e espaço no banco de dados).
* **Geração Dinâmica de QR Code:** Criação de QR Codes em memória RAM (Base64) entregues instantaneamente na resposta da API, sem armazenamento físico.
* **Rastreio de Dispositivos (User-Agent):** Identificação e registro automático da plataforma do usuário (Mobile, Tablet ou Desktop) no momento do redirecionamento.
* **Painel de Métricas Interativo:** Interface responsiva com gráficos gerados via Chart.js, suportando alternância dinâmica entre modo Claro e Escuro.
* **Micro-Pipeline ETL (Exportação de Dados):** Rota dedicada para extração do banco de dados relacional (JOIN entre URLs e Cliques), retornando um arquivo `.csv` pronto para análise em Pandas ou PowerBI.


## 🛠️ Tecnologias Utilizadas

**Backend & Dados:**
* **Python 3.x:** Lógica de negócio e roteamento.
* **FastAPI:** Framework assíncrono de altíssima performance para a construção da API REST.
* **SQLite:** Banco de dados relacional leve e embutido.
* **Pydantic:** Validação rigorosa de dados de entrada.

**Frontend:**
* **HTML5 / JavaScript (Vanilla):** Consumo assíncrono da API (Fetch API).
* **Tailwind CSS (CDN):** Estilização utilitária e gerenciamento nativo de Dark Mode.
* **Chart.js:** Renderização do gráfico de rosca (Doughnut) para as métricas.


## 🗄️ Estrutura do Banco de Dados

O sistema utiliza um modelo relacional simples e eficiente para garantir a integridade dos dados coletados:

* **Tabela `urls`**: Armazena as URLs originais e garante a unicidade do código curto gerado.
* **Tabela `clicks`**: Registra cada evento de redirecionamento, vinculando via Chave Estrangeira (Foreign Key) ao código curto e salvando o tipo de dispositivo detectado.


## ⚙️ Como Executar o Projeto Localmente

Siga os passos abaixo para rodar a aplicação na sua máquina.

1. **Clone este repositório:**
```bash
git clone [https://github.com/SEU-USUARIO/jet-url.git](https://github.com/SEU-USUARIO/jet-url.git)
