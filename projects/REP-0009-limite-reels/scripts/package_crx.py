"""Build an Android Edge sideload candidate using Chromium's CRX3 packer.

Keep --key-file outside the repository. Reusing it preserves the extension ID.
The key is never added to the ZIP/CRX or printed.
"""
import argparse
import io
import json
from pathlib import Path
import struct
import subprocess
import sys
import tempfile
import zipfile

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--browser", required=True, help="Chrome/Edge/Chromium executable")
parser.add_argument("--key-file", required=True, type=Path, help="Private signing key outside the repository; created if absent")
args = parser.parse_args()
root = Path(__file__).resolve().parents[1]
repo = root.parents[1]
key = args.key_file.expanduser().resolve()
if key.is_relative_to(repo):
    parser.error("Keep the private signing key outside the repository, including ignored folders.")
if not key.exists():
    key.parent.mkdir(parents=True, exist_ok=True)
    # Create with owner-only permissions before writing any private material.
    with key.open("xb") as destination:
        key.chmod(0o600)
        subprocess.run(["openssl", "genpkey", "-algorithm", "RSA", "-pkeyopt", "rsa_keygen_bits:2048"],
                       stdout=destination, stderr=subprocess.DEVNULL, check=True)
subprocess.run([sys.executable, str(root / "scripts/package.py")], check=True)
with tempfile.TemporaryDirectory(prefix="short-pause-packer-") as profile:
    subprocess.run([args.browser, "--headless=new", "--no-sandbox", f"--user-data-dir={profile}",
                    f"--pack-extension={root / 'dist/short-pause'}", f"--pack-extension-key={key}"],
                   check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=60)
packed = root / "dist/short-pause.crx"
data = packed.read_bytes()
magic, version, header_size = struct.unpack("<4sII", data[:12])
assert magic == b"Cr24" and version == 3, "Expected CRX3"
with zipfile.ZipFile(io.BytesIO(data[12 + header_size:])) as archive:
    assert archive.testzip() is None
    manifest = json.loads(archive.read("manifest.json"))
    assert manifest == json.loads((root / "extension/manifest.json").read_text())
    for name in archive.namelist():
        assert not name.endswith((".pem", ".key")), "Private key in archive"
output = root / f"dist/short-pause-{manifest['version']}-edge-android.crx"
packed.replace(output)
print(f"CRX3: {output}")
print("Keep your supplied signing key private; reuse it for updates.")
