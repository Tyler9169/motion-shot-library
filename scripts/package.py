"""Build a portable package from a reviewed, exact file allowlist."""
import io
import json
import os
from pathlib import Path, PurePosixPath
import re
import stat
import tempfile
from zipfile import ZipFile, ZIP_DEFLATED, is_zipfile

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / 'scripts/package-files.json'
OUTPUT = ROOT / 'downloads/motion-shot-library.zip'


def check_name(name):
    path = PurePosixPath(name)
    if not name or path.is_absolute() or chr(92) in name or any(p in ('', '.', '..') for p in name.split('/')):
        raise ValueError(f'Unsafe package path: {name}')
    for part in path.parts:
        lower = part.lower()
        if (lower.startswith(('.env', '.dev.vars')) or lower in
                {'.git', '.secrets', '.ssh', '.aws', '.pypirc', '.netrc',
                 'id_rsa', 'id_ed25519', 'node_modules', 'credentials.json', '.ds_store'} or
                lower.endswith(('.pem', '.key', '.p12', '.pfx', '.log')) or
                re.match(r'(service[-_]account|credentials|secrets?)[._-]', lower)):
            raise ValueError(f'Sensitive package path: {name}')


def check_archive(content, depth=0):
    source = io.BytesIO(content)
    if not is_zipfile(source):
        return
    if depth >= 5:
        raise ValueError('Nested archive depth exceeds review limit')
    with ZipFile(source) as archive:
        if sum(item.file_size for item in archive.infolist()) > 256 * 1024 * 1024:
            raise ValueError('Archive exceeds review size limit')
        for item in archive.infolist():
            check_name(item.filename.rstrip('/'))
            if stat.S_ISLNK(item.external_attr >> 16):
                raise ValueError(f'Symlink in nested archive: {item.filename}')
            if not item.is_dir():
                check_archive(archive.read(item), depth + 1)


def build(root=ROOT, manifest=MANIFEST, output=OUTPUT):
    names = json.loads(manifest.read_text())
    if not isinstance(names, list) or not names or any(not isinstance(n, str) for n in names):
        raise ValueError('Manifest must contain exact file paths')
    if len(names) != len(set(names)):
        raise ValueError('Duplicate manifest entries')
    contents = {}
    for name in sorted(names):
        check_name(name)
        source = root / name
        ancestors = [root.joinpath(*PurePosixPath(name).parts[:i])
                     for i in range(1, len(PurePosixPath(name).parts) + 1)]
        if any(p.is_symlink() for p in ancestors):
            raise ValueError(f'Symlink in package path: {name}')
        if not source.resolve().is_relative_to(root.resolve()) or not source.is_file():
            raise ValueError(f'Missing or unsafe package file: {name}')
        content = source.read_bytes()
        check_archive(content)
        contents[name] = content
    output.parent.mkdir(parents=True, exist_ok=True)
    temporary = None
    try:
        with tempfile.NamedTemporaryFile(dir=output.parent, suffix='.zip', delete=False) as handle:
            temporary = Path(handle.name)
        with ZipFile(temporary, 'w', ZIP_DEFLATED) as archive:
            for name, content in contents.items():
                archive.writestr('motion-shot-library/' + name, content)
        os.replace(temporary, output)
    finally:
        if temporary is not None:
            temporary.unlink(missing_ok=True)
    return len(contents)


if __name__ == '__main__':
    print('Packaged', build(), 'approved files')
