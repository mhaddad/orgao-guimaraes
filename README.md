# Órgão Histórico de Guimarães

Simulador 3D interativo do órgão da Colegiada de Nossa Senhora da Oliveira, em Guimarães. Explore a fachada, aproxime a consola, toque os dois manuais e ouça Bach com animação sincronizada das teclas.

[Repositório](https://github.com/mhaddad/orgao-guimaraes) · [Endereço do GitHub Pages após a publicação](https://mhaddad.github.io/orgao-guimaraes/)

## Funcionalidades

- Modelo tridimensional com sete tubos principais, coroa, consola e cenário da igreja.
- Vista frontal fixa, com aproximação à consola e painel de navegação.
- Dois manuais de 61 teclas, com interação por rato, toque e teclado físico.
- Áudio polifónico sintetizado, controlo de volume e reverberação.
- Prelúdio em Dó maior, BWV 846, executado por eventos musicais, com teclas sincronizadas.
- Reprodução, pausa, retoma, reinício e seleção da posição na composição.
- Recursos locais: a execução não requer serviços pagos, contas ou APIs externas.

## Executar localmente

Instale **Node.js 24** e npm. A versão de Node está indicada em `.nvmrc`; o projeto requer Node.js 22.12 ou superior.

```sh
git clone https://github.com/mhaddad/orgao-guimaraes.git
cd orgao-guimaraes
npm ci
npm run dev
```

Abra o endereço apresentado no terminal, normalmente `http://127.0.0.1:5173/`.

O navegador deve suportar WebGL 2 e Web Audio. O áudio só inicia após uma interação. Abrir `index.html` diretamente por `file://` não é suportado.

## Controlos

| Ação | Controlo |
| --- | --- |
| Ver o instrumento completo | **Explorar o órgão** ou **↺** |
| Aproximar a consola | **Tocar os teclados** |
| Ajustar a aproximação | Botões **+** e **−**, roda do rato ou gesto de pinça |
| Tocar notas | Teclas 3D, teclado no ecrã ou `A W S E D F T G Y H U J K` |
| Alterar a oitava do teclado físico | Seletor **Oitava** |
| Reproduzir ou pausar | Botão no painel musical; Espaço quando o foco está na página |
| Ouvir um trecho | Barra de progresso no painel musical |

Os botões do teclado no ecrã também respondem a Enter e Espaço quando têm foco. A aplicação liberta as notas e pausa a peça ao mudar de separador ou perder o foco da janela.

## Publicar no GitHub Pages

A publicação está configurada em [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). O fluxo instala as dependências, executa os testes, gera a aplicação e publica **apenas o conteúdo de `dist/`**. Pull requests executam a verificação sem publicar.

1. Envie os ficheiros deste projeto para a branch `main` de [`mhaddad/orgao-guimaraes`](https://github.com/mhaddad/orgao-guimaraes).
2. No repositório, abra **Settings → Pages**.
3. Em **Build and deployment → Source**, selecione **GitHub Actions**.
4. Abra **Actions → Verificar e publicar no GitHub Pages**. O envio para `main` inicia o fluxo automaticamente; se necessário, utilize **Run workflow** depois de ativar o Pages.
5. Aguarde a conclusão dos jobs `build` e `deploy`.

O site ficará disponível em **https://mhaddad.github.io/orgao-guimaraes/** após uma publicação bem-sucedida. Não são necessários tokens pessoais ou secrets adicionais para este fluxo.

### Primeiro envio desta pasta

Se a pasta ainda não estiver inicializada como repositório Git:

```sh
git init -b main
git remote add origin https://github.com/mhaddad/orgao-guimaraes.git
git add .
git commit -m "Adiciona simulador 3D do órgão de Guimarães"
git push -u origin main
```

Se já existir uma origem configurada, confirme-a com `git remote -v` antes de adicionar outra. A pasta `node_modules/`, a distribuição `dist/` e ficheiros locais ficam excluídos pelo `.gitignore`.

### Endereço-base

O [`vite.config.js`](vite.config.js) define `/orgao-guimaraes/` para a versão de produção e para a pré-visualização. Os recursos, incluindo a partitura, respeitam esse prefixo. O desenvolvimento local continua em `/`.

Se alterar o nome do repositório ou utilizar um domínio próprio, ajuste `base` no ficheiro de configuração e o prefixo verificado em `scripts/check-pages.mjs`.

## Testar e verificar a distribuição

```sh
npm test
npm run build
npm run check:pages
npm run preview
```

A pré-visualização da distribuição abre normalmente em **http://127.0.0.1:4173/orgao-guimaraes/**. Use-a para verificar a mesma estrutura de endereços utilizada no GitHub Pages.

Os testes cobrem afinação, eventos musicais, polifonia, pausa e retoma, teclas independentes, encaixe dos manuais, coroa, limites da câmara, paragem do zoom e geometria do beiral. A verificação de Pages confirma os caminhos do HTML, módulos, fontes e partitura na distribuição. A fidelidade visual e a cintilação exigem avaliação no navegador; não são garantidas pelos testes automáticos.

## Estrutura

```text
.github/workflows/     Verificação e publicação automática
src/                   Interface, modelo 3D, navegação, áudio e execução musical
public/                Recursos utilizados pelo site: fontes, música e licenças
data/scores/           Partitura-fonte MusicXML, não publicada no site
docs/REFERENCES.md     Proveniência e limites da reconstrução
docs/references/       Fotografias e recortes utilizados na modelação
scripts/               Conversão da partitura e verificação da distribuição
tests/                 Testes automatizados
index.html             Entrada da aplicação
vite.config.js         Configuração dos caminhos para GitHub Pages
```

O modelo é construído localmente com Three.js; não depende de um ficheiro GLB remoto. Os teclados estão separados da geometria estática para conservar a interação. Consulte [as referências e a arquitetura](docs/REFERENCES.md) para mais detalhes.

## Repertório

A aplicação inclui o **Prelúdio em Dó maior, BWV 846**, de Johann Sebastian Bach, adaptado timbricamente para órgão. A edição MusicXML retida contém 34 compassos e origina 533 eventos, a 72 bpm, com duração aproximada de 1 min 53 s.

Para voltar a gerar os eventos a partir da fonte, utilize Python 3, sem dependências adicionais:

```sh
python3 scripts/convert-score.py
```

A conversão lê `data/scores/bwv846.mxl` e atualiza `public/music/bwv846.json`. O motor permite carregar outras composições com a mesma estrutura de eventos; a interface atual apresenta uma peça.

## Limites e atribuições

A representação é interpretativa, baseada em fotografias e nas correções fornecidas pelo autor. Dimensões, escultura e extensão dos manuais não resultam de um levantamento organológico. Os puxadores e pedais são decorativos.

O som é sintetizado, com Lá 4 = 440 Hz e reverberação calculada. Não são gravações do órgão original nem uma reprodução medida da acústica da igreja.

As fotografias mantêm os direitos dos respetivos titulares. As fontes DM Sans e Italiana usam a SIL Open Font License, incluída em `public/fonts/`. A licença MIT de Three.js encontra-se em `public/licenses/THREE-LICENSE.txt`. As referências da partitura e os restantes detalhes estão em [docs/REFERENCES.md](docs/REFERENCES.md).
