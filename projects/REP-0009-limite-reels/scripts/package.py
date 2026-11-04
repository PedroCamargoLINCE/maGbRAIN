"""Validate and package the exact same MV3 extension for Chrome and Edge."""
import json
from pathlib import Path
import shutil
import zipfile

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "extension"
manifest = json.loads((SOURCE / "manifest.json").read_text())
assert manifest["manifest_version"] == 3
for filename in [manifest["background"]["service_worker"], manifest["action"]["default_popup"],
                 *manifest["icons"].values(),
                 *(file for script in manifest["content_scripts"] for file in script["js"])]:
    assert (SOURCE / filename).is_file(), f"Missing manifest resource: {filename}"
output = ROOT / "dist"
output.mkdir(exist_ok=True)
unpacked = output / "short-pause"
if unpacked.exists():
    shutil.rmtree(unpacked)
shutil.copytree(SOURCE, unpacked)
archive = output / f"short-pause-{manifest['version']}-chrome-edge.zip"
with zipfile.ZipFile(archive, "w", zipfile.ZIP_DEFLATED) as package:
    for path in sorted(unpacked.rglob("*")):
        if path.is_file():
            package.write(path, path.relative_to(unpacked))
print(f"Unpacked: {unpacked}\nZIP: {archive}")
