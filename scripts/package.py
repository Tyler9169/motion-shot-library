"""Build the portable source package from repository files."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
root = Path(__file__).resolve().parents[1]
files = ['index.html', 'style.css', 'app.js', 'favicon.svg', 'README.md', 'LICENSE', 'THIRD_PARTY.md', 'package.json', 'references.html', 'references.css', 'references.js', 'downloads/xcy-shot-index.csv', 'downloads/create-vibe-motion-source.zip']
for directory in ['lib', 'docs', 'examples', 'scripts', 'data']:
    files.extend(str(p.relative_to(root)) for p in (root / directory).rglob('*') if p.is_file())
files.extend(['vendor/gsap.min.js','vendor/gsap.mjs'])
with ZipFile(root / 'downloads/motion-shot-library.zip', 'w', ZIP_DEFLATED) as archive:
    for name in sorted(files):
        archive.write(root / name, 'motion-shot-library/' + name)
print('Packaged', len(files), 'files')
