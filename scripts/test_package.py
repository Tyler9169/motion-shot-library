"""Regression checks for source package boundaries; no real credentials."""
import io
import json
from pathlib import Path
import tempfile
import unittest
from zipfile import ZipFile
from package import build


class PackageTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.root = Path(self.directory.name)
        (self.root / 'data').mkdir()
        (self.root / 'data/public.json').write_text('{}')
        self.manifest = self.root / 'manifest.json'
        self.output = self.root / 'out.zip'
        self.output.write_bytes(b'previous package')

    def run_build(self, names):
        self.manifest.write_text(json.dumps(names))
        return build(self.root, self.manifest, self.output)

    def assert_rejected(self, names):
        before = self.output.read_bytes()
        with self.assertRaises(ValueError):
            self.run_build(names)
        self.assertEqual(self.output.read_bytes(), before)

    def test_only_approved_files(self):
        (self.root / 'data/.env').write_text('INERT_TEST_ONLY=1')
        self.assertEqual(self.run_build(['data/public.json']), 1)
        with ZipFile(self.output) as archive:
            self.assertEqual(archive.namelist(), ['motion-shot-library/data/public.json'])

    def test_sensitive_manifest_entries(self):
        for name in ['data/.env', 'data/.env.local', 'data/credentials.json',
                     'data/private.key', 'data/.netrc', 'data/service-account.json']:
            with self.subTest(name=name):
                self.assert_rejected([name])

    def test_path_traversal(self):
        for name in ['../outside', '/absolute', 'data/../public.json', 'data//file']:
            with self.subTest(name=name):
                self.assert_rejected([name])

    def test_symlink_file_and_parent(self):
        (self.root / 'data/link').symlink_to(self.root / 'data/public.json')
        (self.root / 'alias').symlink_to(self.root / 'data', target_is_directory=True)
        self.assert_rejected(['data/link'])
        self.assert_rejected(['alias/public.json'])

    def test_nested_archive(self):
        inner = io.BytesIO()
        with ZipFile(inner, 'w') as archive:
            archive.writestr('source/.env', 'INERT_TEST_ONLY=1')
        outer = io.BytesIO()
        with ZipFile(outer, 'w') as archive:
            archive.writestr('source/inner.zip', inner.getvalue())
        (self.root / 'data/source.zip').write_bytes(outer.getvalue())
        self.assert_rejected(['data/source.zip'])

    def test_missing_file(self):
        self.assert_rejected(['data/missing.json'])

    def test_duplicate_entry(self):
        self.assert_rejected(['data/public.json', 'data/public.json'])


if __name__ == '__main__':
    unittest.main()
