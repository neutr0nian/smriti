import { useMemo } from 'react'
import './p5-sketch.css'

interface P5SketchProps {
  code: string
  title: string
  width: number
  height: number
}

const P5_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.4/p5.min.js'

const escapeForScriptTag = (s: string): string => s.replace(/<\/script/gi, '<\\/script')

export default function P5Sketch({ code, title, width, height }: P5SketchProps) {
  const srcdoc = useMemo(
    () => {
      const safeCode = escapeForScriptTag(code)
      return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' https://cdnjs.cloudflare.com; style-src 'unsafe-inline'; img-src data:;" />
  <style>
    html, body { margin: 0; padding: 0; overflow: hidden; background: transparent; }
    canvas { display: block; }
  </style>
  <script src="${P5_CDN}"></script>
  <script>
    window.addEventListener('error', (e) => {
      document.body.innerText = 'Sketch error: ' + (e.error?.message ?? e.message)
    })
    const PALETTE = {
      text:    '#2D2A25',
      primary: '#4A4540',
      muted:   '#8A8578',
      accent:  '#D97757',
      soft:    '#F3EFE5',
    };
    const PAD = 24;
  </script>
</head>
<body>
  <script>
function setup() {
  createCanvas(${width}, ${height});
  smooth();
  pixelDensity(2);
  strokeWeight(2);
  textFont('-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif');
  textSize(14);
  textAlign(CENTER, CENTER);
  stroke(PALETTE.text);
  fill(PALETTE.primary);
${safeCode}
}
function draw() {}
  </script>
</body>
</html>`
    },
    [code, width, height],
  )

  return (
    <figure className="p5-sketch" style={{ width }}>
      <iframe
        className="p5-sketch__canvas"
        sandbox="allow-scripts"
        srcDoc={srcdoc}
        title={title}
        style={{ width, height }}
      />
      <figcaption className="p5-sketch__title">{title}</figcaption>
    </figure>
  )
}
