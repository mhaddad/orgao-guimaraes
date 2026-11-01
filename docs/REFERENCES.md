# Referências e reconstrução

## Fotografias

A pasta [references/](references/) conserva as fontes visuais fornecidas pelo autor. Estes ficheiros documentam a modelação e não integram a distribuição do site.

| Ficheiros | Referência visual |
| --- | --- |
| `orgao-01.jpg`, `orgao-06.jpg`, `orgao-07.jpg`, `orgao-08.jpg` | Fachada, caixa clara e dourada, torre central, alas curvas e galeria. |
| `orgao-02.jpg`, `orgao-03.jpg`, `orgao-04.jpg`, `orgao-05.jpg` | Consola, dois manuais, puxadores, banco e enquadramento frontal visto de lado. |
| `orgao-coroa.png`, `orgao-coroa-close.png` | Arco, concha clara, folhagem, volutas e urnas. |
| `orgao-sete-tubos.png` | Sete tubos principais no conjunto central. |
| `detalhe-lateral.png` | Detalhe adicional fornecido pelo autor. |

Os direitos das fotografias pertencem aos respetivos titulares. O projeto não atribui uma licença própria a essas imagens.

## Modelo

A geometria inicial foi adaptada de um modelo HTML fornecido pelo autor e integrada nos módulos deste projeto. O ficheiro de trabalho original foi retirado do repositório após a integração; a aplicação é autónoma.

A consola está centrada na frente. Os dois manuais interativos substituem o teclado estático do modelo inicial. A balaustrada foi omitida para permitir uma vista desimpedida.

A coroa foi revista pelos dois recortes de referência: arco aberto, concha de base larga e nervuras quase verticais, folhagem compacta e talha sob o arco. Os sete tubos principais têm disposição simétrica, com maior diâmetro ao centro.

As proporções, a profundidade, a folhagem e partes não visíveis são aproximações. Os 61 sons cromáticos por manual, de Dó 2 a Dó 7, simplificam uma configuração histórica que não foi medida. Puxadores e pedais não alteram o som.

## Partitura

- Obra: Johann Sebastian Bach — Prelúdio em Dó maior, BWV 846.
- Fonte: [ficheiro MusicXML do acervo music21](https://github.com/cuthbertLab/music21/blob/master/music21/corpus/bach/bwv846.mxl).
- Cópia retida: [`../data/scores/bwv846.mxl`](../data/scores/bwv846.mxl).
- Os metadados da edição remetem para a transcrição MuseScore 117279.
- A edição retida tem 34 compassos, 533 eventos e andamento de 72 bpm. É a edição utilizada pelo simulador, sem a apresentar como edição crítica da obra.

A composição é de domínio público. O conversor preserva os eventos da transcrição retida, incluindo alturas, pausas, acordes, vozes e ligaduras. A execução utiliza o motor Web Audio da aplicação, não um ficheiro de áudio independente.

## Áudio

A síntese utiliza harmónicos, sustentação e libertação de notas, afinação temperada e reverberação por convolução com um impulso calculado. Não contém gravações do instrumento histórico ou medições acústicas da igreja.

## Módulos

| Módulo | Responsabilidade |
| --- | --- |
| `src/model.js` | Caixa, tubos, talha, consola e cenário da igreja. |
| `src/crown.js` | Coroa reconstruída a partir dos recortes. |
| `src/gallery.js` | Base e beiral, com volumes separados. |
| `src/keyboards.js` | Dois manuais com 122 teclas independentes. |
| `src/navigation.js`, `src/zoom-motion.js` | Percurso frontal e transição com paragem definida. |
| `src/render-stability.js`, `src/static-model.js` | Profundidade, agrupamento estático e estabilidade. |
| `src/scene.js` | Câmara, iluminação, seleção e renderização. |
| `src/audio.js` | Síntese, volume e reverberação. |
| `src/player.js` | Agendamento pelo relógio de áudio e sincronização. |
| `src/main.js`, `src/style.css` | Interface e interação. |

O zoom termina numa posição exata após uma transição de 380 ms. A cena deixa de ser redesenhada quando a câmara e as teclas estão paradas. A renderização utiliza oito amostras por fotograma; peças estáticas são agrupadas por material, mantendo as teclas independentes. A iluminação concentra-se no órgão, com ambiente escuro nas paredes.

## Software e fontes

- [Three.js](https://threejs.org/): licença MIT, distribuída em [`../public/licenses/THREE-LICENSE.txt`](../public/licenses/THREE-LICENSE.txt).
- [Vite](https://vite.dev/): ferramenta de desenvolvimento e distribuição; licença MIT, incluída no pacote instalado pelo npm.
- DM Sans: [SIL Open Font License](../public/fonts/OFL-DM-Sans.txt).
- Italiana: [SIL Open Font License](../public/fonts/OFL-Italiana.txt).

As dependências exatas são registadas em `package-lock.json`. A publicação segue a [orientação oficial do Vite para GitHub Pages](https://vite.dev/guide/static-deploy.html#github-pages).
